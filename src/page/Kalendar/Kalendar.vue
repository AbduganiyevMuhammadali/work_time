<template>
  <div class="kal-page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Kalendar</h2>
        <p class="page-date">{{ monthLabel }}</p>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="filter-bar">
      <div class="filter-left">
        <div class="input-wrap">
          <svg class="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <input type="date" v-model="startDate" />
        </div>
        <span class="date-sep">—</span>
        <div class="input-wrap">
          <svg class="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <input type="date" v-model="endDate" />
        </div>
        <button class="view-btn" @click="generateDays">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
          Ko'rish
        </button>
      </div>
      <div class="input-wrap search-wrap">
        <svg class="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" v-model="searchQuery" placeholder="Xodim qidirish..." class="search-input" />
      </div>
    </div>

    <!-- Stat chips -->
    <div class="stat-chips">
      <div class="chip">
        <span class="chip-dot" style="background: var(--accent)"></span>
        <span class="chip-label">Jami xodim</span>
        <span class="chip-val">{{ filteredEmployees.length }}</span>
      </div>
      <div class="chip">
        <span class="chip-dot" style="background: #059669"></span>
        <span class="chip-label">O'z vaqtida</span>
        <span class="chip-val">{{ stats.onTime }}</span>
      </div>
      <div class="chip">
        <span class="chip-dot" style="background: #d97706"></span>
        <span class="chip-label">Kech keldi</span>
        <span class="chip-val">{{ stats.late }}</span>
      </div>
      <div class="chip">
        <span class="chip-dot" style="background: var(--t4)"></span>
        <span class="chip-label">Kelmadi</span>
        <span class="chip-val">{{ stats.absent }}</span>
      </div>
      <div class="chip">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent)">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="chip-label">O'rtacha soat</span>
        <span class="chip-val">{{ stats.avgHours }}</span>
      </div>

      <div class="chip-legend">
        <span class="legend-item"><span class="legend-box success-box"></span>O'z vaqtida</span>
        <span class="legend-item"><span class="legend-box late-box"></span>Kech keldi</span>
        <span class="legend-item"><span class="legend-box absent-box"></span>Kelmadi</span>
        <span class="legend-item"><span class="legend-box weekend-box"></span>Dam olish</span>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="table-scroll">
        <table class="kal-table">
          <thead>
            <tr>
              <th class="th-emp">Xodim</th>
              <th
                v-for="d in days" :key="d.key"
                class="th-day"
                :class="{ 'th-weekend': d.isWeekend, 'th-today': d.isToday }"
              >
                <span class="day-num" :class="{ 'day-today': d.isToday }">{{ d.num }}</span>
                <span class="day-wd">{{ d.wd }}</span>
              </th>
              <th class="th-total">Jami</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="emp in filteredEmployees" :key="emp.id">
              <!-- Employee cell -->
              <td class="td-emp">
                <div class="emp-row">
                  <div class="emp-avatar" :style="{ background: emp.color + '33', color: emp.color }">{{ initials(emp.name) }}</div>
                  <div>
                    <p class="emp-name">{{ emp.name }}</p>
                    <p class="emp-role">{{ emp.role }}</p>
                  </div>
                </div>
              </td>

              <!-- Day cells -->
              <td
                v-for="d in days" :key="d.key"
                class="td-day"
                :class="{ 'td-weekend': d.isWeekend, 'td-today': d.isToday }"
              >
                <template v-if="d.isWeekend">
                  <span class="wend-dash">—</span>
                </template>
                <template v-else-if="emp.times[d.key]">
                  <div class="day-cell">
                    <span class="arr-badge" :class="arrClass(emp.times[d.key].in)">
                      {{ emp.times[d.key].in }}
                    </span>
                    <span class="dep-time">{{ emp.times[d.key].out }}</span>
                    <span class="dur-time">{{ fmtMins(workMins(emp.times[d.key])) }}</span>
                  </div>
                </template>
                <template v-else>
                  <span class="abs-dash">—</span>
                </template>
              </td>

              <!-- Summary cell -->
              <td class="td-total">
                <div class="total-wrap">
                  <div class="total-row">
                    <span class="total-days" :style="{ color: empRateColor(empRate(emp)) }">
                      {{ empWorkDays(emp) }}/{{ workDaysCount }}
                    </span>
                    <span class="total-sep">·</span>
                    <span class="total-hours">{{ fmtMins(empTotalMins(emp)) }}</span>
                  </div>
                  <div class="bar-wrap">
                    <div class="bar-fill" :style="{ width: empRate(emp) + '%', background: empRateColor(empRate(emp)) }"></div>
                  </div>
                  <div class="total-avg">
                    <span>O'rtacha:</span>
                    <span class="avg-val">{{ empAvgHours(emp) }}/kun</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>

          <!-- Footer -->
          <tfoot>
            <tr class="tfoot-row">
              <td class="td-emp tfoot-lbl">Kunlik holat</td>
              <td
                v-for="d in days" :key="d.key"
                class="td-day tfoot-cell"
                :class="{ 'td-weekend': d.isWeekend }"
              >
                <template v-if="d.isWeekend">
                  <span class="wend-dash">—</span>
                </template>
                <template v-else>
                  <div class="foot-day">
                    <span class="foot-count" :class="dailyCountClass(d.key)">
                      {{ dailyCount(d.key) }}
                    </span>
                    <span class="foot-avg">{{ dailyAvg(d.key) }}</span>
                  </div>
                </template>
              </td>
              <td class="td-total tfoot-lbl"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const today     = new Date().toISOString().slice(0, 10)
