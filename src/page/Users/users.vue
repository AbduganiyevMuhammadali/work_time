<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Users, UserPlus, Pencil, Trash2, Search,
  Shield, UserCog, User, Eye, EyeOff,
  X, Check, Loader2, AlertCircle, RefreshCw
} from 'lucide-vue-next'
import { api } from '@/api/api.js'

// ── Rollar ──────────────────────────────────────────────────
const ROLES = [
  { value: 'Admin', label: 'Admin',  color: '#7c3aed', bg: '#ede9fe', icon: Shield },
  { value: 'HR',    label: 'HR',     color: '#0891b2', bg: '#e0f2fe', icon: UserCog },
  { value: 'Xodim', label: 'Xodim', color: '#059669', bg: '#d1fae5', icon: User },
]
const roleMap = Object.fromEntries(ROLES.map(r => [r.value, r]))

// ── State ────────────────────────────────────────────────────
const users    = ref([])
const loading  = ref(false)
const search   = ref('')
const toast    = ref(null)   // { type: 'success'|'error', msg }

// Modal
const modal    = ref(null)   // null | 'create' | 'edit' | 'delete'
const editing  = ref(null)   // user object
const saving   = ref(false)
const showPwd  = ref(false)
const showCPwd = ref(false)
const formErr  = ref({})

const form = ref({
  username: '', fullname: '', role: 'Xodim', password: '', confirmPassword: ''
})

// ── Joriy foydalanuvchi (localStorage) ──────────────────────
const me = JSON.parse(localStorage.getItem('wt_user') || '{}')

// ── Computed ─────────────────────────────────────────────────
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  return q
    ? users.value.filter(u =>
        u.fullname.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      )
    : users.value
})

const isEdit = computed(() => modal.value === 'edit')

// ── Ma'lumot yuklash ─────────────────────────────────────────
async function loadUsers() {
  loading.value = true
  try {
    users.value = await api.getUsers()
  } catch (e) {
    showToast('error', e.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)

// ── Modal ochish ─────────────────────────────────────────────
function openCreate() {
  editing.value = null
  form.value = { username: '', fullname: '', role: 'Xodim', password: '', confirmPassword: '' }
  formErr.value = {}
  showPwd.value = false
  showCPwd.value = false
  modal.value = 'create'
}

function openEdit(u) {
  editing.value = u
  form.value = { username: u.username, fullname: u.fullname, role: u.role, password: '', confirmPassword: '' }
  formErr.value = {}
  showPwd.value = false
  showCPwd.value = false
  modal.value = 'edit'
}

function openDelete(u) {
  editing.value = u
  modal.value = 'delete'
}

function closeModal() {
  modal.value = null
  editing.value = null
}

// ── Validatsiya ───────────────────────────────────────────────
function validate() {
  const e = {}
  if (!form.value.username.trim())       e.username = 'Username kiritilmagan'
  else if (form.value.username.length < 3) e.username = 'Kamida 3 ta belgi'
  if (!form.value.fullname.trim())       e.fullname = "To'liq ism kiritilmagan"
  if (!form.value.role)                  e.role     = 'Rol tanlanmagan'

  if (!isEdit.value) {
    if (!form.value.password)            e.password = 'Parol kiritilmagan'
    else if (form.value.password.length < 3) e.password = 'Kamida 3 ta belgi'
    if (form.value.password !== form.value.confirmPassword)
                                         e.confirmPassword = 'Parollar mos emas'
  } else if (form.value.password) {
    if (form.value.password.length < 3)  e.password = 'Kamida 3 ta belgi'
    if (form.value.password !== form.value.confirmPassword)
                                         e.confirmPassword = 'Parollar mos emas'
  }

  formErr.value = e
  return Object.keys(e).length === 0
}

// ── Saqlash ───────────────────────────────────────────────────
async function saveUser() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      username:        form.value.username.trim(),
      fullname:        form.value.fullname.trim(),
      role:            form.value.role,
      password:        form.value.password || undefined,
      confirmPassword: form.value.confirmPassword || undefined,
    }

    if (isEdit.value) {
      // Update uchun password bo'sh bo'lsa ham confirmPassword kerak emas
      if (!payload.password) {
        delete payload.password
        delete payload.confirmPassword
        // Ammo validator confirmPassword talab qiladi — bo'sh bo'lsa olib tashlash
        payload.password = ''
        payload.confirmPassword = ''
      }
      const updated = await api.updateUser(editing.value.id, payload)
      const idx = users.value.findIndex(u => u.id === editing.value.id)
      if (idx !== -1) users.value[idx] = updated
      showToast('success', "Foydalanuvchi yangilandi")
    } else {
      const created = await api.createUser(payload)
      users.value.push(created)
      showToast('success', "Foydalanuvchi yaratildi")
    }
    closeModal()
  } catch (e) {
    formErr.value.api = e.message
  } finally {
    saving.value = false
  }
}

