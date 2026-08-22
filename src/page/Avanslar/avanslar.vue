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
          <span class="stat-val">{{ fmt(totalRepaidAmt) }}</span>
          <span class="stat-lbl">Jami qaytarilgan</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#dc2626;--ca-bg:#fee2e2">
        <div class="stat-icon"><AlertCircle :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ fmt(totalRemaining) }}</span>
          <span class="stat-lbl">Qolgan qarz</span>
        </div>
      </div>
      <div class="stat-card" style="--ca:#d97706;--ca-bg:#fef3c7">
        <div class="stat-icon"><Users :size="18" /></div>
        <div class="stat-body">
          <span class="stat-val">{{ activeCount }}</span>
          <span class="stat-lbl">Qarzli xodimlar</span>
        </div>
      </div>
    </div>

    <!-- ── TABLE CARD ────────────────────────────────────── -->
    <div class="table-card">
      <div class="card-head">
        <div class="card-title-group">
          <h2 class="card-title">Avans to'lovlari</h2>
          <span class="card-sub">Xodimlarga berilgan avanslar va qaytarish tarixi</span>
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
          <button class="icon-btn" @click="loadAll" :disabled="loading" title="Yangilash">
            <RefreshCw :size="14" :class="{ spin: loading }" />
          </button>
          <button class="add-btn" @click="openAddModal">
            <Plus :size="15" /><span>Avans berish</span>
          </button>
        </div>
      </div>

      <div v-if="error" class="err-bar">{{ error }}</div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:32px"></th>
              <th>Xodim</th>
              <th>Sana</th>
              <th>Berilgan</th>
              <th>Qaytarilgan</th>
              <th>Qolgan</th>
              <th>Jarayon</th>
              <th>Holat</th>
              <th class="th-act">Amallar</th>
            </tr>
          </thead>
          <tbody>

            <!-- SKELETON -->
            <template v-if="loading">
              <tr v-for="n in 5" :key="n">
                <td></td>
                <td><div class="sk-emp"><div class="sk sk-av"></div><div class="sk sk-lg"></div></div></td>
                <td><div class="sk sk-md"></div></td>
                <td><div class="sk sk-lg"></div></td>
                <td><div class="sk sk-md"></div></td>
                <td><div class="sk sk-md"></div></td>
                <td><div class="sk sk-xl"></div></td>
                <td><div class="sk sk-md"></div></td>
                <td><div class="sk-acts"><div class="sk sk-btn"></div><div class="sk sk-btn"></div></div></td>
              </tr>
            </template>

            <!-- EMPTY -->
            <template v-else-if="filtered.length === 0">
              <tr>
                <td colspan="9" class="empty-cell">
                  <Wallet :size="38" class="empty-icon" />
                  <p>Avanslar topilmadi</p>
                  <button class="add-btn" style="margin-top:12px" @click="openAddModal">
                    <Plus :size="14" /> Birinchi avansni qo'shish
                  </button>
                </td>
              </tr>
            </template>

            <!-- DATA -->
            <template v-else>
              <template v-for="adv in filtered" :key="adv.id">

                <!-- Asosiy qator -->
                <tr :class="{ 'row-expanded': expandedId === adv.id, 'row-repaid': adv.status === 'repaid' }">

                  <!-- Kengaytirish -->
                  <td class="toggle-cell">
                    <button
                      v-if="adv.repayments && adv.repayments.length"
                      class="toggle-btn"
                      @click="toggleExpand(adv.id)"
                      :title="expandedId === adv.id ? 'Yopish' : 'Tarixi'"
                    >
                      <ChevronDown :size="14" :class="{ 'rot-180': expandedId === adv.id }" />
                    </button>
                  </td>

                  <!-- Xodim -->
                  <td>
                    <div class="emp-cell">
                      <div class="av" :style="{ background: adv.color + '22', color: adv.color }">
                        {{ initials(adv.name) }}
                      </div>
                      <div class="emp-info">
                        <span class="emp-name">{{ adv.name }}</span>
                        <span class="emp-dept">{{ adv.department || adv.purpose || '—' }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Sana -->
                  <td>
                    <div class="date-cell">
                      <CalendarDays :size="13" class="date-icon" />
                      <span>{{ formatDate(adv.given_date) }}</span>
                    </div>
                    <div v-if="adv.due_date" class="date-cell due-date" :class="{ 'overdue-date': isOverdue(adv) }">
                      <Clock :size="11" class="date-icon" />
                      <span>{{ formatDate(adv.due_date) }}</span>
                    </div>
                  </td>

                  <!-- Berilgan -->
                  <td><span class="amount-chip given">{{ fmtN(adv.amount) }}</span></td>

                  <!-- Qaytarilgan -->
                  <td>
                    <span class="amount-chip repaid-chip" v-if="adv.repaid_amount > 0">
                      {{ fmtN(adv.repaid_amount) }}
                    </span>
                    <span class="no-val" v-else>—</span>
                  </td>

                  <!-- Qolgan -->
                  <td>
                    <span v-if="adv.remaining > 0" class="amount-chip remaining-chip">
                      {{ fmtN(adv.remaining) }}
                    </span>
                    <span v-else class="done-chip"><CheckCircle2 :size="13" /> To'liq</span>
                  </td>

                  <!-- Jarayon (progress bar) -->
                  <td class="progress-cell">
                    <div class="prog-wrap">
                      <div class="prog-bg">
                        <div
                          class="prog-fill"
                          :style="{
                            width: Math.round((adv.repaid_amount / adv.amount) * 100) + '%',
                            background: adv.status === 'repaid' ? '#059669' : adv.color,
                          }"
                        ></div>
                      </div>
                      <span class="prog-pct">{{ Math.round((adv.repaid_amount / adv.amount) * 100) }}%</span>
                    </div>
                  </td>

                  <!-- Holat -->
                  <td>
                    <span :class="['s-badge', displayStatus(adv)]">
                      <component :is="statusIcon(displayStatus(adv))" :size="11" />
                      {{ statusLabel(displayStatus(adv)) }}
                    </span>
                  </td>

                  <!-- Amallar -->
                  <td class="act-cell">
                    <div class="act-inner">
                      <button
                        v-if="adv.status !== 'repaid'"
                        class="act-btn pay-btn"
                        title="To'lov qo'shish"
                        @click="openRepayModal(adv)"
                      ><Banknote :size="14" /></button>
                      <button class="act-btn edit-btn" title="Tahrirlash" @click="openEditModal(adv)">
                        <Pencil :size="14" />
                      </button>
                      <button class="act-btn del-btn" title="O'chirish" @click="remove(adv)">
                        <Trash2 :size="14" />
                      </button>
                    </div>
                  </td>

                </tr>

                <!-- To'lovlar tarixi (kengaytirilgan) -->
                <tr v-if="expandedId === adv.id && adv.repayments?.length" class="history-row">
                  <td colspan="9" class="history-cell">
                    <div class="history-wrap">
                      <p class="hist-title"><History :size="13" /> To'lovlar tarixi</p>
                      <div class="hist-list">
                        <div v-for="rp in adv.repayments" :key="rp.id" class="hist-item">
                          <span :class="['src-badge', rp.source]">
                            {{ rp.source === 'salary' ? 'Oylik' : 'Naqd' }}
                          </span>
                          <span class="hist-date">{{ formatDate(rp.repaid_date) }}</span>
                          <span class="hist-amount">{{ fmtN(rp.amount) }}</span>
                          <span class="hist-note">{{ rp.note || '—' }}</span>
                          <button
                            class="act-btn del-btn hist-del"
                            title="To'lovni bekor qilish"
                            @click="deleteRepayment(adv, rp)"
                          ><X :size="12" /></button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>

              </template>
            </template>

          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span>{{ filtered.length }} ta yozuv</span>
        <span class="footer-right">
          Umumiy qarz: <strong>{{ fmt(totalRemaining) }}</strong>
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
                <label class="flabel">Xodim <span class="req">*</span></label>
                <select v-model="formM.data.user_id" class="finput" :disabled="formM.editing">
                  <option value="" disabled>Xodimni tanlang...</option>
                  <option v-for="e in employees" :key="e.id" :value="e.id">
                    {{ e.name }}{{ e.department ? ' — ' + e.department : '' }}
                  </option>
                </select>
              </div>

              <div class="frow">
                <div class="fgroup">
                  <label class="flabel">Miqdor (so'm) <span class="req">*</span></label>
                  <input v-model.number="formM.data.amount" type="number" class="finput" min="0" placeholder="0" />
                </div>
                <div class="fgroup">
                  <label class="flabel">Berilgan sana <span class="req">*</span></label>
                  <input v-model="formM.data.given_date" type="date" class="finput" />
                </div>
              </div>

              <div class="fgroup">
                <label class="flabel">Maqsad</label>
                <input v-model="formM.data.purpose" type="text" class="finput" placeholder="Tibbiy xarajat, ta'lim..." @keyup.enter="saveForm" />
              </div>

              <div class="fgroup">
                <label class="flabel">To'lash muddati</label>
                <input v-model="formM.data.due_date" type="date" class="finput" />
              </div>

              <div v-if="formM.err" class="finput-err">{{ formM.err }}</div>
            </div>
            <div class="mfoot">
              <button class="btn-cancel" @click="formM.open = false">Bekor</button>
              <button class="btn-save" @click="saveForm" :disabled="saving">
                <Plus v-if="!formM.editing" :size="15" />
                <Check v-else :size="15" />
                {{ saving ? 'Saqlanmoqda…' : (formM.editing ? 'Saqlash' : "Qo'shish") }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── REPAY MODAL ───────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="repayM.open" class="overlay" @click.self="repayM.open = false">
          <div class="modal">
            <div class="mhead">
              <h3 class="mtitle">To'lov qo'shish</h3>
              <button class="mclose" @click="repayM.open = false"><X :size="18" /></button>
            </div>
            <div class="mbody">

              <!-- Xodim ma'lumoti -->
              <div class="repay-info">
                <div class="av" :style="{ background: repayM.adv?.color + '22', color: repayM.adv?.color }">
                  {{ initials(repayM.adv?.name) }}
                </div>
                <div>
                  <p class="rep-name">{{ repayM.adv?.name }}</p>
                  <p class="rep-sub">Qolgan qarz: <strong>{{ fmt(repayM.adv?.remaining) }}</strong></p>
                </div>
              </div>

              <!-- Progress -->
              <div class="prog-bg" style="margin-bottom:16px">
                <div
                  class="prog-fill"
                  :style="{
                    width: Math.round(((repayM.adv?.repaid_amount || 0) / (repayM.adv?.amount || 1)) * 100) + '%',
                    background: repayM.adv?.color,
                  }"
                ></div>
              </div>

              <div class="frow">
                <div class="fgroup">
                  <label class="flabel">To'lov miqdori (so'm) <span class="req">*</span></label>
                  <input
                    v-model.number="repayM.data.amount"
                    type="number" class="finput" min="1"
                    :max="repayM.adv?.remaining"
                    placeholder="0"
                  />
                </div>
                <div class="fgroup">
                  <label class="flabel">To'lov sanasi <span class="req">*</span></label>
                  <input v-model="repayM.data.repaid_date" type="date" class="finput" />
                </div>
              </div>

              <div class="frow">
                <div class="fgroup">
                  <label class="flabel">Manba</label>
                  <select v-model="repayM.data.source" class="finput">
                    <option value="cash">Naqd pul</option>
                    <option value="salary">Oylik maoshidan</option>
                  </select>
                </div>
                <div class="fgroup">
                  <label class="flabel">Izoh</label>
                  <input v-model="repayM.data.note" type="text" class="finput" placeholder="Ixtiyoriy..." @keyup.enter="confirmRepay" />
                </div>
              </div>

              <!-- Tezkor tugmalar -->
              <div class="quick-btns">
                <button class="quick-btn" @click="repayM.data.amount = repayM.adv?.remaining">
                  To'liq to'lash ({{ fmt(repayM.adv?.remaining) }})
                </button>
                <button
                  v-if="repayM.adv?.remaining > 0"
                  class="quick-btn"
                  @click="repayM.data.amount = Math.round(repayM.adv?.remaining / 2)"
                >
                  Yarmini to'lash
                </button>
              </div>

              <div v-if="repayM.err" class="finput-err">{{ repayM.err }}</div>
            </div>
            <div class="mfoot">
              <button class="btn-cancel" @click="repayM.open = false">Bekor</button>
              <button class="btn-repay" @click="confirmRepay" :disabled="saving">
                <Banknote :size="15" />
                {{ saving ? 'Saqlanmoqda…' : "To'lovni saqlash" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── TOAST ─────────────────────────────────────────── -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast', toast.type]">
        <CheckCircle2 v-if="toast.type === 'success'" :size="16" />
        <XCircle v-else :size="16" />
        {{ toast.msg }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Wallet, CheckCircle2, AlertCircle, Users, Search, Plus,
  CalendarDays, Clock, Pencil, Trash2, X, Check,
  RefreshCw, XCircle, ChevronDown, Banknote, History
} from 'lucide-vue-next'
import { api } from '@/api/api.js'

// ── HELPERS ──────────────────────────────────────────────
const initials   = (n) => (n || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
const fmt        = (v) => Number(v || 0).toLocaleString('uz-UZ') + " so'm"
const fmtN       = (v) => Number(v || 0).toLocaleString('uz-UZ')
const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
  : '—'
const today = () => new Date().toISOString().slice(0, 10)

const isOverdue     = (adv) => adv.status !== 'repaid' && adv.due_date && new Date(adv.due_date) < new Date()
const displayStatus = (adv) => adv.status === 'repaid' ? 'repaid' : isOverdue(adv) ? 'overdue' : 'pending'
const statusLabel   = (s) => ({ pending: 'Kutilmoqda', repaid: 'Qaytarilgan', overdue: "Muddati o'tgan" }[s] || s)
const statusIcon    = (s) => ({ pending: Clock, repaid: CheckCircle2, overdue: AlertCircle }[s] || Clock)

// ── TOAST ─────────────────────────────────────────────────
const toast = ref({ show: false, msg: '', type: 'success' })
let toastTimer = null
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.value = { show: true, msg, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3000)
}

// ── STATE ─────────────────────────────────────────────────
const loading    = ref(false)
const saving     = ref(false)
const error      = ref('')
const advances   = ref([])
const employees  = ref([])
const search     = ref('')
const filterStatus = ref('')
const expandedId = ref(null)

// ── COMPUTED ──────────────────────────────────────────────
const filtered = computed(() => {
  let list = advances.value
  if (filterStatus.value) list = list.filter(a => displayStatus(a) === filterStatus.value)
  const q = search.value.toLowerCase()
  if (q) list = list.filter(a =>
    a.name.toLowerCase().includes(q) || (a.purpose || '').toLowerCase().includes(q)
  )
  return list
})

const totalGiven     = computed(() => advances.value.reduce((s, a) => s + (a.amount || 0), 0))
const totalRepaidAmt = computed(() => advances.value.reduce((s, a) => s + (a.repaid_amount || 0), 0))
const totalRemaining = computed(() => advances.value.reduce((s, a) => s + (a.remaining || 0), 0))
const activeCount    = computed(() => new Set(advances.value.filter(a => a.remaining > 0).map(a => a.user_id)).size)

// ── LOAD ──────────────────────────────────────────────────
async function loadAll() {
  loading.value = true
  error.value   = ''
  try {
    const [advsRes, usersRes] = await Promise.all([api.getAdvances(), api.getUsers()])
    advances.value  = advsRes || []
    employees.value = (usersRes || []).map(u => ({
      id:         u.id,
      name:       u.fullname,
      department: u.department || '',
      color:      u.color      || '#7c3aed',
    }))
  } catch (e) {
    error.value = e.message || "Ma'lumot yuklanmadi"
  } finally {
    loading.value = false
  }
}

// ── EXPAND ────────────────────────────────────────────────
const toggleExpand = (id) => { expandedId.value = expandedId.value === id ? null : id }

// ── ADD / EDIT MODAL ──────────────────────────────────────
const emptyForm = () => ({ user_id: '', amount: 0, given_date: today(), due_date: '', purpose: '', id: null })
const formM = ref({ open: false, editing: false, data: emptyForm(), err: '' })

const openAddModal  = () => { formM.value = { open: true, editing: false, data: emptyForm(), err: '' } }
const openEditModal = (adv) => {
  formM.value = {
    open: true, editing: true, err: '',
    data: {
      id:         adv.id,
      user_id:    adv.user_id,
      amount:     adv.amount,
      given_date: adv.given_date,
      due_date:   adv.due_date || '',
      purpose:    adv.purpose  || '',
    },
  }
}

async function saveForm() {
  const { user_id, amount, given_date, due_date, purpose, id } = formM.value.data
  if (!user_id)    { formM.value.err = 'Xodimni tanlang'; return }
  if (!amount)     { formM.value.err = 'Miqdorni kiriting'; return }
  if (!given_date) { formM.value.err = 'Sanani kiriting'; return }
  saving.value = true; formM.value.err = ''
  try {
    const body = { user_id, amount: Number(amount), given_date, due_date: due_date || null, purpose: purpose || '' }
    if (formM.value.editing) {
      await api.updateAdvance(id, body)
      showToast('Avans yangilandi')
    } else {
      await api.createAdvance(body)
      showToast("Avans qo'shildi")
    }
    await loadAll()
    formM.value.open = false
  } catch (e) {
    showToast(e.message || 'Xatolik yuz berdi', 'error')
  } finally {
    saving.value = false
  }
}

// ── REPAY MODAL ───────────────────────────────────────────
const repayM = ref({
  open: false, adv: null, err: '',
  data: { amount: 0, repaid_date: today(), source: 'cash', note: '' },
})

const openRepayModal = (adv) => {
  repayM.value = {
    open: true, adv, err: '',
    data: { amount: 0, repaid_date: today(), source: 'cash', note: '' },
  }
}

async function confirmRepay() {
  const { amount, repaid_date, source, note } = repayM.value.data
  if (!amount || amount <= 0) { repayM.value.err = 'Miqdorni kiriting'; return }
  if (!repaid_date) { repayM.value.err = 'Sanani kiriting'; return }
  saving.value = true; repayM.value.err = ''
  try {
    await api.repayAdvance(repayM.value.adv.id, { amount: Number(amount), repaid_date, source, note })
    await loadAll()
    repayM.value.open = false
    showToast("To'lov saqlandi")
  } catch (e) {
    repayM.value.err = e.message || 'Xatolik yuz berdi'
  } finally {
    saving.value = false
  }
}

// ── DELETE REPAYMENT ──────────────────────────────────────
async function deleteRepayment(adv, rp) {
  if (!confirm(`${formatDate(rp.repaid_date)} — ${fmtN(rp.amount)} so'm to'lovni bekor qilasizmi?`)) return
  try {
    await api.deleteRepayment(adv.id, rp.id)
    await loadAll()
    showToast("To'lov bekor qilindi")
  } catch (e) {
    showToast(e.message || 'Xatolik', 'error')
  }
}

// ── DELETE ADVANCE ────────────────────────────────────────
async function remove(adv) {
  if (!confirm(`"${adv.name}" uchun ${fmt(adv.amount)} avansni o'chirishni tasdiqlaysizmi?`)) return
  try {
    await api.deleteAdvance(adv.id)
    await loadAll()
    showToast("Avans o'chirildi")
  } catch (e) {
    showToast(e.message || 'Xatolik yuz berdi', 'error')
  }
}

onMounted(loadAll)
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

.stat-val { display: block; font-size: 22px; font-weight: 700; color: var(--t1); line-height: 1.1; }
.stat-lbl { display: block; font-size: 12px; color: var(--t3); margin-top: 2px; }

/* ── TABLE CARD ─────────────────────────────────────────── */
.table-card {
  background: var(--surface);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  overflow: hidden;
}

.card-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 20px 0; gap: 16px; flex-wrap: wrap;
}

.card-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--t1); }
.card-sub   { display: block; font-size: 12px; color: var(--t3); margin-top: 2px; }

