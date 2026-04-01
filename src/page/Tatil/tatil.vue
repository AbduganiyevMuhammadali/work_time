<template>
  <div class="leave-page">

    <!-- ── STAT CARDS ───────────────────────────────────────── -->
    <div class="stats-grid">
      <div class="stat-card" style="--ca:#d97706;--ca-bg:#fef3c7">
        <div class="stat-icon"><Clock :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ countByStatus('pending') }}</span>
          <span class="stat-lbl">Kutilmoqda</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#059669;--ca-bg:#d1fae5">
        <div class="stat-icon"><CheckCircle2 :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ countByStatus('approved') }}</span>
          <span class="stat-lbl">Tasdiqlangan</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#dc2626;--ca-bg:#fee2e2">
        <div class="stat-icon"><XCircle :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ countByStatus('rejected') }}</span>
          <span class="stat-lbl">Rad etilgan</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#7c3aed;--ca-bg:#ede9fe">
        <div class="stat-icon"><CalendarOff :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ totalDays }}</span>
          <span class="stat-lbl">Jami kun</span>
        </div>
      </div>
    </div>

    <!-- ── TABLE CARD ────────────────────────────────────────── -->
    <div class="table-card">
      <div class="card-head">
        <div class="card-title-group">
          <h2 class="card-title">Ta'til so'rovlari</h2>
          <span class="card-sub">Xodimlarning ta'til va ruxsat so'rovlari</span>
        </div>
        <div class="head-controls">

          <div class="search-box">
            <Search :size="14" class="s-icon" />
            <input v-model="search" placeholder="Xodim yoki tur..." />
          </div>

          <select v-model="filterStatus" class="sel">
            <option value="">Barcha holat</option>
            <option value="pending">Kutilmoqda</option>
            <option value="approved">Tasdiqlangan</option>
            <option value="rejected">Rad etilgan</option>
          </select>

          <select v-model="filterType" class="sel">
            <option value="">Barcha tur</option>
            <option value="annual">Yillik ta'til</option>
            <option value="sick">Kasallik</option>
            <option value="unpaid">Haqsiz ta'til</option>
            <option value="maternity">Tug'ruq ta'tili</option>
            <option value="other">Boshqa</option>
          </select>

          <button class="add-btn" @click="openModal(null)">
            <Plus :size="15" /><span>So'rov qo'shish</span>
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Xodim</th>
              <th>Ta'til turi</th>
              <th>Boshlanish</th>
              <th>Tugash</th>
              <th>Kunlar</th>
              <th>Sabab</th>
              <th>Holat</th>
              <th class="th-act">Amallar</th>
            </tr>
          </thead>
          <tbody>

            <template v-if="filtered.length === 0">
              <tr>
                <td colspan="8" class="empty-cell">
                  <CalendarOff :size="36" class="empty-icon" />
                  <p>So'rovlar topilmadi</p>
                </td>
              </tr>
            </template>

            <template v-else>
              <tr v-for="req in filtered" :key="req.id">

                <!-- Xodim -->
                <td>
                  <div class="emp-cell">
                    <div class="av" :style="{ background: req.color + '22', color: req.color }">
                      {{ initials(req.employeeName) }}
                    </div>
                    <div class="emp-info">
                      <span class="emp-name">{{ req.employeeName }}</span>
                      <span class="emp-dept">{{ req.department }}</span>
                    </div>
                  </div>
                </td>

                <!-- Tur -->
                <td>
                  <span class="type-badge" :class="req.type">{{ TYPE_LBL[req.type] }}</span>
                </td>

                <!-- Boshlanish -->
                <td class="date-cell">{{ formatDate(req.startDate) }}</td>

                <!-- Tugash -->
                <td class="date-cell">{{ formatDate(req.endDate) }}</td>

                <!-- Kunlar -->
                <td>
                  <span class="days-chip">{{ calcDays(req.startDate, req.endDate) }} kun</span>
                </td>

                <!-- Sabab -->
                <td class="reason-cell">{{ req.reason || '—' }}</td>

                <!-- Holat -->
                <td>
                  <span :class="['s-badge', req.status]">{{ STATUS_LBL[req.status] }}</span>
                </td>

                <!-- Amallar -->
                <td class="act-cell">
                  <button
                    v-if="req.status === 'pending'"
                    class="act-btn approve-btn"
                    title="Tasdiqlash"
                    @click="changeStatus(req.id, 'approved')"
                  >
                    <Check :size="13" />
                  </button>
                  <button
                    v-if="req.status === 'pending'"
                    class="act-btn reject-btn"
                    title="Rad etish"
                    @click="changeStatus(req.id, 'rejected')"
                  >
                    <X :size="13" />
                  </button>
                  <button
                    v-if="req.status !== 'pending'"
                    class="act-btn reset-btn"
                    title="Qayta ko'rish"
                    @click="changeStatus(req.id, 'pending')"
                  >
                    <RotateCcw :size="13" />
                  </button>
                  <button class="act-btn edit-btn" title="Tahrirlash" @click="openModal(req)">
                    <Pencil :size="13" />
                  </button>
                  <button class="act-btn del-btn" title="O'chirish" @click="removeReq(req.id)">
                    <Trash2 :size="13" />
                  </button>
                </td>

              </tr>
            </template>

          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span>{{ filtered.length }} ta so'rov ko'rsatilmoqda</span>
      </div>
    </div>

    <!-- ── MODAL ─────────────────────────────────────────────── -->
    <div v-if="modalOpen" class="modal-backdrop" @click.self="modalOpen = false">
      <div class="modal">
        <div class="modal-head">
          <div>
            <h3 class="modal-title">{{ editing ? "So'rovni tahrirlash" : "Yangi ta'til so'rovi" }}</h3>
            <p class="modal-sub">Xodim ta'til so'rovini to'ldiring</p>
          </div>
          <button class="close-btn" @click="modalOpen = false"><X :size="18" /></button>
        </div>

        <form class="modal-form" @submit.prevent="saveReq">

          <!-- Xodim -->
          <div class="form-row">
            <div class="form-group">
              <label>Xodim <span class="req">*</span></label>
              <select v-model="form.employeeId" required @change="onEmpChange">
                <option value="" disabled>Xodim tanlang</option>
                <option v-for="e in EMPLOYEES" :key="e.id" :value="e.id">{{ e.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Ta'til turi <span class="req">*</span></label>
              <select v-model="form.type" required>
                <option value="annual">Yillik ta'til</option>
                <option value="sick">Kasallik varaqasi</option>
                <option value="unpaid">Haqsiz ta'til</option>
                <option value="maternity">Tug'ruq ta'tili</option>
                <option value="other">Boshqa</option>
              </select>
            </div>
          </div>

          <!-- Sanalar -->
          <div class="form-row">
            <div class="form-group">
              <label>Boshlanish sanasi <span class="req">*</span></label>
              <input type="date" v-model="form.startDate" required />
            </div>
            <div class="form-group">
              <label>Tugash sanasi <span class="req">*</span></label>
              <input type="date" v-model="form.endDate" required />
            </div>
          </div>

          <!-- Kun hisob -->
          <div v-if="form.startDate && form.endDate" class="days-info">
            <CalendarOff :size="14" />
            <span>Jami: <strong>{{ calcDays(form.startDate, form.endDate) }} ish kuni</strong></span>
          </div>

          <!-- Sabab -->
          <div class="form-group">
            <label>Sabab</label>
            <textarea v-model="form.reason" placeholder="Ta'til sababini kiriting..." rows="3"></textarea>
          </div>

          <!-- Holat (admin uchun) -->
          <div class="form-group">
            <label>Holat</label>
            <select v-model="form.status">
              <option value="pending">Kutilmoqda</option>
              <option value="approved">Tasdiqlangan</option>
              <option value="rejected">Rad etilgan</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="modalOpen = false">Bekor qilish</button>
            <button type="submit" class="save-btn">
              <Check :size="14" /> {{ editing ? 'Saqlash' : "Qo'shish" }}
            </button>
          </div>

        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Search, Plus, Check, X, Pencil, Trash2, RotateCcw,
  Clock, CheckCircle2, XCircle, CalendarOff
} from 'lucide-vue-next'

// ─── Constants ───────────────────────────────────────────────
const STATUS_LBL = { pending: 'Kutilmoqda', approved: 'Tasdiqlangan', rejected: 'Rad etilgan' }
const TYPE_LBL   = { annual: 'Yillik', sick: 'Kasallik', unpaid: 'Haqsiz', maternity: "Tug'ruq", other: 'Boshqa' }

const EMPLOYEES = [
  { id: 1, name: 'Alisher Karimov',   department: 'IT',     color: '#7c3aed' },
  { id: 2, name: 'Malika Yusupova',   department: 'Design', color: '#059669' },
  { id: 3, name: "Jamshid To'xtaev",  department: 'HR',     color: '#2563eb' },
  { id: 4, name: 'Nodira Ergasheva',  department: 'Moliya', color: '#d97706' },
  { id: 5, name: 'Sardor Nazarov',    department: 'Savdo',  color: '#dc2626' },
  { id: 6, name: 'Zulfiya Xoliqova',  department: 'IT',     color: '#0891b2' },
]

// ─── State ───────────────────────────────────────────────────
const search       = ref('')
const filterStatus = ref('')
const filterType   = ref('')
const modalOpen    = ref(false)
const editing      = ref(null)

const defaultForm = () => ({
  employeeId: '', employeeName: '', department: '', color: '',
  type: 'annual', startDate: '', endDate: '',
  reason: '', status: 'pending',
})
const form = ref(defaultForm())

const requests = ref([
  { id: 1, employeeId: 5, employeeName: 'Sardor Nazarov',   department: 'Savdo',  color: '#dc2626', type: 'annual',   startDate: '2026-03-10', endDate: '2026-03-21', reason: 'Yillik ta\'til',       status: 'approved' },
  { id: 2, employeeId: 4, employeeName: 'Nodira Ergasheva', department: 'Moliya', color: '#d97706', type: 'sick',     startDate: '2026-03-05', endDate: '2026-03-07', reason: 'Grippe',               status: 'approved' },
  { id: 3, employeeId: 3, employeeName: "Jamshid To'xtaev", department: 'HR',     color: '#2563eb', type: 'annual',   startDate: '2026-03-15', endDate: '2026-03-20', reason: "Oilaviy tadbirlar",    status: 'pending'  },
  { id: 4, employeeId: 2, employeeName: 'Malika Yusupova',  department: 'Design', color: '#059669', type: 'unpaid',   startDate: '2026-03-08', endDate: '2026-03-09', reason: "Shaxsiy ish",          status: 'pending'  },
  { id: 5, employeeId: 1, employeeName: 'Alisher Karimov',  department: 'IT',     color: '#7c3aed', type: 'sick',     startDate: '2026-02-20', endDate: '2026-02-22', reason: 'Shamollash',           status: 'rejected' },
  { id: 6, employeeId: 6, employeeName: 'Zulfiya Xoliqova', department: 'IT',     color: '#0891b2', type: 'annual',   startDate: '2026-04-01', endDate: '2026-04-14', reason: "Yillik dam olish",     status: 'pending'  },
])

// ─── Computed ─────────────────────────────────────────────────
const filtered = computed(() => {
  let list = requests.value
  if (search.value)       list = list.filter(r => r.employeeName.toLowerCase().includes(search.value.toLowerCase()) || TYPE_LBL[r.type].toLowerCase().includes(search.value.toLowerCase()))
  if (filterStatus.value) list = list.filter(r => r.status === filterStatus.value)
  if (filterType.value)   list = list.filter(r => r.type === filterType.value)
  return list
})

const countByStatus = (s)  => requests.value.filter(r => r.status === s).length
const totalDays     = computed(() => requests.value.filter(r => r.status === 'approved').reduce((sum, r) => sum + calcDays(r.startDate, r.endDate), 0))

// ─── Helpers ──────────────────────────────────────────────────
const initials  = (name) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
const calcDays  = (s, e) => {
  if (!s || !e) return 0
  const diff = (new Date(e) - new Date(s)) / 86400000
  return diff < 0 ? 0 : Math.round(diff) + 1
}
const formatDate = (d) => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}.${m}.${y}`
}

// ─── Modal ────────────────────────────────────────────────────
const onEmpChange = () => {
  const emp = EMPLOYEES.find(e => e.id === form.value.employeeId)
  if (emp) {
    form.value.employeeName = emp.name
    form.value.department   = emp.department
    form.value.color        = emp.color
  }
}

const openModal = (req) => {
  editing.value = req
  form.value = req
    ? { ...req }
    : defaultForm()
  modalOpen.value = true
}

const saveReq = () => {
  if (editing.value) {
    const idx = requests.value.findIndex(r => r.id === editing.value.id)
    if (idx !== -1) requests.value[idx] = { ...form.value }
  } else {
    requests.value.push({ ...form.value, id: Date.now() })
  }
  modalOpen.value = false
}

const changeStatus = (id, status) => {
  const req = requests.value.find(r => r.id === id)
  if (req) req.status = status
}

const removeReq = (id) => {
  requests.value = requests.value.filter(r => r.id !== id)
}
</script>

<style scoped>
/* ── PAGE ───────────────────────────────────────────────────── */
.leave-page {
  padding: 24px;
  background: var(--bg);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}

/* ── STAT CARDS ─────────────────────────────────────────────── */
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
  box-shadow: var(--shadow-sm);
  border-bottom: 3px solid var(--ca);
}
.stat-icon {
  width: 42px; height: 42px;
  border-radius: 10px;
  background: var(--ca-bg);
  color: var(--ca);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
:global(.layout.dark) .stat-icon { background: color-mix(in srgb, var(--ca) 15%, transparent); }
.stat-val { display: block; font-size: 24px; font-weight: 700; color: var(--t1); line-height: 1.1; }
.stat-lbl { display: block; font-size: 12px; color: var(--t3); margin-top: 2px; }

/* ── TABLE CARD ─────────────────────────────────────────────── */
.table-card {
  background: var(--surface);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
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
.card-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--t1); }
.card-sub   { display: block; font-size: 12px; color: var(--t3); margin-top: 2px; }

.head-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 10px;
  background: var(--surface2);
  transition: border-color 0.15s;
}
.search-box:focus-within { border-color: var(--accent-br); }
.s-icon { color: var(--t4); flex-shrink: 0; }
.search-box input {
  border: none; outline: none;
  background: transparent;
  font-size: 13px; color: var(--t1);
  width: 160px;
}
.search-box input::placeholder { color: var(--t4); }

.sel {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 13px;
  color: var(--t1);
  background: var(--surface2);
  outline: none;
  cursor: pointer;
}
.sel:focus { border-color: var(--accent-br); }

.add-btn {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent); color: #fff;
  border: none; border-radius: 8px;
  padding: 8px 14px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: opacity 0.15s; white-space: nowrap;
}
.add-btn:hover { opacity: 0.88; }

/* ── TABLE ──────────────────────────────────────────────────── */
.table-wrap { overflow-x: auto; padding-top: 16px; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead th {
  background: var(--surface2); color: var(--t3);
  font-weight: 600; font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.5px;
  padding: 9px 14px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.th-act { text-align: center; }
tbody td {
  padding: 11px 14px;
  border-bottom: 1px solid var(--border2);
  color: var(--t2);
  vertical-align: middle;
}
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td     { background: var(--surface2); }

.emp-cell { display: flex; align-items: center; gap: 9px; }
.av {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.emp-name  { display: block; font-weight: 600; color: var(--t1); font-size: 13px; }
.emp-dept  { display: block; font-size: 11px; color: var(--t4); }

.date-cell   { font-size: 12px; color: var(--t3); white-space: nowrap; }
.reason-cell { max-width: 160px; font-size: 12px; color: var(--t3); }

.days-chip {
  display: inline-block;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--t2);
  white-space: nowrap;
}

/* Type badge */
.type-badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.type-badge.annual    { background: #ede9fe; color: #5b21b6; }
.type-badge.sick      { background: #fee2e2; color: #991b1b; }
.type-badge.unpaid    { background: #f3f4f6; color: #374151; }
.type-badge.maternity { background: #fce7f3; color: #9d174d; }
.type-badge.other     { background: #fef3c7; color: #92400e; }

:global(.layout.dark) .type-badge.annual    { background: rgba(124,58,237,0.15);  color: #a78bfa; }
:global(.layout.dark) .type-badge.sick      { background: rgba(220,38,38,0.15);   color: #f87171; }
:global(.layout.dark) .type-badge.unpaid    { background: rgba(107,114,128,0.15); color: #9ca3af; }
:global(.layout.dark) .type-badge.maternity { background: rgba(219,39,119,0.15);  color: #f472b6; }
:global(.layout.dark) .type-badge.other     { background: rgba(217,119,6,0.15);   color: #fbbf24; }

/* Status badge */
.s-badge {
  padding: 3px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 500; white-space: nowrap;
}
.s-badge.pending  { background: #fef3c7; color: #92400e; }
.s-badge.approved { background: #d1fae5; color: #065f46; }
.s-badge.rejected { background: #fee2e2; color: #991b1b; }

:global(.layout.dark) .s-badge.pending  { background: rgba(217,119,6,0.15);  color: #fbbf24; }
:global(.layout.dark) .s-badge.approved { background: rgba(5,150,105,0.15);  color: #34d399; }
:global(.layout.dark) .s-badge.rejected { background: rgba(220,38,38,0.15);  color: #f87171; }

/* Action buttons */
.act-cell { display: flex; gap: 4px; justify-content: center; }
.act-btn {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface2);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.approve-btn { color: #059669; }
.approve-btn:hover { background: #d1fae5; border-color: #6ee7b7; }
.reject-btn  { color: #dc2626; }
.reject-btn:hover  { background: #fee2e2; border-color: #fca5a5; }
.reset-btn   { color: #d97706; }
.reset-btn:hover   { background: #fef3c7; border-color: #fde68a; }
.edit-btn    { color: var(--accent); }
.edit-btn:hover    { background: var(--accent-bg); border-color: var(--accent-br); }
.del-btn     { color: #dc2626; }
.del-btn:hover     { background: #fee2e2; border-color: #fca5a5; }

:global(.layout.dark) .approve-btn:hover { background: rgba(5,150,105,0.15);  border-color: rgba(5,150,105,0.3); }
:global(.layout.dark) .reject-btn:hover  { background: rgba(220,38,38,0.15);  border-color: rgba(220,38,38,0.3); }
:global(.layout.dark) .del-btn:hover     { background: rgba(220,38,38,0.15);  border-color: rgba(220,38,38,0.3); }

/* Empty state */
.empty-cell   { text-align: center; padding: 52px 16px !important; color: var(--t4); }
.empty-icon   { display: block; margin: 0 auto 10px; opacity: 0.35; }
.empty-cell p { margin: 0; font-size: 14px; }

.table-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--t4);
}

/* ── MODAL ──────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 999; padding: 16px;
}
.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-md);
  width: 100%; max-width: 540px;
  max-height: 90vh; overflow-y: auto;
  animation: modal-in 0.2s ease;
}
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 20px 20px 0;
}
.modal-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--t1); }
.modal-sub   { margin: 4px 0 0; font-size: 12px; color: var(--t3); }
.close-btn {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 8px; width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--t3); transition: all 0.15s; flex-shrink: 0;
}
.close-btn:hover { background: var(--border); color: var(--t1); }

.modal-form {
  padding: 16px 20px 20px;
  display: flex; flex-direction: column; gap: 14px;
}
.form-row { display: flex; gap: 12px; }
.form-group { flex: 1; display: flex; flex-direction: column; gap: 5px; }
label { font-size: 12px; font-weight: 500; color: var(--t2); }
.req  { color: #dc2626; margin-left: 2px; }
input, select, textarea {
  border: 1px solid var(--border);
  border-radius: 8px; padding: 8px 10px;
  font-size: 13px; color: var(--t1);
  background: var(--surface2);
  outline: none; transition: border-color 0.15s;
  width: 100%; box-sizing: border-box;
  font-family: inherit;
}
input:focus, select:focus, textarea:focus { border-color: var(--accent-br); box-shadow: 0 0 0 2px var(--accent-bg); }
textarea { resize: vertical; min-height: 72px; }

.days-info {
  display: flex; align-items: center; gap: 8px;
  background: var(--accent-bg);
  border: 1px solid var(--accent-br);
  border-radius: 8px; padding: 8px 12px;
  font-size: 12px; color: var(--accent);
}

.modal-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
.cancel-btn {
  border: 1px solid var(--border); background: var(--surface2);
  color: var(--t2); border-radius: 8px; padding: 9px 18px;
  font-size: 13px; cursor: pointer; transition: all 0.15s;
}
.cancel-btn:hover { background: var(--border); }
.save-btn {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent); color: #fff;
  border: none; border-radius: 8px; padding: 9px 20px;
  font-size: 13px; font-weight: 500; cursor: pointer; transition: opacity 0.15s;
}
.save-btn:hover { opacity: 0.88; }

/* ── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) {
  .leave-page     { padding: 16px; }
  .card-head      { flex-direction: column; align-items: stretch; }
  .head-controls  { flex-direction: column; }
  .form-row       { flex-direction: column; }
}
</style>
