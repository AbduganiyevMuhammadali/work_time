<template>
  <div class="employees-page">

    <!-- ── STAT CARDS ───────────────────────────────────── -->
    <div class="stats-grid">
      <div class="stat-card" style="--ca:#7c3aed;--ca-bg:#ede9fe">
        <div class="stat-icon"><Users :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ employees.length }}</span>
          <span class="stat-lbl">Jami xodim</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#059669;--ca-bg:#d1fae5">
        <div class="stat-icon"><UserCheck :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ countStatus('active') }}</span>
          <span class="stat-lbl">Faol xodimlar</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#dc2626;--ca-bg:#fee2e2">
        <div class="stat-icon"><UserMinus :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ countStatus('inactive') }}</span>
          <span class="stat-lbl">Nofaol xodimlar</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#d97706;--ca-bg:#fef3c7">
        <div class="stat-icon"><CalendarOff :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ countStatus('leave') }}</span>
          <span class="stat-lbl">Ta'tilda</span>
        </div>
      </div>
    </div>

    <!-- ── TABLE CARD ────────────────────────────────────── -->
    <div class="table-card">
      <div class="card-head">
        <div class="card-title-group">
          <h2 class="card-title">Xodimlar ro'yxati</h2>
          <span class="card-sub">Ish jadvallari va haftalik dam olish kunlari</span>
        </div>
        <div class="head-controls">
          <div class="search-box">
            <Search :size="14" class="s-icon" />
            <input v-model="search" placeholder="Xodim yoki lavozim..." />
          </div>
          <button class="add-btn" @click="openModal(null)">
            <Plus :size="15" /><span>Xodim qo'shish</span>
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Xodim</th>
              <th>Lavozim / Bo'lim</th>
              <th>Ish vaqti</th>
              <th>Haftalik jadval</th>
              <th>Holat</th>
              <th class="th-act">Amallar</th>
            </tr>
          </thead>
          <tbody>

            <!-- SKELETON -->
            <template v-if="loading">
              <tr v-for="i in 5" :key="'sk'+i">
                <td><div class="sk sk-emp"></div></td>
                <td><div class="sk sk-med"></div></td>
                <td><div class="sk sk-sm"></div></td>
                <td><div class="sk sk-days"></div></td>
                <td><div class="sk sk-badge"></div></td>
                <td><div class="sk sk-acts"></div></td>
              </tr>
            </template>

            <!-- EMPTY -->
            <template v-else-if="filtered.length === 0">
              <tr>
                <td colspan="6" class="empty-cell">
                  <UserX :size="36" class="empty-icon" />
                  <p>Xodimlar topilmadi</p>
                </td>
              </tr>
            </template>

            <!-- DATA -->
            <template v-else>
              <tr v-for="emp in filtered" :key="emp.id">

                <!-- Xodim -->
                <td>
                  <div class="emp-cell">
                    <div class="av" :style="!emp.photo ? { background: emp.color + '22', color: emp.color } : {}">
                      <img v-if="emp.photo" :src="emp.photo" :alt="emp.name" class="av-img" />
                      <template v-else>{{ initials(emp.name) }}</template>
                    </div>
                    <div class="emp-info">
                      <span class="emp-name">{{ emp.name }}</span>
                      <span class="emp-contact">{{ emp.phone }}</span>
                    </div>
                  </div>
                </td>

                <!-- Lavozim -->
                <td>
                  <div class="pos-group">
                    <span class="emp-pos">{{ emp.position }}</span>
                    <span class="emp-dept">{{ emp.department }}</span>
                  </div>
                </td>

                <!-- Ish vaqti -->
                <td>
                  <div class="time-cell">
                    <Clock :size="12" />
                    <span>{{ emp.startTime }} – {{ emp.endTime }}</span>
                  </div>
                </td>

                <!-- Haftalik jadval -->
                <td>
                  <div class="week-row">
                    <span
                      v-for="(d, i) in DAY_LABELS"
                      :key="i"
                      :class="['wd', emp.workDays.includes(i) ? 'wd-on' : 'wd-off']"
                      :title="DAY_FULL[i]"
                    >{{ d }}</span>
                  </div>
                </td>

                <!-- Holat -->
                <td>
                  <span :class="['s-badge', emp.status]">{{ STATUS_LBL[emp.status] }}</span>
                </td>

                <!-- Amallar -->
                <td class="act-cell">
                  <button class="act-btn edit-btn" title="Tahrirlash" @click="openModal(emp)">
                    <Pencil :size="14" />
                  </button>
                  <button class="act-btn del-btn" title="O'chirish" @click="removeEmp(emp.id)">
                    <Trash2 :size="14" />
                  </button>
                </td>

              </tr>
            </template>

          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span>{{ filtered.length }} ta xodim ko'rsatilmoqda</span>
      </div>
    </div>

    <!-- MODAL -->
    <EmployeeModal
      v-if="modalOpen"
      :employee="editing"
      @close="modalOpen = false"
      @save="handleSave"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Users, UserCheck, UserMinus, UserX, CalendarOff, Search, Plus, Pencil, Trash2, Clock } from 'lucide-vue-next'
