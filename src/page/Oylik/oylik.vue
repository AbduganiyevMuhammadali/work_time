<template>
  <div class="salary-page">

    <!-- ── STAT CARDS ───────────────────────────────────── -->
    <div class="stats-grid">
      <div class="stat-card" style="--ca:#7c3aed;--ca-bg:#ede9fe">
        <div class="stat-icon"><Banknote :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ fmt(totalFund) }}</span>
          <span class="stat-lbl">Jami oylik fondi</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#2563eb;--ca-bg:#dbeafe">
        <div class="stat-icon"><CreditCard :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ fmt(totalAdvances) }}</span>
          <span class="stat-lbl">Berilgan avanslar</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#dc2626;--ca-bg:#fee2e2">
        <div class="stat-icon"><ShieldAlert :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ fmt(totalFines) }}</span>
          <span class="stat-lbl">Jarimalar</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#059669;--ca-bg:#d1fae5">
        <div class="stat-icon"><TrendingUp :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ fmt(totalNet) }}</span>
          <span class="stat-lbl">To'lash kerak</span>
        </div>
      </div>
    </div>

    <!-- ── TABLE CARD ────────────────────────────────────── -->
    <div class="table-card">
      <div class="card-head">
        <div class="card-title-group">
          <h2 class="card-title">Oylik hisob-kitob</h2>
          <span class="card-sub">{{ MONTHS[month - 1] }}, {{ year }}</span>
        </div>
        <div class="head-controls">
          <select v-model="month" class="sel">
            <option v-for="(m, i) in MONTHS" :key="i" :value="i + 1">{{ m }}</option>
          </select>
          <select v-model="year" class="sel">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
          <button class="pay-all-btn" @click="payAll">
            <CheckCheck :size="15" /><span>Hammasini to'lash</span>
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Xodim</th>
              <th>Ish kunlari</th>
              <th>Asosiy oylik</th>
              <th>Bonus</th>
              <th>Avans</th>
              <th>Jarima</th>
              <th>Sof oylik</th>
              <th>Holat</th>
              <th class="th-act">Amallar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in salaries" :key="emp.id">

              <!-- Xodim -->
              <td>
                <div class="emp-cell">
                  <div class="av" :style="{ background: emp.color + '22', color: emp.color }">
                    {{ initials(emp.name) }}
                  </div>
                  <div class="emp-info">
                    <span class="emp-name">{{ emp.name }}</span>
                    <span class="emp-dept">{{ emp.department }}</span>
                  </div>
                </div>
              </td>

              <!-- Ish kunlari -->
              <td>
                <div class="days-wrap">
                  <span class="days-txt">{{ emp.workedDays }}<span class="days-of">/{{ emp.totalDays }}</span></span>
                  <div class="days-bar-bg">
                    <div
                      class="days-bar-fill"
                      :style="{ width: pct(emp.workedDays, emp.totalDays) + '%', background: emp.color }"
                    ></div>
                  </div>
                </div>
              </td>

              <!-- Asosiy oylik -->
              <td class="mc">{{ fmt(emp.baseSalary) }}</td>

              <!-- Bonus -->
              <td class="mc mc-green">+{{ fmt(emp.bonus) }}</td>

              <!-- Avans -->
              <td class="mc mc-blue">{{ emp.advance ? '-' + fmt(emp.advance) : '—' }}</td>

              <!-- Jarima -->
              <td class="mc mc-red">{{ emp.fine ? '-' + fmt(emp.fine) : '—' }}</td>

              <!-- Sof oylik -->
              <td class="mc mc-bold">{{ fmt(net(emp)) }}</td>

              <!-- Holat -->
              <td>
                <span :class="['s-badge', emp.paid ? 'paid' : 'pending']">
                  <CheckCircle2 v-if="emp.paid" :size="11" />
                  <Clock v-else :size="11" />
                  {{ emp.paid ? "To'landi" : 'Kutilmoqda' }}
                </span>
              </td>

              <!-- Amallar -->
              <td class="act-cell">
                <button
                  :class="['act-btn', emp.paid ? 'act-paid' : 'act-pay']"
                  :disabled="emp.paid"
                  :title="emp.paid ? 'To\'langan' : 'To\'lash'"
                  @click="openPayModal(emp)"
                ><DollarSign :size="14" /></button>
                <button class="act-btn act-eye" title="Batafsil" @click="openDetail(emp)">
                  <Eye :size="14" />
                </button>
                <button class="act-btn act-fine" title="Jarima qo'shish" @click="openFineModal(emp)">
                  <AlertTriangle :size="14" />
                </button>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span>{{ paidCount }}/{{ salaries.length }} ta to'langan</span>
        <span class="footer-right">Jami sof: <strong>{{ fmt(totalNet) }}</strong></span>
      </div>
    </div>

    <!-- ── PAY MODAL ──────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="payM.open" class="overlay" @click.self="payM.open = false">
          <div class="modal">
            <div class="mhead">
              <h3 class="mtitle">Oylikni to'lash</h3>
              <button class="mclose" @click="payM.open = false"><X :size="18" /></button>
            </div>
            <div class="mbody">
              <div class="mprofile">
                <div class="mav" :style="{ background: payM.emp?.color + '22', color: payM.emp?.color }">
                  {{ payM.emp ? initials(payM.emp.name) : '' }}
                </div>
                <div>
                  <p class="mname">{{ payM.emp?.name }}</p>
                  <p class="mdept">{{ payM.emp?.department }}</p>
                </div>
              </div>
              <div class="msummary">
                <div class="mrow"><span>Asosiy oylik</span><span>{{ fmt(payM.emp?.baseSalary) }}</span></div>
                <div class="mrow mgreen"><span>Bonus</span><span>+{{ fmt(payM.emp?.bonus) }}</span></div>
                <div class="mrow mblue"><span>Avans</span><span>-{{ fmt(payM.emp?.advance) }}</span></div>
                <div class="mrow mred"><span>Jarima</span><span>-{{ fmt(payM.emp?.fine) }}</span></div>
                <div class="mrow mtotal">
                  <span>Sof oylik</span>
                  <span>{{ payM.emp ? fmt(net(payM.emp)) : '' }}</span>
                </div>
              </div>
            </div>
            <div class="mfoot">
              <button class="btn-cancel" @click="payM.open = false">Bekor</button>
              <button class="btn-pay" @click="confirmPay">
                <DollarSign :size="15" /> To'lash
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── FINE MODAL ─────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="fineM.open" class="overlay" @click.self="fineM.open = false">
          <div class="modal">
            <div class="mhead">
              <h3 class="mtitle">Jarima qo'shish</h3>
              <button class="mclose" @click="fineM.open = false"><X :size="18" /></button>
            </div>
            <div class="mbody">
              <div class="mprofile mprofile-sm">
                <div class="mav mav-sm" :style="{ background: fineM.emp?.color + '22', color: fineM.emp?.color }">
                  {{ fineM.emp ? initials(fineM.emp.name) : '' }}
                </div>
                <p class="mname">{{ fineM.emp?.name }}</p>
              </div>
              <div class="fgroup">
                <label class="flabel">Miqdor (so'm)</label>
                <input v-model.number="fineM.amount" type="number" class="finput" min="0" placeholder="Masalan: 50 000" />
              </div>
              <div class="fgroup">
                <label class="flabel">Sababi</label>
                <input v-model="fineM.reason" type="text" class="finput" placeholder="Kech kelish, sifatsiz ish..." />
              </div>
            </div>
            <div class="mfoot">
              <button class="btn-cancel" @click="fineM.open = false">Bekor</button>
              <button class="btn-danger" @click="saveFine">Qo'shish</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── DETAIL MODAL ───────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="detM.open" class="overlay" @click.self="detM.open = false">
          <div class="modal">
            <div class="mhead">
              <h3 class="mtitle">Oylik tafsiloti</h3>
              <button class="mclose" @click="detM.open = false"><X :size="18" /></button>
            </div>
            <div class="mbody" v-if="detM.emp">
              <div class="mprofile">
                <div class="mav" :style="{ background: detM.emp.color + '22', color: detM.emp.color }">
                  {{ initials(detM.emp.name) }}
                </div>
                <div>
                  <p class="mname">{{ detM.emp.name }}</p>
                  <p class="mdept">{{ detM.emp.department }} · {{ detM.emp.position }}</p>
                </div>
              </div>
              <div class="det-grid">
                <div class="det-item">
                  <span class="det-lbl">Ish kunlari</span>
                  <span class="det-val">{{ detM.emp.workedDays }}/{{ detM.emp.totalDays }}</span>
                </div>
                <div class="det-item">
                  <span class="det-lbl">Asosiy oylik</span>
                  <span class="det-val">{{ fmt(detM.emp.baseSalary) }}</span>
                </div>
                <div class="det-item">
                  <span class="det-lbl">Bonus</span>
                  <span class="det-val mgreen">+{{ fmt(detM.emp.bonus) }}</span>
                </div>
                <div class="det-item">
                  <span class="det-lbl">Avans</span>
                  <span class="det-val mblue">-{{ fmt(detM.emp.advance) }}</span>
                </div>
                <div class="det-item">
                  <span class="det-lbl">Jarima</span>
                  <span class="det-val mred">-{{ fmt(detM.emp.fine) }}</span>
                </div>
                <div class="det-item">
                  <span class="det-lbl">Holat</span>
                  <span :class="['s-badge', detM.emp.paid ? 'paid' : 'pending']">
                    {{ detM.emp.paid ? "To'landi" : 'Kutilmoqda' }}
                  </span>
                </div>
              </div>
              <div class="det-net">
                <span>Sof oylik</span>
                <span class="det-net-val">{{ fmt(net(detM.emp)) }}</span>
              </div>
            </div>
            <div class="mfoot">
              <button class="btn-cancel" @click="detM.open = false">Yopish</button>
              <button
                v-if="detM.emp && !detM.emp.paid"
                class="btn-pay"
                @click="openPayModal(detM.emp); detM.open = false"
              ><DollarSign :size="15" /> To'lash</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Banknote, CreditCard, ShieldAlert, TrendingUp,
  CheckCheck, DollarSign, Eye, AlertTriangle,
  X, CheckCircle2, Clock
} from 'lucide-vue-next'

