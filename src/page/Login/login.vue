<template>
  <div class="login-root" :class="{ dark: darkMode }">

    <!-- ── LEFT PANEL ────────────────────────────────────────── -->
    <div class="left-panel">

      <!-- Overlay gradient -->
      <div class="left-overlay"></div>

      <!-- Content -->
      <div class="left-content">

        <!-- Logo -->
        <div class="brand">
          <div class="brand-icon">
            <Cpu :size="22" color="#fff" />
          </div>
          <span class="brand-name">Work<strong>Time</strong></span>
        </div>

        <!-- Headline -->
        <div class="left-hero">
          <h1 class="hero-title">Kadrlar boshqaruvi<br>yangi darajada</h1>
          <p class="hero-sub">
            Xodimlar, davomat, maosh va ta'tillarni
            bitta tizimda boshqaring — tez, qulay, ishonchli.
          </p>
        </div>

        <!-- Feature list -->
        <ul class="feature-list">
          <li v-for="f in features" :key="f.label" class="feature-item">
            <span class="f-ico"><component :is="f.icon" :size="15" /></span>
            <span>{{ f.label }}</span>
          </li>
        </ul>

        <!-- Stats row -->
        <div class="stats-row">
          <div class="mini-stat" v-for="s in miniStats" :key="s.label">
            <span class="ms-val">{{ s.val }}</span>
            <span class="ms-lbl">{{ s.label }}</span>
          </div>
        </div>

      </div>
    </div>

    <!-- ── RIGHT PANEL ────────────────────────────────────────── -->
    <div class="right-panel">

      <!-- Theme toggle -->
      <button class="theme-toggle" @click="darkMode = !darkMode" :title="darkMode ? 'Yorug\' rejim' : 'Qorong\'u rejim'">
        <Transition name="spin" mode="out-in">
          <Sun  v-if="darkMode"  key="sun"  :size="17" />
          <Moon v-else           key="moon" :size="17" />
        </Transition>
      </button>

      <!-- Form card -->
      <div class="form-card">

        <!-- Card header -->
        <div class="card-top">
          <div class="card-logo">
            <Cpu :size="18" />
          </div>
          <h2 class="card-title">Tizimga kirish</h2>
          <p class="card-sub">Hisob ma'lumotlaringizni kiriting</p>
        </div>

        <!-- Form -->
        <form class="login-form" @submit.prevent="handleLogin" novalidate>

          <!-- Email / Login -->
          <div class="field-group" :class="{ 'has-error': errors.login }">
            <label>Email yoki login <span class="req">*</span></label>
            <div class="inp-wrap" :class="{ focused: focus.login }">
              <User :size="15" class="inp-ico" />
              <input
                v-model="form.login"
                type="text"
                placeholder="admin@worktime.uz"
                autocomplete="username"
                @focus="focus.login = true"
                @blur="focus.login = false; validate('login')"
              />
            </div>
            <span v-if="errors.login" class="err-msg">{{ errors.login }}</span>
          </div>

          <!-- Parol -->
          <div class="field-group" :class="{ 'has-error': errors.password }">
            <div class="label-row">
              <label>Parol <span class="req">*</span></label>
              <button type="button" class="forgot-link" @click="showForgot = true">
                Parolni unutdingizmi?
              </button>
            </div>
            <div class="inp-wrap" :class="{ focused: focus.password }">
              <Lock :size="15" class="inp-ico" />
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                @focus="focus.password = true"
                @blur="focus.password = false; validate('password')"
              />
              <button type="button" class="pwd-toggle" @click="showPwd = !showPwd" tabindex="-1">
                <Eye    v-if="!showPwd" :size="15" />
                <EyeOff v-else          :size="15" />
              </button>
            </div>
            <span v-if="errors.password" class="err-msg">{{ errors.password }}</span>
          </div>

          <!-- Remember me -->
          <label class="check-row">
            <input type="checkbox" v-model="form.remember" class="check-box" />
            <span class="check-label">Meni eslab qol</span>
          </label>

          <!-- Error banner -->
          <Transition name="slide-down">
            <div v-if="authError" class="error-banner">
              <AlertCircle :size="15" />
              <span>{{ authError }}</span>
              <button type="button" @click="authError = ''"><X :size="13" /></button>
            </div>
          </Transition>

          <!-- Submit -->
          <button type="submit" class="login-btn" :class="{ loading: isLoading }" :disabled="isLoading">
            <Transition name="spin" mode="out-in">
              <Loader2 v-if="isLoading" key="load" :size="16" class="spin-ico" />
              <LogIn   v-else           key="login" :size="16" />
            </Transition>
            <span>{{ isLoading ? 'Tekshirilmoqda...' : 'Kirish' }}</span>
          </button>

          <!-- Demo hint -->
          <div class="demo-hint">
            <span class="demo-lbl">Demo kirish:</span>
            <button type="button" class="demo-fill" @click="fillDemo">
              Admin / admin123
            </button>
          </div>

        </form>
      </div>

      <!-- Footer -->
      <p class="right-footer">&copy; 2026 WorkTime. Barcha huquqlar himoyalangan.</p>
    </div>

    <!-- ── FORGOT PASSWORD MODAL ───────────────────────────── -->
    <Transition name="fade">
      <div v-if="showForgot" class="modal-backdrop" @click.self="showForgot = false">
        <div class="forgot-modal">
          <div class="fm-head">
            <h3>Parolni tiklash</h3>
            <button class="fm-close" @click="showForgot = false"><X :size="17" /></button>
          </div>

          <template v-if="!forgotSent">
            <p class="fm-desc">Email manzilingizni kiriting, parolni tiklash havolasini yuboramiz.</p>
            <div class="field-group">
              <label>Email</label>
              <div class="inp-wrap">
                <Mail :size="15" class="inp-ico" />
                <input v-model="forgotEmail" type="email" placeholder="email@example.com" />
              </div>
            </div>
            <div class="fm-actions">
              <button class="cancel-btn" @click="showForgot = false">Bekor</button>
              <button class="login-btn sm" @click="sendForgot">
                <Send :size="14" /> Yuborish
              </button>
            </div>
          </template>

          <template v-else>
            <div class="fm-success">
              <CheckCircle2 :size="40" class="success-ico" />
              <h4>Xat yuborildi!</h4>
              <p>{{ forgotEmail }} manziliga parolni tiklash havolasi yuborildi.</p>
              <button class="login-btn sm" @click="showForgot = false; forgotSent = false">Yopish</button>
            </div>
          </template>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Cpu, User, Lock, Eye, EyeOff, LogIn, Loader2,
  AlertCircle, X, Moon, Sun, Mail, Send, CheckCircle2,
  Users, Clock, BarChart2, Shield
} from 'lucide-vue-next'
import { api } from '@/api/api.js'

