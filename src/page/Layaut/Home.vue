<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  LineElement, CategoryScale, LinearScale, PointElement,
  ArcElement, Filler
} from 'chart.js'
import {
  Users, UserCheck, UserX, Clock,
  TrendingUp, TrendingDown, ChevronRight,
  CheckCircle2, XCircle, AlertCircle,
  CalendarDays, Timer, BarChart2,
  UserPlus, FileText, Wallet, CalendarOff,
  Star, Trophy, Award, Medal,
  UserMinus, ArrowUpCircle, ShieldAlert,
  CakeSlice, PartyPopper, RefreshCw,
  Check, X
} from 'lucide-vue-next'

ChartJS.register(
  Title, Tooltip, Legend,
  LineElement, CategoryScale, LinearScale, PointElement,
  ArcElement, Filler
)

const darkMode = inject('darkMode', ref(false))

// ─── Animated counters ───
const animatedValues = ref({ total: 0, present: 0, absent: 0, late: 0 })
const targets = { total: 42, present: 31, absent: 8, late: 3 }

onMounted(() => {
  Object.keys(targets).forEach(key => {
    const target = targets[key]
    let count = 0
    const timer = setInterval(() => {
      count++
      animatedValues.value[key] = Math.min(Math.round((target / 60) * count), target)
      if (count >= 60) clearInterval(timer)
    }, 16)
  })
})

// ─── KPI cards ───
const kpiCards = computed(() => [
  {
    key: 'total',   label: 'Jami xodimlar',   value: animatedValues.value.total,
    change: '+2 bu oy',   positive: true,   icon: Users,
    accent: '#7c3aed',
    lightBg: darkMode.value ? 'rgba(124,58,237,0.15)' : '#ede9fe',
    borderColor: darkMode.value ? 'rgba(124,58,237,0.5)' : '#c4b5fd'
  },
  {
    key: 'present', label: 'Bugun kelgan',    value: animatedValues.value.present,
    change: '+3 kechagidan', positive: true,  icon: UserCheck,
    accent: '#059669',
    lightBg: darkMode.value ? 'rgba(5,150,105,0.15)' : '#d1fae5',
    borderColor: darkMode.value ? 'rgba(5,150,105,0.5)' : '#6ee7b7'
  },
  {
    key: 'absent',  label: 'Kelmagan',        value: animatedValues.value.absent,
    change: '-1 kechagidan', positive: true,  icon: UserX,
    accent: '#dc2626',
    lightBg: darkMode.value ? 'rgba(220,38,38,0.15)' : '#fee2e2',
    borderColor: darkMode.value ? 'rgba(220,38,38,0.5)' : '#fca5a5'
  },
  {
    key: 'late',    label: 'Kech qolgan',     value: animatedValues.value.late,
    change: "-2 haftalik o'rtacha", positive: true, icon: Clock,
    accent: '#d97706',
    lightBg: darkMode.value ? 'rgba(217,119,6,0.15)' : '#fef3c7',
    borderColor: darkMode.value ? 'rgba(217,119,6,0.5)' : '#fde68a'
  }
])

// ─── Quick actions ───
const quickActions = [
  { label: "Xodim qo'shish",    icon: UserPlus,    color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  count: null,         info: '42 ta xodim',      modal: 'addEmployee'  },
  { label: 'Davomat belgilash', icon: CalendarDays, color: '#059669', bg: 'rgba(5,150,105,0.1)',   count: '8 kutmoqda', info: 'Bugungi ro\'yxat', modal: 'markAttend'   },
  { label: 'Hisobot yaratish',  icon: FileText,    color: '#0891b2', bg: 'rgba(8,145,178,0.1)',   count: null,         info: 'Mart 2026',        modal: 'genReport'    },
  { label: "Ta'til so'rash",    icon: CalendarOff,  color: '#d97706', bg: 'rgba(217,119,6,0.1)',   count: '3 kutmoqda', info: "Yangi so'rov",     modal: 'leaveReq'     },
  { label: 'Maosh hisoblash',   icon: Wallet,      color: '#dc2626', bg: 'rgba(220,38,38,0.1)',   count: null,         info: 'Mart 2026',        modal: 'calcSalary'   },
  { label: 'Ma\'lumot yangilash', icon: RefreshCw,  color: '#6b7280', bg: 'rgba(107,114,128,0.1)', count: null,        info: 'Sinxronizatsiya',  modal: 'refresh'      },
]

// ─── Modal system ───
const activeModal = ref(null)
const modalSuccess = ref(false)
let refreshing = ref(false)

function openModal(key) {
  if (key === 'refresh') { doRefresh(); return }
  modalSuccess.value = false
  activeModal.value = key
}

function closeModal() {
  activeModal.value = null
  modalSuccess.value = false
}

function submitModal() {
  modalSuccess.value = true
  setTimeout(() => closeModal(), 1600)
}

function doRefresh() {
  refreshing.value = true
  setTimeout(() => { refreshing.value = false }, 1400)
}

// ─── Modal: Xodim qo'shish ───
const newEmployee = ref({
  firstName: '', lastName: '', phone: '', email: '',
  department: '', role: '', startDate: '', salary: ''
})

const departments_list = ['Development', 'Design', 'QA', 'Management', 'DevOps', 'Other']

function submitAddEmployee() {
  if (!newEmployee.value.firstName || !newEmployee.value.lastName || !newEmployee.value.department) return
  submitModal()
  newEmployee.value = { firstName:'', lastName:'', phone:'', email:'', department:'', role:'', startDate:'', salary:'' }
}

// ─── Modal: Davomat belgilash ───
const attendDate = ref(new Date().toISOString().slice(0, 10))
const attendList = ref([
  { name: 'Alisher Nazarov',   initials: 'AN', color: '#7c3aed', status: 'arrived' },
  { name: 'Malika Yusupova',   initials: 'MY', color: '#f59e0b', status: 'absent'  },
  { name: 'Bobur Toshmatov',   initials: 'BT', color: '#ef4444', status: 'absent'  },
  { name: 'Nilufar Rahimova',  initials: 'NR', color: '#059669', status: 'arrived' },
  { name: 'Jasur Mirzayev',    initials: 'JM', color: '#06b6d4', status: 'arrived' },
  { name: 'Dilorom Hasanova',  initials: 'DH', color: '#ec4899', status: 'late'    },
  { name: 'Sardor Qodirov',    initials: 'SQ', color: '#6366f1', status: 'absent'  },
])

const attendStatusOpts = [
  { val: 'arrived', label: 'Keldi',   color: '#059669' },
  { val: 'late',    label: 'Kech',    color: '#d97706' },
  { val: 'absent',  label: 'Kelmadi', color: '#ef4444' },
]

// ─── Modal: Hisobot yaratish ───
const report = ref({
  type: 'attend', period: new Date().toISOString().slice(0, 7),
  department: 'all', format: 'pdf'
})

const reportTypes = [
  { val: 'attend', label: 'Davomat hisoboti',        icon: '📋' },
  { val: 'salary', label: 'Maosh hisoboti',           icon: '💰' },
  { val: 'perf',   label: 'Samaradorlik hisoboti',    icon: '📊' },
  { val: 'all',    label: 'Umumiy hisobot',           icon: '📁' },
]

// ─── Modal: Ta'til so'rash ───
const leaveForm = ref({
  employee: '', type: 'annual', from: '', to: '', reason: ''
})

const leaveTypes = [
  { val: 'annual',  label: "Yillik ta'til"        },
  { val: 'sick',    label: 'Kasallik varaqasi'    },
  { val: 'short',   label: "Qisqa ta'til (1 kun)" },
  { val: 'reason',  label: 'Uzrli sabab'          },
  { val: 'unpaid',  label: "Haqsiz ta'til"        },
]

const leaveDays = computed(() => {
  if (!leaveForm.value.from || !leaveForm.value.to) return 0
  const ms = new Date(leaveForm.value.to) - new Date(leaveForm.value.from)
  return Math.max(0, Math.round(ms / 86400000) + 1)
})

// ─── Modal: Maosh hisoblash ───
const salaryCalc = ref({
  employee: 'all', month: new Date().toISOString().slice(0, 7),
  department: 'all'
})