.head-controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

.search-box {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid var(--border); border-radius: 8px;
  padding: 7px 10px; background: var(--surface2); transition: border-color 0.15s;
}
.search-box:focus-within { border-color: var(--accent-br); }
.s-icon { color: var(--t4); flex-shrink: 0; }
.search-box input {
  border: none; outline: none; background: transparent;
  font-size: 13px; color: var(--t1); width: 180px;
}
.search-box input::placeholder { color: var(--t4); }

.sel {
  border: 1px solid var(--border); border-radius: 8px;
  padding: 7px 10px; font-size: 13px; color: var(--t1);
  background: var(--surface2); cursor: pointer; outline: none;
}

.icon-btn {
  width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid var(--border); background: var(--surface2);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--t3); transition: all 0.15s;
}
.icon-btn:hover { border-color: var(--accent-br); color: var(--accent); }
.icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.add-btn {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent); color: #fff; border: none;
  border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: opacity 0.15s; white-space: nowrap;
}
.add-btn:hover { opacity: 0.88; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; }

/* ── TABLE ──────────────────────────────────────────────── */
.table-wrap { overflow-x: auto; padding-top: 16px; }

table { width: 100%; border-collapse: collapse; font-size: 13px; }

thead th {
  background: var(--surface2); color: var(--t3);
  font-weight: 600; font-size: 11px; text-transform: uppercase;
  letter-spacing: 0.5px; padding: 9px 12px;
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.th-act { text-align: center; }

tbody td {
  padding: 12px 12px;
  border-bottom: 1px solid var(--border2);
  color: var(--t2); vertical-align: middle;
}
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: var(--surface2); }
tbody tr.row-repaid td { opacity: 0.65; }
tbody tr.row-expanded td { background: var(--accent-bg); }