const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

const now   = new Date()
const month = ref(now.getMonth() + 1)
const year  = ref(now.getFullYear())
const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]

const initials = (n) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
const pct      = (a, b) => Math.round(a / b * 100)
const fmt      = (v) => v ? Number(v).toLocaleString('uz-UZ') + " so'm" : "0 so'm"
const net      = (e) => (e.baseSalary || 0) + (e.bonus || 0) - (e.advance || 0) - (e.fine || 0)

const salaries = ref([
  { id:1, name:'Alisher Karimov',   position:'Dasturchi',      department:'IT',     color:'#7c3aed', baseSalary:4500000, bonus:500000, advance:500000, fine:0,      workedDays:22, totalDays:24, paid:false },
  { id:2, name:'Malika Yusupova',   position:'Dizayner',       department:'Design', color:'#059669', baseSalary:3800000, bonus:200000, advance:0,      fine:100000, workedDays:24, totalDays:24, paid:true  },
  { id:3, name:"Jamshid To'xtaev",  position:'Menejir',        department:'HR',     color:'#2563eb', baseSalary:3200000, bonus:300000, advance:300000, fine:50000,  workedDays:23, totalDays:24, paid:false },
  { id:4, name:'Nodira Ergasheva',  position:'Buxgalter',      department:'Moliya', color:'#d97706', baseSalary:3500000, bonus:0,      advance:0,      fine:0,      workedDays:20, totalDays:24, paid:false },
  { id:5, name:'Sardor Nazarov',    position:'Sotuvchi',       department:'Savdo',  color:'#dc2626', baseSalary:2800000, bonus:700000, advance:200000, fine:150000, workedDays:21, totalDays:24, paid:false },
  { id:6, name:'Zulfiya Xoliqova',  position:"Tizim ma'muri", department:'IT',     color:'#0891b2', baseSalary:4200000, bonus:400000, advance:0,      fine:0,      workedDays:24, totalDays:24, paid:true  },
])

