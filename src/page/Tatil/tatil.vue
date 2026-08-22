<template>
  <div class="leave-page">

    <!-- ── TOAST ─────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="toast-fade">
        <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>
      </Transition>
    </Teleport>

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

            <!-- Skeleton -->
            <template v-if="loading">
              <tr v-for="n in 5" :key="'sk'+n" class="sk-row">
                <td><div class="sk-emp"><div class="sk-av"></div><div class="sk-lines"><div class="sk"></div><div class="sk sk-sm"></div></div></div></td>
                <td><div class="sk sk-badge"></div></td>
                <td><div class="sk sk-date"></div></td>
                <td><div class="sk sk-date"></div></td>
                <td><div class="sk sk-chip"></div></td>
                <td><div class="sk sk-reason"></div></td>
                <td><div class="sk sk-badge"></div></td>
                <td><div class="sk-acts"><div class="sk sk-act"></div><div class="sk sk-act"></div><div class="sk sk-act"></div></div></td>
              </tr>
            </template>

            <!-- Empty -->
            <template v-else-if="filtered.length === 0">
              <tr>
                <td colspan="8" class="empty-cell">
                  <CalendarOff :size="36" class="empty-icon" />
                  <p>So'rovlar topilmadi</p>
                </td>
              </tr>
            </template>

            <!-- Data -->
            <template v-else>
              <tr v-for="req in filtered" :key="req.id">

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

                <td>
                  <span class="type-badge" :class="req.type">{{ TYPE_LBL[req.type] }}</span>
                </td>

                <td class="date-cell">{{ formatDate(req.start_date) }}</td>
                <td class="date-cell">{{ formatDate(req.end_date) }}</td>

                <td>
                  <span class="days-chip">{{ calcDays(req.start_date, req.end_date) }} kun</span>
                </td>

                <td class="reason-cell">{{ req.reason || '—' }}</td>

                <td>
                  <span :class="['s-badge', req.status]">{{ STATUS_LBL[req.status] }}</span>
                </td>

                <td class="act-cell">
                  <button
                    v-if="req.status === 'pending'"
                    class="act-btn approve-btn"
                    title="Tasdiqlash"
                    :disabled="saving === req.id"
                    @click="changeStatus(req, 'approved')"
                  ><Check :size="13" /></button>
                  <button
                    v-if="req.status === 'pending'"
                    class="act-btn reject-btn"
                    title="Rad etish"
                    :disabled="saving === req.id"
                    @click="changeStatus(req, 'rejected')"
                  ><X :size="13" /></button>
                  <button
                    v-if="req.status !== 'pending'"
                    class="act-btn reset-btn"
                    title="Qayta ko'rish"
                    :disabled="saving === req.id"
                    @click="changeStatus(req, 'pending')"
                  ><RotateCcw :size="13" /></button>
                  <button class="act-btn edit-btn" title="Tahrirlash" @click="openModal(req)"><Pencil :size="13" /></button>
                  <button class="act-btn del-btn" title="O'chirish" :disabled="saving === req.id" @click="removeReq(req)"><Trash2 :size="13" /></button>
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

          <div class="form-row">
            <!-- ── Xodim: custom searchable dropdown ── -->
            <div class="form-group">
              <label>Xodim <span class="req">*</span></label>
              <div class="emp-select-wrap" ref="empDropRef">
                <div class="emp-select" :class="{ open: empDropOpen, filled: !!selectedEmp }" @click="toggleEmpDrop">
                  <template v-if="selectedEmp">
                    <div class="es-av" :style="{ background: selectedEmp.color+'22', color: selectedEmp.color }">
                      {{ initials(selectedEmp.fullname) }}
                    </div>
                    <div class="es-info">
                      <span class="es-name">{{ selectedEmp.fullname }}</span>
                      <span class="es-dept">{{ selectedEmp.department || '' }}</span>
                    </div>
                  </template>
                  <span v-else class="es-placeholder">Xodim tanlang...</span>
                  <svg class="es-chevron" :class="{ rotated: empDropOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>

                <div v-if="empDropOpen" class="emp-drop">
                  <div class="emp-drop-search">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input ref="empSearchInput" v-model="empSearch" placeholder="Qidirish..." @click.stop />
                  </div>
                  <div class="emp-drop-list">
                    <template v-if="employees.length === 0">
                      <div class="emp-empty">Xodimlar topilmadi (server qayta ishga tushiring)</div>
                    </template>
                    <template v-else>
                      <div
                        v-for="e in filteredEmployees"
                        :key="e.id"
                        class="emp-opt"
                        :class="{ active: form.user_id === e.id }"
                        @click.stop="selectEmp(e)"
                      >
                        <div class="eo-av" :style="{ background: (e.color||'#7c3aed')+'22', color: e.color||'#7c3aed' }">
                          {{ initials(e.fullname) }}
                        </div>
                        <div class="eo-info">
                          <span class="eo-name">{{ e.fullname }}</span>
                          <span class="eo-dept">{{ e.department || '' }}</span>
                        </div>
                        <svg v-if="form.user_id === e.id" class="eo-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div v-if="filteredEmployees.length === 0" class="emp-empty">Topilmadi</div>
                    </template>
                  </div>
                </div>
              </div>

              <!-- hidden required field -->
              <input type="text" :value="form.user_id" required style="position:absolute;opacity:0;width:0;height:0;pointer-events:none" tabindex="-1" />
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

          <div class="form-row">
            <div class="form-group">
              <label>Boshlanish sanasi <span class="req">*</span></label>
              <input type="date" v-model="form.start_date" required />
            </div>
            <div class="form-group">
              <label>Tugash sanasi <span class="req">*</span></label>
              <input type="date" v-model="form.end_date" required />
            </div>
          </div>

          <div v-if="form.start_date && form.end_date" class="days-info">
            <CalendarOff :size="14" />
            <span>Jami: <strong>{{ calcDays(form.start_date, form.end_date) }} ish kuni</strong></span>
          </div>

          <div class="form-group">
            <label>Sabab</label>
            <textarea v-model="form.reason" placeholder="Ta'til sababini kiriting..." rows="3"></textarea>
          </div>

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
            <button type="submit" class="save-btn" :disabled="formSaving">
              <Check :size="14" /> {{ editing ? 'Saqlash' : "Qo'shish" }}
            </button>
          </div>

        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  Search, Plus, Check, X, Pencil, Trash2, RotateCcw,
  Clock, CheckCircle2, XCircle, CalendarOff
} from 'lucide-vue-next'
import { api } from '@/api/api.js'