import EmployeeModal from './modal.vue'
import { api } from '@/api/api.js'

const DAY_LABELS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
const DAY_FULL   = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']
const STATUS_LBL = { active: 'Faol', inactive: 'Nofaol', leave: "Ta'tilda" }
const COLORS     = ['#7c3aed', '#059669', '#dc2626', '#d97706', '#2563eb', '#0891b2', '#db2777', '#ea580c']

const search    = ref('')
const loading   = ref(false)
const modalOpen = ref(false)
const editing   = ref(null)
const employees = ref([])

// API dan xodimlarni yuklash va frontga mos formatga o'tkazish
function mapUser(u) {
  return {
    id:           u.id,
    name:         u.fullname,
    username:     u.username,
    role:         u.role,
    position:     u.position    || '',
    department:   u.department  || '',
    phone:        u.phone       || '',
    startTime:    u.start_time  || '09:00',
    endTime:      u.end_time    || '18:00',
    workDays:     Array.isArray(u.work_days) ? u.work_days.map(Number) : [0,1,2,3,4],
    status:       u.emp_status  || 'active',
    color:        u.color       || COLORS[u.id % COLORS.length],
    salary:       parseFloat(u.salary) || 0,
    to_count_time: !!u.to_count_time,
    face_id_name: u.face_id_name || null,
    photo:        u.photo        || null,
  }
}

async function loadEmployees() {
  loading.value = true
  try {
    const data = await api.getUsers()
    employees.value = data.map(mapUser)
  } catch (e) {
    console.error(e.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadEmployees)

const initials    = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
const countStatus = (s)    => employees.value.filter(e => e.status === s).length

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return employees.value.filter(e =>
    e.name.toLowerCase().includes(q) ||
    (e.position || '').toLowerCase().includes(q) ||
    (e.department || '').toLowerCase().includes(q)
  )
})

const openModal = (emp) => {
  editing.value = emp ? { ...emp, workDays: [...(emp.workDays || [])] } : null
  modalOpen.value = true
}

const handleSave = async (data) => {
  const payload = {
    username:      data.username,
    fullname:      data.name,
    role:          data.role || 'Xodim',
    password:      data.password        || undefined,
    position:      data.position,
    department:    data.department,
    phone:         data.phone,
    start_time:    data.startTime,
    end_time:      data.endTime,
    work_days:     data.workDays,
    color:         data.color || COLORS[employees.value.length % COLORS.length],
    emp_status:    data.status,
    salary:        data.salary || 0,
    to_count_time: !!data.to_count_time,
    face_id_name:  data.face_id_name || null,
  }
  try {
    let savedUser
    if (data.id) {
      savedUser = await api.updateUser(data.id, payload)
      const idx = employees.value.findIndex(e => e.id === data.id)
      if (idx !== -1) employees.value[idx] = mapUser(savedUser)
    } else {
      savedUser = await api.createUser(payload)
      employees.value.push(mapUser(savedUser))
    }

    // Rasm yuklash (alohida multipart so'rov)
    const userId = savedUser?.id || data.id
    if (userId && data._selectedFile) {
      const fd = new FormData()
      fd.append('photo', data._selectedFile)
      const photoRes = await api.uploadPhoto(userId, fd)
      if (photoRes.photo) {
        const emp = employees.value.find(e => e.id === userId)
        if (emp) emp.photo = photoRes.photo
      }
    } else if (userId && data._removePhoto) {
      await api.deletePhoto(userId)
      const emp = employees.value.find(e => e.id === userId)
      if (emp) emp.photo = null
    }

    modalOpen.value = false
  } catch (e) {
    alert(e.message)
  }
}

const removeEmp = async (id) => {
  if (!confirm("Xodimni o'chirishni tasdiqlaysizmi?")) return
  try {
    await api.deleteUser(id)
    employees.value = employees.value.filter(e => e.id !== id)
  } catch (e) {
    alert(e.message)
  }
}
</script>

<style scoped>
/* ── PAGE ───────────────────────────────────────────────── */
.employees-page {
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
  box-shadow: var(--shadow-sm);
  border-bottom: 3px solid var(--ca);
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
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
  font-size: 24px;
  font-weight: 700;
  color: var(--t1);
  line-height: 1.1;
}