const totalFund     = computed(() => salaries.value.reduce((a, e) => a + e.baseSalary, 0))
const totalAdvances = computed(() => salaries.value.reduce((a, e) => a + e.advance, 0))
const totalFines    = computed(() => salaries.value.reduce((a, e) => a + e.fine, 0))
const totalNet      = computed(() => salaries.value.filter(e => !e.paid).reduce((a, e) => a + net(e), 0))
const paidCount     = computed(() => salaries.value.filter(e => e.paid).length)

// ── Pay Modal
const payM = ref({ open: false, emp: null })
const openPayModal = (emp) => { payM.value = { open: true, emp } }
const confirmPay = () => {
  if (payM.value.emp) payM.value.emp.paid = true
  payM.value.open = false
}
const payAll = () => salaries.value.forEach(e => e.paid = true)

// ── Fine Modal
const fineM = ref({ open: false, emp: null, amount: 0, reason: '' })
const openFineModal = (emp) => { fineM.value = { open: true, emp, amount: 0, reason: '' } }
const saveFine = () => {
  if (fineM.value.emp && fineM.value.amount > 0) fineM.value.emp.fine += fineM.value.amount
  fineM.value.open = false
}

// ── Detail Modal
const detM = ref({ open: false, emp: null })
const openDetail = (emp) => { detM.value = { open: true, emp } }
</script>