// ─── Constants ───────────────────────────────────────────────
const STATUS_LBL = { pending: 'Kutilmoqda', approved: 'Tasdiqlangan', rejected: 'Rad etilgan' }
const TYPE_LBL   = { annual: 'Yillik', sick: 'Kasallik', unpaid: 'Haqsiz', maternity: "Tug'ruq", other: 'Boshqa' }

// ─── State ───────────────────────────────────────────────────
const requests     = ref([])
const employees    = ref([])
const loading      = ref(false)
const saving       = ref(null)   // id of row being saved
const formSaving   = ref(false)
const search       = ref('')
const filterStatus = ref('')
const filterType   = ref('')
const modalOpen    = ref(false)
const editing      = ref(null)
const toast        = ref({ show: false, msg: '', type: 'success' })

// ─── Emp dropdown ─────────────────────────────────────────────
const empDropRef    = ref(null)
const empSearchInput = ref(null)
const empDropOpen   = ref(false)
const empSearch     = ref('')
const selectedEmp   = computed(() => employees.value.find(e => e.id === form.value.user_id) || null)
const filteredEmployees = computed(() => {
  const q = empSearch.value.toLowerCase()
  return q ? employees.value.filter(e => e.fullname.toLowerCase().includes(q) || (e.department||'').toLowerCase().includes(q)) : employees.value
})

function toggleEmpDrop() {
  empDropOpen.value = !empDropOpen.value
  if (empDropOpen.value) {
    empSearch.value = ''
    nextTick(() => empSearchInput.value?.focus())
  }
}

function selectEmp(e) {
  form.value.user_id = e.id
  empDropOpen.value  = false
  empSearch.value    = ''
}

function onDocClick(ev) {
  if (empDropRef.value && !empDropRef.value.contains(ev.target)) {
    empDropOpen.value = false
  }
}

onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

const defaultForm = () => ({
  user_id: '', type: 'annual', start_date: '', end_date: '',
  reason: '', status: 'pending',
})
const form = ref(defaultForm())

// ─── Toast ────────────────────────────────────────────────────
let toastTimer = null
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.value = { show: true, msg, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3000)
}

