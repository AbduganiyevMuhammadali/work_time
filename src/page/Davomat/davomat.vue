<script setup>
import { ref, computed } from 'vue'
import {
  Users, UserCheck, Clock, UserX,
  Search, RefreshCw, CalendarDays,
  CheckCircle2, AlertCircle, XCircle,
  ChevronDown, Download
} from 'lucide-vue-next'

const today = new Date().toISOString().split('T')[0]
const selectedDate = ref(today)
const searchQuery   = ref('')
const loading       = ref(false)
const activeFilter  = ref('all')

const formattedDate = computed(() => {
  const d = new Date(selectedDate.value)
  return d.toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

const initials = name => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

const employees = ref([
  { id:  1, name: "O'rinboyev I.I",   role: 'Rentgent',          color: '#7c3aed', arrival: '08:00', departure: '17:00', status: 'on-time', phone: '+998 90 200 20 20' },
  { id:  2, name: 'Tashaliyev D.Q',   role: 'Laborant',           color: '#059669', arrival: '08:00', departure: '16:00', status: 'on-time', phone: '+998 90 201 21 21' },
  { id:  3, name: 'Mirzayeva Umida',  role: 'Laborant',           color: '#2563eb', arrival: '08:45', departure: '17:00', status: 'late',    phone: '+998 90 202 22 22' },
  { id:  4, name: 'Hoshinova Odina',  role: 'Hamshira',           color: '#d97706', arrival: '08:00', departure: '16:00', status: 'on-time', phone: '+998 90 203 23 23' },
  { id:  5, name: 'Karimov Bobur',    role: 'Shifokor',           color: '#dc2626', arrival: null,    departure: null,    status: 'absent',  phone: '+998 90 300 10 10' },
  { id:  6, name: 'Nazarova Malika',  role: 'UI/UX Designer',     color: '#ec4899', arrival: '07:55', departure: '17:10', status: 'on-time', phone: '+998 91 100 11 11' },
  { id:  7, name: 'Toshmatov Bobur',  role: 'Backend Developer',  color: '#6366f1', arrival: '09:22', departure: '18:00', status: 'late',    phone: '+998 91 200 22 22' },
  { id:  8, name: 'Rahimova Nilufar', role: 'QA Engineer',        color: '#059669', arrival: '08:10', departure: '17:00', status: 'on-time', phone: '+998 91 300 33 33' },
  { id:  9, name: 'Mirzayev Jasur',   role: 'DevOps Engineer',    color: '#06b6d4', arrival: '08:30', departure: '17:30', status: 'on-time', phone: '+998 93 400 44 44' },
  { id: 10, name: 'Hasanova Dilorom', role: 'Project Manager',    color: '#f59e0b', arrival: '09:15', departure: '18:00', status: 'late',    phone: '+998 93 500 55 55' },
])

const statusCfg = {
  'on-time': { label: "O'z vaqtida", color: '#059669', bg: '#d1fae5', bgDark: 'rgba(5,150,105,0.15)',  icon: CheckCircle2 },
  'late':    { label: 'Kech keldi',  color: '#dc2626', bg: '#fee2e2', bgDark: 'rgba(220,38,38,0.15)',   icon: AlertCircle  },
  'absent':  { label: 'Kelmadi',     color: '#d97706', bg: '#fef3c7', bgDark: 'rgba(217,119,6,0.15)',   icon: XCircle      },
}

const filterTabs = [
  { key: 'all',     label: 'Hammasi' },
  { key: 'on-time', label: "O'z vaqtida" },
  { key: 'late',    label: 'Kech keldi' },
  { key: 'absent',  label: 'Kelmadi' },
]

const statCards = computed(() => [
  { key: 'all',     label: 'Jami',    value: stats.value.total,  accent: '#7c3aed', accentBg: 'rgba(124,58,237,0.1)',  icon: Users     },
  { key: 'on-time', label: 'Keldi',   value: stats.value.onTime, accent: '#059669', accentBg: 'rgba(5,150,105,0.1)',   icon: UserCheck },
  { key: 'late',    label: 'Kech',    value: stats.value.late,   accent: '#dc2626', accentBg: 'rgba(220,38,38,0.1)',   icon: Clock     },
  { key: 'absent',  label: 'Kelmadi', value: stats.value.absent, accent: '#d97706', accentBg: 'rgba(217,119,6,0.1)',   icon: UserX     },
])

const stats = computed(() => ({
  total:  employees.value.length,
  onTime: employees.value.filter(e => e.status === 'on-time').length,
  late:   employees.value.filter(e => e.status === 'late').length,
  absent: employees.value.filter(e => e.status === 'absent').length,
}))

const attendanceRate = computed(() =>
  Math.round((stats.value.onTime / stats.value.total) * 100)
)

const filteredEmployees = computed(() => {
  let list = employees.value
  const q = searchQuery.value.toLowerCase().trim()
  if (q) list = list.filter(e => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q))
  if (activeFilter.value !== 'all') list = list.filter(e => e.status === activeFilter.value)
  return list
})

const setToday = () => { selectedDate.value = today }

const loadData = async () => {
  loading.value = true
  try { await new Promise(r => setTimeout(r, 900)) }
  finally { loading.value = false }
}

function cycleStatus(emp) {
  const cycle = { 'on-time': 'late', 'late': 'absent', 'absent': 'on-time' }
  emp.status = cycle[emp.status]
  if (emp.status === 'on-time') {
    emp.arrival = '08:00'; emp.departure = '17:00'
  } else if (emp.status === 'late') {
    const m = String(Math.floor(Math.random() * 30) + 5).padStart(2, '0')
    emp.arrival = `09:${m}`; emp.departure = '18:00'
  } else {
    emp.arrival = null; emp.departure = null
  }
}

function rateColor(r) {
  return r >= 80 ? '#059669' : r >= 60 ? '#d97706' : '#dc2626'
}
function rateGradient(r) {
  return r >= 80
    ? 'linear-gradient(90deg,#059669,#34d399)'
    : r >= 60
      ? 'linear-gradient(90deg,#d97706,#fbbf24)'
      : 'linear-gradient(90deg,#dc2626,#f87171)'
}
</script>

<template>
  <div class="page">

    <!-- ══ Header ══ -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Davomat</h2>
        <p class="page-date">{{ formattedDate }}</p>
      </div>
      <button class="export-btn">
        <Download size="15" />
        <span class="export-label">Eksport</span>
      </button>
    </div>

    <!-- ══ Stat cards (clickable filter) ══ -->
    <div class="stat-grid">
      <button
        v-for="card in statCards"
        :key="card.key"
        class="stat-card"
        :class="{ active: activeFilter === card.key }"
        :style="{ '--a': card.accent, '--ab': card.accentBg }"
        @click="activeFilter = card.key"
      >
        <div class="stat-icon">
          <component :is="card.icon" size="19" />
        </div>
        <div class="stat-body">
          <p class="stat-label">{{ card.label }}</p>
          <span class="stat-value">{{ card.value }}</span>
        </div>
      </button>
    </div>

    <!-- ══ Progress bar ══ -->
    <div class="rate-card">
      <div class="rate-top">
        <span class="rate-title">Davomat darajasi</span>
        <span class="rate-pct" :style="{ color: rateColor(attendanceRate) }">{{ attendanceRate }}%</span>
      </div>
      <div class="rate-track">
        <div class="rate-fill" :style="{ width: attendanceRate + '%', background: rateGradient(attendanceRate) }"></div>
      </div>
      <div class="rate-legend">
        <span><i class="dot" style="background:#059669"></i>Keldi: {{ stats.onTime }}</span>
        <span><i class="dot" style="background:#dc2626"></i>Kech: {{ stats.late }}</span>
        <span><i class="dot" style="background:#d97706"></i>Kelmadi: {{ stats.absent }}</span>
      </div>
    </div>

    <!-- ══ Toolbar ══ -->
    <div class="toolbar">
      <!-- Filter tabs -->
      <div class="filter-tabs">
        <button
          v-for="tab in filterTabs"
          :key="tab.key"
          class="ftab"
          :class="{ active: activeFilter === tab.key }"
          @click="activeFilter = tab.key"
        >{{ tab.label }}</button>
      </div>

      <!-- Search + date + refresh -->
      <div class="toolbar-right">
        <div class="search-box">
          <Search size="14" class="search-icon" />
          <input v-model="searchQuery" type="text" placeholder="Qidirish..." class="search-input" />
        </div>
        <div class="date-box">
          <CalendarDays size="14" class="date-icon" />
          <input type="date" v-model="selectedDate" class="date-input" />
        </div>
        <button class="icon-btn today-btn" @click="setToday" title="Bugun">Bugun</button>
        <button class="icon-btn refresh-btn" @click="loadData" :disabled="loading" title="Yangilash">
          <RefreshCw size="15" :class="{ 'spin-anim': loading }" />
        </button>
      </div>
    </div>

    <!-- ══ Content ══ -->
    <div class="content-card">

      <!-- Empty -->
      <div v-if="!loading && filteredEmployees.length === 0" class="empty-state">
        <Users size="42" :stroke-width="1.5" />
        <p>Xodim topilmadi</p>
      </div>

      <!-- ── DESKTOP: Table ── -->
      <div class="desk-wrap">
        <table class="desk-table">
          <thead>
            <tr>
              <th class="col-num">№</th>
              <th>Xodim</th>
              <th>Kelish</th>
              <th>Ketish</th>
              <th>Telefon</th>
              <th>Holat</th>
              <th class="col-act"></th>
            </tr>
          </thead>
          <tbody>
            <!-- Skeleton -->
            <template v-if="loading">
              <tr v-for="n in 6" :key="'sk' + n">
                <td><div class="sk sk-xs"></div></td>
                <td>
                  <div class="emp-cell">
                    <div class="sk sk-av"></div>
                    <div><div class="sk sk-md"></div><div class="sk sk-sm mt4"></div></div>
                  </div>
                </td>
                <td><div class="sk sk-sm"></div></td>
                <td><div class="sk sk-sm"></div></td>
                <td><div class="sk sk-lg"></div></td>
                <td><div class="sk sk-md"></div></td>
                <td></td>
              </tr>
            </template>

            <!-- Rows -->
            <template v-else>
              <tr v-for="(emp, i) in filteredEmployees" :key="emp.id">
                <td class="td-num">{{ i + 1 }}</td>
                <td>
                  <div class="emp-cell">
                    <div class="av-ring" :class="emp.status">
                      <div class="av-inner" :style="{ background: emp.color }">{{ initials(emp.name) }}</div>
                    </div>
                    <div>
                      <p class="emp-name">{{ emp.name }}</p>
                      <p class="emp-role">{{ emp.role }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="chip chip-in">{{ emp.arrival || '—' }}</span></td>
                <td><span class="chip chip-out">{{ emp.departure || '—' }}</span></td>
                <td class="phone-td">{{ emp.phone }}</td>
                <td>
                  <span class="pill" :style="{ background: statusCfg[emp.status].bg, color: statusCfg[emp.status].color }">
                    <component :is="statusCfg[emp.status].icon" size="11" />
                    {{ statusCfg[emp.status].label }}
                  </span>
                </td>
                <td>
                  <button class="cycle-btn" @click="cycleStatus(emp)" title="Holat o'zgartirish">
                    <ChevronDown size="14" />
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- ── MOBILE: Card list ── -->
      <div class="mob-list">
        <!-- Skeleton -->
        <div v-if="loading" class="mob-skel-wrap">
          <div v-for="n in 5" :key="n" class="mob-sk-card">
            <div class="sk sk-av"></div>
            <div class="mob-sk-body">
              <div class="sk sk-lg"></div>
              <div class="sk sk-md mt4"></div>
            </div>
            <div class="sk sk-md"></div>
          </div>
        </div>

        <!-- Employee cards -->
        <template v-else>
          <div
            v-for="(emp, i) in filteredEmployees"
            :key="emp.id"
            class="mob-card"
          >
            <!-- Top row -->
            <div class="mob-top">
              <span class="mob-num">{{ i + 1 }}</span>
              <div class="av-ring" :class="emp.status">
                <div class="av-inner" :style="{ background: emp.color }">{{ initials(emp.name) }}</div>
              </div>
              <div class="mob-info">
                <p class="emp-name">{{ emp.name }}</p>
                <p class="emp-role">{{ emp.role }}</p>
              </div>
              <button class="mob-status-btn" @click="cycleStatus(emp)">
                <component :is="statusCfg[emp.status].icon" size="20" :style="{ color: statusCfg[emp.status].color }" />
              </button>
            </div>

            <!-- Bottom row -->
            <div class="mob-bottom">
              <div class="mob-time">
                <span class="mob-time-lbl">Kelish</span>
                <span class="chip chip-in">{{ emp.arrival || '—' }}</span>
              </div>
              <div class="mob-time">
                <span class="mob-time-lbl">Ketish</span>
                <span class="chip chip-out">{{ emp.departure || '—' }}</span>
              </div>
              <span class="pill" :style="{ background: statusCfg[emp.status].bg, color: statusCfg[emp.status].color }">
                <component :is="statusCfg[emp.status].icon" size="11" />
                {{ statusCfg[emp.status].label }}
              </span>
            </div>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ════════════════════════════════
   Base
   ════════════════════════════════ */
.page {
  padding: 24px;
  background: var(--bg, #f5f6fa);
  min-height: 100%;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--t1, #111827);
  transition: background-color 0.3s ease, color 0.3s ease;
  box-sizing: border-box;
}

/* ════════════════════════════════
   Header
   ════════════════════════════════ */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 22px; font-weight: 700;
  color: var(--t1); margin: 0 0 3px;
  transition: color 0.3s ease;
}

.page-date {
  font-size: 13px; color: var(--t4); margin: 0;
  text-transform: capitalize;
  transition: color 0.3s ease;
}

.export-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 9px;
  font-size: 13px; font-weight: 600;
  color: var(--t2); cursor: pointer;
  font-family: inherit;
  transition: background-color 0.15s, border-color 0.15s, color 0.3s ease;
  white-space: nowrap;
}
.export-btn:hover { background: var(--accent-hv); color: var(--accent); border-color: var(--accent-br); }

/* ════════════════════════════════
   Stat cards
   ════════════════════════════════ */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px;
  background: var(--surface);
  border: 2px solid transparent;
  border-radius: 13px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  box-shadow: 0 1px 5px var(--shadow-sm);
  transition: all 0.18s ease;
}

.stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px var(--shadow-md); }
.stat-card.active { border-color: var(--a); box-shadow: 0 0 0 3px color-mix(in srgb, var(--a) 15%, transparent); }

.stat-icon {
  width: 46px; height: 46px;
  border-radius: 12px;
  background: var(--ab);
  color: var(--a);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.stat-body { flex: 1; }

.stat-label {
  font-size: 12px; color: var(--t4); margin: 0 0 3px;
  font-weight: 500; transition: color 0.3s ease;
}

.stat-value {
  font-size: 26px; font-weight: 800; line-height: 1;
  letter-spacing: -0.5px; color: var(--a);
}

/* ════════════════════════════════
   Progress bar card
   ════════════════════════════════ */
.rate-card {
  background: var(--surface);
  border-radius: 13px;
  padding: 16px 20px;
  box-shadow: 0 1px 5px var(--shadow-sm);
  transition: background-color 0.3s ease;
}

.rate-top {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px;
}

.rate-title { font-size: 13px; font-weight: 600; color: var(--t2); transition: color 0.3s ease; }
.rate-pct   { font-size: 17px; font-weight: 800; transition: color 0.3s ease; }

.rate-track {
  height: 10px;
  background: var(--border2);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
  transition: background-color 0.3s ease;
}

.rate-fill {
  height: 10px;
  border-radius: 8px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.rate-legend {
  display: flex; gap: 18px; flex-wrap: wrap;
}

.rate-legend span {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; color: var(--t3);
  transition: color 0.3s ease;
}

.dot {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  font-style: normal;
}

/* ════════════════════════════════
   Toolbar
   ════════════════════════════════ */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.ftab {
  padding: 6px 14px;
  border: none;
  border-radius: 7px;
  background: none;
  font-size: 12px; font-weight: 600;
  color: var(--t3); cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.ftab:hover { color: var(--accent); background: var(--accent-hv); }
.ftab.active { background: var(--accent); color: #fff; box-shadow: 0 2px 8px rgba(124,58,237,0.3); }

.toolbar-right {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}

.search-box {
  position: relative; display: flex; align-items: center;
}

.search-icon {
  position: absolute; left: 10px; color: var(--t4);
  pointer-events: none; transition: color 0.3s ease;
}

.search-input {
  padding: 8px 12px 8px 32px;
  width: 200px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 9px;
  font-size: 13px; color: var(--t2);
  font-family: inherit; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.3s ease, color 0.3s ease;
}

.search-input:focus {
  border-color: var(--accent-br);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.date-box {
  position: relative; display: flex; align-items: center;
}

.date-icon {
  position: absolute; left: 10px; color: var(--t4);
  pointer-events: none; transition: color 0.3s ease;
}

.date-input {
  padding: 8px 12px 8px 32px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 9px;
  font-size: 13px; color: var(--t2);
  font-family: inherit; outline: none;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.3s ease, color 0.3s ease;
}

.date-input:focus { border-color: var(--accent-br); }

.icon-btn {
  display: flex; align-items: center; justify-content: center;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  color: var(--t3); cursor: pointer;
  font-family: inherit;
  transition: background-color 0.15s, color 0.15s, border-color 0.3s ease;
}

.today-btn {
  padding: 0 14px;
  font-size: 12px; font-weight: 600;
  color: var(--accent);
}
.today-btn:hover { background: var(--accent-hv); border-color: var(--accent-br); }

.refresh-btn {
  width: 36px;
  border-radius: 9px;
}
.refresh-btn:hover { background: var(--accent-hv); color: var(--accent); }
.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ════════════════════════════════
   Content card
   ════════════════════════════════ */
.content-card {
  background: var(--surface);
  border-radius: 14px;
  box-shadow: 0 1px 6px var(--shadow-sm);
  overflow: hidden;
  transition: background-color 0.3s ease;
}

/* ── Empty state ── */
.empty-state {
  text-align: center; padding: 60px 20px;
  color: var(--t4);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  transition: color 0.3s ease;
}
.empty-state p { font-size: 14px; margin: 0; }

/* ── Desktop table ── */
.desk-wrap { overflow-x: auto; }

.desk-table {
  width: 100%; border-collapse: collapse; text-align: left;
}

.desk-table thead { position: sticky; top: 0; z-index: 1; }

.desk-table th {
  background: var(--surface2);
  padding: 11px 16px;
  font-weight: 700; color: var(--t4);
  font-size: 11px; letter-spacing: 0.06em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.desk-table td {
  padding: 11px 16px;
  border-bottom: 1px solid var(--border2);
  font-size: 13px; color: var(--t3);
  vertical-align: middle;
  transition: border-color 0.3s ease, color 0.3s ease;
}

.desk-table tbody tr:last-child td { border-bottom: none; }
.desk-table tbody tr { transition: background-color 0.15s ease; }
.desk-table tbody tr:hover { background: var(--surface2); }

.col-num { width: 44px; text-align: center; }
.col-act { width: 48px; }

.td-num { text-align: center; color: var(--t5); font-weight: 600; }

/* Employee cell */
.emp-cell { display: flex; align-items: center; gap: 10px; }

.av-ring {
  width: 40px; height: 40px;
  border-radius: 50%; padding: 2px; flex-shrink: 0;
}
.av-ring.on-time { background: linear-gradient(135deg, #059669, #34d399); }
.av-ring.late    { background: linear-gradient(135deg, #dc2626, #f87171); }
.av-ring.absent  { background: var(--border); }

.av-inner {
  width: 100%; height: 100%;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff;
  border: 2px solid var(--surface);
  transition: border-color 0.3s ease;
}

.emp-name { font-size: 13px; font-weight: 600; color: var(--t1); margin: 0; transition: color 0.3s ease; }
.emp-role { font-size: 11px; color: var(--t4); margin: 0; transition: color 0.3s ease; }

/* Chips */
.chip {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 6px;
  font-size: 12.5px; font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.chip-in  { background: var(--accent-bg); color: var(--accent); transition: background-color 0.3s ease, color 0.3s ease; }
.chip-out { background: var(--surface2); color: var(--t3); border: 1px solid var(--border); transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease; }

.phone-td { font-variant-numeric: tabular-nums; font-size: 13px; }

/* Status pill */
.pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 11px; border-radius: 20px;
  font-size: 11.5px; font-weight: 700; white-space: nowrap;
  transition: background-color 0.3s ease;
}

/* Cycle button */
.cycle-btn {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px;
  border: 1px solid var(--border);
  border-radius: 8px; background: none;
  color: var(--t4); cursor: pointer;
  transition: all 0.15s ease;
}
.cycle-btn:hover { background: var(--accent-hv); color: var(--accent); border-color: var(--accent-br); }

/* ── Mobile list (hidden on desktop) ── */
.mob-list { display: none; }

/* ════════════════════════════════
   Skeleton
   ════════════════════════════════ */
.sk {
  background: linear-gradient(90deg, var(--border) 25%, var(--border2) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
  border-radius: 6px; height: 13px;
}
.sk-xs { width: 24px; }
.sk-sm { width: 60px; }
.sk-md { width: 90px; }
.sk-lg { width: 130px; }
.sk-av { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; }
.mt4   { margin-top: 5px; }

@keyframes shimmer {
  0%   { background-position:  200% 0; }
  100% { background-position: -200% 0; }
}

/* Refresh spin */
.spin-anim { animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ════════════════════════════════
   Dark mode overrides
   ════════════════════════════════ */
:global(.layout.dark) .pill[style*='#d1fae5'] { background: rgba(5,150,105,0.15) !important; }
:global(.layout.dark) .pill[style*='#fee2e2'] { background: rgba(220,38,38,0.15) !important; }
:global(.layout.dark) .pill[style*='#fef3c7'] { background: rgba(217,119,6,0.15) !important; }

/* ════════════════════════════════
   MOBILE ≤ 768px
   ════════════════════════════════ */
@media (max-width: 768px) {

  .page { padding: 14px 12px; gap: 12px; }

  /* Header */
  .page-title { font-size: 19px; }
  .export-label { display: none; }
  .export-btn { padding: 8px 10px; }

  /* Stat cards: 2x2 */
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stat-card { padding: 12px 14px; gap: 10px; }
  .stat-icon { width: 38px; height: 38px; border-radius: 10px; }
  .stat-value { font-size: 22px; }

  /* Progress bar */
  .rate-card { padding: 12px 14px; }
  .rate-legend { gap: 12px; }
  .rate-legend span { font-size: 11px; }

  /* Toolbar: stack */
  .toolbar { flex-direction: column; align-items: stretch; gap: 8px; }

  .filter-tabs { overflow-x: auto; width: 100%; }
  .ftab { padding: 7px 12px; font-size: 11px; }

  .toolbar-right { width: 100%; justify-content: space-between; }

  .search-input { width: 100%; }
  .search-box { flex: 1; }

  /* Hide date box label on small, keep compact */
  .date-input { width: 130px; font-size: 12px; }

  /* Hide desktop table, show mobile list */
  .desk-wrap { display: none; }
  .mob-list  { display: block; padding: 8px; }

  /* Mobile skeleton */
  .mob-skel-wrap { display: flex; flex-direction: column; gap: 8px; }

  .mob-sk-card {
    display: flex; align-items: center; gap: 12px;
    padding: 12px; border-radius: 10px;
    background: var(--surface2);
  }

  .mob-sk-body { flex: 1; }

  /* Mobile employee card */
  .mob-card {
    border: 1px solid var(--border);
    border-radius: 13px;
    margin-bottom: 8px;
    background: var(--surface);
    overflow: hidden;
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }

  .mob-top {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px;
  }

  .mob-num {
    font-size: 11px; font-weight: 700; color: var(--t5);
    width: 18px; flex-shrink: 0; text-align: center;
    transition: color 0.3s ease;
  }

  .mob-info { flex: 1; min-width: 0; }
  .mob-info .emp-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .mob-status-btn {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; flex-shrink: 0;
    border: none; background: none;
    cursor: pointer; border-radius: 50%;
    transition: background-color 0.15s ease;
  }
  .mob-status-btn:hover { background: var(--surface2); }

  .mob-bottom {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    padding: 8px 14px 12px;
    border-top: 1px solid var(--border2);
    transition: border-color 0.3s ease;
  }

  .mob-time {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
  }

  .mob-time-lbl {
    font-size: 10px; font-weight: 600; color: var(--t4);
    text-transform: uppercase; letter-spacing: 0.4px;
    transition: color 0.3s ease;
  }

  .mob-bottom .pill { margin-left: auto; }
}

/* ════════════════════════════════
   TABLET 769–1024px
   ════════════════════════════════ */
@media (min-width: 769px) and (max-width: 1024px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  .search-input { width: 160px; }
}
</style>