<style scoped>
/* ── PAGE ───────────────────────────────────────────────── */
.salary-page {
  padding: 24px;
  background: var(--bg);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}

/* ── STAT CARDS ─────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.stat-card {
  background: var(--surface);
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 4px var(--shadow-sm);
  border-bottom: 3px solid var(--ca);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--shadow-md);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  background: var(--ca-bg);
  color: var(--ca);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

:global(.layout.dark) .stat-icon {
  background: color-mix(in srgb, var(--ca) 15%, transparent);
}

.stat-val {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--t1);
  line-height: 1.1;
  white-space: nowrap;
}

.stat-lbl {
  display: block;
  font-size: 11.5px;
  color: var(--t3);
  margin-top: 3px;
}

/* ── TABLE CARD ─────────────────────────────────────────── */
.table-card {
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 1px 4px var(--shadow-sm);
  border: 1px solid var(--border);
  overflow: hidden;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
  gap: 16px;
  flex-wrap: wrap;
}

.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--t1);
}

.card-sub {
  display: block;
  font-size: 12px;
  color: var(--t3);
  margin-top: 2px;
}

.head-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.sel {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 13px;
  color: var(--t2);
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}

.sel:focus { border-color: var(--accent-br); }

.pay-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
  white-space: nowrap;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.3);
}

.pay-all-btn:hover { opacity: 0.88; }

/* ── TABLE ──────────────────────────────────────────────── */
.table-wrap {
  overflow-x: auto;
  padding-top: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

thead th {
  background: var(--surface2);
  color: var(--t3);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 9px 14px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.th-act { text-align: center; }

tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border2);
  color: var(--t2);
  vertical-align: middle;
}

tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: var(--surface2); }