// ─── Load data ────────────────────────────────────────────────
async function load() {
  loading.value = true
  const [leavesRes, usersRes] = await Promise.allSettled([
    api.getLeaves(),
    api.getUsers(),
  ])
  if (leavesRes.status === 'fulfilled') {
    requests.value = leavesRes.value?.data || []
  } else {
    console.warn('[tatil] getLeaves xato:', leavesRes.reason)
    showToast('Ta\'tillar yuklanmadi: ' + (leavesRes.reason?.message || 'xatolik'), 'error')
  }

  if (usersRes.status === 'fulfilled') {
    const list = usersRes.value
    employees.value = Array.isArray(list) ? list : []
    console.log('[tatil] xodimlar:', employees.value.length, employees.value.map(e => e.fullname))
  } else {
    console.warn('[tatil] getUsers xato:', usersRes.reason)
    showToast('Xodimlar yuklanmadi: ' + (usersRes.reason?.message || 'xatolik'), 'error')
  }

  loading.value = false
}

onMounted(() => {
  load()
  document.addEventListener('click', onDocClick)
})

// ─── Computed ─────────────────────────────────────────────────
const filtered = computed(() => {
  let list = requests.value
  if (search.value)       list = list.filter(r =>
    r.employeeName.toLowerCase().includes(search.value.toLowerCase()) ||
    TYPE_LBL[r.type].toLowerCase().includes(search.value.toLowerCase())
  )
  if (filterStatus.value) list = list.filter(r => r.status === filterStatus.value)
  if (filterType.value)   list = list.filter(r => r.type   === filterType.value)
  return list
})

const countByStatus = (s) => requests.value.filter(r => r.status === s).length
const totalDays = computed(() =>
  requests.value
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + calcDays(r.start_date, r.end_date), 0)
)

// ─── Helpers ──────────────────────────────────────────────────
const initials  = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
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

// ─── Status change ────────────────────────────────────────────
async function changeStatus(req, status) {
  saving.value = req.id
  try {
    await api.updateLeave(req.id, { status })
    req.status = status
    showToast(status === 'approved' ? 'Tasdiqlandi' : status === 'rejected' ? 'Rad etildi' : 'Holat yangilandi')
  } catch (e) {
    showToast(e.message || 'Xatolik', 'error')
  } finally {
    saving.value = null
  }
}

// ─── Remove ───────────────────────────────────────────────────
async function removeReq(req) {
  if (!confirm(`"${req.employeeName}" so'rovini o'chirishni tasdiqlaysizmi?`)) return
  saving.value = req.id
  try {
    await api.deleteLeave(req.id)
    requests.value = requests.value.filter(r => r.id !== req.id)
    showToast("So'rov o'chirildi")
  } catch (e) {
    showToast(e.message || 'Xatolik', 'error')
  } finally {
    saving.value = null
  }
}

// ─── Modal ────────────────────────────────────────────────────
const openModal = (req) => {
  empDropOpen.value = false
  empSearch.value   = ''
  editing.value = req
  form.value = req
    ? {
        user_id:    req.user_id,
        type:       req.type,
        start_date: req.start_date,
        end_date:   req.end_date,
        reason:     req.reason,
        status:     req.status,
      }
    : defaultForm()
  modalOpen.value = true
}