// ── O'chirish ─────────────────────────────────────────────────
async function deleteUser() {
  saving.value = true
  try {
    await api.deleteUser(editing.value.id)
    users.value = users.value.filter(u => u.id !== editing.value.id)
    showToast('success', "Foydalanuvchi o'chirildi")
    closeModal()
  } catch (e) {
    showToast('error', e.message)
    closeModal()
  } finally {
    saving.value = false
  }
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(type, msg) {
  toast.value = { type, msg }
  setTimeout(() => toast.value = null, 3000)
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}
</script>

<template>
  <div class="page">

    <!-- ══ Toast ══ -->
    <Transition name="toast-slide">
      <div v-if="toast" class="toast" :class="toast.type">
        <component :is="toast.type === 'success' ? Check : AlertCircle" :size="15" />
        <span>{{ toast.msg }}</span>
      </div>
    </Transition>

    <!-- ══ Header ══ -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Foydalanuvchilar</h2>
        <p class="page-sub">Tizim foydalanuvchilari va ruxsatlarini boshqarish</p>
      </div>
      <div class="header-actions">
        <button class="refresh-btn" @click="loadUsers" :disabled="loading" title="Yangilash">
          <RefreshCw :size="15" :class="{ 'spin': loading }" />
        </button>
        <button class="add-btn" @click="openCreate">
          <UserPlus :size="15" />
          <span>Foydalanuvchi qo'shish</span>
        </button>
      </div>
    </div>

    <!-- ══ Stat cards ══ -->
    <div class="stat-row">
      <div v-for="r in ROLES" :key="r.value" class="stat-card" :style="{'--c': r.color, '--cb': r.bg}">
        <div class="sc-icon"><component :is="r.icon" :size="17" /></div>
        <div>
          <p class="sc-val">{{ users.filter(u => u.role === r.value).length }}</p>
          <p class="sc-lbl">{{ r.label }}</p>
        </div>
      </div>
      <div class="stat-card" style="--c:#6b7280;--cb:#f3f4f6">
        <div class="sc-icon"><Users :size="17" /></div>
        <div>
          <p class="sc-val">{{ users.length }}</p>
          <p class="sc-lbl">Jami</p>
        </div>
      </div>
    </div>

    <!-- ══ Table card ══ -->
    <div class="table-card">
      <div class="card-head">
        <h3 class="card-title">Foydalanuvchilar ro'yxati</h3>
        <div class="search-box">
          <Search :size="14" class="s-ico" />
          <input v-model="search" placeholder="Ism yoki username..." />
        </div>
      </div>

      <!-- Desktop table -->
      <div class="desk-wrap">
        <table>
          <thead>
            <tr>
              <th>Foydalanuvchi</th>
              <th>Username</th>
              <th>Rol</th>
              <th>Yaratilgan</th>
              <th class="th-act">Amallar</th>
            </tr>
          </thead>
          <tbody>
            <!-- Skeleton -->
            <template v-if="loading">
              <tr v-for="i in 4" :key="i">
                <td><div class="sk sk-emp"></div></td>
                <td><div class="sk sk-md"></div></td>
                <td><div class="sk sk-badge"></div></td>
                <td><div class="sk sk-md"></div></td>
                <td><div class="sk sk-acts"></div></td>
              </tr>
            </template>
            <!-- Empty -->
            <template v-else-if="filtered.length === 0">
              <tr><td colspan="5" class="empty-cell">
                <Users :size="36" class="empty-ico" />
                <p>Foydalanuvchi topilmadi</p>
              </td></tr>
            </template>
            <!-- Data -->
            <template v-else>
              <tr v-for="u in filtered" :key="u.id">
                <td>
                  <div class="user-cell">
                    <div class="av" :style="{ background: roleMap[u.role]?.bg, color: roleMap[u.role]?.color }">
                      {{ initials(u.fullname) }}
                    </div>
                    <div>
                      <p class="u-name">{{ u.fullname }}</p>
                      <p class="u-you" v-if="u.id == me.id">Siz</p>
                    </div>
                  </div>
                </td>
                <td><span class="username-chip">@{{ u.username }}</span></td>
                <td>
                  <span class="role-badge" :style="{ background: roleMap[u.role]?.bg, color: roleMap[u.role]?.color }">
                    <component :is="roleMap[u.role]?.icon" :size="11" />
                    {{ u.role }}
                  </span>
                </td>
                <td class="date-td">{{ u.createdAt ? new Date(u.createdAt).toLocaleDateString('uz-UZ') : '—' }}</td>
                <td class="act-cell">
                  <button class="act-btn edit-btn" @click="openEdit(u)" title="Tahrirlash"><Pencil :size="13" /></button>
                  <button class="act-btn del-btn" @click="openDelete(u)" :disabled="u.id == me.id" title="O'chirish"><Trash2 :size="13" /></button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Mobile card list -->
      <div class="mob-list">
        <div v-if="loading" class="mob-sk-wrap">
          <div v-for="i in 4" :key="i" class="mob-sk">
            <div class="sk sk-av"></div>
            <div class="mob-sk-body"><div class="sk sk-lg"></div><div class="sk sk-md mt4"></div></div>
            <div class="sk sk-badge"></div>
          </div>
        </div>
        <div v-else v-for="u in filtered" :key="u.id" class="mob-card">
          <div class="mob-left">
            <div class="av" :style="{ background: roleMap[u.role]?.bg, color: roleMap[u.role]?.color }">
              {{ initials(u.fullname) }}
            </div>
            <div>
              <p class="u-name">{{ u.fullname }} <span v-if="u.id == me.id" class="you-tag">Siz</span></p>
              <p class="u-un">@{{ u.username }}</p>
            </div>
          </div>
          <div class="mob-right">
            <span class="role-badge" :style="{ background: roleMap[u.role]?.bg, color: roleMap[u.role]?.color }">
              <component :is="roleMap[u.role]?.icon" :size="10" />{{ u.role }}
            </span>
            <div class="mob-acts">
              <button class="act-btn edit-btn" @click="openEdit(u)"><Pencil :size="13" /></button>
              <button class="act-btn del-btn"  @click="openDelete(u)" :disabled="u.id == me.id"><Trash2 :size="13" /></button>
            </div>
          </div>
        </div>
        <div v-if="!loading && filtered.length === 0" class="empty-cell">
          <Users :size="34" class="empty-ico" /><p>Topilmadi</p>
        </div>
      </div>

      <div class="card-foot">{{ filtered.length }} ta foydalanuvchi</div>
    </div>

    <!-- ══ Create / Edit Modal ══ -->
    <Transition name="fade">
      <div v-if="modal === 'create' || modal === 'edit'" class="overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-head">
            <h3>{{ isEdit ? 'Tahrirlash' : "Yangi foydalanuvchi qo'shish" }}</h3>
            <button class="close-btn" @click="closeModal"><X :size="16" /></button>
          </div>

          <!-- API error -->
          <div v-if="formErr.api" class="api-err">
            <AlertCircle :size="14" />{{ formErr.api }}
          </div>

          <div class="modal-body">

            <!-- Fullname -->
            <div class="field" :class="{ err: formErr.fullname }">
              <label>To'liq ism <span class="req">*</span></label>
              <input v-model="form.fullname" placeholder="Abdullayev Jahongir" />
              <span v-if="formErr.fullname" class="err-msg">{{ formErr.fullname }}</span>
            </div>

            <!-- Username -->
            <div class="field" :class="{ err: formErr.username }">
              <label>Username <span class="req">*</span></label>
              <input v-model="form.username" placeholder="jahongir_admin" />
              <span v-if="formErr.username" class="err-msg">{{ formErr.username }}</span>
            </div>

            <!-- Rol -->
            <div class="field" :class="{ err: formErr.role }">
              <label>Rol <span class="req">*</span></label>
              <div class="role-pick">
                <button
                  v-for="r in ROLES" :key="r.value"
                  type="button"
                  class="role-opt"
                  :class="{ active: form.role === r.value }"
                  :style="form.role === r.value ? { background: r.bg, color: r.color, borderColor: r.color } : {}"
                  @click="form.role = r.value"
                >
                  <component :is="r.icon" :size="14" />
                  {{ r.label }}
                </button>
              </div>
              <span v-if="formErr.role" class="err-msg">{{ formErr.role }}</span>
            </div>

            <!-- Password -->
            <div class="field" :class="{ err: formErr.password }">
              <label>Parol {{ isEdit ? '(o\'zgartirish ixtiyoriy)' : '' }} <span v-if="!isEdit" class="req">*</span></label>
              <div class="pwd-wrap">
                <input :type="showPwd ? 'text' : 'password'" v-model="form.password" placeholder="••••••" />
                <button type="button" class="eye-btn" @click="showPwd = !showPwd">
                  <Eye v-if="!showPwd" :size="14" /><EyeOff v-else :size="14" />
                </button>
              </div>
              <span v-if="formErr.password" class="err-msg">{{ formErr.password }}</span>
            </div>

            <!-- Confirm Password -->
            <div class="field" :class="{ err: formErr.confirmPassword }">
              <label>Parolni tasdiqlang {{ isEdit ? '(ixtiyoriy)' : '' }} <span v-if="!isEdit" class="req">*</span></label>
              <div class="pwd-wrap">
                <input :type="showCPwd ? 'text' : 'password'" v-model="form.confirmPassword" placeholder="••••••" />
                <button type="button" class="eye-btn" @click="showCPwd = !showCPwd">
                  <Eye v-if="!showCPwd" :size="14" /><EyeOff v-else :size="14" />
                </button>
              </div>
              <span v-if="formErr.confirmPassword" class="err-msg">{{ formErr.confirmPassword }}</span>
            </div>

          </div>

          <div class="modal-foot">
            <button class="cancel-btn" @click="closeModal" :disabled="saving">Bekor</button>
            <button class="save-btn" @click="saveUser" :disabled="saving">
              <Loader2 v-if="saving" :size="14" class="spin" />
              <Check v-else :size="14" />
              {{ isEdit ? 'Saqlash' : "Qo'shish" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══ Delete Confirm Modal ══ -->
    <Transition name="fade">
      <div v-if="modal === 'delete'" class="overlay" @click.self="closeModal">
        <div class="modal modal-sm">
          <div class="modal-head">
            <h3>Foydalanuvchini o'chirish</h3>
            <button class="close-btn" @click="closeModal"><X :size="16" /></button>
          </div>
          <div class="del-body">
            <div class="del-av" :style="{ background: roleMap[editing?.role]?.bg, color: roleMap[editing?.role]?.color }">
              {{ initials(editing?.fullname || '') }}
            </div>
            <p class="del-name">{{ editing?.fullname }}</p>
            <p class="del-warn">Bu amalni bekor qilib bo'lmaydi. Foydalanuvchi tizimdan butunlay o'chiriladi.</p>
          </div>
          <div class="modal-foot">
            <button class="cancel-btn" @click="closeModal" :disabled="saving">Bekor</button>
            <button class="del-confirm-btn" @click="deleteUser" :disabled="saving">
              <Loader2 v-if="saving" :size="14" class="spin" />
              <Trash2 v-else :size="14" />
              O'chirish
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* ── PAGE ───────────────────────────────────────────────────── */
.page {
  padding: 24px;
  background: var(--bg);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-sizing: border-box;
}

/* ── HEADER ─────────────────────────────────────────────────── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.page-title { font-size: 21px; font-weight: 700; color: var(--t1); margin: 0 0 3px; }
.page-sub   { font-size: 13px; color: var(--t4); margin: 0; }
.header-actions { display: flex; align-items: center; gap: 8px; }

.refresh-btn {
  width: 36px; height: 36px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  color: var(--t3); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.refresh-btn:hover { background: var(--accent-hv); color: var(--accent); }

.add-btn {
  display: flex; align-items: center; gap: 7px;
  background: var(--accent); color: #fff;
  border: none; border-radius: 9px;
  padding: 9px 16px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; white-space: nowrap;
  transition: opacity 0.15s;
}
.add-btn:hover { opacity: 0.88; }

/* ── STAT ROW ───────────────────────────────────────────────── */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.stat-card {
  background: var(--surface);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 1px 4px var(--shadow-sm);
  border-bottom: 3px solid var(--c);
}
.sc-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: var(--cb);
  color: var(--c);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.sc-val { font-size: 22px; font-weight: 800; color: var(--t1); margin: 0; line-height: 1; }
.sc-lbl { font-size: 11px; color: var(--t4); margin: 3px 0 0; }

/* ── TABLE CARD ─────────────────────────────────────────────── */
.table-card {
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 1px 4px var(--shadow-sm);
  border: 1px solid var(--border);
  overflow: hidden;
}
.card-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 20px 0; gap: 12px; flex-wrap: wrap;
}
.card-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--t1); }
.search-box {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid var(--border); border-radius: 8px;
  padding: 7px 10px; background: var(--surface2);
  transition: border-color 0.15s;
}
.search-box:focus-within { border-color: var(--accent-br); }
.s-ico { color: var(--t4); flex-shrink: 0; }
.search-box input {
  border: none; outline: none; background: transparent;
  font-size: 13px; color: var(--t1); width: 200px;
}
.search-box input::placeholder { color: var(--t4); }

