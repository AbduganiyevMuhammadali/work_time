<template>
  <div class="settings-page">

    <!-- ── HEADER ────────────────────────────────────────────── -->
    <div class="page-header">
      <h1 class="page-title">Sozlamalar</h1>
      <p class="page-sub">Tizim va kompaniya sozlamalari</p>
    </div>

    <!-- ── GRID ──────────────────────────────────────────────── -->
    <div class="settings-grid">

      <!-- ── LEFT TABS ─────────────────────────────────────────── -->
      <div class="tabs-card">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <component :is="tab.icon" :size="16" class="tab-ico" />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- ── RIGHT CONTENT ──────────────────────────────────────── -->
      <div class="content-card">

        <!-- ── KOMPANIYA ─────────────────────────────────────────── -->
        <div v-if="activeTab === 'company'">
          <div class="section-head">
            <Building2 :size="18" />
            <div>
              <h3>Kompaniya ma'lumotlari</h3>
              <p>Asosiy kompaniya ma'lumotlari</p>
            </div>
          </div>

          <div class="form-body">
            <div class="form-row">
              <div class="form-group">
                <label>Kompaniya nomi</label>
                <input v-model="company.name" placeholder="WorkTime LLC" />
              </div>
              <div class="form-group">
                <label>INN / STIR</label>
                <input v-model="company.inn" placeholder="123456789" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Telefon</label>
                <input v-model="company.phone" placeholder="+998 71 123 45 67" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="company.email" placeholder="info@company.uz" />
              </div>
            </div>
            <div class="form-group">
              <label>Manzil</label>
              <input v-model="company.address" placeholder="Toshkent sh., Chilonzor tumani..." />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Valyuta</label>
                <select v-model="company.currency">
                  <option value="UZS">UZS – So'm</option>
                  <option value="USD">USD – Dollar</option>
                  <option value="EUR">EUR – Evro</option>
                </select>
              </div>
              <div class="form-group">
                <label>Til</label>
                <select v-model="company.language">
                  <option value="uz">O'zbek</option>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button class="save-btn" @click="saved('company')">
                <Save :size="14" /> Saqlash
              </button>
            </div>
          </div>
        </div>

        <!-- ── ISH VAQTI ──────────────────────────────────────────── -->
        <div v-if="activeTab === 'workhours'">
          <div class="section-head">
            <Clock :size="18" />
            <div>
              <h3>Ish vaqti sozlamalari</h3>
              <p>Ish grafigi va bayram kunlari</p>
            </div>
          </div>

          <div class="form-body">
            <div class="form-row">
              <div class="form-group">
                <label>Ish boshlanishi</label>
                <input type="time" v-model="workHours.start" />
              </div>
              <div class="form-group">
                <label>Ish tugashi</label>
                <input type="time" v-model="workHours.end" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tushlik boshlanishi</label>
                <input type="time" v-model="workHours.lunchStart" />
              </div>
              <div class="form-group">
                <label>Tushlik tugashi</label>
                <input type="time" v-model="workHours.lunchEnd" />
              </div>
            </div>

            <div class="form-group">
              <label>Kechikish chegarasi (daqiqa)</label>
              <input type="number" v-model="workHours.lateThreshold" min="0" max="60" />
              <span class="field-hint">Bu daqiqadan ko'p kechiksa "Kech qoldi" deb hisoblanadi</span>
            </div>

            <div class="form-group">
              <label>Ish kunlari</label>
              <div class="days-picker">
                <button
                  v-for="(d, i) in DAY_FULL"
                  :key="i"
                  type="button"
                  :class="['day-btn', workHours.workDays.includes(i) ? 'day-on' : '']"
                  @click="toggleWorkDay(i)"
                >
                  <span class="d-short">{{ DAY_SHORT[i] }}</span>
                  <span class="d-name">{{ d }}</span>
                </button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Yillik ta'til kunlari</label>
                <input type="number" v-model="workHours.annualLeaveDays" min="0" />
              </div>
              <div class="form-group">
                <label>Vaqtincha nogironlik (kun)</label>
                <input type="number" v-model="workHours.sickLeaveDays" min="0" />
              </div>
            </div>

            <div class="form-actions">
              <button class="save-btn" @click="saved('workhours')">
                <Save :size="14" /> Saqlash
              </button>
            </div>
          </div>
        </div>

        <!-- ── BILDIRISHNOMALAR ───────────────────────────────────── -->
        <div v-if="activeTab === 'notif'">
          <div class="section-head">
            <Bell :size="18" />
            <div>
              <h3>Bildirishnoma sozlamalari</h3>
              <p>Qaysi hodisalar uchun bildirishnoma olish</p>
            </div>
          </div>

          <div class="form-body">
            <div class="toggle-list">

              <div class="toggle-item" v-for="item in notifItems" :key="item.key">
                <div class="toggle-info">
                  <span class="toggle-label">{{ item.label }}</span>
                  <span class="toggle-desc">{{ item.desc }}</span>
                </div>
                <button
                  class="toggle-btn"
                  :class="{ 'toggle-on': notif[item.key] }"
                  @click="notif[item.key] = !notif[item.key]"
                  role="switch"
                  :aria-checked="notif[item.key]"
                >
                  <span class="toggle-thumb"></span>
                </button>
              </div>

            </div>
            <div class="form-actions">
              <button class="save-btn" @click="saved('notif')">
                <Save :size="14" /> Saqlash
              </button>
            </div>
          </div>
        </div>

        <!-- ── MAOSH ──────────────────────────────────────────────── -->
        <div v-if="activeTab === 'salary'">
          <div class="section-head">
            <BadgeDollarSign :size="18" />
            <div>
              <h3>Maosh sozlamalari</h3>
              <p>Maosh hisoblash parametrlari</p>
            </div>
          </div>

          <div class="form-body">
            <div class="form-row">
              <div class="form-group">
                <label>Maosh hisoblash kuni</label>
                <input type="number" v-model="salarySettings.payDay" min="1" max="31" />
                <span class="field-hint">Har oyning nechanchi kuni maosh hisoblansin</span>
              </div>
              <div class="form-group">
                <label>Avans foizi (%)</label>
                <input type="number" v-model="salarySettings.advancePercent" min="0" max="100" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Kechikish jarima koeffitsienti</label>
                <input type="number" v-model="salarySettings.latePenaltyRate" min="0" step="0.01" />
                <span class="field-hint">Har kechikish daqiqasi uchun koeffitsient</span>
              </div>
              <div class="form-group">
                <label>Ishdan tashqari vaqt koeffitsienti</label>
                <input type="number" v-model="salarySettings.overtimeRate" min="1" step="0.1" />
                <span class="field-hint">Ish vaqtidan tashqari ishlash uchun (1.5 = 150%)</span>
              </div>
            </div>

            <div class="form-group">
              <label>Soliq foizi (%)</label>
              <input type="number" v-model="salarySettings.taxPercent" min="0" max="100" />
            </div>

            <div class="form-actions">
              <button class="save-btn" @click="saved('salary')">
                <Save :size="14" /> Saqlash
              </button>
            </div>
          </div>
        </div>

        <!-- ── PROFIL ──────────────────────────────────────────────── -->
        <div v-if="activeTab === 'profile'">
          <div class="section-head">
            <UserCircle :size="18" />
            <div>
              <h3>Profilim</h3>
              <p>Shaxsiy ma'lumotlar va parolni o'zgartirish</p>
            </div>
          </div>

          <div class="form-body">
            <!-- Avatar -->
            <div class="avatar-section">
              <div class="big-av" :style="{ background: '#7c3aed22', color: '#7c3aed' }">MA</div>
              <div class="av-info">
                <p class="av-name">Muhammad Ali</p>
                <p class="av-role">Administrator</p>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Ism</label>
                <input v-model="profile.firstName" placeholder="Muhammad" />
              </div>
              <div class="form-group">
                <label>Familiya</label>
                <input v-model="profile.lastName" placeholder="Ali" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="profile.email" placeholder="admin@company.uz" />
              </div>
              <div class="form-group">
                <label>Telefon</label>
                <input v-model="profile.phone" placeholder="+998 90 000 00 00" />
              </div>
            </div>

            <div class="divider-line"></div>
            <p class="section-subtitle">Parolni o'zgartirish</p>

            <div class="form-group">
              <label>Joriy parol</label>
              <input type="password" v-model="profile.currentPwd" placeholder="••••••••" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Yangi parol</label>
                <input type="password" v-model="profile.newPwd" placeholder="••••••••" />
              </div>
              <div class="form-group">
                <label>Tasdiqlash</label>
                <input type="password" v-model="profile.confirmPwd" placeholder="••••••••" />
              </div>
            </div>

            <div class="form-actions">
              <button class="save-btn" @click="saved('profile')">
                <Save :size="14" /> Saqlash
              </button>
            </div>
          </div>
        </div>

        <!-- ── Saved toast ───────────────────────────────────────── -->
        <Transition name="toast">
          <div v-if="savedMsg" class="saved-toast">
            <CheckCircle2 :size="15" /> Muvaffaqiyatli saqlandi
          </div>
        </Transition>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Building2, Clock, Bell, BadgeDollarSign, UserCircle,
  Save, CheckCircle2
} from 'lucide-vue-next'