const router = useRouter()

// ─── Theme ────────────────────────────────────────────────────
const darkMode = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

// ─── Left panel data ──────────────────────────────────────────
const features = [
  { icon: Users,     label: 'Xodimlarni to\'liq boshqarish' },
  { icon: Clock,     label: 'Real-vaqt davomat nazorati' },
  { icon: BarChart2, label: 'Oylik va avans hisobi' },
  { icon: Shield,    label: 'Xavfsiz va tezkor tizim' },
]

const miniStats = [
  { val: '500+', label: 'Kompaniya' },
  { val: '12K+', label: 'Xodim' },
  { val: '99.9%', label: 'Uptime' },
]

// ─── Form state ───────────────────────────────────────────────
const form = ref({ login: '', password: '', remember: false })
const errors   = ref({ login: '', password: '' })
const focus    = ref({ login: false, password: false })
const showPwd  = ref(false)
const isLoading = ref(false)
const authError = ref('')

// ─── Forgot password ──────────────────────────────────────────
const showForgot  = ref(false)
const forgotEmail = ref('')
const forgotSent  = ref(false)

const sendForgot = () => {
  if (!forgotEmail.value) return
  forgotSent.value = true
}

// ─── Validation ───────────────────────────────────────────────
const validate = (field) => {
  if (field === 'login') {
    errors.value.login = form.value.login.trim() ? '' : 'Login yoki email kiritilmagan'
  }
  if (field === 'password') {
    errors.value.password = form.value.password ? '' : 'Parol kiritilmagan'
  }
}

const validateAll = () => {
  validate('login')
  validate('password')
  return !errors.value.login && !errors.value.password
}

// ─── Demo fill ────────────────────────────────────────────────
const fillDemo = () => {
  form.value.login    = 'Admin'
  form.value.password = 'admin123'
  errors.value.login  = ''
  errors.value.password = ''
}

// ─── Login submit ─────────────────────────────────────────────
const handleLogin = async () => {
  if (!validateAll()) return

  isLoading.value = true
  authError.value = ''

  try {
    const data = await api.login(form.value.login, form.value.password)
    localStorage.setItem('wt_token', data.token)
    localStorage.setItem('wt_user', JSON.stringify({
      id:       data.id,
      name:     data.fullname,
      username: data.username,
      role:     data.role,
    }))
    router.push('/')
  } catch (err) {
    authError.value = err.message || "Login yoki parol noto'g'ri!"
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ── ROOT ───────────────────────────────────────────────────── */
.login-root {
  display: flex;
  min-height: 100vh;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f6fa;
  color: #111827;
  --acc: #7c3aed;
  --acc2: #6d28d9;
}

/* ── LEFT PANEL ─────────────────────────────────────────────── */
.left-panel {
  flex: 1;
  position: relative;
  background: linear-gradient(145deg, #4c1d95 0%, #7c3aed 45%, #a855f7 100%);
  display: flex;
  align-items: stretch;
  overflow: hidden;
}

/* Decorative blobs */
.left-panel::before,
.left-panel::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  pointer-events: none;
}
.left-panel::before { width: 420px; height: 420px; top: -120px; right: -140px; }
.left-panel::after  { width: 300px; height: 300px; bottom: -80px; left: -100px; }

.left-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 100%);
}