const salaryResults = ref([
  { name: 'Alisher Nazarov',  base: 5500000, bonus: 550000, fine: 0,      attend: 98 },
  { name: 'Malika Yusupova',  base: 4800000, bonus: 200000, fine: 150000, attend: 88 },
  { name: 'Bobur Toshmatov',  base: 6200000, bonus: 620000, fine: 200000, attend: 92 },
  { name: 'Nilufar Rahimova', base: 4200000, bonus: 420000, fine: 0,      attend: 98 },
  { name: 'Jasur Mirzayev',   base: 5800000, bonus: 580000, fine: 0,      attend: 96 },
])

function netSalary(r) { return r.base + r.bonus - r.fine }
function formatSom(n) { return (n / 1000000).toFixed(2) + ' mln' }

// ─── Chart theme ───
const chartTheme = computed(() => ({
  gridColor:   darkMode.value ? '#252340' : '#f3f4f6',
  tickColor:   darkMode.value ? '#4f4d62' : '#9ca3af',
  tooltipBg:   darkMode.value ? '#1a1829' : '#1f2937',
  legendColor: darkMode.value ? '#c4bfdd' : '#6b7280'
}))

// ─── Line chart ───
const lineChartData = {
  labels: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
  datasets: [
    {
      label: 'Kelgan',
      data: [38, 40, 35, 39, 31, 18, 6],
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124,58,237,0.08)',
      tension: 0.45, borderWidth: 2.5, fill: true,
      pointBackgroundColor: '#7c3aed', pointBorderColor: '#fff', pointBorderWidth: 2,
      pointRadius: 5, pointHoverRadius: 7
    },
    {
      label: 'Kelmagan',
      data: [4, 2, 7, 3, 8, 18, 30],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.06)',
      tension: 0.45, borderWidth: 2, fill: true,
      pointBackgroundColor: '#ef4444', pointBorderColor: '#fff', pointBorderWidth: 2,
      pointRadius: 5, pointHoverRadius: 7
    },
    {
      label: 'Kech qolgan',
      data: [2, 1, 3, 2, 4, 2, 1],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245,158,11,0.06)',
      tension: 0.45, borderWidth: 2, fill: false,
      pointBackgroundColor: '#f59e0b', pointBorderColor: '#fff', pointBorderWidth: 2,
      pointRadius: 5, pointHoverRadius: 7
    }
  ]
}

const lineChartOptions = computed(() => ({
  responsive: true, maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top', align: 'end',
      labels: { usePointStyle: true, pointStyleWidth: 8, font: { size: 12 }, boxHeight: 8, color: chartTheme.value.legendColor }
    },
    tooltip: { backgroundColor: chartTheme.value.tooltipBg, padding: 12, cornerRadius: 8 }
  },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 12 }, color: chartTheme.value.tickColor } },
    y: {
      min: 0, max: 50,
      grid: { color: chartTheme.value.gridColor, drawBorder: false },
      border: { display: false },
      ticks: { stepSize: 10, font: { size: 12 }, color: chartTheme.value.tickColor }
    }
  }
}))

// ─── Donut chart ───
const donutData = {
  labels: ['Kelgan', 'Kelmagan', 'Kech qolgan', 'Sababli'],
  datasets: [{
    data: [31, 5, 3, 3],
    backgroundColor: ['#7c3aed', '#ef4444', '#f59e0b', '#06b6d4'],
    borderColor: 'transparent', borderWidth: 3, hoverOffset: 6
  }]
}

const donutOptions = computed(() => ({
  responsive: true, maintainAspectRatio: false, cutout: '74%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true, pointStyleWidth: 8, padding: 14, font: { size: 12 }, boxHeight: 8, color: chartTheme.value.legendColor }
    },
    tooltip: { backgroundColor: chartTheme.value.tooltipBg, padding: 10, cornerRadius: 8 }
  }
}))

// ─── Today's attendance ───
const todayList = ref([
  { name: 'Alisher Nazarov',  role: 'Frontend Developer', time: '08:45', status: 'arrived', initials: 'AN', color: '#7c3aed' },
  { name: 'Malika Yusupova',  role: 'UI/UX Designer',     time: '09:12', status: 'late',    initials: 'MY', color: '#f59e0b' },
  { name: 'Bobur Toshmatov',  role: 'Backend Developer',  time: '—',     status: 'absent',  initials: 'BT', color: '#ef4444' },
  { name: 'Nilufar Rahimova', role: 'QA Engineer',        time: '08:55', status: 'arrived', initials: 'NR', color: '#059669' },
  { name: 'Jasur Mirzayev',   role: 'DevOps Engineer',    time: '08:30', status: 'arrived', initials: 'JM', color: '#06b6d4' },
  { name: 'Dilorom Hasanova', role: 'Project Manager',    time: '09:20', status: 'late',    initials: 'DH', color: '#ec4899' },
  { name: 'Sardor Qodirov',   role: 'Mobile Developer',   time: '—',     status: 'absent',  initials: 'SQ', color: '#6366f1' },
])

const statusMap = {
  arrived: { label: 'Keldi',   color: '#059669', bg: '#d1fae5', bgDark: 'rgba(5,150,105,0.18)',  icon: CheckCircle2 },
  late:    { label: 'Kech',    color: '#d97706', bg: '#fef3c7', bgDark: 'rgba(217,119,6,0.18)',  icon: AlertCircle },
  absent:  { label: 'Kelmadi', color: '#dc2626', bg: '#fee2e2', bgDark: 'rgba(220,38,38,0.18)',  icon: XCircle }
}

function statusBg(status) {
  return darkMode.value ? statusMap[status].bgDark : statusMap[status].bg
}

// ─── Pending Leave Requests ───
const leaveRequests = ref([
  { name: 'Kamola Ergasheva',  initials: 'KE', color: '#ec4899', type: "Yillik ta'til",   from: '10-mart', to: '17-mart', days: 8,  reason: 'Oilaviy masala',    status: 'pending'  },
  { name: 'Doniyor Xoliqov',   initials: 'DX', color: '#6366f1', type: "Kasallik varaqasi", from: '6-mart',  to: '8-mart',  days: 3,  reason: 'Shifokor ko\'rsatmasi', status: 'pending' },
  { name: 'Zulfiya Nazarova',  initials: 'ZN', color: '#f59e0b', type: "Qisqa ta'til",   from: '7-mart',  to: '7-mart',  days: 1,  reason: 'Shaxsiy sabab',     status: 'approved' },
  { name: 'Mirzo Toshpulatov', initials: 'MT', color: '#059669', type: "Yillik ta'til",   from: '15-mart', to: '22-mart', days: 7,  reason: 'Dam olish',         status: 'pending'  },
  { name: 'Sarvinoz Holova',   initials: 'SH', color: '#7c3aed', type: "Uzrli sabab",     from: '9-mart',  to: '9-mart',  days: 1,  reason: 'Hujjat topshirish', status: 'rejected' },
])

const leaveStatusMap = {
  pending:  { label: "Ko'rib chiqilmoqda", color: '#d97706', bg: '#fef3c7', bgDark: 'rgba(217,119,6,0.2)'  },
  approved: { label: 'Tasdiqlandi',        color: '#059669', bg: '#d1fae5', bgDark: 'rgba(5,150,105,0.2)'  },
  rejected: { label: 'Rad etildi',         color: '#dc2626', bg: '#fee2e2', bgDark: 'rgba(220,38,38,0.2)'  }
}

function approveLeave(idx) { leaveRequests.value[idx].status = 'approved' }
function rejectLeave(idx)  { leaveRequests.value[idx].status = 'rejected' }

// ─── Recent HR Activity ───
const activities = ref([
  { type: 'hire',      icon: UserPlus,      color: '#059669', bg: '#d1fae5', bgDark: 'rgba(5,150,105,0.18)',   title: 'Yangi xodim qabul qilindi',      desc: 'Rustam Qodirov — Backend Developer',    time: '1 soat oldin'    },
  { type: 'promote',   icon: ArrowUpCircle, color: '#7c3aed', bg: '#ede9fe', bgDark: 'rgba(124,58,237,0.18)',  title: 'Lavozim oshirildi',               desc: 'Alisher Nazarov — Senior Developer ga',  time: '3 soat oldin'    },
  { type: 'resign',    icon: UserMinus,     color: '#ef4444', bg: '#fee2e2', bgDark: 'rgba(239,68,68,0.18)',   title: 'Iste\'foga ariza berdi',          desc: 'Behzod Karimov — QA Engineer',           time: 'Kecha'           },
  { type: 'warning',   icon: ShieldAlert,   color: '#d97706', bg: '#fef3c7', bgDark: 'rgba(217,119,6,0.18)',   title: 'Ogohlantirish berildi',           desc: 'Kech kelish sababi — Doniyor X.',        time: 'Kecha'           },
  { type: 'leave',     icon: CheckCircle2,  color: '#0891b2', bg: '#e0f2fe', bgDark: 'rgba(8,145,178,0.18)',   title: "Ta'til tasdiqlandi",              desc: "Zulfiya Nazarova — 1 kunlik ta'til",    time: '2 kun oldin'     },
  { type: 'award',     icon: Award,         color: '#f59e0b', bg: '#fef3c7', bgDark: 'rgba(245,158,11,0.18)',  title: 'Oy xodimi tanlandi',              desc: 'Nilufar Rahimova — Mart 2026',           time: '3 kun oldin'     },
])