// ─── Tabs ─────────────────────────────────────────────────────
const tabs = [
  { key: 'company',   label: 'Kompaniya',        icon: Building2          },
  { key: 'workhours', label: 'Ish vaqti',         icon: Clock              },
  { key: 'salary',    label: 'Maosh sozlamalari', icon: BadgeDollarSign    },
  { key: 'notif',     label: 'Bildirishnomalar',  icon: Bell               },
  { key: 'profile',   label: 'Profilim',          icon: UserCircle         },
]
const activeTab = ref('company')

// ─── Day labels ───────────────────────────────────────────────
const DAY_SHORT = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
const DAY_FULL  = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']

// ─── Settings data ────────────────────────────────────────────
const company = ref({
  name: 'WorkTime LLC', inn: '302756789',
  phone: '+998 71 123 45 67', email: 'info@worktime.uz',
  address: "Toshkent sh., Yunusobod tumani, Amir Temur ko'chasi 108",
  currency: 'UZS', language: 'uz',
})

const workHours = ref({
  start: '09:00', end: '18:00',
  lunchStart: '13:00', lunchEnd: '14:00',
  lateThreshold: 15,
  workDays: [0, 1, 2, 3, 4],
  annualLeaveDays: 24,
  sickLeaveDays: 10,
})

const notif = ref({
  lateArrival: true, absent: true, leaveRequest: true,
  salaryReady: true, birthdayReminder: true, systemAlert: false,
  weeklyReport: true, monthlyReport: true,
})