/* ── TABLE ──────────────────────────────────────────────────── */
.desk-wrap { overflow-x: auto; padding-top: 14px; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead th {
  background: var(--surface2); color: var(--t3);
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.5px; padding: 9px 16px;
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.th-act { text-align: center; }
tbody td { padding: 12px 16px; border-bottom: 1px solid var(--border2); color: var(--t2); vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: var(--surface2); }

.user-cell { display: flex; align-items: center; gap: 10px; }
.av {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.u-name { font-size: 13px; font-weight: 600; color: var(--t1); margin: 0; }
.u-you  { font-size: 10px; color: var(--accent); font-weight: 600; margin: 1px 0 0; }

.username-chip {
  display: inline-block; padding: 2px 8px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 6px; font-size: 12px; color: var(--t3);
  font-family: monospace;
}

.role-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
}

.date-td { color: var(--t4); font-size: 12px; }

.act-cell { display: flex; gap: 6px; justify-content: center; }
.act-btn {
  width: 28px; height: 28px; border-radius: 7px;
  border: 1px solid var(--border); background: var(--surface2);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.act-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.edit-btn { color: var(--accent); }
.edit-btn:hover:not(:disabled) { background: var(--accent-bg); border-color: var(--accent-br); }
.del-btn { color: #dc2626; }
.del-btn:hover:not(:disabled) { background: #fee2e2; border-color: #fca5a5; }

/* ── MOBILE LIST ────────────────────────────────────────────── */
.mob-list { display: none; }

/* ── SKELETON ───────────────────────────────────────────────── */
.sk {
  background: linear-gradient(90deg, var(--border) 25%, var(--border2) 50%, var(--border) 75%);
  background-size: 200% 100%; animation: shimmer 1.3s infinite;
  border-radius: 6px; height: 13px;
}
.sk-emp   { height: 36px; width: 160px; border-radius: 18px; }
.sk-md    { width: 90px; }
.sk-lg    { width: 130px; }
.sk-badge { height: 22px; width: 70px; border-radius: 20px; }
.sk-acts  { height: 28px; width: 64px; border-radius: 7px; }
.sk-av    { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
.mt4      { margin-top: 5px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── EMPTY ──────────────────────────────────────────────────── */
.empty-cell { text-align: center; padding: 52px 16px !important; color: var(--t4); }
.empty-ico  { display: block; margin: 0 auto 10px; opacity: 0.3; }
.empty-cell p { margin: 0; font-size: 14px; }

/* ── FOOTER ─────────────────────────────────────────────────── */
.card-foot { padding: 10px 16px; border-top: 1px solid var(--border); font-size: 12px; color: var(--t4); }

/* ── OVERLAY & MODAL ────────────────────────────────────────── */
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 16px;
}
.modal {
  background: var(--surface);
  border-radius: 14px;
  width: 100%; max-width: 460px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: modal-in 0.2s ease;
  max-height: 92vh; overflow-y: auto;
}
.modal-sm { max-width: 360px; }
@keyframes modal-in { from { opacity: 0; transform: scale(0.96) translateY(10px); } }

.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 20px 0;
}
.modal-head h3 { margin: 0; font-size: 16px; font-weight: 700; color: var(--t1); }
.close-btn {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1px solid var(--border); background: var(--surface2);
  color: var(--t3); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.close-btn:hover { background: var(--border); color: var(--t1); }

.api-err {
  margin: 12px 20px 0;
  display: flex; align-items: center; gap: 8px;
  background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 8px; padding: 10px 12px;
  font-size: 12px; color: #991b1b;
}

.modal-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 12px; font-weight: 600; color: var(--t2); }
.field.err label { color: #dc2626; }
.field input {
  padding: 9px 12px;
  border: 1.5px solid var(--border);
  border-radius: 9px; background: var(--surface2);
  font-size: 13px; color: var(--t1); font-family: inherit;
  outline: none; transition: border-color 0.15s, box-shadow 0.15s;
}
.field input:focus { border-color: var(--accent-br); box-shadow: 0 0 0 3px var(--accent-bg); }
.field.err input { border-color: #dc2626; }
.err-msg { font-size: 11px; color: #dc2626; font-weight: 500; }
.req { color: #dc2626; margin-left: 2px; }

/* Role picker */
.role-pick { display: flex; gap: 8px; flex-wrap: wrap; }
.role-opt {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 9px;
  border: 1.5px solid var(--border); background: var(--surface2);
  font-size: 13px; font-weight: 500; color: var(--t3);
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.role-opt:hover { border-color: var(--accent-br); color: var(--accent); }
.role-opt.active { font-weight: 700; }

/* Password field */
.pwd-wrap {
  display: flex; align-items: center;
  border: 1.5px solid var(--border); border-radius: 9px;
  background: var(--surface2); overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.pwd-wrap:focus-within { border-color: var(--accent-br); box-shadow: 0 0 0 3px var(--accent-bg); }
.field.err .pwd-wrap { border-color: #dc2626; }
.pwd-wrap input { flex: 1; border: none; outline: none; background: transparent; padding: 9px 12px; font-size: 13px; color: var(--t1); font-family: inherit; }
.eye-btn {
  padding: 0 10px; background: none; border: none;
  color: var(--t4); cursor: pointer; display: flex; align-items: center;
  transition: color 0.15s;
}
.eye-btn:hover { color: var(--accent); }

/* Modal footer */
.modal-foot {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}
.cancel-btn {
  padding: 9px 18px; border: 1px solid var(--border);
  border-radius: 8px; background: var(--surface2);
  font-size: 13px; color: var(--t2); cursor: pointer;
  font-family: inherit; transition: all 0.15s;
}
.cancel-btn:hover { background: var(--border); }
.save-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 20px; background: var(--accent); color: #fff;
  border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: opacity 0.15s;
}
.save-btn:hover { opacity: 0.88; }
.save-btn:disabled, .cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Delete modal */
.del-body { padding: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.del-av {
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700;
}
.del-name { margin: 0; font-size: 16px; font-weight: 700; color: var(--t1); }
.del-warn { margin: 0; font-size: 13px; color: var(--t4); line-height: 1.5; max-width: 280px; }
.del-confirm-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 20px; background: #dc2626; color: #fff;
  border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: opacity 0.15s;
}
.del-confirm-btn:hover { opacity: 0.88; }
.del-confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── TOAST ──────────────────────────────────────────────────── */
.toast {
  position: fixed; bottom: 80px; right: 20px; z-index: 300;
  display: flex; align-items: center; gap: 8px;
  padding: 12px 18px; border-radius: 10px;
  font-size: 13px; font-weight: 600;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}
.toast.success { background: #059669; color: #fff; }
.toast.error   { background: #dc2626; color: #fff; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.25s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translateX(40px); }

/* ── TRANSITIONS ────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.spin { animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .page { padding: 14px 12px; gap: 12px; }
  .stat-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .stat-card { padding: 12px 14px; }
  .sc-val { font-size: 20px; }
  .page-title { font-size: 18px; }
  .add-btn span { display: none; }
  .add-btn { padding: 9px 12px; }
  .desk-wrap { display: none; }
  .mob-list {
    display: block;
    padding: 10px;
  }
  .mob-sk-wrap { display: flex; flex-direction: column; gap: 8px; }
  .mob-sk {
    display: flex; align-items: center; gap: 10px;
    padding: 12px; border-radius: 10px; background: var(--surface2);
  }
  .mob-sk-body { flex: 1; }
  .mob-card {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: 12px; margin-bottom: 8px;
    background: var(--surface);
  }
  .mob-left { display: flex; align-items: center; gap: 10px; }
  .u-un { font-size: 11px; color: var(--t4); margin: 2px 0 0; font-family: monospace; }
  .mob-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .mob-acts { display: flex; gap: 5px; }
  .you-tag { font-size: 10px; color: var(--accent); font-weight: 600; background: var(--accent-bg); padding: 1px 5px; border-radius: 4px; margin-left: 4px; }
  .modal { max-width: 100%; border-radius: 18px 18px 0 0; position: fixed; bottom: 0; left: 0; right: 0; max-height: 95vh; }
  .overlay { align-items: flex-end; padding: 0; }
  .role-pick { gap: 6px; }
  .role-opt { padding: 7px 10px; font-size: 12px; }
  .toast { bottom: 90px; right: 12px; left: 12px; }
}
</style>