/* ── EMPLOYEE CELL ──────────────────────────────────────── */
.emp-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.av {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.emp-name {
  display: block;
  font-weight: 600;
  color: var(--t1);
  font-size: 13px;
  white-space: nowrap;
}

.emp-dept {
  display: inline-block;
  font-size: 11px;
  color: var(--t4);
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 6px;
  margin-top: 2px;
}

/* ── DAYS COLUMN ────────────────────────────────────────── */
.days-wrap {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 80px;
}

.days-txt {
  font-size: 13px;
  font-weight: 600;
  color: var(--t1);
}

.days-of {
  font-size: 11px;
  font-weight: 400;
  color: var(--t4);
}

.days-bar-bg {
  height: 4px;
  border-radius: 4px;
  background: var(--border2);
  overflow: hidden;
}

.days-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

/* ── MONEY CELLS ────────────────────────────────────────── */
.mc {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  font-size: 12.5px;
}

.mc-green { color: #059669; font-weight: 500; }
.mc-blue  { color: #2563eb; font-weight: 500; }
.mc-red   { color: #dc2626; font-weight: 500; }
.mc-bold  { color: var(--t1); font-weight: 700; font-size: 13px; }

:global(.layout.dark) .mc-green { color: #34d399; }
:global(.layout.dark) .mc-blue  { color: #60a5fa; }
:global(.layout.dark) .mc-red   { color: #f87171; }

/* ── STATUS BADGE ───────────────────────────────────────── */
.s-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.s-badge.paid    { background: #d1fae5; color: #065f46; }
.s-badge.pending { background: #fef3c7; color: #92400e; }

:global(.layout.dark) .s-badge.paid    { background: rgba(5,150,105,0.15); color: #34d399; }
:global(.layout.dark) .s-badge.pending { background: rgba(217,119,6,0.15); color: #fbbf24; }

/* ── ACTION BUTTONS ─────────────────────────────────────── */
.act-cell {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.act-btn {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--surface2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.act-pay  { color: #059669; }
.act-pay:hover { background: #d1fae5; border-color: #6ee7b7; }

.act-paid { color: var(--t5); cursor: not-allowed; opacity: 0.5; }

.act-eye  { color: var(--accent); }
.act-eye:hover { background: var(--accent-bg); border-color: var(--accent-br); }

.act-fine { color: #dc2626; }
.act-fine:hover { background: #fee2e2; border-color: #fca5a5; }

:global(.layout.dark) .act-pay:hover  { background: rgba(5,150,105,0.15); border-color: rgba(5,150,105,0.3); }
:global(.layout.dark) .act-fine:hover { background: rgba(220,38,38,0.15); border-color: rgba(220,38,38,0.3); }

/* ── TABLE FOOTER ───────────────────────────────────────── */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--t4);
}

.footer-right strong { color: var(--t1); font-size: 13px; }

/* ── MODAL OVERLAY ──────────────────────────────────────── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

:global(.layout.dark) .overlay {
  background: rgba(0, 0, 0, 0.65);
}

.modal {
  background: var(--surface);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  overflow: hidden;
}

.mhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
}

.mtitle {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--t1);
}

.mclose {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--t3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.mclose:hover { background: var(--border2); color: var(--t1); }

.mbody { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

/* profile block */
.mprofile {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--surface2);
  border-radius: 10px;
  border: 1px solid var(--border);
}

.mprofile-sm { padding: 10px 14px; }

.mav {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.mav-sm { width: 36px; height: 36px; font-size: 12px; }

.mname {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--t1);
}

.mdept {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--t4);
}

/* summary rows */
.msummary {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.mrow {
  display: flex;
  justify-content: space-between;
  padding: 9px 14px;
  font-size: 13px;
  color: var(--t2);
  border-bottom: 1px solid var(--border2);
  transition: background 0.15s;
}

.mrow:last-child { border-bottom: none; }
.mrow:hover { background: var(--surface2); }

.mrow span:last-child { font-weight: 500; }

.mgreen span:last-child { color: #059669; }
.mblue  span:last-child { color: #2563eb; }
.mred   span:last-child { color: #dc2626; }

:global(.layout.dark) .mgreen span:last-child { color: #34d399; }
:global(.layout.dark) .mblue  span:last-child { color: #60a5fa; }
:global(.layout.dark) .mred   span:last-child { color: #f87171; }

.mtotal {
  background: var(--accent-bg);
  font-weight: 700;
}

.mtotal span { color: var(--accent) !important; font-size: 14px; }

/* detail grid */
.det-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.det-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.det-lbl {
  font-size: 11px;
  color: var(--t4);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.det-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--t1);
}

.det-val.mgreen { color: #059669; }
.det-val.mblue  { color: #2563eb; }
.det-val.mred   { color: #dc2626; }

:global(.layout.dark) .det-val.mgreen { color: #34d399; }
:global(.layout.dark) .det-val.mblue  { color: #60a5fa; }
:global(.layout.dark) .det-val.mred   { color: #f87171; }

.det-net {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: var(--accent-bg);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}

.det-net-val {
  font-size: 18px;
  font-weight: 700;
}

/* fine form */
.fgroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flabel {
  font-size: 12px;
  font-weight: 500;
  color: var(--t3);
}

.finput {
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface2);
  color: var(--t1);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.finput:focus {
  border-color: var(--accent-br);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

/* modal footer */
.mfoot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.btn-cancel {
  padding: 8px 18px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface2);
  color: var(--t2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-cancel:hover { background: var(--border2); }

.btn-pay {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: none;
  border-radius: 9px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.3);
  transition: opacity 0.15s;
}

.btn-pay:hover { opacity: 0.88; }

.btn-danger {
  padding: 8px 18px;
  border: none;
  border-radius: 9px;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 3px 10px rgba(220, 38, 38, 0.3);
  transition: opacity 0.15s;
}

.btn-danger:hover { opacity: 0.88; }

/* ── MODAL ANIMATION ────────────────────────────────────── */
.modal-enter-active,
.modal-leave-active { transition: all 0.2s ease; }

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}

/* ── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width: 960px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .salary-page { padding: 16px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .card-head { flex-direction: column; align-items: stretch; }
  .head-controls { flex-wrap: wrap; }
  .stat-val { font-size: 15px; }
}
</style>
