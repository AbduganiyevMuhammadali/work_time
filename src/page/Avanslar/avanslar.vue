<template>
  <div class="advance-page">

    <!-- ── STAT CARDS ───────────────────────────────────── -->
    <div class="stats-grid">
      <div class="stat-card" style="--ca:#7c3aed;--ca-bg:#ede9fe">
        <div class="stat-icon"><Wallet :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ fmt(totalGiven) }}</span>
          <span class="stat-lbl">Jami berilgan</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#059669;--ca-bg:#d1fae5">
        <div class="stat-icon"><CheckCircle2 :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ fmt(totalRepaid) }}</span>
          <span class="stat-lbl">Qaytarilgan</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#dc2626;--ca-bg:#fee2e2">
        <div class="stat-icon"><AlertCircle :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ fmt(totalPending) }}</span>
          <span class="stat-lbl">Qaytarilmagan</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#d97706;--ca-bg:#fef3c7">
        <div class="stat-icon"><Users :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ activeCount }}</span>
          <span class="stat-lbl">Xodimlar soni</span>
        </div>
      </div>
    </div>

    <!-- ── TABLE CARD ────────────────────────────────────── -->
    <div class="table-card">
      <div class="card-head">
        <div class="card-title-group">
          <h2 class="card-title">Avans to'lovlari</h2>
          <span class="card-sub">Xodimlarga berilgan avanslar ro'yxati</span>
        </div>
        <div class="head-controls">
          <div class="search-box">
            <Search :size="14" class="s-icon" />
            <input v-model="search" placeholder="Xodim yoki maqsad..." />
          </div>
          <select v-model="filterStatus" class="sel">
            <option value="">Barchasi</option>
            <option value="pending">Kutilmoqda</option>
            <option value="repaid">Qaytarilgan</option>
            <option value="overdue">Muddati o'tgan</option>
          </select>
          <button class="add-btn" @click="openAddModal">
            <Plus :size="15" /><span>Avans berish</span>
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Xodim</th>
              <th>Sana</th>
              <th>Miqdor</th>
              <th>Maqsad</th>
              <th>To'lash muddati</th>
              <th>Holat</th>
              <th class="th-act">Amallar</th>
            </tr>
          </thead>
          <tbody>

            <!-- EMPTY -->
            <template v-if="filtered.length === 0">
              <tr>
                <td colspan="7" class="empty-cell">
                  <Wallet :size="38" class="empty-icon" />
                  <p>Avanslar topilmadi</p>
                </td>
              </tr>
            </template>

            <!-- DATA -->
            <template v-else>
              <tr v-for="adv in filtered" :key="adv.id">

                <!-- Xodim -->
                <td>
                  <div class="emp-cell">
                    <div class="av" :style="{ background: adv.color + '22', color: adv.color }">
                      {{ initials(adv.name) }}
                    </div>
                    <div class="emp-info">
                      <span class="emp-name">{{ adv.name }}</span>
                      <span class="emp-dept">{{ adv.department }}</span>
                    </div>
                  </div>
                </td>

                <!-- Sana -->
                <td>
                  <div class="date-cell">
                    <CalendarDays :size="13" class="date-icon" />
                    <span>{{ formatDate(adv.date) }}</span>
                  </div>
                </td>

                <!-- Miqdor -->
                <td>
                  <span class="amount-chip">{{ fmt(adv.amount) }}</span>
                </td>

                <!-- Maqsad -->
                <td class="purpose-cell">{{ adv.purpose }}</td>

                <!-- To'lash muddati -->
                <td>
                  <div class="date-cell" :class="isOverdue(adv) ? 'overdue-date' : ''">
                    <Clock :size="13" class="date-icon" />
                    <span>{{ formatDate(adv.dueDate) }}</span>
                  </div>
                </td>

                <!-- Holat -->
                <td>
                  <span :class="['s-badge', adv.status]">
                    <component :is="statusIcon(adv.status)" :size="11" />
                    {{ statusLabel(adv.status) }}
                  </span>
                </td>

                <!-- Amallar -->
                <td class="act-cell">
                  <button
                    v-if="adv.status !== 'repaid'"
                    class="act-btn repay-btn"
                    title="Qaytarildi deb belgilash"
                    @click="openRepayModal(adv)"
                  ><CheckCheck :size="14" /></button>
                  <button class="act-btn edit-btn" title="Tahrirlash" @click="openEditModal(adv)">
                    <Pencil :size="14" />
                  </button>
                  <button class="act-btn del-btn" title="O'chirish" @click="remove(adv.id)">
                    <Trash2 :size="14" />
                  </button>
                </td>

              </tr>
            </template>

          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span>{{ filtered.length }} ta yozuv</span>
        <span class="footer-right">
          Qaytarilmagan: <strong>{{ fmt(totalPending) }}</strong>
        </span>
      </div>
    </div>

    <!-- ── ADD / EDIT MODAL ───────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="formM.open" class="overlay" @click.self="formM.open = false">
          <div class="modal">
            <div class="mhead">
              <h3 class="mtitle">{{ formM.editing ? 'Avansni tahrirlash' : 'Avans berish' }}</h3>
              <button class="mclose" @click="formM.open = false"><X :size="18" /></button>
            </div>
            <div class="mbody">

              <div class="fgroup">
                <label class="flabel">Xodim</label>
                <select v-model="formM.data.empId" class="finput">
                  <option value="" disabled>Xodimni tanlang...</option>
                  <option v-for="e in EMPLOYEES" :key="e.id" :value="e.id">
                    {{ e.name }} — {{ e.department }}
                  </option>
                </select>
              </div>

              <div class="frow">
                <div class="fgroup">
                  <label class="flabel">Miqdor (so'm)</label>
                  <input v-model.number="formM.data.amount" type="number" class="finput" min="0" placeholder="0" />
                </div>
                <div class="fgroup">
                  <label class="flabel">Berilgan sana</label>
                  <input v-model="formM.data.date" type="date" class="finput" />
                </div>
              </div>

              <div class="fgroup">
                <label class="flabel">Maqsad</label>
                <input v-model="formM.data.purpose" type="text" class="finput" placeholder="Tibbiy xarajat, ta'lim..." />
              </div>

              <div class="fgroup">
                <label class="flabel">To'lash muddati</label>
                <input v-model="formM.data.dueDate" type="date" class="finput" />
              </div>

            </div>
            <div class="mfoot">
              <button class="btn-cancel" @click="formM.open = false">Bekor</button>
              <button class="btn-save" @click="saveForm">
                <Plus v-if="!formM.editing" :size="15" />
                <Check v-else :size="15" />
                {{ formM.editing ? 'Saqlash' : 'Qo\'shish' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── REPAY CONFIRM MODAL ────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="repayM.open" class="overlay" @click.self="repayM.open = false">
          <div class="modal modal-sm">
            <div class="mhead">
              <h3 class="mtitle">Qaytarilganini tasdiqlash</h3>
              <button class="mclose" @click="repayM.open = false"><X :size="18" /></button>
            </div>
            <div class="mbody">
              <div class="confirm-info">
                <div class="confirm-icon">
                  <CheckCircle2 :size="32" color="#059669" />
                </div>
                <div>
                  <p class="confirm-name">{{ repayM.adv?.name }}</p>
                  <p class="confirm-amount">{{ fmt(repayM.adv?.amount) }} qaytarildi deb belgilanadi</p>
                </div>
              </div>
            </div>
            <div class="mfoot">
              <button class="btn-cancel" @click="repayM.open = false">Bekor</button>
              <button class="btn-repay" @click="confirmRepay">
                <CheckCheck :size="15" /> Tasdiqlash
              </button>
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
  Wallet, CheckCircle2, AlertCircle, Users, Search, Plus,
  CalendarDays, Clock, CheckCheck, Pencil, Trash2, X, Check
} from 'lucide-vue-next'

// ── HELPERS ──────────────────────────────────────────────
const initials   = (n) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
const fmt        = (v) => v ? Number(v).toLocaleString('uz-UZ') + " so'm" : "0 so'm"
const formatDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { day:'2-digit', month:'short', year:'numeric' }) : '—'
const isOverdue  = (adv) => adv.status !== 'repaid' && adv.dueDate && new Date(adv.dueDate) < new Date()
const today      = () => new Date().toISOString().slice(0, 10)

const statusLabel = (s) => ({ pending:'Kutilmoqda', repaid:'Qaytarilgan', overdue:"Muddati o'tgan" }[s] || s)
const statusIcon  = (s) => ({ pending: Clock, repaid: CheckCircle2, overdue: AlertCircle }[s] || Clock)

// ── REFERENCE DATA ────────────────────────────────────────
const EMPLOYEES = [
  { id:1, name:'Alisher Karimov',   department:'IT',     color:'#7c3aed' },
  { id:2, name:'Malika Yusupova',   department:'Design', color:'#059669' },
  { id:3, name:"Jamshid To'xtaev",  department:'HR',     color:'#2563eb' },
  { id:4, name:'Nodira Ergasheva',  department:'Moliya', color:'#d97706' },
  { id:5, name:'Sardor Nazarov',    department:'Savdo',  color:'#dc2626' },
  { id:6, name:'Zulfiya Xoliqova',  department:'IT',     color:'#0891b2' },
]

// ── STATE ─────────────────────────────────────────────────
const search       = ref('')
const filterStatus = ref('')

const advances = ref([
  { id:1, empId:1, name:'Alisher Karimov',   department:'IT',     color:'#7c3aed', amount:500000,  date:'2026-03-01', dueDate:'2026-04-01', purpose:'Tibbiy xarajat',     status:'pending' },
  { id:2, empId:3, name:"Jamshid To'xtaev",  department:'HR',     color:'#2563eb', amount:300000,  date:'2026-03-05', dueDate:'2026-04-05', purpose:"Ko'chish xarajati",   status:'pending' },
  { id:3, empId:5, name:'Sardor Nazarov',    department:'Savdo',  color:'#dc2626', amount:200000,  date:'2026-02-10', dueDate:'2026-03-10', purpose:'Shaxsiy ehtiyoj',     status:'overdue' },
  { id:4, empId:2, name:'Malika Yusupova',   department:'Design', color:'#059669', amount:400000,  date:'2026-02-15', dueDate:'2026-03-15', purpose:"Ta'lim to'lovi",      status:'repaid'  },
  { id:5, empId:6, name:'Zulfiya Xoliqova',  department:'IT',     color:'#0891b2', amount:600000,  date:'2026-03-03', dueDate:'2026-04-03', purpose:'Uy ta\'miri',         status:'pending' },
  { id:6, empId:4, name:'Nodira Ergasheva',  department:'Moliya', color:'#d97706', amount:250000,  date:'2026-02-20', dueDate:'2026-03-20', purpose:'Oilaviy tadbirlar',   status:'repaid'  },
])

// ── COMPUTED ──────────────────────────────────────────────
const filtered = computed(() => {
  let list = advances.value
  if (filterStatus.value) list = list.filter(a => a.status === filterStatus.value)
  const q = search.value.toLowerCase()
  if (q) list = list.filter(a => a.name.toLowerCase().includes(q) || a.purpose.toLowerCase().includes(q))
  return list
})

const totalGiven   = computed(() => advances.value.reduce((s, a) => s + a.amount, 0))
const totalRepaid  = computed(() => advances.value.filter(a => a.status === 'repaid').reduce((s, a) => s + a.amount, 0))
const totalPending = computed(() => advances.value.filter(a => a.status !== 'repaid').reduce((s, a) => s + a.amount, 0))
const activeCount  = computed(() => new Set(advances.value.filter(a => a.status !== 'repaid').map(a => a.empId)).size)

// ── ADD / EDIT MODAL ──────────────────────────────────────
const emptyForm = () => ({ empId: '', amount: 0, date: today(), dueDate: '', purpose: '', id: null })

const formM = ref({ open: false, editing: false, data: emptyForm() })

const openAddModal = () => {
  formM.value = { open: true, editing: false, data: emptyForm() }
}

const openEditModal = (adv) => {
  formM.value = {
    open: true,
    editing: true,
    data: { empId: adv.empId, amount: adv.amount, date: adv.date, dueDate: adv.dueDate, purpose: adv.purpose, id: adv.id }
  }
}

const saveForm = () => {
  const { empId, amount, date, dueDate, purpose, id } = formM.value.data
  if (!empId || !amount || !date) return

  const emp = EMPLOYEES.find(e => e.id === empId)
  if (!emp) return

  if (formM.value.editing) {
    const idx = advances.value.findIndex(a => a.id === id)
    if (idx !== -1) {
      const old = advances.value[idx]
      advances.value[idx] = { ...old, empId, name: emp.name, department: emp.department, color: emp.color, amount, date, dueDate, purpose }
    }
  } else {
    advances.value.push({
      id: Date.now(),
      empId, name: emp.name, department: emp.department, color: emp.color,
      amount, date, dueDate, purpose,
      status: isOverdue({ status: 'pending', dueDate }) ? 'overdue' : 'pending'
    })
  }
  formM.value.open = false
}

// ── REPAY MODAL ───────────────────────────────────────────
const repayM = ref({ open: false, adv: null })

const openRepayModal = (adv) => {
  repayM.value = { open: true, adv }
}

const confirmRepay = () => {
  if (repayM.value.adv) {
    const idx = advances.value.findIndex(a => a.id === repayM.value.adv.id)
    if (idx !== -1) advances.value[idx].status = 'repaid'
  }
  repayM.value.open = false
}

// ── REMOVE ────────────────────────────────────────────────
const remove = (id) => {
  advances.value = advances.value.filter(a => a.id !== id)
}
</script>

<style scoped>
/* ── PAGE ───────────────────────────────────────────────── */
.advance-page {
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
  font-size: 17px;
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

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 10px;
  background: var(--surface2);
  transition: border-color 0.15s;
}

.search-box:focus-within { border-color: var(--accent-br); }

.s-icon { color: var(--t4); flex-shrink: 0; }

.search-box input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--t1);
  width: 180px;
  font-family: inherit;
}