function actBg(act) {
  return darkMode.value ? act.bgDark : act.bg
}

// ─── Top Performers ───
const topPerformers = ref([
  { rank: 1, name: 'Nilufar Rahimova',  role: 'QA Engineer',        rate: 98, initials: 'NR', color: '#059669', icon: Trophy },
  { rank: 2, name: 'Jasur Mirzayev',    role: 'DevOps Engineer',    rate: 96, initials: 'JM', color: '#7c3aed', icon: Medal  },
  { rank: 3, name: 'Alisher Nazarov',   role: 'Frontend Developer', rate: 94, initials: 'AN', color: '#0891b2', icon: Star   },
  { rank: 4, name: 'Dilorom Hasanova',  role: 'Project Manager',    rate: 91, initials: 'DH', color: '#ec4899', icon: Star   },
  { rank: 5, name: 'Malika Yusupova',   role: 'UI/UX Designer',     rate: 88, initials: 'MY', color: '#f59e0b', icon: Star   },
])

const rankColors = ['#f59e0b', '#9ca3af', '#c2773d', '#6b7280', '#6b7280']

// ─── Salary Overview ───
const salary = ref({
  total:   180000000,
  paid:    145000000,
  pending:  35000000,
  byDept: [
    { dept: 'Development', amount: 68000000, color: '#7c3aed' },
    { dept: 'Design',      amount: 32000000, color: '#ec4899' },
    { dept: 'QA',          amount: 28000000, color: '#059669' },
    { dept: 'Management',  amount: 30000000, color: '#f59e0b' },
    { dept: 'DevOps',      amount: 22000000, color: '#06b6d4' },
  ]
})

const paidPercent = computed(() =>
  Math.round((salary.value.paid / salary.value.total) * 100)
)

function formatMoney(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(0) + ' mln'
  return n.toLocaleString()
}

// ─── Upcoming Birthdays & Anniversaries ───
const upcomingEvents = ref([
  { name: 'Nilufar Rahimova', initials: 'NR', color: '#059669', type: 'birthday',     label: "Tug'ilgan kun",  date: '8-mart',  icon: CakeSlice   },
  { name: 'Jasur Mirzayev',   initials: 'JM', color: '#7c3aed', type: 'anniversary',  label: '3 yillik yubiley', date: '10-mart', icon: PartyPopper },
  { name: 'Alisher Nazarov',  initials: 'AN', color: '#0891b2', type: 'birthday',     label: "Tug'ilgan kun",  date: '12-mart', icon: CakeSlice   },
  { name: 'Kamola Ergasheva', initials: 'KE', color: '#ec4899', type: 'anniversary',  label: '1 yillik yubiley', date: '15-mart', icon: PartyPopper },
])

// ─── Department headcount ───
const departments = ref([
  { name: 'Development', count: 12, total: 42, color: '#7c3aed' },
  { name: 'Design',      count:  7, total: 42, color: '#ec4899' },
  { name: 'QA',          count:  8, total: 42, color: '#059669' },
  { name: 'Management',  count:  6, total: 42, color: '#f59e0b' },
  { name: 'DevOps',      count:  5, total: 42, color: '#06b6d4' },
  { name: 'Other',       count:  4, total: 42, color: '#9ca3af' },
])

const attendanceRate = computed(() => Math.round((31 / 42) * 100))

const today = new Date().toLocaleDateString('uz-UZ', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})
</script>