.stat-lbl {
  display: block;
  font-size: 12px;
  color: var(--t3);
  margin-top: 2px;
}

/* ── TABLE CARD ─────────────────────────────────────────── */
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
  gap: 10px;
  align-items: center;
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

.search-box:focus-within {
  border-color: var(--accent-br);
}

.s-icon {
  color: var(--t4);
  flex-shrink: 0;
}

.search-box input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--t1);
  width: 190px;
}

.search-box input::placeholder {
  color: var(--t4);
}

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
}

.add-btn:hover {
  opacity: 0.88;
}

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
  padding: 9px 16px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.th-act {
  text-align: center;
}

tbody td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--border2);
  color: var(--t2);
  vertical-align: middle;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover td {
  background: var(--surface2);
}

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
  overflow: hidden;
}

.av-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.emp-name {
  display: block;
  font-weight: 600;
  color: var(--t1);
  font-size: 13px;
}

.emp-contact {
  display: block;
  font-size: 11px;
  color: var(--t4);
  margin-top: 1px;
}

/* ── POSITION ───────────────────────────────────────────── */
.pos-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.emp-pos {
  font-weight: 500;
  color: var(--t2);
}

.emp-dept {
  display: inline-block;
  font-size: 11px;
  color: var(--t4);
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 6px;
}

/* ── TIME CELL ──────────────────────────────────────────── */
.time-cell {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--t3);
  font-size: 12px;
}

/* ── WEEKLY SCHEDULE ────────────────────────────────────── */
.week-row {
  display: flex;
  gap: 3px;
}

.wd {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}

.wd-on {
  background: var(--accent-bg);
  color: var(--accent);
  border: 1px solid var(--accent-br);
}

.wd-off {
  background: var(--border2);
  color: var(--t5);
  border: 1px solid transparent;
}

:global(.layout.dark) .wd-on {
  background: rgba(167, 139, 250, 0.15);
  color: #a78bfa;
  border-color: rgba(167, 139, 250, 0.3);
}

:global(.layout.dark) .wd-off {
  background: rgba(255, 255, 255, 0.04);
  color: var(--t5);
}

/* ── STATUS BADGE ───────────────────────────────────────── */
.s-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.s-badge.active   { background: #d1fae5; color: #065f46; }
.s-badge.inactive { background: #fee2e2; color: #991b1b; }
.s-badge.leave    { background: #fef3c7; color: #92400e; }

:global(.layout.dark) .s-badge.active   { background: rgba(5, 150, 105, 0.15);  color: #34d399; }
:global(.layout.dark) .s-badge.inactive { background: rgba(220, 38, 38, 0.15);  color: #f87171; }
:global(.layout.dark) .s-badge.leave    { background: rgba(217, 119, 6, 0.15);  color: #fbbf24; }

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

.edit-btn { color: var(--accent); }
.edit-btn:hover { background: var(--accent-bg); border-color: var(--accent-br); }

.del-btn { color: #dc2626; }
.del-btn:hover { background: #fee2e2; border-color: #fca5a5; }

:global(.layout.dark) .del-btn:hover {
  background: rgba(220, 38, 38, 0.15);
  border-color: rgba(220, 38, 38, 0.3);
}

/* ── SKELETON ───────────────────────────────────────────── */
.sk {
  border-radius: 6px;
  background: var(--border2);
  animation: sk-pulse 1.4s ease-in-out infinite;
}

.sk-emp   { height: 36px; width: 160px; border-radius: 18px; }
.sk-med   { height: 14px; width: 120px; }
.sk-sm    { height: 14px; width: 80px; }
.sk-days  { height: 24px; width: 196px; border-radius: 8px; }
.sk-badge { height: 22px; width: 62px; border-radius: 20px; }
.sk-acts  { height: 30px; width: 68px; border-radius: 7px; }

@keyframes sk-pulse {
  0%, 100% { opacity: 0.45; }
  50%       { opacity: 1; }
}

/* ── EMPTY STATE ────────────────────────────────────────── */
.empty-cell {
  text-align: center;
  padding: 52px 16px !important;
  color: var(--t4);
}

.empty-icon {
  display: block;
  margin: 0 auto 10px;
  opacity: 0.35;
}

.empty-cell p {
  margin: 0;
  font-size: 14px;
}

/* ── FOOTER ─────────────────────────────────────────────── */
.table-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--t4);
}

/* ── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .employees-page { padding: 16px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .card-head { flex-direction: column; align-items: stretch; }
  .head-controls { flex-direction: column; }
  .search-box input { width: 100%; }
}
</style>