const notifItems = [
  { key: 'lateArrival',     label: 'Kechikish xabardorlik',       desc: 'Xodim kechikib kelganda' },
  { key: 'absent',          label: 'Kelmaganlar',                  desc: "Xodim ishga kelmaganda" },
  { key: 'leaveRequest',    label: "Ta'til so'rovi",               desc: "Yangi ta'til so'rovi kelganda" },
  { key: 'salaryReady',     label: 'Maosh tayyor',                 desc: 'Oylik hisob tayyor bo\'lganda' },
  { key: 'birthdayReminder',label: 'Tug\'ilgan kun',               desc: 'Xodim tug\'ilgan kuni eslatmasi' },
  { key: 'weeklyReport',    label: 'Haftalik hisobot',             desc: 'Har dushanba haftalik hisobot' },
  { key: 'monthlyReport',   label: 'Oylik hisobot',                desc: "Har oy boshida oylik hisobot" },
  { key: 'systemAlert',     label: 'Tizim ogohlantirishlari',      desc: 'Texnik muammolar haqida' },
]

const salarySettings = ref({
  payDay: 25, advancePercent: 40,
  latePenaltyRate: 0.05, overtimeRate: 1.5,
  taxPercent: 12,
})

const profile = ref({
  firstName: 'Muhammad', lastName: 'Ali',
  email: 'admin@worktime.uz', phone: '+998 90 000 00 00',
  currentPwd: '', newPwd: '', confirmPwd: '',
})

// ─── Actions ──────────────────────────────────────────────────
const savedMsg = ref(false)
let   saveTimer = null

const saved = (tab) => {
  savedMsg.value = true
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => { savedMsg.value = false }, 2500)
}

const toggleWorkDay = (i) => {
  const idx = workHours.value.workDays.indexOf(i)
  if (idx === -1) workHours.value.workDays.push(i)
  else workHours.value.workDays.splice(idx, 1)
}
</script>

<style scoped>
/* ── PAGE ───────────────────────────────────────────────────── */
.settings-page {
  padding: 24px;
  background: var(--bg);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}

.page-header { }
.page-title  { margin: 0 0 2px; font-size: 20px; font-weight: 700; color: var(--t1); }
.page-sub    { margin: 0; font-size: 13px; color: var(--t3); }

/* ── GRID ───────────────────────────────────────────────────── */
.settings-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
  align-items: start;
}

/* ── TABS CARD ──────────────────────────────────────────────── */
.tabs-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: var(--shadow-sm);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--t3);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  width: 100%;
}
.tab-btn:hover  { background: var(--surface2); color: var(--t1); }
.tab-btn.active { background: var(--accent-bg); color: var(--accent); }
.tab-ico        { flex-shrink: 0; }

/* ── CONTENT CARD ───────────────────────────────────────────── */
.content-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  position: relative;
  min-height: 400px;
}