.search-box input::placeholder { color: var(--t4); }

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

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
  white-space: nowrap;
  font-family: inherit;
}

.add-btn:hover { opacity: 0.88; }

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

/* ── DATE CELL ──────────────────────────────────────────── */
.date-cell {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--t3);
  font-size: 12.5px;
  white-space: nowrap;
}

.date-icon { flex-shrink: 0; }

.overdue-date { color: #dc2626; }
:global(.layout.dark) .overdue-date { color: #f87171; }

/* ── AMOUNT CHIP ────────────────────────────────────────── */
.amount-chip {
  display: inline-block;
  padding: 3px 10px;
  background: var(--accent-bg);
  color: var(--accent);
  border: 1px solid var(--accent-br);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* ── PURPOSE ────────────────────────────────────────────── */
.purpose-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--t3);
  font-size: 12.5px;
}

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

.s-badge.pending { background: #fef3c7; color: #92400e; }
.s-badge.repaid  { background: #d1fae5; color: #065f46; }
.s-badge.overdue { background: #fee2e2; color: #991b1b; }

:global(.layout.dark) .s-badge.pending { background: rgba(217,119,6,0.15);  color: #fbbf24; }
:global(.layout.dark) .s-badge.repaid  { background: rgba(5,150,105,0.15);  color: #34d399; }
:global(.layout.dark) .s-badge.overdue { background: rgba(220,38,38,0.15);  color: #f87171; }

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

.repay-btn { color: #059669; }
.repay-btn:hover { background: #d1fae5; border-color: #6ee7b7; }

.edit-btn { color: var(--accent); }
.edit-btn:hover { background: var(--accent-bg); border-color: var(--accent-br); }

.del-btn { color: #dc2626; }
.del-btn:hover { background: #fee2e2; border-color: #fca5a5; }

:global(.layout.dark) .repay-btn:hover { background: rgba(5,150,105,0.15); border-color: rgba(5,150,105,0.3); }
:global(.layout.dark) .del-btn:hover   { background: rgba(220,38,38,0.15); border-color: rgba(220,38,38,0.3); }

/* ── EMPTY STATE ────────────────────────────────────────── */
.empty-cell {
  text-align: center;
  padding: 52px 16px !important;
  color: var(--t4);
}

.empty-icon {
  display: block;
  margin: 0 auto 10px;
  opacity: 0.3;
}

.empty-cell p { margin: 0; font-size: 14px; }

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

/* ── OVERLAY ────────────────────────────────────────────── */
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

:global(.layout.dark) .overlay { background: rgba(0, 0, 0, 0.65); }

.modal {
  background: var(--surface);
  border-radius: 16px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  overflow: hidden;
}

.modal-sm { max-width: 380px; }

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

.mbody {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.frow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

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
  width: 100%;
  box-sizing: border-box;
}

.finput:focus {
  border-color: var(--accent-br);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

/* confirm block */
.confirm-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  background: var(--surface2);
  border-radius: 10px;
  border: 1px solid var(--border);
}

.confirm-icon { flex-shrink: 0; }

.confirm-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--t1);
}

.confirm-amount {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--t3);
}

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

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: none;
  border-radius: 9px;
  background: var(--accent);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}

.btn-save:hover { opacity: 0.88; }

.btn-repay {
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

.btn-repay:hover { opacity: 0.88; }

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
  .advance-page { padding: 16px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .card-head { flex-direction: column; align-items: stretch; }
  .head-controls { flex-direction: column; }
  .search-box input { width: 100%; }
  .frow { grid-template-columns: 1fr; }
}
</style>