async function saveReq() {
  formSaving.value = true
  try {
    const payload = {
      user_id:    form.value.user_id,
      type:       form.value.type,
      start_date: form.value.start_date,
      end_date:   form.value.end_date,
      reason:     form.value.reason || null,
      status:     form.value.status,
    }

    if (editing.value) {
      await api.updateLeave(editing.value.id, payload)
      showToast('So\'rov yangilandi')
    } else {
      await api.createLeave(payload)
      showToast('So\'rov qo\'shildi')
    }

    modalOpen.value = false
    await load()
  } catch (e) {
    showToast(e.message || 'Saqlashda xatolik', 'error')
  } finally {
    formSaving.value = false
  }
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

/* ── TOAST ──────────────────────────────────────────────────── */
.toast {
  position: fixed;
  bottom: 24px; right: 24px;
  background: #1e293b; color: #fff;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  z-index: 9999;
  border-left: 4px solid #059669;
}
.toast.error  { border-left-color: #dc2626; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.25s; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(10px); }

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
.act-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.approve-btn { color: #059669; }
.approve-btn:hover:not(:disabled) { background: #d1fae5; border-color: #6ee7b7; }
.reject-btn  { color: #dc2626; }
.reject-btn:hover:not(:disabled)  { background: #fee2e2; border-color: #fca5a5; }
.reset-btn   { color: #d97706; }
.reset-btn:hover:not(:disabled)   { background: #fef3c7; border-color: #fde68a; }
.edit-btn    { color: var(--accent); }
.edit-btn:hover    { background: var(--accent-bg); border-color: var(--accent-br); }
.del-btn     { color: #dc2626; }
.del-btn:hover:not(:disabled)     { background: #fee2e2; border-color: #fca5a5; }

:global(.layout.dark) .approve-btn:hover:not(:disabled) { background: rgba(5,150,105,0.15);  border-color: rgba(5,150,105,0.3); }
:global(.layout.dark) .reject-btn:hover:not(:disabled)  { background: rgba(220,38,38,0.15);  border-color: rgba(220,38,38,0.3); }
:global(.layout.dark) .del-btn:hover:not(:disabled)     { background: rgba(220,38,38,0.15);  border-color: rgba(220,38,38,0.3); }

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

/* ── SKELETON ───────────────────────────────────────────────── */
@keyframes sk-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.sk {
  height: 12px; border-radius: 6px;
  background: linear-gradient(90deg, var(--border2) 25%, var(--border) 50%, var(--border2) 75%);
  background-size: 800px 100%;
  animation: sk-shimmer 1.4s ease infinite;
}
.sk-row td { padding: 14px; }
.sk-emp { display: flex; align-items: center; gap: 9px; }
.sk-av  { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(90deg, var(--border2) 25%, var(--border) 50%, var(--border2) 75%);
          background-size: 800px 100%; animation: sk-shimmer 1.4s ease infinite; }
.sk-lines { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.sk-sm    { width: 60%; }
.sk-badge  { width: 60px; }
.sk-date   { width: 72px; }
.sk-chip   { width: 44px; }
.sk-reason { width: 90px; }
.sk-acts   { display: flex; gap: 4px; justify-content: center; }
.sk-act    { width: 28px; height: 28px; border-radius: 6px; }

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

/* ── EMP DROPDOWN ───────────────────────────────────────────── */
.emp-select-wrap {
  position: relative;
}
.emp-select {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 10px;
  background: var(--surface2);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  transition: border-color 0.15s;
  user-select: none;
}
.emp-select:hover, .emp-select.open { border-color: var(--accent-br); }
.emp-select.open { box-shadow: 0 0 0 2px var(--accent-bg); }
.es-av {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
}
.es-info { flex: 1; overflow: hidden; }
.es-name { display: block; font-size: 13px; font-weight: 500; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.es-dept { display: block; font-size: 11px; color: var(--t4); }
.es-placeholder { font-size: 13px; color: var(--t4); flex: 1; }
.es-chevron { margin-left: auto; flex-shrink: 0; color: var(--t3); transition: transform 0.2s; }
.es-chevron.rotated { transform: rotate(180deg); }

.emp-drop {
  position: absolute;
  top: calc(100% + 4px); left: 0; right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 200;
  overflow: hidden;
}
.emp-drop-search {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
}
.emp-drop-search svg { color: var(--t4); flex-shrink: 0; }
.emp-drop-search input {
  border: none; outline: none; background: transparent;
  font-size: 13px; color: var(--t1); width: 100%; padding: 0;
  box-shadow: none;
}
.emp-drop-search input::placeholder { color: var(--t4); }
.emp-drop-list { max-height: 220px; overflow-y: auto; }
.emp-opt {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 12px; cursor: pointer;
  transition: background 0.12s;
}
.emp-opt:hover    { background: var(--surface2); }
.emp-opt.active   { background: var(--accent-bg); }
.eo-av {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
}
.eo-info { flex: 1; overflow: hidden; }
.eo-name { display: block; font-size: 13px; font-weight: 500; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.eo-dept { display: block; font-size: 11px; color: var(--t4); }
.eo-check { color: var(--accent); flex-shrink: 0; }
.emp-empty { padding: 16px; text-align: center; font-size: 13px; color: var(--t4); }

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
.save-btn:hover:not(:disabled) { opacity: 0.88; }
.save-btn:disabled { opacity: 0.55; cursor: not-allowed; }

/* ── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) {
  .leave-page     { padding: 16px; }
  .card-head      { flex-direction: column; align-items: stretch; }
  .head-controls  { flex-direction: column; }
  .form-row       { flex-direction: column; }
}
</style>