/* ── TOGGLE CELL ────────────────────────────────────────── */
.toggle-cell { padding: 0 4px !important; }
.toggle-btn {
  width: 24px; height: 24px; border-radius: 6px;
  border: 1px solid var(--border); background: var(--surface2);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--t4); transition: all 0.2s;
}
.toggle-btn:hover { background: var(--accent-bg); color: var(--accent); border-color: var(--accent-br); }
.rot-180 { transform: rotate(180deg); }

/* ── EMPLOYEE CELL ──────────────────────────────────────── */
.emp-cell { display: flex; align-items: center; gap: 10px; }
.av {
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.emp-name  { display: block; font-weight: 600; color: var(--t1); font-size: 13px; }
.emp-dept  { display: block; font-size: 11px; color: var(--t4); margin-top: 1px; }

/* ── DATE CELL ──────────────────────────────────────────── */
.date-cell { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--t3); }
.due-date  { margin-top: 3px; font-size: 11px; }
.date-icon { flex-shrink: 0; }
.overdue-date { color: #dc2626; }

/* ── AMOUNT CHIPS ───────────────────────────────────────── */
.amount-chip {
  display: inline-flex; align-items: center;
  padding: 3px 8px; border-radius: 6px;
  font-size: 12px; font-weight: 600; white-space: nowrap;
}
.given         { background: #ede9fe; color: #7c3aed; }
.repaid-chip   { background: #d1fae5; color: #059669; }
.remaining-chip{ background: #fee2e2; color: #dc2626; }
.done-chip     { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #059669; font-weight: 600; }
.no-val        { color: var(--t5); font-size: 12px; }

:global(.layout.dark) .given          { background: rgba(124, 58, 237, 0.15); }
:global(.layout.dark) .repaid-chip    { background: rgba(5, 150, 105, 0.15); }
:global(.layout.dark) .remaining-chip { background: rgba(220, 38, 38, 0.15); }

/* ── PROGRESS BAR ───────────────────────────────────────── */
.progress-cell { min-width: 120px; }
.prog-wrap  { display: flex; align-items: center; gap: 8px; }
.prog-bg    { flex: 1; height: 6px; border-radius: 3px; background: var(--border2); overflow: hidden; }
.prog-fill  { height: 100%; border-radius: 3px; transition: width 0.4s ease; min-width: 2px; }
.prog-pct   { font-size: 11px; color: var(--t4); min-width: 28px; text-align: right; }

/* ── STATUS BADGE ───────────────────────────────────────── */
.s-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 500; white-space: nowrap;
}
.s-badge.pending  { background: #fef3c7; color: #92400e; }
.s-badge.repaid   { background: #d1fae5; color: #065f46; }
.s-badge.overdue  { background: #fee2e2; color: #991b1b; }
:global(.layout.dark) .s-badge.pending  { background: rgba(217,119,6,0.15); color: #fbbf24; }
:global(.layout.dark) .s-badge.repaid   { background: rgba(5,150,105,0.15); color: #34d399; }
:global(.layout.dark) .s-badge.overdue  { background: rgba(220,38,38,0.15); color: #f87171; }

/* ── ACTION BUTTONS ─────────────────────────────────────── */
.act-cell { vertical-align: middle; }
.act-inner { display: flex; gap: 5px; justify-content: center; }
.act-btn {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1px solid var(--border); background: var(--surface2);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.pay-btn  { color: #059669; }
.pay-btn:hover { background: #d1fae5; border-color: #6ee7b7; }
.edit-btn { color: var(--accent); }
.edit-btn:hover { background: var(--accent-bg); border-color: var(--accent-br); }
.del-btn  { color: #dc2626; }
.del-btn:hover { background: #fee2e2; border-color: #fca5a5; }
:global(.layout.dark) .pay-btn:hover  { background: rgba(5,150,105,0.15); }
:global(.layout.dark) .del-btn:hover  { background: rgba(220,38,38,0.15); border-color: rgba(220,38,38,0.3); }

/* ── HISTORY ROW ────────────────────────────────────────── */
.history-row td { padding: 0 !important; border-bottom: 1px solid var(--border) !important; }
.history-cell { background: var(--surface2) !important; }
.history-wrap { padding: 12px 20px 14px 48px; }
.hist-title   {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; color: var(--t3);
  margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.5px;
}
.hist-list  { display: flex; flex-direction: column; gap: 6px; }
.hist-item  {
  display: flex; align-items: center; gap: 12px;
  padding: 7px 12px; border-radius: 8px;
  background: var(--surface); border: 1px solid var(--border);
  font-size: 12px;
}
.src-badge {
  padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 600; white-space: nowrap;
}
.src-badge.salary  { background: #dbeafe; color: #1d4ed8; }
.src-badge.cash    { background: #d1fae5; color: #065f46; }
:global(.layout.dark) .src-badge.salary { background: rgba(37,99,235,0.15); color: #60a5fa; }
:global(.layout.dark) .src-badge.cash   { background: rgba(5,150,105,0.15); color: #34d399; }
.hist-date   { color: var(--t3); min-width: 80px; }
.hist-amount { font-weight: 700; color: var(--t1); min-width: 100px; }
.hist-note   { flex: 1; color: var(--t4); }
.hist-del    { width: 24px !important; height: 24px !important; margin-left: auto; flex-shrink: 0; }

/* ── SKELETON ───────────────────────────────────────────── */
.sk {
  border-radius: 6px; background: var(--border2);
  animation: sk-pulse 1.4s ease-in-out infinite;
}
.sk-emp  { display: flex; align-items: center; gap: 10px; }
.sk-av   { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; }
.sk-lg   { height: 14px; width: 110px; }
.sk-md   { height: 14px; width: 80px; }
.sk-xl   { height: 14px; width: 130px; }
.sk-btn  { height: 30px; width: 30px; border-radius: 7px; }
.sk-acts { display: flex; gap: 5px; justify-content: center; }
@keyframes sk-pulse { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }

/* ── EMPTY ──────────────────────────────────────────────── */
.empty-cell { text-align: center; padding: 52px 16px !important; color: var(--t4); }
.empty-icon { display: block; margin: 0 auto 10px; opacity: 0.35; }
.empty-cell p { margin: 0; font-size: 14px; }
.err-bar { margin: 12px 20px 0; padding: 10px 14px; border-radius: 8px; background: #fee2e2; color: #991b1b; font-size: 13px; }

/* ── FOOTER ─────────────────────────────────────────────── */
.table-footer {
  padding: 12px 16px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between;
  font-size: 12px; color: var(--t4);
}
.footer-right strong { color: var(--t1); }

/* ── MODAL ──────────────────────────────────────────────── */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
}
.modal {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; box-shadow: var(--shadow-md);
  width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
  animation: m-in 0.18s ease;
}
@keyframes m-in { from { opacity:0; transform: scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1); } }

.mhead {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 18px 0;
}
.mtitle { margin: 0; font-size: 15px; font-weight: 600; color: var(--t1); }
.mclose {
  background: var(--surface2); border: 1px solid var(--border); border-radius: 8px;
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--t3); transition: all 0.15s;
}
.mclose:hover { background: var(--border); color: var(--t1); }
.mbody { padding: 14px 18px 6px; display: flex; flex-direction: column; gap: 12px; }
.mfoot { display: flex; gap: 10px; justify-content: flex-end; padding: 10px 18px 18px; }

.fgroup  { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.frow    { display: flex; gap: 12px; }
.flabel  { font-size: 12px; font-weight: 500; color: var(--t2); }
.finput  {
  border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px;
  font-size: 13px; color: var(--t1); background: var(--surface2); outline: none;
  transition: border-color 0.15s; width: 100%; box-sizing: border-box;
}
.finput:focus { border-color: var(--accent-br); box-shadow: 0 0 0 2px var(--accent-bg); }
.finput-err { padding: 8px 10px; border-radius: 8px; background: #fee2e2; color: #991b1b; font-size: 12px; }
.req { color: #dc2626; margin-left: 2px; }

.btn-cancel {
  border: 1px solid var(--border); background: var(--surface2); color: var(--t2);
  border-radius: 8px; padding: 9px 18px; font-size: 13px; cursor: pointer; transition: all 0.15s;
}
.btn-cancel:hover { background: var(--border); }

.btn-save {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent); color: #fff; border: none;
  border-radius: 8px; padding: 9px 20px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: opacity 0.15s;
}
.btn-save:hover { opacity: 0.88; }
.btn-save:disabled, .btn-repay:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-repay {
  display: flex; align-items: center; gap: 6px;
  background: #059669; color: #fff; border: none;
  border-radius: 8px; padding: 9px 20px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: opacity 0.15s;
}
.btn-repay:hover { opacity: 0.88; }

/* ── REPAY MODAL SPECIFICS ──────────────────────────────── */
.repay-info {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border-radius: 10px;
  background: var(--surface2); border: 1px solid var(--border);
}
.rep-name { margin: 0; font-weight: 600; color: var(--t1); font-size: 14px; }
.rep-sub  { margin: 3px 0 0; font-size: 12px; color: var(--t3); }
.rep-sub strong { color: #dc2626; }

.quick-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.quick-btn {
  flex: 1; padding: 7px 10px; border-radius: 8px;
  border: 1px solid var(--accent-br); background: var(--accent-bg);
  color: var(--accent); font-size: 12px; cursor: pointer; transition: all 0.15s;
  white-space: nowrap;
}
.quick-btn:hover { background: var(--accent); color: #fff; }

/* ── TOAST ──────────────────────────────────────────────── */
.toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  display: flex; align-items: center; gap: 8px;
  padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15); color: #fff;
}
.toast.success { background: #059669; }
.toast.error   { background: #dc2626; }

.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px) scale(0.97); }

.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: scale(0.96) translateY(8px); }

/* ── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) {
  .advance-page { padding: 16px; }
  .frow { flex-direction: column; }
}
</style>