.left-content {
  position: relative;
  z-index: 1;
  padding: 48px 52px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  justify-content: center;
  color: #fff;
  max-width: 520px;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
}
.brand-name {
  font-size: 20px;
  font-weight: 400;
  color: rgba(255,255,255,0.9);
  letter-spacing: -0.3px;
}
.brand-name strong { font-weight: 800; color: #fff; }

/* Hero */
.hero-title {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.5px;
  color: #fff;
  margin: 0;
}
.hero-sub {
  margin: 12px 0 0;
  font-size: 15px;
  line-height: 1.65;
  color: rgba(255,255,255,0.75);
}

/* Features */
.feature-list {
  list-style: none;
  padding: 0; margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: rgba(255,255,255,0.88);
}
.f-ico {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: #fff;
}

/* Stats row */
.stats-row {
  display: flex;
  gap: 28px;
  border-top: 1px solid rgba(255,255,255,0.15);
  padding-top: 24px;
}
.mini-stat { display: flex; flex-direction: column; gap: 3px; }
.ms-val    { font-size: 22px; font-weight: 800; color: #fff; }
.ms-lbl    { font-size: 11px; color: rgba(255,255,255,0.6); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }

/* ── RIGHT PANEL ─────────────────────────────────────────────── */
.right-panel {
  width: 480px;
  flex-shrink: 0;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  position: relative;
  min-height: 100vh;
}

.theme-toggle {
  position: absolute;
  top: 20px; right: 20px;
  width: 36px; height: 36px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fafafa;
  color: #6b7280;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.theme-toggle:hover { background: #f3f4f6; color: #111827; }

.right-footer {
  position: absolute;
  bottom: 20px;
  font-size: 11px;
  color: #9ca3af;
}

/* ── FORM CARD ──────────────────────────────────────────────── */
.form-card {
  width: 100%;
  max-width: 360px;
}

.card-top { text-align: center; margin-bottom: 28px; }
.card-logo {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: #ede9fe;
  color: var(--acc);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px;
}
.card-title { margin: 0 0 6px; font-size: 22px; font-weight: 700; color: #111827; }
.card-sub   { margin: 0; font-size: 13px; color: #6b7280; }

/* ── LOGIN FORM ─────────────────────────────────────────────── */
.login-form { display: flex; flex-direction: column; gap: 16px; }

.field-group { display: flex; flex-direction: column; gap: 5px; }
.field-group label { font-size: 12px; font-weight: 600; color: #374151; }

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inp-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fafafa;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.inp-wrap.focused {
  border-color: var(--acc);
  box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
  background: #fff;
}
.has-error .inp-wrap {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220,38,38,0.08);
}
.inp-ico { color: #9ca3af; flex-shrink: 0; }
.inp-wrap.focused .inp-ico { color: var(--acc); }

.inp-wrap input {
  flex: 1; border: none; outline: none;
  background: transparent;
  font-size: 13px; color: #111827;
  font-family: inherit;
}
.inp-wrap input::placeholder { color: #d1d5db; }

.pwd-toggle {
  background: none; border: none;
  cursor: pointer; color: #9ca3af;
  display: flex; align-items: center;
  padding: 0; transition: color 0.15s;
}
.pwd-toggle:hover { color: var(--acc); }

.req { color: #dc2626; margin-left: 2px; }

.err-msg { font-size: 11px; color: #dc2626; font-weight: 500; margin-top: 1px; }

.forgot-link {
  background: none; border: none;
  font-size: 12px; color: var(--acc);
  cursor: pointer; font-weight: 600;
  padding: 0; transition: opacity 0.15s;
}
.forgot-link:hover { opacity: 0.75; }

/* Remember me */
.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.check-box {
  width: 16px; height: 16px;
  border-radius: 4px;
  cursor: pointer;
  accent-color: var(--acc);
}
.check-label { font-size: 13px; color: #374151; }

/* Error banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  color: #991b1b;
}
.error-banner span { flex: 1; }
.error-banner button {
  background: none; border: none;
  cursor: pointer; color: #ef4444;
  display: flex; align-items: center;
  padding: 0;
}

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.22s ease; }
.slide-down-enter-from, .slide-down-leave-to       { opacity: 0; transform: translateY(-8px); max-height: 0; }

/* Login button */
.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--acc);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  font-family: inherit;
  letter-spacing: 0.1px;
}
.login-btn:hover:not(:disabled) {
  background: var(--acc2);
  box-shadow: 0 4px 14px rgba(124,58,237,0.35);
  transform: translateY(-1px);
}
.login-btn:active:not(:disabled) { transform: translateY(0); }
.login-btn.loading { opacity: 0.8; cursor: wait; }
.login-btn:disabled { cursor: not-allowed; }
.login-btn.sm { padding: 9px 18px; font-size: 13px; }

.spin-ico { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Spin transition for icon swap */
.spin-enter-active, .spin-leave-active { transition: all 0.2s ease; }
.spin-enter-from { opacity: 0; transform: rotate(-90deg) scale(0.8); }
.spin-leave-to   { opacity: 0; transform: rotate(90deg) scale(0.8); }

/* Demo hint */
.demo-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: 1px dashed #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  color: #9ca3af;
  background: #fafafa;
}
.demo-lbl { font-weight: 500; }
.demo-fill {
  background: none; border: none;
  color: var(--acc);
  font-size: 12px; font-weight: 700;
  cursor: pointer; padding: 0;
  transition: opacity 0.15s;
  font-family: monospace;
}
.demo-fill:hover { opacity: 0.75; }

/* ── FORGOT MODAL ───────────────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  padding: 16px;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.forgot-modal {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  padding: 24px;
  width: 100%;
  max-width: 380px;
  animation: modal-in 0.2s ease;
}
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.fm-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
}
.fm-head h3 { margin: 0; font-size: 16px; font-weight: 700; color: #111827; }
.fm-close {
  background: #f3f4f6; border: none;
  border-radius: 7px; width: 30px; height: 30px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: #6b7280; transition: all 0.15s;
}
.fm-close:hover { background: #e5e7eb; color: #111827; }
.fm-desc  { font-size: 13px; color: #6b7280; margin-bottom: 16px; line-height: 1.5; }
.fm-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }

.cancel-btn {
  border: 1px solid #e5e7eb; background: #fafafa;
  color: #374151; border-radius: 8px; padding: 9px 16px;
  font-size: 13px; cursor: pointer; transition: all 0.15s;
  font-family: inherit;
}
.cancel-btn:hover { background: #f3f4f6; }

.fm-success {
  text-align: center;
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 10px 0;
}
.success-ico { color: #059669; }
.fm-success h4 { margin: 0; font-size: 17px; font-weight: 700; color: #111827; }
.fm-success p  { margin: 0; font-size: 13px; color: #6b7280; line-height: 1.5; }

/* ── DARK MODE ──────────────────────────────────────────────── */
.dark .right-panel         { background: #1a1a2e; }
.dark .card-title          { color: #f9fafb; }
.dark .card-sub            { color: #9ca3af; }
.dark .field-group label   { color: #d1d5db; }
.dark .inp-wrap            { background: #111827; border-color: #374151; }
.dark .inp-wrap.focused    { background: #1f2937; border-color: #7c3aed; }
.dark .inp-wrap input      { color: #f9fafb; }
.dark .inp-ico             { color: #6b7280; }
.dark .check-label         { color: #d1d5db; }
.dark .demo-hint           { background: #111827; border-color: #374151; color: #6b7280; }
.dark .theme-toggle        { background: #1f2937; border-color: #374151; color: #9ca3af; }
.dark .theme-toggle:hover  { background: #374151; color: #f9fafb; }
.dark .right-footer        { color: #4b5563; }
.dark .forgot-modal        { background: #1f2937; }
.dark .fm-head h3          { color: #f9fafb; }
.dark .fm-close            { background: #374151; color: #9ca3af; }
.dark .fm-close:hover      { background: #4b5563; color: #f9fafb; }
.dark .fm-desc             { color: #9ca3af; }
.dark .fm-success h4       { color: #f9fafb; }
.dark .inp-wrap input::placeholder { color: #4b5563; }
.dark .cancel-btn          { background: #374151; border-color: #4b5563; color: #d1d5db; }
.dark .card-logo           { background: rgba(124,58,237,0.2); }
.dark .has-error .inp-wrap { box-shadow: 0 0 0 3px rgba(220,38,38,0.15); }

/* ── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 900px) {
  .left-panel { display: none; }
  .right-panel { width: 100%; }
}
@media (max-width: 480px) {
  .right-panel { padding: 32px 20px; }
  .form-card { max-width: 100%; }
}
</style>