<template>
  <div class="home">

    <!-- ══════════════════════════════════
         Page Header
    ══════════════════════════════════ -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-date">{{ today }}</p>
      </div>
      <button class="btn-primary">
        <CalendarDays size="16" />
        Davomat olish
      </button>
    </div>

    <!-- ══════════════════════════════════
         Quick Actions
    ══════════════════════════════════ -->
    <div class="quick-actions">
      <button
        v-for="act in quickActions"
        :key="act.label"
        class="qa-btn"
        :class="{ refreshing: act.modal === 'refresh' && refreshing }"
        :style="{ '--qa-color': act.color, '--qa-bg': act.bg }"
        @click="openModal(act.modal)"
      >
        <span class="qa-icon">
          <component :is="act.icon" size="18" :class="{ 'spin-anim': act.modal === 'refresh' && refreshing }" />
        </span>
        <span class="qa-body">
          <span class="qa-label">{{ act.label }}</span>
          <span class="qa-info">{{ act.modal === 'refresh' && refreshing ? 'Yangilanmoqda...' : (act.count || act.info) }}</span>
        </span>
        <span v-if="act.count" class="qa-dot"></span>
      </button>
    </div>

    <!-- ══════════════════════════════════
         KPI Cards
    ══════════════════════════════════ -->
    <div class="kpi-grid">
      <div
        v-for="card in kpiCards"
        :key="card.key"
        class="kpi-card"
        :style="{ borderBottomColor: card.borderColor }"
      >
        <div class="kpi-icon" :style="{ background: card.lightBg, color: card.accent }">
          <component :is="card.icon" size="22" />
        </div>
        <div class="kpi-body">
          <p class="kpi-label">{{ card.label }}</p>
          <h2 class="kpi-value" :style="{ color: card.accent }">{{ card.value }}</h2>
          <p class="kpi-change" :class="card.positive ? 'positive' : 'negative'">
            <component :is="card.positive ? TrendingUp : TrendingDown" size="13" />
            {{ card.change }}
          </p>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════
         Charts Row
    ══════════════════════════════════ -->
    <div class="row-2">
      <div class="card chart-card">
        <div class="card-head">
          <div>
            <h3 class="card-title">Haftalik davomat</h3>
            <p class="card-sub">Bu haftaning kunlik holati</p>
          </div>
          <div class="rate-badge">
            <BarChart2 size="14" />
            {{ attendanceRate }}% davomat
          </div>
        </div>
        <div class="chart-wrap">
          <Line :data="lineChartData" :options="lineChartOptions" />
        </div>
      </div>

      <div class="card donut-card">
        <div class="card-head">
          <div>
            <h3 class="card-title">Bugungi holat</h3>
            <p class="card-sub">Jami 42 xodimdan</p>
          </div>
        </div>
        <div class="donut-wrap">
          <Doughnut :data="donutData" :options="donutOptions" />
          <div class="donut-center">
            <span class="donut-pct">{{ attendanceRate }}%</span>
            <span class="donut-lbl">davomat</span>
          </div>
        </div>
        <div class="donut-stats">
          <div v-for="item in [
            { label:'Kelgan', val:31, color:'#7c3aed' },
            { label:'Kelmagan', val:5, color:'#ef4444' },
            { label:'Kech qolgan', val:3, color:'#f59e0b' },
            { label:'Sababli', val:3, color:'#06b6d4' }
          ]" :key="item.label" class="d-stat">
            <span class="d-dot" :style="{ background: item.color }"></span>
            <span class="d-key">{{ item.label }}</span>
            <span class="d-val">{{ item.val }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════
         Attendance + Department headcount
    ══════════════════════════════════ -->
    <div class="row-2">

      <!-- Today attendance list -->
      <div class="card attend-card">
        <div class="card-head">
          <div>
            <h3 class="card-title">Bugungi davomat</h3>
            <p class="card-sub">Real vaqt holati</p>
          </div>
          <button class="btn-ghost">Barchasi <ChevronRight size="14" /></button>
        </div>
        <div class="attend-list">
          <div v-for="emp in todayList" :key="emp.name" class="attend-row">
            <div class="emp-avatar" :style="{ background: emp.color }">{{ emp.initials }}</div>
            <div class="emp-info">
              <p class="emp-name">{{ emp.name }}</p>
              <p class="emp-role">{{ emp.role }}</p>
            </div>
            <div class="emp-time">
              <Timer size="13" class="time-icon" />{{ emp.time }}
            </div>
            <span class="status-badge" :style="{ background: statusBg(emp.status), color: statusMap[emp.status].color }">
              <component :is="statusMap[emp.status].icon" size="12" />
              {{ statusMap[emp.status].label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Department Headcount -->
      <div class="card dept-card">
        <div class="card-head">
          <div>
            <h3 class="card-title">Bo'limlar tarkibi</h3>
            <p class="card-sub">Xodimlar soni bo'limlar bo'yicha</p>
          </div>
        </div>
        <div class="dept-list">
          <div v-for="d in departments" :key="d.name" class="dept-row">
            <div class="dept-dot-wrap">
              <span class="dept-dot" :style="{ background: d.color }"></span>
              <span class="dept-name">{{ d.name }}</span>
            </div>
            <div class="dept-bar-wrap">
              <div
                class="dept-bar"
                :style="{ width: (d.count / d.total) * 100 + '%', background: d.color }"
              ></div>
            </div>
            <span class="dept-count">{{ d.count }} kishi</span>
          </div>
        </div>
        <!-- Total summary -->
        <div class="dept-summary">
          <div class="dept-sum-row" v-for="d in departments" :key="d.name + '_s'">
            <span class="sum-dot" :style="{ background: d.color }"></span>
            <span class="sum-pct">{{ Math.round((d.count / 42) * 100) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════
         Leave Requests + Recent Activity
    ══════════════════════════════════ -->
    <div class="row-2">

      <!-- Pending Leave Requests -->
      <div class="card leave-card">
        <div class="card-head">
          <div>
            <h3 class="card-title">Ta'til so'rovlari</h3>
            <p class="card-sub">
              <span class="pending-count">{{ leaveRequests.filter(r => r.status === 'pending').length }}</span>
              ta ko'rib chiqilmoqda
            </p>
          </div>
          <button class="btn-ghost">Barchasi <ChevronRight size="14" /></button>
        </div>

        <div class="leave-list">
          <div v-for="(req, i) in leaveRequests" :key="req.name" class="leave-row">
            <div class="lv-avatar" :style="{ background: req.color }">{{ req.initials }}</div>
            <div class="lv-info">
              <p class="lv-name">{{ req.name }}</p>
              <p class="lv-meta">{{ req.type }} &bull; {{ req.from }} – {{ req.to }} ({{ req.days }} kun)</p>
            </div>
            <span
              class="lv-status"
              :style="{
                background: darkMode ? leaveStatusMap[req.status].bgDark : leaveStatusMap[req.status].bg,
                color: leaveStatusMap[req.status].color
              }"
            >{{ leaveStatusMap[req.status].label }}</span>
            <div v-if="req.status === 'pending'" class="lv-actions">
              <button class="lv-btn approve" @click="approveLeave(i)" title="Tasdiqlash">
                <Check size="13" />
              </button>
              <button class="lv-btn reject" @click="rejectLeave(i)" title="Rad etish">
                <X size="13" />
              </button>
            </div>
            <div v-else class="lv-actions-placeholder"></div>
          </div>
        </div>
      </div>

      <!-- Recent HR Activity -->
      <div class="card activity-card">
        <div class="card-head">
          <div>
            <h3 class="card-title">So'nggi HR faoliyat</h3>
            <p class="card-sub">Oxirgi o'zgarishlar</p>
          </div>
        </div>
        <div class="activity-list">
          <div v-for="(act, i) in activities" :key="i" class="activity-row">
            <div class="act-icon" :style="{ background: actBg(act), color: act.color }">
              <component :is="act.icon" size="15" />
            </div>
            <div class="act-line" v-if="i < activities.length - 1"></div>
            <div class="act-body">
              <p class="act-title">{{ act.title }}</p>
              <p class="act-desc">{{ act.desc }}</p>
            </div>
            <span class="act-time">{{ act.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════
         Top Performers + Salary + Birthdays
    ══════════════════════════════════ -->
    <div class="row-3b">

      <!-- Top Performers -->
      <div class="card perf-card">
        <div class="card-head">
          <div>
            <h3 class="card-title">Eng faol xodimlar</h3>
            <p class="card-sub">Mart 2026 — davomat foizi bo'yicha</p>
          </div>
          <div class="trophy-badge">
            <Trophy size="14" />
            Top 5
          </div>
        </div>
        <div class="perf-list">
          <div v-for="(p, i) in topPerformers" :key="p.name" class="perf-row">
            <span class="perf-rank" :style="{ color: rankColors[i], borderColor: rankColors[i] + '40' }">
              {{ p.rank }}
            </span>
            <div class="perf-avatar" :style="{ background: p.color }">{{ p.initials }}</div>
            <div class="perf-info">
              <p class="perf-name">{{ p.name }}</p>
              <p class="perf-role">{{ p.role }}</p>
            </div>
            <div class="perf-rate-wrap">
              <div class="perf-bar-bg">
                <div class="perf-bar" :style="{ width: p.rate + '%', background: p.color }"></div>
              </div>
              <span class="perf-pct" :style="{ color: p.color }">{{ p.rate }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Salary Overview -->
      <div class="card salary-card">
        <div class="card-head">
          <div>
            <h3 class="card-title">Oylik maosh</h3>
            <p class="card-sub">Mart 2026 — umumiy byudjet</p>
          </div>
        </div>

        <div class="salary-total">
          <div class="sal-main">
            <span class="sal-amount">{{ formatMoney(salary.total) }}</span>
            <span class="sal-currency">so'm</span>
          </div>
          <div class="sal-progress-bar">
            <div class="sal-paid-bar" :style="{ width: paidPercent + '%' }"></div>
          </div>
          <div class="sal-split">
            <div class="sal-item">
              <span class="sal-dot" style="background:#059669"></span>
              <span class="sal-lbl">To'langan</span>
              <span class="sal-val green">{{ formatMoney(salary.paid) }}</span>
            </div>
            <div class="sal-item">
              <span class="sal-dot" style="background:#f59e0b"></span>
              <span class="sal-lbl">Kutmoqda</span>
              <span class="sal-val orange">{{ formatMoney(salary.pending) }}</span>
            </div>
          </div>
        </div>

        <div class="sal-dept-list">
          <div v-for="d in salary.byDept" :key="d.dept" class="sal-dept-row">
            <span class="sal-dept-dot" :style="{ background: d.color }"></span>
            <span class="sal-dept-name">{{ d.dept }}</span>
            <div class="sal-dept-bar-wrap">
              <div class="sal-dept-bar" :style="{ width: (d.amount / salary.total) * 100 + '%', background: d.color }"></div>
            </div>
            <span class="sal-dept-val">{{ formatMoney(d.amount) }}</span>
          </div>
        </div>
      </div>

      <!-- Upcoming Birthdays & Anniversaries -->
      <div class="card birthday-card">
        <div class="card-head">
          <div>
            <h3 class="card-title">Yaqin sanalar</h3>
            <p class="card-sub">Tug'ilgan kunlar & yubileylar</p>
          </div>
        </div>
        <div class="birthday-list">
          <div v-for="ev in upcomingEvents" :key="ev.name" class="birthday-row">
            <div class="bd-avatar" :style="{ background: ev.color }">{{ ev.initials }}</div>
            <div class="bd-info">
              <p class="bd-name">{{ ev.name }}</p>
              <p class="bd-label">{{ ev.label }}</p>
            </div>
            <div class="bd-right">
              <span class="bd-date">{{ ev.date }}</span>
              <span class="bd-icon-wrap" :style="{ background: ev.color + '22', color: ev.color }">
                <component :is="ev.icon" size="14" />
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>

  <!-- ══════════════════════════════════
       MODAL OVERLAY
  ══════════════════════════════════ -->
  <Transition name="modal-fade">
    <div v-if="activeModal" class="modal-overlay" @click.self="closeModal">
      <Transition name="modal-slide" mode="out-in">

        <!-- ── 1. Xodim qo'shish ── -->
        <div v-if="activeModal === 'addEmployee'" key="addEmployee" class="modal">
          <div class="modal-head">
            <div class="modal-head-icon" style="background:rgba(124,58,237,0.12);color:#7c3aed">
              <UserPlus size="20" />
            </div>
            <div>
              <h2 class="modal-title">Yangi xodim qo'shish</h2>
              <p class="modal-sub">Xodim ma'lumotlarini to'ldiring</p>
            </div>
            <button class="modal-close" @click="closeModal"><X size="18"/></button>
          </div>

          <Transition name="success-fade">
            <div v-if="modalSuccess" class="modal-success">
              <CheckCircle2 size="40" color="#059669"/>
              <p>Xodim muvaffaqiyatli qo'shildi!</p>
            </div>
          </Transition>

          <form v-if="!modalSuccess" class="modal-form" @submit.prevent="submitAddEmployee">
            <div class="form-row-2">
              <div class="form-group">
                <label>Ism <span class="req">*</span></label>
                <input v-model="newEmployee.firstName" placeholder="Alisher" required />
              </div>
              <div class="form-group">
                <label>Familiya <span class="req">*</span></label>
                <input v-model="newEmployee.lastName" placeholder="Nazarov" required />
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Telefon</label>
                <input v-model="newEmployee.phone" placeholder="+998 90 123 45 67" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input v-model="newEmployee.email" type="email" placeholder="alisher@company.uz" />
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Bo'lim <span class="req">*</span></label>
                <select v-model="newEmployee.department" required>
                  <option value="">Tanlang...</option>
                  <option v-for="d in departments_list" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Lavozim</label>
                <input v-model="newEmployee.role" placeholder="Frontend Developer" />
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Ishga kirish sanasi</label>
                <input v-model="newEmployee.startDate" type="date" />
              </div>
              <div class="form-group">
                <label>Oylik maosh (so'm)</label>
                <input v-model="newEmployee.salary" type="number" placeholder="5 000 000" />
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="closeModal">Bekor qilish</button>
              <button type="submit" class="btn-submit" style="--c:#7c3aed">
                <UserPlus size="15"/> Qo'shish
              </button>
            </div>
          </form>
        </div>

        <!-- ── 2. Davomat belgilash ── -->
        <div v-else-if="activeModal === 'markAttend'" key="markAttend" class="modal modal-wide">
          <div class="modal-head">
            <div class="modal-head-icon" style="background:rgba(5,150,105,0.12);color:#059669">
              <CalendarDays size="20" />
            </div>
            <div>
              <h2 class="modal-title">Davomat belgilash</h2>
              <p class="modal-sub">Bugungi xodimlar ro'yxati</p>
            </div>
            <button class="modal-close" @click="closeModal"><X size="18"/></button>
          </div>

          <Transition name="success-fade">
            <div v-if="modalSuccess" class="modal-success">
              <CheckCircle2 size="40" color="#059669"/>
              <p>Davomat muvaffaqiyatli saqlandi!</p>
            </div>
          </Transition>

          <div v-if="!modalSuccess">
            <div class="form-group" style="margin-bottom:16px">
              <label>Sana</label>
              <input v-model="attendDate" type="date" style="max-width:200px"/>
            </div>

            <div class="attend-modal-list">
              <div v-for="emp in attendList" :key="emp.name" class="attend-modal-row">
                <div class="emp-avatar" :style="{ background: emp.color }">{{ emp.initials }}</div>
                <span class="attend-modal-name">{{ emp.name }}</span>
                <div class="attend-toggle">
                  <button
                    v-for="opt in attendStatusOpts" :key="opt.val"
                    class="atog-btn"
                    :class="{ active: emp.status === opt.val }"
                    :style="emp.status === opt.val ? { background: opt.color, color: '#fff', borderColor: opt.color } : {}"
                    @click="emp.status = opt.val"
                    type="button"
                  >{{ opt.label }}</button>
                </div>
              </div>
            </div>

            <div class="modal-actions" style="margin-top:20px">
              <button type="button" class="btn-cancel" @click="closeModal">Bekor qilish</button>
              <button type="button" class="btn-submit" style="--c:#059669" @click="submitModal">
                <CheckCircle2 size="15"/> Saqlash
              </button>
            </div>
          </div>
        </div>

        <!-- ── 3. Hisobot yaratish ── -->
        <div v-else-if="activeModal === 'genReport'" key="genReport" class="modal">
          <div class="modal-head">
            <div class="modal-head-icon" style="background:rgba(8,145,178,0.12);color:#0891b2">
              <FileText size="20" />
            </div>
            <div>
              <h2 class="modal-title">Hisobot yaratish</h2>
              <p class="modal-sub">Kerakli parametrlarni tanlang</p>
            </div>
            <button class="modal-close" @click="closeModal"><X size="18"/></button>
          </div>

          <Transition name="success-fade">
            <div v-if="modalSuccess" class="modal-success">
              <CheckCircle2 size="40" color="#059669"/>
              <p>Hisobot tayyorlanmoqda... Yuklab olish boshlandi!</p>
            </div>
          </Transition>

          <form v-if="!modalSuccess" class="modal-form" @submit.prevent="submitModal">
            <div class="form-group">
              <label>Hisobot turi</label>
              <div class="report-type-grid">
                <label
                  v-for="rt in reportTypes" :key="rt.val"
                  class="rtype-card"
                  :class="{ selected: report.type === rt.val }"
                >
                  <input type="radio" v-model="report.type" :value="rt.val" />
                  <span class="rtype-icon">{{ rt.icon }}</span>
                  <span class="rtype-label">{{ rt.label }}</span>
                </label>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Davr</label>
                <input v-model="report.period" type="month" />
              </div>
              <div class="form-group">
                <label>Bo'lim</label>
                <select v-model="report.department">
                  <option value="all">Barcha bo'limlar</option>
                  <option v-for="d in departments_list" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Format</label>
              <div class="format-tabs">
                <button
                  v-for="fmt in ['pdf','excel','csv']" :key="fmt"
                  type="button"
                  class="fmt-tab"
                  :class="{ active: report.format === fmt }"
                  @click="report.format = fmt"
                >{{ fmt.toUpperCase() }}</button>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="closeModal">Bekor qilish</button>
              <button type="submit" class="btn-submit" style="--c:#0891b2">
                <FileText size="15"/> Yuklab olish
              </button>
            </div>
          </form>
        </div>

        <!-- ── 4. Ta'til so'rash ── -->
        <div v-else-if="activeModal === 'leaveReq'" key="leaveReq" class="modal">
          <div class="modal-head">
            <div class="modal-head-icon" style="background:rgba(217,119,6,0.12);color:#d97706">
              <CalendarOff size="20" />
            </div>
            <div>
              <h2 class="modal-title">Ta'til so'rovi</h2>
              <p class="modal-sub">Yangi ta'til ariza qoldiring</p>
            </div>
            <button class="modal-close" @click="closeModal"><X size="18"/></button>
          </div>

          <Transition name="success-fade">
            <div v-if="modalSuccess" class="modal-success">
              <CheckCircle2 size="40" color="#059669"/>
              <p>Ta'til so'rovi yuborildi! Menejer ko'rib chiqadi.</p>
            </div>
          </Transition>

          <form v-if="!modalSuccess" class="modal-form" @submit.prevent="submitModal">
            <div class="form-row-2">
              <div class="form-group">
                <label>Xodim <span class="req">*</span></label>
                <select v-model="leaveForm.employee" required>
                  <option value="">Tanlang...</option>
                  <option v-for="emp in todayList" :key="emp.name" :value="emp.name">{{ emp.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Ta'til turi <span class="req">*</span></label>
                <select v-model="leaveForm.type" required>
                  <option v-for="lt in leaveTypes" :key="lt.val" :value="lt.val">{{ lt.label }}</option>
                </select>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Boshlanish sanasi <span class="req">*</span></label>
                <input v-model="leaveForm.from" type="date" required />
              </div>
              <div class="form-group">
                <label>Tugash sanasi <span class="req">*</span></label>
                <input v-model="leaveForm.to" type="date" required />
              </div>
            </div>

            <div v-if="leaveDays > 0" class="leave-days-badge">
              <CalendarDays size="14"/>
              <strong>{{ leaveDays }} kun</strong> ta'til so'ralmoqda
            </div>

            <div class="form-group">
              <label>Sabab / Izoh</label>
              <textarea v-model="leaveForm.reason" rows="3" placeholder="Ta'til sababini yozing..."></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="closeModal">Bekor qilish</button>
              <button type="submit" class="btn-submit" style="--c:#d97706">
                <CalendarOff size="15"/> So'rov yuborish
              </button>
            </div>
          </form>
        </div>

        <!-- ── 5. Maosh hisoblash ── -->
        <div v-else-if="activeModal === 'calcSalary'" key="calcSalary" class="modal modal-wide">
          <div class="modal-head">
            <div class="modal-head-icon" style="background:rgba(220,38,38,0.12);color:#dc2626">
              <Wallet size="20" />
            </div>
            <div>
              <h2 class="modal-title">Maosh hisoblash</h2>
              <p class="modal-sub">Oylik to'lovlarni ko'rib chiqing</p>
            </div>
            <button class="modal-close" @click="closeModal"><X size="18"/></button>
          </div>

          <div class="form-row-2" style="margin-bottom:16px">
            <div class="form-group">
              <label>Oy</label>
              <input v-model="salaryCalc.month" type="month" />
            </div>
            <div class="form-group">
              <label>Bo'lim</label>
              <select v-model="salaryCalc.department">
                <option value="all">Barcha bo'limlar</option>
                <option v-for="d in departments_list" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
          </div>

          <div class="salary-table-wrap">
            <table class="salary-table">
              <thead>
                <tr>
                  <th>Xodim</th>
                  <th>Asosiy</th>
                  <th>Bonus</th>
                  <th>Jarima</th>
                  <th>Davomat</th>
                  <th>Jami</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in salaryResults" :key="r.name">
                  <td class="sal-emp-cell">
                    <div class="sal-emp-dot" :style="{ background: '#7c3aed' }"></div>
                    {{ r.name }}
                  </td>
                  <td>{{ formatSom(r.base) }}</td>
                  <td class="green">+{{ formatSom(r.bonus) }}</td>
                  <td class="red">{{ r.fine ? '-' + formatSom(r.fine) : '—' }}</td>
                  <td>
                    <span class="attend-pct-badge" :style="{ color: r.attend >= 95 ? '#059669' : r.attend >= 85 ? '#d97706' : '#dc2626' }">
                      {{ r.attend }}%
                    </span>
                  </td>
                  <td class="net-val">{{ formatSom(netSalary(r)) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="tfoot-row">
                  <td><strong>Jami</strong></td>
                  <td>{{ formatSom(salaryResults.reduce((s,r)=>s+r.base,0)) }}</td>
                  <td class="green">+{{ formatSom(salaryResults.reduce((s,r)=>s+r.bonus,0)) }}</td>
                  <td class="red">-{{ formatSom(salaryResults.reduce((s,r)=>s+r.fine,0)) }}</td>
                  <td>—</td>
                  <td class="net-val">{{ formatSom(salaryResults.reduce((s,r)=>s+netSalary(r),0)) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="modal-actions" style="margin-top:20px">
            <button type="button" class="btn-cancel" @click="closeModal">Yopish</button>
            <button type="button" class="btn-submit" style="--c:#dc2626" @click="submitModal">
              <FileText size="15"/> Hisobot chiqarish
            </button>
          </div>
        </div>

      </Transition>
    </div>
  </Transition>

</template>

<style scoped>
/* ─── Base ─── */
.home {
  padding: 24px;
  background: var(--bg, #f5f6fa);
  min-height: 100%;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  color: var(--t1, #111827);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* ─── Page header ─── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--t1);
  margin: 0 0 4px;
  transition: color 0.3s ease;
}

.page-date {
  font-size: 13px;
  color: var(--t4);
  margin: 0;
  text-transform: capitalize;
  transition: color 0.3s ease;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: linear-gradient(135deg, #7c3aed, #8b5cf6);
  color: #fff;
  border: none;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  box-shadow: 0 4px 14px rgba(124,58,237,0.35);
}
.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

/* ─── Quick Actions ─── */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.qa-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, background-color 0.3s ease, border-color 0.3s ease;
  position: relative;
  text-align: left;
}

.qa-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--shadow-md);
  border-color: var(--qa-color);
}

.qa-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--qa-bg);
  color: var(--qa-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qa-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.qa-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--t1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.qa-info {
  font-size: 11px;
  color: var(--t4);
  transition: color 0.3s ease;
}

.qa-dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid var(--surface);
}

/* ─── KPI grid ─── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: var(--surface);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 4px solid transparent;
  box-shadow: 0 1px 6px var(--shadow-sm);
  transition: background-color 0.3s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.kpi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px var(--shadow-md); }

.kpi-icon {
  width: 52px; height: 52px; border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background-color 0.3s ease;
}

.kpi-label { font-size: 12px; color: var(--t4); margin: 0 0 4px; font-weight: 500; transition: color 0.3s ease; }
.kpi-value { font-size: 30px; font-weight: 800; margin: 0 0 4px; line-height: 1; letter-spacing: -0.5px; }
.kpi-change { font-size: 12px; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 4px; }
.kpi-change.positive { color: #059669; }
.kpi-change.negative { color: #dc2626; }

/* ─── Card base ─── */
.card {
  background: var(--surface);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 6px var(--shadow-sm);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-title { font-size: 15px; font-weight: 700; color: var(--t1); margin: 0 0 3px; transition: color 0.3s ease; }
.card-sub { font-size: 12px; color: var(--t4); margin: 0; transition: color 0.3s ease; }

.btn-ghost {
  display: flex; align-items: center; gap: 3px;
  font-size: 12px; color: var(--accent); font-weight: 600;
  border: none; background: none; cursor: pointer; padding: 4px 0;
  transition: color 0.3s ease;
}
.btn-ghost:hover { opacity: 0.75; }

/* ─── Rows ─── */
.row-2 {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
}

.row-3b {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

/* ─── Charts ─── */
.chart-card { display: flex; flex-direction: column; }
.chart-wrap { flex: 1; height: 240px; }

.rate-badge {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 12px;
  background: var(--accent-bg);
  color: var(--accent);
  border-radius: 20px;
  font-size: 12px; font-weight: 700; white-space: nowrap;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* ─── Donut ─── */
.donut-card { display: flex; flex-direction: column; }
.donut-wrap { position: relative; height: 190px; margin-bottom: 8px; }

.donut-center {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -64%);
  text-align: center; pointer-events: none;
}

.donut-pct { display: block; font-size: 24px; font-weight: 800; color: var(--t1); line-height: 1; transition: color 0.3s ease; }
.donut-lbl { font-size: 11px; color: var(--t4); font-weight: 500; transition: color 0.3s ease; }

.donut-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin-top: 4px; }
.d-stat { display: flex; align-items: center; gap: 7px; font-size: 12px; }
.d-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.d-key { color: var(--t3); flex: 1; transition: color 0.3s ease; }
.d-val { font-weight: 700; color: var(--t1); transition: color 0.3s ease; }

/* ─── Attendance list ─── */
.attend-card { display: flex; flex-direction: column; }
.attend-list { display: flex; flex-direction: column; gap: 2px; }

.attend-row {
  display: flex; align-items: center; gap: 12px;
  padding: 9px 8px; border-radius: 10px;
  transition: background-color 0.15s ease;
}
.attend-row:hover { background: var(--surface2); }

.emp-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 11px; font-weight: 700; flex-shrink: 0;
}

.emp-info { flex: 1; min-width: 0; }
.emp-name { font-size: 13px; font-weight: 600; color: var(--t1); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.3s ease; }
.emp-role { font-size: 11px; color: var(--t4); margin: 0; transition: color 0.3s ease; }

.emp-time {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--t3); font-weight: 600;
  min-width: 52px; justify-content: flex-end;
  transition: color 0.3s ease;
}
.time-icon { color: var(--t5); transition: color 0.3s ease; }

.status-badge {
  display: flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 700; white-space: nowrap;
  transition: background-color 0.3s ease;
}

/* ─── Department card ─── */
.dept-list { display: flex; flex-direction: column; gap: 12px; }

.dept-row { display: flex; align-items: center; gap: 10px; }

.dept-dot-wrap { display: flex; align-items: center; gap: 7px; width: 110px; flex-shrink: 0; }

.dept-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }

.dept-name { font-size: 12px; color: var(--t2); font-weight: 500; transition: color 0.3s ease; }

.dept-bar-wrap { flex: 1; background: var(--border2); border-radius: 6px; height: 7px; overflow: hidden; transition: background-color 0.3s ease; }
.dept-bar { height: 7px; border-radius: 6px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }

.dept-count { font-size: 12px; font-weight: 700; color: var(--t3); width: 58px; text-align: right; flex-shrink: 0; transition: color 0.3s ease; }

.dept-summary { display: flex; gap: 8px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border2); transition: border-color 0.3s ease; }
.dept-sum-row { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--t4); }
.sum-dot { width: 7px; height: 7px; border-radius: 50%; }
.sum-pct { font-weight: 600; }

/* ─── Leave Requests ─── */
.leave-card { display: flex; flex-direction: column; }
.leave-list { display: flex; flex-direction: column; gap: 4px; }

.leave-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 8px; border-radius: 10px;
  transition: background-color 0.15s ease;
}
.leave-row:hover { background: var(--surface2); }

.lv-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 11px; font-weight: 700; flex-shrink: 0;
}

.lv-info { flex: 1; min-width: 0; }
.lv-name { font-size: 13px; font-weight: 600; color: var(--t1); margin: 0; transition: color 0.3s ease; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lv-meta { font-size: 11px; color: var(--t4); margin: 0; transition: color 0.3s ease; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.lv-status {
  padding: 3px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 700; white-space: nowrap;
  flex-shrink: 0; transition: background-color 0.3s ease;
}

.lv-actions { display: flex; gap: 4px; flex-shrink: 0; }
.lv-actions-placeholder { width: 60px; flex-shrink: 0; }

.lv-btn {
  width: 28px; height: 28px; border: none; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 13px; transition: all 0.15s ease;
}

.lv-btn.approve { background: #d1fae5; color: #059669; }
.lv-btn.approve:hover { background: #059669; color: #fff; }
.lv-btn.reject  { background: #fee2e2; color: #dc2626; }
.lv-btn.reject:hover  { background: #dc2626; color: #fff; }

.pending-count {
  display: inline-flex; align-items: center; justify-content: center;
  background: #fef3c7; color: #d97706;
  font-weight: 700; font-size: 11px;
  padding: 1px 7px; border-radius: 10px;
}

/* ─── Activity Timeline ─── */
.activity-card { display: flex; flex-direction: column; }
.activity-list { display: flex; flex-direction: column; }

.activity-row {
  display: flex; align-items: flex-start; gap: 12px;
  position: relative; padding-bottom: 16px;
}
.activity-row:last-child { padding-bottom: 0; }

.act-icon {
  width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; z-index: 1; transition: background-color 0.3s ease;
}

.act-line {
  position: absolute;
  left: 17px; top: 34px;
  width: 1px; height: calc(100% - 34px);
  background: var(--border2);
  transition: background-color 0.3s ease;
}

.act-body { flex: 1; min-width: 0; padding-top: 4px; }
.act-title { font-size: 13px; font-weight: 600; color: var(--t1); margin: 0 0 2px; transition: color 0.3s ease; }
.act-desc { font-size: 11px; color: var(--t4); margin: 0; transition: color 0.3s ease; }

.act-time {
  font-size: 11px; color: var(--t4); white-space: nowrap;
  padding-top: 5px; flex-shrink: 0; transition: color 0.3s ease;
}

/* ─── Top Performers ─── */
.perf-card { display: flex; flex-direction: column; }
.perf-list { display: flex; flex-direction: column; gap: 12px; }

.perf-row { display: flex; align-items: center; gap: 10px; }

.perf-rank {
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800;
  border: 2px solid transparent; flex-shrink: 0;
}

.perf-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 11px; font-weight: 700; flex-shrink: 0;
}

.perf-info { flex: 1; min-width: 0; }
.perf-name { font-size: 13px; font-weight: 600; color: var(--t1); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.3s ease; }
.perf-role { font-size: 11px; color: var(--t4); margin: 0; transition: color 0.3s ease; }

.perf-rate-wrap { display: flex; align-items: center; gap: 8px; width: 100px; flex-shrink: 0; }

.perf-bar-bg { flex: 1; background: var(--border2); border-radius: 6px; height: 6px; overflow: hidden; transition: background-color 0.3s ease; }
.perf-bar { height: 6px; border-radius: 6px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }

.perf-pct { font-size: 12px; font-weight: 700; width: 32px; text-align: right; flex-shrink: 0; }

.trophy-badge {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 12px;
  background: rgba(245,158,11,0.12);
  color: #d97706;
  border-radius: 20px;
  font-size: 12px; font-weight: 700; white-space: nowrap;
}

/* ─── Salary Overview ─── */
.salary-card { display: flex; flex-direction: column; }

.salary-total { margin-bottom: 18px; }

.sal-main { display: flex; align-items: baseline; gap: 6px; margin-bottom: 10px; }
.sal-amount { font-size: 26px; font-weight: 800; color: var(--t1); letter-spacing: -0.5px; transition: color 0.3s ease; }
.sal-currency { font-size: 13px; color: var(--t4); transition: color 0.3s ease; }

.sal-progress-bar {
  height: 10px; background: var(--border2); border-radius: 8px;
  overflow: hidden; margin-bottom: 10px; transition: background-color 0.3s ease;
}
.sal-paid-bar {
  height: 10px;
  background: linear-gradient(90deg, #059669, #34d399);
  border-radius: 8px;
  transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
}

.sal-split { display: flex; gap: 20px; }
.sal-item { display: flex; align-items: center; gap: 7px; }
.sal-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sal-lbl { font-size: 12px; color: var(--t4); transition: color 0.3s ease; }
.sal-val { font-size: 12px; font-weight: 700; }
.sal-val.green  { color: #059669; }
.sal-val.orange { color: #d97706; }

.sal-dept-list { display: flex; flex-direction: column; gap: 10px; }
.sal-dept-row { display: flex; align-items: center; gap: 8px; }
.sal-dept-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sal-dept-name { font-size: 12px; color: var(--t2); width: 100px; flex-shrink: 0; transition: color 0.3s ease; }
.sal-dept-bar-wrap { flex: 1; background: var(--border2); border-radius: 6px; height: 6px; overflow: hidden; transition: background-color 0.3s ease; }
.sal-dept-bar { height: 6px; border-radius: 6px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
.sal-dept-val { font-size: 11px; font-weight: 700; color: var(--t3); width: 60px; text-align: right; flex-shrink: 0; transition: color 0.3s ease; }

/* ─── Birthdays & Anniversaries ─── */
.birthday-card { display: flex; flex-direction: column; }
.birthday-list { display: flex; flex-direction: column; gap: 12px; }

.birthday-row { display: flex; align-items: center; gap: 12px; }

.bd-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 11px; font-weight: 700; flex-shrink: 0;
}

.bd-info { flex: 1; }
.bd-name { font-size: 13px; font-weight: 600; color: var(--t1); margin: 0; transition: color 0.3s ease; }
.bd-label { font-size: 11px; color: var(--t4); margin: 0; transition: color 0.3s ease; }

.bd-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.bd-date { font-size: 12px; font-weight: 700; color: var(--t3); transition: color 0.3s ease; }

.bd-icon-wrap {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}

/* ══════════════════════════════════
   MODAL SYSTEM
══════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: var(--surface, #fff);
  border-radius: 18px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  position: relative;
  transition: background-color 0.3s ease;
}

.modal-wide { max-width: 720px; }

/* Modal header */
.modal-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.modal-head-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 17px; font-weight: 800;
  color: var(--t1); margin: 0 0 2px;
  transition: color 0.3s ease;
}

.modal-sub {
  font-size: 12px; color: var(--t4); margin: 0;
  transition: color 0.3s ease;
}

.modal-close {
  margin-left: auto;
  width: 34px; height: 34px; border-radius: 10px;
  border: none; background: var(--surface2);
  color: var(--t3); cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: background-color 0.15s, color 0.15s;
}
.modal-close:hover { background: #fee2e2; color: #dc2626; }

/* Form */
.modal-form { display: flex; flex-direction: column; gap: 16px; }

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px; font-weight: 700;
  color: var(--t3); letter-spacing: 0.2px;
  transition: color 0.3s ease;
}

.req { color: #ef4444; }

.form-group input,
.form-group select,
.form-group textarea {
  padding: 9px 12px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  font-size: 13px;
  color: var(--t1);
  background: var(--surface2);
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.3s ease, color 0.3s ease;
  width: 100%;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #a78bfa;
  box-shadow: 0 0 0 3px rgba(167,139,250,0.15);
  background: var(--surface);
}

.form-group textarea { resize: vertical; min-height: 80px; }

/* Modal actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.btn-cancel {
  padding: 9px 18px; border: 1.5px solid var(--border);
  background: var(--surface2); color: var(--t3);
  border-radius: 9px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: background-color 0.15s, border-color 0.15s;
}
.btn-cancel:hover { background: var(--border2); }

.btn-submit {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 20px;
  background: var(--c, #7c3aed);
  color: #fff; border: none;
  border-radius: 9px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 14px rgba(0,0,0,0.18);
  transition: opacity 0.2s, transform 0.15s;
}
.btn-submit:hover { opacity: 0.88; transform: translateY(-1px); }

/* Success state */
.modal-success {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px; padding: 40px 0;
  text-align: center;
}
.modal-success p {
  font-size: 15px; font-weight: 700;
  color: var(--t1); transition: color 0.3s ease;
}

/* Davomat modal */
.attend-modal-list { display: flex; flex-direction: column; gap: 8px; }

.attend-modal-row {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 10px; border-radius: 10px;
  background: var(--surface2); transition: background-color 0.3s ease;
}

.attend-modal-name {
  flex: 1; font-size: 13px; font-weight: 600;
  color: var(--t1); transition: color 0.3s ease;
}

.attend-toggle { display: flex; gap: 6px; }

.atog-btn {
  padding: 5px 11px; border-radius: 20px;
  border: 1.5px solid var(--border);
  background: transparent; color: var(--t4);
  font-size: 11px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s ease;
}
.atog-btn:hover { border-color: currentColor; }

/* Report types */
.report-type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.rtype-card {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; padding: 14px 10px;
  border: 1.5px solid var(--border);
  border-radius: 12px; cursor: pointer;
  background: var(--surface2);
  transition: border-color 0.15s, background-color 0.15s, box-shadow 0.15s;
}

.rtype-card input { display: none; }

.rtype-card.selected {
  border-color: #7c3aed;
  background: #ede9fe;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
}

.layout.dark .rtype-card.selected {
  background: rgba(124,58,237,0.18);
}

.rtype-icon { font-size: 22px; }
.rtype-label { font-size: 12px; font-weight: 600; color: var(--t2); text-align: center; transition: color 0.3s ease; }

/* Format tabs */
.format-tabs { display: flex; gap: 8px; }

.fmt-tab {
  padding: 7px 18px; border-radius: 8px;
  border: 1.5px solid var(--border);
  background: var(--surface2); color: var(--t3);
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s ease;
}
.fmt-tab:hover { border-color: #0891b2; color: #0891b2; }
.fmt-tab.active { background: #0891b2; color: #fff; border-color: #0891b2; }

/* Leave days badge */
.leave-days-badge {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: 10px;
  background: rgba(217,119,6,0.1);
  color: #d97706; font-size: 13px;
  border: 1px solid rgba(217,119,6,0.25);
}

/* Salary table */
.salary-table-wrap {
  border: 1px solid var(--border);
  border-radius: 12px; overflow: hidden;
  transition: border-color 0.3s ease;
}

.salary-table {
  width: 100%; border-collapse: collapse;
  font-size: 13px;
}

.salary-table th {
  padding: 10px 14px; text-align: left;
  background: var(--surface2); color: var(--t4);
  font-size: 11px; font-weight: 700; letter-spacing: 0.4px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.salary-table td {
  padding: 11px 14px;
  border-top: 1px solid var(--border2);
  color: var(--t2);
  transition: border-color 0.3s ease, color 0.3s ease;
}

.salary-table tr:hover td { background: var(--surface2); }

.sal-emp-cell { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--t1) !important; }
.sal-emp-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.green { color: #059669 !important; font-weight: 700; }
.red   { color: #dc2626 !important; font-weight: 700; }
.net-val { font-weight: 800; color: var(--t1) !important; }

.attend-pct-badge { font-weight: 700; font-size: 12px; }

.tfoot-row td {
  background: var(--surface2) !important;
  font-weight: 700;
  border-top: 2px solid var(--border) !important;
}

/* Refresh spin */
.spin-anim { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.refreshing { opacity: 0.7; pointer-events: none; }

/* ── Transitions ── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-slide-enter-active { transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1); }
.modal-slide-leave-active  { transition: all 0.2s ease; }
.modal-slide-enter-from { opacity: 0; transform: scale(0.92) translateY(16px); }
.modal-slide-leave-to   { opacity: 0; transform: scale(0.96) translateY(8px); }

.success-fade-enter-active, .success-fade-leave-active { transition: all 0.3s ease; }
.success-fade-enter-from, .success-fade-leave-to { opacity: 0; transform: scale(0.85); }

/* ════════════════════════════════════════
   MOBILE — max-width: 768px
   ════════════════════════════════════════ */
@media (max-width: 768px) {

  /* ─── Layout ─── */
  .home {
    padding: 16px 12px;
    gap: 14px;
  }

  /* ─── Page header ─── */
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .page-title { font-size: 18px; }
  .page-date  { font-size: 12px; }

  .btn-primary {
    width: 100%;
    justify-content: center;
    padding: 10px;
  }

  /* ─── Quick actions: 2 columns ─── */
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .qa-btn {
    padding: 10px 11px;
    gap: 8px;
  }

  .qa-icon { width: 32px; height: 32px; border-radius: 8px; }
  .qa-label { font-size: 11px; }
  .qa-info  { font-size: 10px; }

  /* ─── KPI cards: 2x2 grid ─── */
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .kpi-card {
    padding: 14px;
    gap: 10px;
    flex-direction: column;
    align-items: flex-start;
  }

  .kpi-icon { width: 40px; height: 40px; border-radius: 10px; }
  .kpi-value { font-size: 24px; }
  .kpi-change { font-size: 11px; }

  /* ─── Rows: 1 column ─── */
  .row-2,
  .row-3b {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  /* ─── Charts ─── */
  .chart-wrap { height: 180px; }
  .donut-wrap { height: 160px; }

  /* ─── Attendance row: compact ─── */
  .attend-row { gap: 8px; padding: 8px 6px; }
  .emp-role   { display: none; }
  .emp-time   { font-size: 11px; min-width: 40px; }

  /* ─── Leave rows: hide status on small ─── */
  .lv-meta    { font-size: 10px; }
  .lv-status  { display: none; }

  /* ─── Activity timeline ─── */
  .act-time { font-size: 10px; }

  /* ─── Performers: hide bar ─── */
  .perf-rate-wrap { width: 56px; }
  .perf-pct { font-size: 11px; }

  /* ─── Salary dept names ─── */
  .sal-dept-name { width: 72px; font-size: 11px; }
  .sal-dept-val  { width: 50px; font-size: 10px; }

  /* ─── Card padding ─── */
  .card { padding: 14px; }
  .card-head { margin-bottom: 12px; }
  .card-title { font-size: 14px; }

  /* ─── Modal: full screen ─── */
  .modal-overlay { padding: 0; align-items: flex-end; }

  .modal {
    border-radius: 20px 20px 0 0;
    max-width: 100%;
    max-height: 92vh;
    padding: 20px 16px;
  }

  .modal-wide { max-width: 100%; }

  /* Form 2-column → 1-column */
  .form-row-2 {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  /* Report type: 1 column */
  .report-type-grid { grid-template-columns: 1fr 1fr; }

  /* Salary table: scrollable */
  .salary-table-wrap { overflow-x: auto; }
  .salary-table { min-width: 500px; }

  /* Attend modal: stack toggle buttons */
  .attend-modal-row {
    flex-wrap: wrap;
    gap: 8px;
  }

  .attend-modal-name { width: 100%; }
  .attend-toggle { flex-wrap: wrap; }

  /* Modal actions: full-width */
  .modal-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
    padding: 11px;
  }
}

/* ════════════════════════════════════════
   TABLET — 769px to 1024px
   ════════════════════════════════════════ */
@media (min-width: 769px) and (max-width: 1024px) {
  .quick-actions { grid-template-columns: repeat(3, 1fr); }
  .kpi-grid      { grid-template-columns: repeat(2, 1fr); }
  .row-2         { grid-template-columns: 1fr; }
  .row-3b        { grid-template-columns: 1fr 1fr; }
}
</style>