.section-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border2);
  color: var(--accent);
}
.section-head h3 { margin: 0 0 3px; font-size: 15px; font-weight: 600; color: var(--t1); }
.section-head p  { margin: 0; font-size: 12px; color: var(--t3); }

/* ── FORM ───────────────────────────────────────────────────── */
.form-body { display: flex; flex-direction: column; gap: 16px; }
.form-row  { display: flex; gap: 14px; }
.form-group { flex: 1; display: flex; flex-direction: column; gap: 5px; }
label { font-size: 12px; font-weight: 500; color: var(--t2); }

input, select {
  border: 1px solid var(--border);
  border-radius: 8px; padding: 8px 10px;
  font-size: 13px; color: var(--t1);
  background: var(--surface2);
  outline: none; transition: border-color 0.15s;
  width: 100%; box-sizing: border-box;
}
input:focus, select:focus {
  border-color: var(--accent-br);
  box-shadow: 0 0 0 2px var(--accent-bg);
}

.field-hint { font-size: 11px; color: var(--t4); margin-top: 2px; }

.form-actions { display: flex; justify-content: flex-end; padding-top: 4px; }
.save-btn {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent); color: #fff;
  border: none; border-radius: 8px;
  padding: 9px 20px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: opacity 0.15s;
}
.save-btn:hover { opacity: 0.88; }

/* ── DAYS PICKER ────────────────────────────────────────────── */
.days-picker { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
.day-btn {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 7px 8px; border-radius: 9px;
  border: 1px solid var(--border); background: var(--surface2);
  cursor: pointer; transition: all 0.15s; flex: 1; min-width: 46px;
}
.day-btn:hover { border-color: var(--accent-br); }
.day-btn.day-on { background: var(--accent-bg); border-color: var(--accent-br); color: var(--accent); }
.d-short { font-size: 12px; font-weight: 700; }
.d-name  { font-size: 9px; color: var(--t4); white-space: nowrap; }
.day-btn.day-on .d-name { color: var(--accent); opacity: 0.75; }
:global(.layout.dark) .day-btn.day-on { background: rgba(167,139,250,0.15); border-color: rgba(167,139,250,0.35); color: #a78bfa; }

/* ── TOGGLE LIST ────────────────────────────────────────────── */
.toggle-list { display: flex; flex-direction: column; gap: 2px; }
.toggle-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 13px 0;
  border-bottom: 1px solid var(--border2);
}
.toggle-item:last-child { border-bottom: none; }
.toggle-info { display: flex; flex-direction: column; gap: 2px; }
.toggle-label { font-size: 13px; font-weight: 500; color: var(--t1); }
.toggle-desc  { font-size: 11px; color: var(--t4); }

.toggle-btn {
  width: 42px; height: 24px;
  border-radius: 12px;
  border: none; cursor: pointer;
  background: var(--border);
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle-btn.toggle-on { background: var(--accent); }
.toggle-thumb {
  position: absolute;
  top: 3px; left: 3px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle-btn.toggle-on .toggle-thumb { transform: translateX(18px); }

/* ── PROFILE ────────────────────────────────────────────────── */
.avatar-section {
  display: flex; align-items: center; gap: 16px;
  padding: 16px; background: var(--surface2);
  border: 1px solid var(--border); border-radius: 10px;
}
.big-av {
  width: 60px; height: 60px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; flex-shrink: 0;
}
.av-name { margin: 0 0 3px; font-size: 15px; font-weight: 600; color: var(--t1); }
.av-role { margin: 0; font-size: 12px; color: var(--t3); }

.divider-line { border: none; border-top: 1px solid var(--border2); margin: 4px 0; }
.section-subtitle { margin: 0; font-size: 13px; font-weight: 600; color: var(--t2); }

/* ── SAVED TOAST ────────────────────────────────────────────── */
.saved-toast {
  position: absolute;
  bottom: 24px; right: 24px;
  display: flex; align-items: center; gap: 8px;
  background: #059669; color: #fff;
  border-radius: 10px; padding: 10px 16px;
  font-size: 13px; font-weight: 500;
  box-shadow: 0 4px 12px rgba(5,150,105,0.35);
}
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateY(8px); }

/* ── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 700px) {
  .settings-grid { grid-template-columns: 1fr; }
  .tabs-card { flex-direction: row; flex-wrap: wrap; }
  .tab-btn   { flex: 1; justify-content: center; min-width: 100px; }
}
@media (max-width: 500px) {
  .form-row { flex-direction: column; }
}
</style>