const startDate = ref('')
const endDate   = ref('')
const searchQuery = ref('')

// ── Days ─────────────────────────────────────────────────
const WD = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']
const days = ref([])

const generateDays = () => {
  if (!startDate.value || !endDate.value) return
  const result = []
  const cur = new Date(startDate.value + 'T00:00:00')
  const end = new Date(endDate.value   + 'T00:00:00')
  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10)
    const wd  = cur.getDay()
    result.push({ key, num: String(cur.getDate()).padStart(2, '0'), wd: WD[wd], isWeekend: wd === 0 || wd === 6, isToday: key === today })
    cur.setDate(cur.getDate() + 1)
  }
  days.value = result
}

onMounted(() => {
  const now = new Date()
  endDate.value = now.toISOString().slice(0, 10)
  now.setDate(1)
  startDate.value = now.toISOString().slice(0, 10)
  generateDays()
})

// ── Month label ───────────────────────────────────────────
const MZ = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
const monthLabel = computed(() => {
  if (!startDate.value) return ''
  const d = new Date(startDate.value + 'T00:00:00')
  return `${MZ[d.getMonth()]} ${d.getFullYear()}`
})

// ── Time helpers ──────────────────────────────────────────
const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }

const workMins = (entry) => {
  if (!entry?.in || !entry?.out) return 0
  return Math.max(0, toMins(entry.out) - toMins(entry.in))
}

