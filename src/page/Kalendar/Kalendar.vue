<template>
  <div class="kal-page">

    <!-- ══ Header ══ -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Kalendar</h2>
        <p class="page-date">{{ monthLabel }}</p>
      </div>
      <button class="refresh-btn" @click="loadData" :disabled="loading" title="Yangilash">
        <RefreshCw size="15" :class="{ 'spin': loading }" />
      </button>
    </div>

    <!-- ══ Filter bar ══ -->
    <div class="filter-bar">
      <div class="filter-left">
        <div class="input-wrap">
          <CalendarDays size="14" class="input-icon" />
          <input type="date" v-model="startDate" />
        </div>
        <span class="date-sep">—</span>
        <div class="input-wrap">
          <CalendarDays size="14" class="input-icon" />
          <input type="date" v-model="endDate" />
        </div>
        <button class="view-btn" @click="loadData" :disabled="loading">
          <Search size="13" />
          Ko'rish
        </button>
      </div>

      <div class="input-wrap search-wrap">
        <Search size="14" class="input-icon" />
        <input type="text" v-model="searchQuery" placeholder="Xodim qidirish..." class="search-input" />
      </div>
    </div>

    <!-- ══ Stat chips ══ -->
    <div class="stat-chips">
      <div class="chip">
        <span class="chip-dot" style="background: var(--accent)"></span>
        <span class="chip-label">Jami xodim</span>
        <span class="chip-val">{{ filteredUsers.length }}</span>
      </div>
      <div class="chip">
        <span class="chip-dot" style="background: #059669"></span>
        <span class="chip-label">O'z vaqtida</span>
        <span class="chip-val">{{ stats.onTime }}</span>
      </div>
      <div class="chip">
        <span class="chip-dot" style="background: #dc2626"></span>
        <span class="chip-label">Kech keldi</span>
        <span class="chip-val">{{ stats.late }}</span>
      </div>
      <div class="chip">
        <span class="chip-dot" style="background: var(--t4)"></span>
        <span class="chip-label">Kelmadi</span>
        <span class="chip-val">{{ stats.absent }}</span>
      </div>
      <div class="chip">
        <Clock size="13" style="color:var(--accent)" />
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

    <!-- ══ Error ══ -->
    <div v-if="error" class="error-msg">{{ error }}</div>

    <!-- ══ Table ══ -->
    <div class="table-card">

      <!-- Empty state -->
      <div v-if="!loading && filteredUsers.length === 0" class="empty-state">
        <Users size="42" :stroke-width="1.5" />
        <p>Xodim topilmadi yoki davr tanlanmagan</p>
      </div>

      <div v-else class="table-scroll">
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
            <!-- Skeleton -->
            <template v-if="loading">
              <tr v-for="n in 6" :key="'sk' + n">
                <td class="td-emp">
                  <div class="emp-row">
                    <div class="sk sk-av"></div>
                    <div><div class="sk sk-lg"></div><div class="sk sk-sm mt3"></div></div>
                  </div>
                </td>
                <td v-for="d in days" :key="d.key" class="td-day">
                  <div v-if="!d.isWeekend" class="sk sk-cell"></div>
                </td>
                <td class="td-total"><div class="sk sk-xl"></div></td>
              </tr>
            </template>

            <!-- Rows -->
            <template v-else>
              <tr v-for="emp in filteredUsers" :key="emp.id">
                <!-- Xodim -->
                <td class="td-emp">
                  <div class="emp-row">
                    <div class="emp-avatar" :style="{ background: emp.color + '22', color: emp.color }">
                      {{ initials(emp.name) }}
                    </div>
                    <div>
                      <p class="emp-name">{{ emp.name }}</p>
                      <p class="emp-role">{{ emp.position }}</p>
                    </div>
                  </div>
                </td>

                <!-- Kun katakchalar -->
                <td
                  v-for="d in days" :key="d.key"
                  class="td-day"
                  :class="{ 'td-weekend': d.isWeekend, 'td-today': d.isToday }"
                >
                  <template v-if="d.isWeekend">
                    <span class="wend-dash">—</span>
                  </template>
                  <template v-else-if="emp.days[d.key]">
                    <div class="day-cell">
                      <!-- Kelish vaqti -->
                      <span class="arr-badge" :class="arrClass(emp.days[d.key])">
                        {{ emp.days[d.key].in || '?' }}
                      </span>
                      <!-- Ketish vaqti -->
                      <span class="dep-time">{{ emp.days[d.key].out || '—' }}</span>
                      <!-- Ish soati -->
                      <template v-if="durText(emp.days[d.key], d.key)">
                        <span class="dur-time" :class="{ 'dur-live': durText(emp.days[d.key], d.key).live }">
                          {{ durText(emp.days[d.key], d.key).txt }}
                          <span v-if="durText(emp.days[d.key], d.key).live" class="live-dot"></span>
                        </span>
                      </template>
                      <!-- Jarima (agar bo'lsa) -->
                      <span v-if="emp.days[d.key].penalty > 0" class="pen-badge">
                        {{ formatSumma(emp.days[d.key].penalty) }}
                      </span>
                    </div>
                  </template>
                  <template v-else>
                    <span class="abs-dash">—</span>
                  </template>
                </td>

                <!-- Jami -->
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
                    <div class="total-row2">
                      <span class="avg-lbl">O'rtacha:</span>
                      <span class="avg-val">{{ empAvgHours(emp) }}/kun</span>
                      <span v-if="empTotalPenalty(emp) > 0" class="pen-total">
                        -{{ formatSumma(empTotalPenalty(emp)) }}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>

          <!-- Footer -->
          <tfoot v-if="!loading && filteredUsers.length > 0">
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
import { RefreshCw, CalendarDays, Search, Clock, Users } from 'lucide-vue-next'
import { api } from '@/api/api.js'

/** Mahalliy sana: getFullYear/Month/Date — timezone muammosiz */
function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const today     = localDateStr(new Date())
const startDate = ref('')
const endDate   = ref('')
const searchQuery = ref('')
const loading   = ref(false)
const error     = ref('')

// ── Days list ─────────────────────────────────────────────
const WD   = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']
const days = ref([])

function buildDays(start, end) {
  const result = []
  const cur  = new Date(start + 'T00:00:00')
  const last = new Date(end   + 'T00:00:00')
  while (cur <= last) {
    const key = localDateStr(cur)   // mahalliy sana — UTC emas
    const wd  = cur.getDay()
    result.push({
      key,
      num: String(cur.getDate()).padStart(2, '0'),
      wd:  WD[wd],
      isWeekend: wd === 0 || wd === 6,
      isToday:   key === today,
    })
    cur.setDate(cur.getDate() + 1)
  }
  return result
}

// ── Month label ───────────────────────────────────────────
const MZ = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
const monthLabel = computed(() => {
  if (!startDate.value) return ''
  const d = new Date(startDate.value + 'T00:00:00')
  return `${MZ[d.getMonth()]} ${d.getFullYear()}`
})

// ── API ───────────────────────────────────────────────────
const employees = ref([])   // [{ id, name, position, color, days: { 'YYYY-MM-DD': {in,out,come_time,leave_time,status,penalty} } }]

const loadData = async () => {
  if (!startDate.value || !endDate.value) return
  loading.value = true
  error.value   = ''
  days.value    = buildDays(startDate.value, endDate.value)
  try {
    const res = await api.getFaceIdRange(startDate.value, endDate.value)
    employees.value = res.users || []
  } catch (e) {
    error.value = e.message || 'Ma\'lumot yuklanmadi'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const now = new Date()
  endDate.value   = now.toISOString().slice(0, 10)
  now.setDate(1)
  startDate.value = now.toISOString().slice(0, 10)
  loadData()
})

// ── Filter ────────────────────────────────────────────────
const filteredUsers = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return q
    ? employees.value.filter(e => e.name.toLowerCase().includes(q))
    : employees.value
})

// ── Time helpers ──────────────────────────────────────────
const toMins = (t) => {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/**
 * Ish daqiqasi:
 *  - in va out ikkalasi bo'lsa → out - in
 *  - faqat in bo'lsa, kun bugun bo'lsa → hozirgi vaqt - in (davom etmoqda)
 *  - boshqa holat → 0
 */
const workMins = (entry, dateKey) => {
  if (!entry?.in) return 0
  const inMins = toMins(entry.in)
  if (entry.out) {
    return Math.max(0, toMins(entry.out) - inMins)
  }
  // Ketish yo'q, lekin bugun bo'lsa — hozirgi vaqtgacha
  if (dateKey === today) {
    const now = new Date()
    const nowMins = now.getHours() * 60 + now.getMinutes()
    return Math.max(0, nowMins - inMins)
  }
  return 0
}

const fmtMins = (mins) => {
  if (!mins) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}s ${m}d` : `${h}s`
}

/** Ish soati matni — bugun & ketish yo'q bo'lsa "davom etmoqda" belgisi */
const durText = (entry, dateKey) => {
  const mins = workMins(entry, dateKey)
  if (!mins) return null
  const txt = fmtMins(mins)
  // Hali davom etayotgan bo'lsa (bugun, out yo'q)
  if (!entry.out && dateKey === today) return { txt, live: true }
  return { txt, live: false }
}

const formatSumma = (val) => {
  if (!val) return '0'
  const n = Number(val)
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return Math.round(n / 1_000) + 'K'
  return String(n)
}

/** Kelish belgisi rangi — come_time ga nisbatan hisoblash */
const arrClass = (entry) => {
  if (!entry?.in) return ''
  const actual    = toMins(entry.in)
  const scheduled = toMins(entry.come_time || '09:00')
  if (actual <= scheduled)      return 'arr-ok'
  if (actual <= scheduled + 15) return 'arr-late'
  return 'arr-very-late'
}

const initials = (name) =>
  (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

// ── Work stats per employee ───────────────────────────────
const workDaysCount = computed(() => days.value.filter(d => !d.isWeekend).length)

const empWorkDays   = (emp) => days.value.filter(d => !d.isWeekend && emp.days[d.key]).length
const empTotalMins  = (emp) => days.value.reduce((s, d) => s + workMins(emp.days[d.key], d.key), 0)
const empTotalPenalty = (emp) =>
  days.value.reduce((s, d) => s + (emp.days[d.key]?.penalty || 0), 0)
const empRate       = (emp) =>
  workDaysCount.value ? Math.round((empWorkDays(emp) / workDaysCount.value) * 100) : 0
const empAvgHours   = (emp) => {
  const wd = empWorkDays(emp)
  return wd ? fmtMins(Math.round(empTotalMins(emp) / wd)) : '—'
}
const empRateColor  = (pct) => pct >= 90 ? '#059669' : pct >= 70 ? '#d97706' : '#dc2626'

// ── Daily footer ──────────────────────────────────────────
const dailyCount = (key) => filteredUsers.value.filter(e => !!e.days[key]).length

const dailyCountClass = (key) => {
  const p = filteredUsers.value.length ? dailyCount(key) / filteredUsers.value.length : 0
  return p >= 0.9 ? 'fc-high' : p >= 0.6 ? 'fc-mid' : 'fc-low'
}

const dailyAvg = (key) => {
  const present = filteredUsers.value.filter(e => e.days[key])
  if (!present.length) return '—'
  const total = present.reduce((s, e) => s + workMins(e.days[key], key), 0)
  return fmtMins(Math.round(total / present.length))
}

// ── Aggregate stats ───────────────────────────────────────
const stats = computed(() => {
  let onTime = 0, late = 0, absent = 0, totalMins = 0, totalDays = 0
  const wds = days.value.filter(d => !d.isWeekend)
  filteredUsers.value.forEach(emp => {
    wds.forEach(d => {
      const entry = emp.days[d.key]
      if (!entry) { absent++; return }
      if (entry.status === 'on-time') onTime++; else late++
      totalMins += workMins(entry, d.key)
      totalDays++
    })
  })
  return {
    onTime, late, absent,
    avgHours: totalDays ? fmtMins(Math.round(totalMins / totalDays)) : '—',
  }
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
.page-header {
  display: flex; justify-content: space-between; align-items: center;
}
.page-title {
  font-size: 22px; font-weight: 700;
  color: var(--t1); margin: 0 0 4px;
  transition: color 0.3s ease;
}
.page-date {
  font-size: 13px; color: var(--t4); margin: 0;
  transition: color 0.3s ease;
}
.refresh-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  border: 1px solid var(--border); border-radius: 9px;
  background: var(--surface); color: var(--t3); cursor: pointer;
  transition: all 0.15s;
}
.refresh-btn:hover { background: var(--accent-hv); color: var(--accent); }
.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Filter bar ──────────────────────────────────────────── */
.filter-bar {
  display: flex; align-items: center;
  justify-content: space-between; gap: 10px; flex-wrap: wrap;
}
.filter-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.date-sep { color: var(--t4); font-size: 14px; }

.input-wrap { position: relative; display: flex; align-items: center; }
.input-icon {
  position: absolute; left: 10px;
  color: var(--t4); pointer-events: none;
}

.input-wrap input[type='date'],
.search-input {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 9px; color: var(--t2); font-size: 13px; font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.3s ease;
}
.input-wrap input[type='date'] { padding: 8px 12px 8px 32px; }
.input-wrap input:focus, .search-input:focus {
  border-color: var(--accent-br);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.search-wrap { flex: 1; min-width: 200px; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; box-sizing: border-box; }

.view-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px;
  background: linear-gradient(135deg, var(--accent), var(--accent2, #8b5cf6));
  color: #fff; border: none; border-radius: 9px;
  font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
  box-shadow: 0 4px 14px rgba(124,58,237,0.3);
  transition: opacity 0.2s, transform 0.15s;
}
.view-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.view-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

/* ── Stat chips ──────────────────────────────────────────── */
.stat-chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.chip {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 20px; font-size: 13px;
  border: 1px solid var(--border); background: var(--surface);
  transition: background-color 0.3s ease;
}
.chip-dot   { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.chip-label { color: var(--t3); }
.chip-val   { font-weight: 700; color: var(--t1); }

.chip-legend { margin-left: auto; display: flex; align-items: center; gap: 14px; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--t4); }
.legend-box  { width: 24px; height: 13px; border-radius: 4px; flex-shrink: 0; }
.success-box { background: #d1fae5; }
.late-box    { background: #fef3c7; }
.absent-box  { background: var(--surface2); border: 1px solid var(--border); }
.weekend-box {
  background: repeating-linear-gradient(
    135deg, var(--border2) 0, var(--border2) 3px, var(--border) 3px, var(--border) 6px
  );
}

/* ── Error ───────────────────────────────────────────────── */
.error-msg {
  padding: 12px 16px; background: #fee2e2; color: #dc2626;
  border-radius: 10px; font-size: 13px;
}

/* ── Table card ──────────────────────────────────────────── */
.table-card {
  background: var(--surface); border-radius: 14px;
  box-shadow: 0 1px 6px var(--shadow-sm); overflow: hidden;
  transition: background-color 0.3s ease;
}
.table-scroll { overflow-x: auto; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 60px 20px; color: var(--t4); text-align: center;
}
.empty-state p { margin: 0; font-size: 14px; }

.kal-table {
  width: 100%; border-collapse: collapse;
  text-align: center; font-size: 12.5px;
}

/* ── thead ───────────────────────────────────────────────── */
.kal-table thead { position: sticky; top: 0; z-index: 2; }

.kal-table th {
  background: var(--surface2); border-bottom: 1px solid var(--border);
  white-space: nowrap; font-weight: 700; color: var(--t4);
  transition: background-color 0.3s ease;
}

.th-emp {
  text-align: left; min-width: 190px;
  padding: 12px 12px 12px 16px;
  position: sticky; left: 0; z-index: 3;
  border-right: 1px solid var(--border);
}
.th-day {
  min-width: 80px; padding: 8px 4px;
  vertical-align: middle;
}
.th-day.th-weekend { background: var(--border2); opacity: 0.8; }
.th-day.th-today   { background: var(--accent-bg); }

.day-num {
  display: block; font-size: 15px; font-weight: 800;
  color: var(--t2); line-height: 1.2;
}
.day-today { color: var(--accent) !important; }
.day-wd {
  display: block; font-size: 10px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--t4);
}

.th-total {
  min-width: 155px; padding: 12px;
  position: sticky; right: 0; z-index: 3;
  border-left: 1px solid var(--border);
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
}

/* ── tbody ───────────────────────────────────────────────── */
.kal-table td { border-bottom: 1px solid var(--border2); transition: border-color 0.3s ease; }
.kal-table tbody tr:last-child td { border-bottom: none; }
.kal-table tbody tr:hover td { background: var(--accent-hv); }

.td-emp {
  text-align: left; padding: 10px 12px 10px 16px;
  position: sticky; left: 0; z-index: 1;
  background: var(--surface); border-right: 1px solid var(--border);
  transition: background-color 0.3s ease;
}
.kal-table tbody tr:hover .td-emp { background: var(--accent-hv); }

.emp-row { display: flex; align-items: center; gap: 9px; }
.emp-avatar {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800;
  border: 2px solid transparent;
}
.emp-name { font-size: 12.5px; font-weight: 600; color: var(--t1); margin: 0; white-space: nowrap; }
.emp-role { font-size: 11px; color: var(--t4); margin: 0; }

.td-day { padding: 5px 3px; vertical-align: middle; }
.td-weekend {
  background: repeating-linear-gradient(
    135deg, var(--border2) 0, var(--border2) 4px, transparent 4px, transparent 8px
  );
}
.td-today { background: var(--accent-bg); }
.kal-table tbody tr:hover .td-weekend,
.kal-table tbody tr:hover .td-today { background: var(--accent-hv); }

/* ── Day cell ────────────────────────────────────────────── */
.day-cell {
  display: flex; flex-direction: column;
  align-items: center; gap: 2px;
}

.arr-badge {
  display: inline-block;
  padding: 2px 7px; border-radius: 5px;
  font-size: 11px; font-weight: 700;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.arr-ok        { background: #d1fae5; color: #059669; }
.arr-late      { background: #fef3c7; color: #d97706; }
.arr-very-late { background: #fee2e2; color: #dc2626; }

.dep-time {
  font-size: 10.5px; font-weight: 500;
  color: var(--t3); font-variant-numeric: tabular-nums;
}
.dur-time {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 6px; border-radius: 5px;
  font-size: 11px; font-weight: 800;
  background: var(--accent-bg); color: var(--accent);
  letter-spacing: 0.01em;
}
.dur-live {
  background: rgba(5,150,105,0.12); color: #059669;
}
.live-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #059669;
  animation: blink 1.2s infinite;
  flex-shrink: 0;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}
.pen-badge {
  font-size: 9.5px; font-weight: 700;
  color: #dc2626; letter-spacing: 0;
}

.wend-dash, .abs-dash { color: var(--t5); font-size: 14px; font-weight: 600; }

/* ── Summary column ──────────────────────────────────────── */
.td-total {
  padding: 8px 12px;
  position: sticky; right: 0; z-index: 1;
  background: var(--surface); border-left: 1px solid var(--border);
  transition: background-color 0.3s ease;
}
.kal-table tbody tr:hover .td-total { background: var(--accent-hv); }

.total-wrap { display: flex; flex-direction: column; gap: 4px; }
.total-row  { display: flex; align-items: center; gap: 5px; font-size: 12px; }
.total-days { font-weight: 800; font-variant-numeric: tabular-nums; }
.total-sep  { color: var(--t4); }
.total-hours { font-size: 11.5px; font-weight: 600; color: var(--t3); }

.bar-wrap {
  height: 4px; border-radius: 3px;
  background: var(--border2); overflow: hidden;
}
.bar-fill {
  height: 4px; border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
}

.total-row2 {
  display: flex; align-items: center; gap: 5px;
  font-size: 10.5px; color: var(--t4);
}
.avg-lbl { color: var(--t4); }
.avg-val { font-weight: 700; color: var(--t3); }
.pen-total { margin-left: auto; font-weight: 700; color: #dc2626; font-size: 10px; }

/* ── Skeleton ────────────────────────────────────────────── */
.sk {
  background: linear-gradient(90deg, var(--border) 25%, var(--border2) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
  border-radius: 5px; height: 12px;
}
.sk-av   { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; }
.sk-sm   { width: 55px; }
.sk-lg   { width: 100px; }
.sk-xl   { width: 130px; height: 40px; border-radius: 8px; }
.sk-cell { width: 60px; height: 46px; border-radius: 6px; margin: 0 auto; }
.mt3     { margin-top: 4px; }

@keyframes shimmer {
  0%   { background-position:  200% 0; }
  100% { background-position: -200% 0; }
}
.spin { animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Footer ──────────────────────────────────────────────── */
.tfoot-row td {
  background: var(--surface2) !important;
  border-top: 2px solid var(--border); padding: 8px 4px;
}
.tfoot-lbl {
  font-size: 11px; font-weight: 700; text-align: left;
  color: var(--t4); padding-left: 16px;
}
.tfoot-cell { text-align: center; }
.foot-day   { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.foot-count {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  font-size: 12px; font-weight: 800;
}
.fc-high { background: #d1fae5; color: #059669; }
.fc-mid  { background: #fef3c7; color: #d97706; }
.fc-low  { background: #fee2e2; color: #dc2626; }

.foot-avg {
  font-size: 10px; font-weight: 600; color: var(--accent);
}

/* ── Dark mode ───────────────────────────────────────────── */
:global(.layout.dark) .success-box    { background: rgba(5,150,105,0.2); }
:global(.layout.dark) .late-box       { background: rgba(217,119,6,0.2); }
:global(.layout.dark) .arr-ok         { background: rgba(5,150,105,0.2);  color: #34d399; }
:global(.layout.dark) .arr-late       { background: rgba(217,119,6,0.2);  color: #fbbf24; }
:global(.layout.dark) .arr-very-late  { background: rgba(220,38,38,0.2);  color: #f87171; }
:global(.layout.dark) .fc-high        { background: rgba(5,150,105,0.2); color: #34d399; }
:global(.layout.dark) .fc-mid         { background: rgba(217,119,6,0.2); color: #fbbf24; }
:global(.layout.dark) .fc-low         { background: rgba(220,38,38,0.2); color: #f87171; }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 768px) {
  .kal-page { padding: 14px 12px; gap: 14px; }
  .stat-chips { gap: 6px; }
  .chip { padding: 5px 10px; font-size: 12px; }
  .chip-legend { display: none; }
  .filter-bar { flex-direction: column; align-items: stretch; }
  .filter-left { justify-content: space-between; }
  .search-wrap { width: 100%; }
}
</style>