const fmtMins = (mins) => {
  if (!mins) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}s ${m}d` : `${h}s`
}

const arrClass = (timeIn) => {
  if (!timeIn) return ''
  const m = toMins(timeIn)
  if (m <= 8 * 60 + 10) return 'arr-ok'
  if (m <= 9 * 60)      return 'arr-late'
  return 'arr-very-late'
}

const initials = (name) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

// ── Demo data ─────────────────────────────────────────────
const employees = ref([
  {
    id: 1, name: "O'rinboyev I.I", role: 'Rentgent', color: '#7c3aed',
    times: {
      '2026-03-02': { in: '07:58', out: '17:10' },
      '2026-03-03': { in: '08:03', out: '17:05' },
      '2026-03-04': { in: '08:47', out: '17:00' },
      '2026-03-05': { in: '08:01', out: '16:55' },
      '2026-03-06': { in: '07:55', out: '17:02' },
    },
  },
  {
    id: 2, name: 'Tashaliyev D.Q', role: 'Laborant', color: '#059669',
    times: {
      '2026-03-02': { in: '07:50', out: '16:50' },
      '2026-03-03': { in: '09:10', out: '18:00' },
      '2026-03-05': { in: '08:05', out: '17:00' },
      '2026-03-06': { in: '08:30', out: '17:30' },
    },
  },
  {
    id: 3, name: 'Mirzayeva Umida', role: 'Laborant', color: '#2563eb',
    times: {
      '2026-03-02': { in: '08:00', out: '17:00' },
      '2026-03-03': { in: '08:00', out: '17:00' },
      '2026-03-04': { in: '08:00', out: '17:00' },
      '2026-03-05': { in: '08:00', out: '17:00' },
      '2026-03-06': { in: '08:00', out: '17:00' },
    },
  },
  {
    id: 4, name: 'Hoshinova Odina', role: 'Hamshira', color: '#d97706',
    times: {
      '2026-03-02': { in: '07:45', out: '16:45' },
      '2026-03-04': { in: '08:55', out: '17:55' },
      '2026-03-06': { in: '08:10', out: '17:10' },
    },
  },
  {
    id: 5, name: 'Karimov Bobur', role: 'Shifokor', color: '#dc2626',
    times: {
      '2026-03-03': { in: '08:00', out: '17:00' },
      '2026-03-04': { in: '08:00', out: '17:00' },
      '2026-03-05': { in: '09:30', out: '18:30' },
    },
  },
])

// ── Filter ────────────────────────────────────────────────
const filteredEmployees = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return q ? employees.value.filter((e) => e.name.toLowerCase().includes(q)) : employees.value
})

// ── Work days helpers ─────────────────────────────────────
const workDaysCount = computed(() => days.value.filter((d) => !d.isWeekend).length)

const empWorkDays   = (emp) => days.value.filter((d) => !d.isWeekend && emp.times[d.key]).length
const empTotalMins  = (emp) => days.value.reduce((s, d) => s + workMins(emp.times[d.key]), 0)
const empRate       = (emp) => workDaysCount.value ? Math.round((empWorkDays(emp) / workDaysCount.value) * 100) : 0

const empAvgHours = (emp) => {
  const wd = empWorkDays(emp)
  if (!wd) return '—'
  return fmtMins(Math.round(empTotalMins(emp) / wd))
}

const empRateColor = (pct) => pct >= 90 ? '#059669' : pct >= 70 ? '#d97706' : '#dc2626'

// ── Daily footer ──────────────────────────────────────────
const dailyCount = (key) => filteredEmployees.value.filter((e) => !!e.times[key]).length

const dailyCountClass = (key) => {
  const p = filteredEmployees.value.length ? dailyCount(key) / filteredEmployees.value.length : 0
  return p >= 0.9 ? 'fc-high' : p >= 0.6 ? 'fc-mid' : 'fc-low'
}

const dailyAvg = (key) => {
  const present = filteredEmployees.value.filter((e) => e.times[key])
  if (!present.length) return '—'
  const total = present.reduce((s, e) => s + workMins(e.times[key]), 0)
  return fmtMins(Math.round(total / present.length))
}

// ── Aggregate stats ───────────────────────────────────────
const stats = computed(() => {
  let onTime = 0, late = 0, absent = 0, totalMins = 0, totalDays = 0
  const wds = days.value.filter((d) => !d.isWeekend)
  filteredEmployees.value.forEach((emp) => {
    wds.forEach((d) => {
      const e = emp.times[d.key]
      if (!e) { absent++; return }
      const sc = arrClass(e.in)
      if (sc === 'arr-ok') onTime++; else late++
      totalMins += workMins(e)
      totalDays++
    })
  })
  const avgH = totalDays ? Math.round(totalMins / totalDays) : 0
  return { onTime, late, absent, avgHours: fmtMins(avgH) }
})
</script>

<style scoped>
.kal-page {
  padding: 24px;
  background: var(--bg, #f5f6fa);
  min-height: 100%;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: var(--t1, #111827);
  transition: background-color 0.3s ease, color 0.3s ease;
  box-sizing: border-box;
}

/* ── Header ──────────────────────────────────────────────── */
.page-header { display: flex; justify-content: space-between; align-items: center; }

.page-title {
  font-size: 22px; font-weight: 700;
  color: var(--t1); margin: 0 0 4px;
  transition: color 0.3s ease;
}

.page-date {
  font-size: 13px; color: var(--t4); margin: 0;
  transition: color 0.3s ease;
}

/* ── Filter bar ──────────────────────────────────────────── */
.filter-bar {
  display: flex; align-items: center;
  justify-content: space-between; gap: 10px; flex-wrap: wrap;
}

.filter-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.date-sep { color: var(--t4); font-size: 14px; transition: color 0.3s ease; }

.input-wrap { position: relative; display: flex; align-items: center; }

.input-icon {
  position: absolute; left: 10px;
  color: var(--t4); pointer-events: none;
  transition: color 0.3s ease;
}

.input-wrap input[type='date'], .search-input {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 9px; color: var(--t2); font-size: 13px; font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.3s ease, color 0.3s ease;
}

.input-wrap input[type='date'] { padding: 8px 12px 8px 32px; }

.input-wrap input[type='date']:focus, .search-input:focus {
  border-color: var(--accent-br);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.search-wrap { flex: 1; min-width: 200px; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; box-sizing: border-box; }

.view-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent2, #8b5cf6));
  color: #fff; border: none; border-radius: 9px;
  font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
  box-shadow: 0 4px 14px rgba(124,58,237,0.35);
  transition: opacity 0.2s, transform 0.15s;
}
.view-btn:hover { opacity: 0.9; transform: translateY(-1px); }

/* ── Stat chips ──────────────────────────────────────────── */
.stat-chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.chip {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 20px; font-size: 13px;
  border: 1px solid var(--border); background: var(--surface);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.chip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.chip-label { color: var(--t3); transition: color 0.3s ease; }
.chip-val { font-weight: 700; color: var(--t1); transition: color 0.3s ease; }

.chip-legend { margin-left: auto; display: flex; align-items: center; gap: 14px; }

.legend-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--t4); transition: color 0.3s ease;
}

.legend-box { width: 24px; height: 13px; border-radius: 4px; flex-shrink: 0; }
.success-box { background: #d1fae5; }
.late-box    { background: #fef3c7; }
.absent-box  { background: var(--surface2); border: 1px solid var(--border); }
.weekend-box {
  background: repeating-linear-gradient(
    135deg, var(--border2) 0, var(--border2) 3px, var(--border) 3px, var(--border) 6px
  );
}

:global(.layout.dark) .success-box { background: rgba(5,150,105,0.2); }
:global(.layout.dark) .late-box    { background: rgba(217,119,6,0.2); }

/* ── Table card ──────────────────────────────────────────── */
.table-card {
  background: var(--surface); border-radius: 14px;
  box-shadow: 0 1px 6px var(--shadow-sm); overflow: hidden;
  transition: background-color 0.3s ease;
}

.table-scroll { overflow-x: auto; }

.kal-table {
  width: 100%; border-collapse: collapse;
  text-align: center; font-size: 12.5px;
}

/* ── thead ───────────────────────────────────────────────── */
.kal-table thead { position: sticky; top: 0; z-index: 2; }

.kal-table th {
  background: var(--surface2); border-bottom: 1px solid var(--border);
  white-space: nowrap; font-weight: 700; color: var(--t4);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.th-emp {
  text-align: left; min-width: 185px;
  padding: 12px 12px 12px 16px;
  position: sticky; left: 0; z-index: 3;
  border-right: 1px solid var(--border);
}

.th-day {
  min-width: 78px; padding: 8px 4px;
  display: table-cell; vertical-align: middle;
}

.th-day.th-weekend { background: var(--border2); opacity: 0.8; }
.th-day.th-today   { background: var(--accent-bg); }

.day-num {
  display: block; font-size: 15px; font-weight: 800;
  color: var(--t2); line-height: 1.2;
  transition: color 0.3s ease;
}
.day-today { color: var(--accent) !important; }

.day-wd {
  display: block; font-size: 10px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--t4); transition: color 0.3s ease;
}

.th-total {
  min-width: 148px; padding: 12px;
  position: sticky; right: 0; z-index: 3;
  border-left: 1px solid var(--border);
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
}

/* ── tbody ───────────────────────────────────────────────── */
.kal-table td {
  border-bottom: 1px solid var(--border2);
  transition: border-color 0.3s ease;
}

.kal-table tbody tr:last-child td { border-bottom: none; }
.kal-table tbody tr { transition: background-color 0.15s ease; }
.kal-table tbody tr:hover td { background: var(--accent-hv); }

.td-emp {
  text-align: left; padding: 10px 12px 10px 16px;
  position: sticky; left: 0; z-index: 1;
  background: var(--surface); border-right: 1px solid var(--border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
.kal-table tbody tr:hover .td-emp { background: var(--accent-hv); }

.emp-row { display: flex; align-items: center; gap: 9px; }

.emp-avatar {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  border: 2px solid var(--border);
  transition: border-color 0.3s ease;
}

.emp-name { font-size: 12.5px; font-weight: 600; color: var(--t1); margin: 0; white-space: nowrap; transition: color 0.3s ease; }
.emp-role { font-size: 11px; color: var(--t4); margin: 0; transition: color 0.3s ease; }

.td-day { padding: 6px 3px; vertical-align: middle; }

.td-weekend {
  background: repeating-linear-gradient(
    135deg,
    var(--border2) 0, var(--border2) 4px,
    transparent 4px, transparent 8px
  );
}
.td-today { background: var(--accent-bg); }

.kal-table tbody tr:hover .td-weekend,
.kal-table tbody tr:hover .td-today { background: var(--accent-hv); }

/* Day cell content */
.day-cell {
  display: flex; flex-direction: column;
  align-items: center; gap: 2px;
}

.arr-badge {
  display: inline-block;
  padding: 2px 7px; border-radius: 5px;
  font-size: 11px; font-weight: 700;
  font-variant-numeric: tabular-nums; white-space: nowrap;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.arr-ok        { background: #d1fae5; color: #059669; }
.arr-late      { background: #fef3c7; color: #d97706; }
.arr-very-late { background: #fee2e2; color: #dc2626; }

:global(.layout.dark) .arr-ok        { background: rgba(5,150,105,0.2);  color: #34d399; }
:global(.layout.dark) .arr-late      { background: rgba(217,119,6,0.2);  color: #fbbf24; }
:global(.layout.dark) .arr-very-late { background: rgba(220,38,38,0.2);  color: #f87171; }

.dep-time {
  font-size: 10.5px; font-weight: 500;
  color: var(--t3); font-variant-numeric: tabular-nums;
  transition: color 0.3s ease;
}

.dur-time {
  font-size: 10px; font-weight: 700;
  color: var(--accent); letter-spacing: 0.01em;
  transition: color 0.3s ease;
}

.wend-dash { color: var(--t5); font-size: 14px; font-weight: 600; }
.abs-dash  { color: var(--t5); font-size: 14px; font-weight: 600; }

/* ── Summary column ──────────────────────────────────────── */
.td-total {
  padding: 8px 12px;
  position: sticky; right: 0; z-index: 1;
  background: var(--surface);
  border-left: 1px solid var(--border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
.kal-table tbody tr:hover .td-total { background: var(--accent-hv); }

.total-wrap { display: flex; flex-direction: column; gap: 4px; }

.total-row {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px;
}

.total-days { font-weight: 800; font-variant-numeric: tabular-nums; }
.total-sep  { color: var(--t4); font-weight: 300; }
.total-hours {
  font-size: 11.5px; font-weight: 600;
  color: var(--t3); font-variant-numeric: tabular-nums;
  transition: color 0.3s ease;
}

.bar-wrap {
  height: 4px; border-radius: 3px;
  background: var(--border2); overflow: hidden;
  transition: background-color 0.3s ease;
}

.bar-fill {
  height: 4px; border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
}

.total-avg {
  display: flex; align-items: center; gap: 4px;
  font-size: 10.5px; color: var(--t4);
  transition: color 0.3s ease;
}

.avg-val { font-weight: 700; color: var(--t3); transition: color 0.3s ease; }

/* ── Footer ──────────────────────────────────────────────── */
.tfoot-row td {
  background: var(--surface2) !important;
  border-top: 2px solid var(--border);
  padding: 8px 4px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.tfoot-lbl {
  font-size: 11px; font-weight: 700; text-align: left;
  color: var(--t4); padding-left: 16px;
  transition: color 0.3s ease;
}

.tfoot-cell { text-align: center; }

.foot-day { display: flex; flex-direction: column; align-items: center; gap: 2px; }

.foot-count {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  font-size: 12px; font-weight: 800;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.fc-high { background: #d1fae5; color: #059669; }
.fc-mid  { background: #fef3c7; color: #d97706; }
.fc-low  { background: #fee2e2; color: #dc2626; }

:global(.layout.dark) .fc-high { background: rgba(5,150,105,0.2); color: #34d399; }
:global(.layout.dark) .fc-mid  { background: rgba(217,119,6,0.2); color: #fbbf24; }
:global(.layout.dark) .fc-low  { background: rgba(220,38,38,0.2); color: #f87171; }

.foot-avg {
  font-size: 10px; font-weight: 600;
  color: var(--accent); font-variant-numeric: tabular-nums;
  transition: color 0.3s ease;
}
</style>
