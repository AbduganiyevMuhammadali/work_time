<template>
  <div class="login-root" :class="{ dark: darkMode }">

    <!-- ── ANIMATED BACKGROUND ──────────────────────────────── -->
    <div class="bg-mesh">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <!-- ── LEFT PANEL ────────────────────────────────────────── -->
    <div class="left-panel">
      <div class="left-inner">

        <!-- Brand -->
        <div class="brand">
          <div class="brand-icon">
            <Cpu :size="20" />
          </div>
          <span class="brand-name">Work<strong>Time</strong></span>
        </div>

        <!-- Hero -->
        <div class="hero">
          <div class="hero-badge">
            <Sparkles :size="12" />
            <span>Aqlli HR tizimi</span>
          </div>
          <h1 class="hero-title">
            Kadrlar boshqaruvi<br>
            <span class="gradient-text">yangi darajada</span>
          </h1>
          <p class="hero-sub">
            Xodimlar, davomat, maosh va ta'tillarni bitta tizimda
            boshqaring — tez, qulay, ishonchli.
          </p>
        </div>

        <!-- Feature cards -->
        <div class="feature-grid">
          <div class="feat-card" v-for="f in features" :key="f.label">
            <div class="feat-icon">
              <component :is="f.icon" :size="16" />
            </div>
            <div>
              <div class="feat-title">{{ f.title }}</div>
              <div class="feat-sub">{{ f.label }}</div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-bar">
          <div class="stat-item" v-for="s in miniStats" :key="s.label">
            <span class="stat-val">{{ s.val }}</span>
            <span class="stat-lbl">{{ s.label }}</span>
          </div>
          <div class="stat-div"></div>
          <div class="stat-live">
            <span class="live-dot"></span>
            <span>Jonli tizim</span>
          </div>
        </div>

      </div>
    </div>

    <!-- ── RIGHT PANEL ────────────────────────────────────────── -->
    <div class="right-panel">

      <!-- Top bar -->
      <div class="right-topbar">
        <div class="brand brand-sm">
          <div class="brand-icon sm">
            <Cpu :size="14" />
          </div>
          <span class="brand-name sm">Work<strong>Time</strong></span>
        </div>
        <button class="theme-btn" @click="darkMode = !darkMode">
          <Transition name="flip" mode="out-in">
            <Sun  v-if="darkMode"  key="sun"  :size="15" />
            <Moon v-else           key="moon" :size="15" />
          </Transition>
        </button>
      </div>

      <!-- Glass card -->
      <div class="glass-card">

        <!-- Card top -->
        <div class="card-head">
          <div class="card-avatar">
            <Lock :size="22" />
            <div class="avatar-ring"></div>
          </div>
          <h2 class="card-title">Xush kelibsiz!</h2>
          <p class="card-sub">Hisobingizga kirish uchun ma'lumotlarni kiriting</p>
        </div>

        <!-- Form -->
        <form class="form" @submit.prevent="handleLogin" novalidate>

          <!-- Login -->
          <div class="field" :class="{ error: errors.login, filled: form.login }">
            <label class="field-label">Login</label>
            <div class="field-input" :class="{ focused: focus.login }">
              <span class="field-ico"><User :size="15" /></span>
              <input
                v-model="form.login"
                type="text"
                placeholder="username"
                autocomplete="username"
                @focus="focus.login = true"
                @blur="focus.login = false; validate('login')"
              />
            </div>
            <Transition name="err">
              <span v-if="errors.login" class="field-err">
                <AlertCircle :size="11" /> {{ errors.login }}
              </span>
            </Transition>
          </div>

          <!-- Password -->
          <div class="field" :class="{ error: errors.password, filled: form.password }">
            <div class="field-label-row">
              <label class="field-label">Parol</label>
              <button type="button" class="forgot-btn" @click="showForgot = true">
                Unutdingizmi?
              </button>
            </div>
            <div class="field-input" :class="{ focused: focus.password }">
              <span class="field-ico"><Lock :size="15" /></span>
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                @focus="focus.password = true"
                @blur="focus.password = false; validate('password')"
              />
              <button type="button" class="eye-btn" @click="showPwd = !showPwd" tabindex="-1">
                <Transition name="flip" mode="out-in">
                  <Eye    v-if="!showPwd" key="e"  :size="15" />
                  <EyeOff v-else          key="eo" :size="15" />
                </Transition>
              </button>
            </div>
            <Transition name="err">
              <span v-if="errors.password" class="field-err">
                <AlertCircle :size="11" /> {{ errors.password }}
              </span>
            </Transition>
          </div>

          <!-- Remember -->
          <label class="remember">
            <input type="checkbox" v-model="form.remember" class="checkbox" />
            <span class="checkbox-custom">
              <Check v-if="form.remember" :size="10" />
            </span>
            <span class="remember-text">Meni eslab qol</span>
          </label>

          <!-- Error banner -->
          <Transition name="banner">
            <div v-if="authError" class="err-banner">
              <div class="err-banner-icon"><AlertCircle :size="14" /></div>
              <span>{{ authError }}</span>
              <button type="button" @click="authError = ''">
                <X :size="12" />
              </button>
            </div>
          </Transition>

          <!-- Submit -->
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span class="btn-shine"></span>
            <Transition name="flip" mode="out-in">
              <Loader2 v-if="isLoading" key="l" :size="16" class="spin" />
              <LogIn   v-else           key="i" :size="16" />
            </Transition>
            <span>{{ isLoading ? 'Tekshirilmoqda...' : 'Kirish' }}</span>
          </button>

          <!-- Demo -->
          <button type="button" class="demo-btn" @click="fillDemo">
            <Zap :size="13" />
            <span>Demo: <strong>Admin / admin123</strong></span>
          </button>

        </form>
      </div>

      <p class="footer-txt">&copy; {{ new Date().getFullYear() }} WorkTime — Barcha huquqlar himoyalangan</p>
    </div>

    <!-- ── FORGOT MODAL ───────────────────────────────────────── -->
    <Transition name="fade">
      <div v-if="showForgot" class="modal-bg" @click.self="showForgot = false">
        <div class="modal">
          <div class="modal-head">
            <div class="modal-icon"><KeyRound :size="18" /></div>
            <div>
              <h3>Parolni tiklash</h3>
              <p>Email manzilingizni kiriting</p>
            </div>
            <button class="modal-close" @click="showForgot = false"><X :size="16" /></button>
          </div>

          <template v-if="!forgotSent">
            <div class="field">
              <label class="field-label">Email</label>
              <div class="field-input">
                <span class="field-ico"><Mail :size="15" /></span>
                <input v-model="forgotEmail" type="email" placeholder="email@example.com" />
              </div>
            </div>
            <div class="modal-actions">
              <button class="outline-btn" @click="showForgot = false">Bekor</button>
              <button class="submit-btn sm" @click="sendForgot">
                <Send :size="13" /> Yuborish
              </button>
            </div>
          </template>

          <template v-else>
            <div class="success-state">
              <div class="success-ring">
                <CheckCircle2 :size="32" />
              </div>
              <h4>Xat yuborildi!</h4>
              <p>{{ forgotEmail }} manziliga havolа yuborildi.</p>
              <button class="submit-btn sm" @click="showForgot = false; forgotSent = false">
                Yopish
              </button>
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
  Users, Clock, BarChart2, Shield, Sparkles, Check,
  KeyRound, Zap
} from 'lucide-vue-next'
import { api } from '@/api/api.js'

const router = useRouter()

const darkMode = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

const features = [
  { icon: Users,     title: 'Xodimlar',  label: "To'liq boshqarish" },
  { icon: Clock,     title: 'Davomat',   label: 'Real-vaqt nazorat' },
  { icon: BarChart2, title: 'Hisobot',   label: 'Oylik va avans' },
  { icon: Shield,    title: 'Xavfsizlik', label: 'Himoyalangan tizim' },
]

const miniStats = [
  { val: '500+', label: 'Kompaniya' },
  { val: '12K+', label: 'Xodim' },
  { val: '99.9%', label: 'Uptime' },
]

const form      = ref({ login: '', password: '', remember: false })
const errors    = ref({ login: '', password: '' })
const focus     = ref({ login: false, password: false })
const showPwd   = ref(false)
const isLoading = ref(false)
const authError = ref('')

const showForgot  = ref(false)
const forgotEmail = ref('')
const forgotSent  = ref(false)

const sendForgot = () => { if (forgotEmail.value) forgotSent.value = true }

const validate = (f) => {
  if (f === 'login')    errors.value.login    = form.value.login.trim()  ? '' : "Login kiritilmagan"
  if (f === 'password') errors.value.password = form.value.password      ? '' : "Parol kiritilmagan"
}
const validateAll = () => { validate('login'); validate('password'); return !errors.value.login && !errors.value.password }

const fillDemo = () => {
  form.value.login = 'Admin'; form.value.password = 'admin123'
  errors.value.login = ''; errors.value.password = ''
}

const handleLogin = async () => {
  if (!validateAll()) return
  isLoading.value = true; authError.value = ''
  try {
    const data = await api.login(form.value.login, form.value.password)
    localStorage.setItem('wt_token', data.token)
    localStorage.setItem('wt_user', JSON.stringify({ id: data.id, name: data.fullname, username: data.username, role: data.role }))
    router.push('/')
  } catch (err) {
    authError.value = err.message || "Login yoki parol noto'g'ri!"
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ── TOKENS ─────────────────────────────────────────────────── */
.login-root {
  --acc:     #7c3aed;
  --acc2:    #5b21b6;
  --acc3:    #a78bfa;
  --bg:      #f0f0f7;
  --card-bg: rgba(255,255,255,0.75);
  --border:  rgba(0,0,0,0.08);
  --txt:     #111827;
  --txt2:    #6b7280;
  --inp-bg:  rgba(255,255,255,0.9);
  --inp-border: rgba(0,0,0,0.12);

  display: flex;
  min-height: 100vh;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--txt);
  position: relative;
  overflow: hidden;
}

/* ── DARK ───────────────────────────────────────────────────── */
.dark {
  --bg:      #0d0d1a;
  --card-bg: rgba(255,255,255,0.04);
  --border:  rgba(255,255,255,0.08);
  --txt:     #f1f5f9;
  --txt2:    #94a3b8;
  --inp-bg:  rgba(255,255,255,0.05);
  --inp-border: rgba(255,255,255,0.1);
}

/* ── ANIMATED BG MESH ───────────────────────────────────────── */
.bg-mesh {
  position: fixed; inset: 0;
  pointer-events: none; z-index: 0;
  overflow: hidden;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: drift 18s ease-in-out infinite;
}
.blob-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%);
  top: -200px; left: -150px;
  animation-delay: 0s;
}
.blob-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%);
  bottom: -150px; right: -100px;
  animation-delay: -7s;
}
.blob-3 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%);
  top: 40%; left: 40%;
  animation-delay: -13s;
}
@keyframes drift {
  0%,100% { transform: translate(0,0) scale(1); }
  33%      { transform: translate(30px,-20px) scale(1.05); }
  66%      { transform: translate(-20px,30px) scale(0.96); }
}
.grid-overlay {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px);
  background-size: 44px 44px;
}

/* ── LEFT PANEL ─────────────────────────────────────────────── */
.left-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: 60px 48px;
}
.left-inner {
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Brand */
.brand { display: flex; align-items: center; gap: 10px; }
.brand-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--acc), #6d28d9);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  box-shadow: 0 4px 14px rgba(124,58,237,0.4);
}
.brand-icon.sm { width: 28px; height: 28px; border-radius: 7px; }
.brand-name {
  font-size: 18px; font-weight: 400;
  color: var(--txt2); letter-spacing: -0.3px;
}
.brand-name.sm { font-size: 14px; }
.brand-name strong { font-weight: 800; color: var(--txt); }

/* Hero badge */
.hero-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(124,58,237,0.1);
  border: 1px solid rgba(124,58,237,0.2);
  border-radius: 100px;
  padding: 5px 12px;
  font-size: 12px; font-weight: 600;
  color: var(--acc);
  width: fit-content;
}
.dark .hero-badge { background: rgba(124,58,237,0.15); border-color: rgba(124,58,237,0.3); }

.hero-title {
  font-size: 42px; font-weight: 800;
  line-height: 1.15; letter-spacing: -1px;
  color: var(--txt); margin: 14px 0 0;
}
.gradient-text {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6366f1 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub {
  margin: 14px 0 0;
  font-size: 15px; line-height: 1.7;
  color: var(--txt2);
}

/* Feature grid */
.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.feat-card {
  display: flex; align-items: center; gap: 12px;
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.feat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
.feat-icon {
  width: 34px; height: 34px; flex-shrink: 0;
  background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(167,139,250,0.1));
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  color: var(--acc);
}
.feat-title { font-size: 12px; font-weight: 700; color: var(--txt); }
.feat-sub   { font-size: 11px; color: var(--txt2); margin-top: 1px; }

/* Stats bar */
.stats-bar {
  display: flex; align-items: center; gap: 28px;
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px 24px;
}
.stat-item { display: flex; flex-direction: column; gap: 2px; }
.stat-val  { font-size: 20px; font-weight: 800; color: var(--txt); letter-spacing: -0.5px; }
.stat-lbl  { font-size: 11px; font-weight: 500; color: var(--txt2); text-transform: uppercase; letter-spacing: 0.5px; }
.stat-div  { flex: 1; }
.stat-live {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 600; color: #10b981;
}
.live-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16,185,129,0.2);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
  50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0.08); }
}

/* ── RIGHT PANEL ─────────────────────────────────────────────── */
.right-panel {
  width: 500px; flex-shrink: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 40px 40px;
  position: relative; z-index: 1;
  min-height: 100vh;
}

.right-topbar {
  position: absolute; top: 24px; left: 32px; right: 32px;
  display: flex; align-items: center; justify-content: space-between;
}

.theme-btn {
  width: 36px; height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--inp-bg);
  color: var(--txt2);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.18s;
  backdrop-filter: blur(8px);
}
.theme-btn:hover { color: var(--txt); border-color: var(--acc); }

/* Glass card */
.glass-card {
  width: 100%; max-width: 400px;
  background: var(--card-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 36px;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.08) inset,
    0 24px 64px rgba(0,0,0,0.1),
    0 8px 24px rgba(124,58,237,0.06);
}
.dark .glass-card {
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.05) inset,
    0 24px 64px rgba(0,0,0,0.4),
    0 8px 24px rgba(124,58,237,0.1);
}

/* Card head */
.card-head { text-align: center; margin-bottom: 32px; }
.card-avatar {
  position: relative;
  width: 60px; height: 60px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(167,139,250,0.1));
  border: 1px solid rgba(124,58,237,0.2);
  display: flex; align-items: center; justify-content: center;
  color: var(--acc);
  margin: 0 auto 16px;
}
.avatar-ring {
  position: absolute; inset: -6px;
  border-radius: 22px;
  border: 2px dashed rgba(124,58,237,0.2);
  animation: ring-spin 12s linear infinite;
}
@keyframes ring-spin { to { transform: rotate(360deg); } }

.card-title { font-size: 24px; font-weight: 800; color: var(--txt); margin: 0 0 6px; letter-spacing: -0.5px; }
.card-sub   { font-size: 13px; color: var(--txt2); margin: 0; line-height: 1.5; }

/* ── FORM ───────────────────────────────────────────────────── */
.form { display: flex; flex-direction: column; gap: 18px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--txt); }
.field-label-row { display: flex; justify-content: space-between; align-items: center; }

.field-input {
  display: flex; align-items: center; gap: 10px;
  background: var(--inp-bg);
  border: 1.5px solid var(--inp-border);
  border-radius: 12px;
  padding: 11px 14px;
  transition: all 0.18s;
  backdrop-filter: blur(4px);
}
.field-input.focused {
  border-color: var(--acc);
  box-shadow: 0 0 0 4px rgba(124,58,237,0.1);
  background: rgba(255,255,255,0.95);
}
.dark .field-input.focused {
  background: rgba(255,255,255,0.08);
  box-shadow: 0 0 0 4px rgba(124,58,237,0.15);
}
.field.error .field-input {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239,68,68,0.08);
}
.field-ico { color: var(--txt2); flex-shrink: 0; display: flex; }
.field-input.focused .field-ico { color: var(--acc); }

.field-input input {
  flex: 1; border: none; outline: none;
  background: transparent;
  font-size: 14px; color: var(--txt);
  font-family: inherit;
}
.field-input input::placeholder { color: rgba(107,114,128,0.5); }

.field-err {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 500; color: #ef4444;
}
.err-enter-active, .err-leave-active { transition: all 0.18s; }
.err-enter-from, .err-leave-to { opacity: 0; transform: translateY(-4px); }

.forgot-btn {
  background: none; border: none;
  font-size: 12px; color: var(--acc);
  cursor: pointer; font-weight: 600;
  padding: 0; transition: opacity 0.15s;
  font-family: inherit;
}
.forgot-btn:hover { opacity: 0.7; }

.eye-btn {
  background: none; border: none;
  cursor: pointer; color: var(--txt2);
  display: flex; padding: 0; transition: color 0.15s;
}
.eye-btn:hover { color: var(--acc); }

/* Remember */
.remember {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; user-select: none;
}
.checkbox { display: none; }
.checkbox-custom {
  width: 18px; height: 18px; flex-shrink: 0;
  border-radius: 5px;
  border: 1.5px solid var(--inp-border);
  background: var(--inp-bg);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  color: #fff;
}
.remember input:checked + .checkbox-custom {
  background: var(--acc);
  border-color: var(--acc);
}
.remember-text { font-size: 13px; color: var(--txt2); }

/* Error banner */
.err-banner {
  display: flex; align-items: center; gap: 10px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 13px; color: #ef4444;
}
.err-banner-icon { display: flex; flex-shrink: 0; }
.err-banner span { flex: 1; }
.err-banner button { background: none; border: none; cursor: pointer; color: #ef4444; display: flex; }
.banner-enter-active, .banner-leave-active { transition: all 0.22s; }
.banner-enter-from, .banner-leave-to { opacity: 0; transform: translateY(-6px); }

/* Submit button */
.submit-btn {
  position: relative;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: #fff; border: none; border-radius: 12px;
  padding: 13px 20px;
  font-size: 14px; font-weight: 700;
  cursor: pointer; overflow: hidden;
  transition: all 0.2s;
  font-family: inherit; letter-spacing: 0.1px;
  box-shadow: 0 4px 14px rgba(124,58,237,0.3);
}
.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
  box-shadow: 0 6px 20px rgba(124,58,237,0.45);
  transform: translateY(-1px);
}
.submit-btn:active:not(:disabled) { transform: translateY(0); box-shadow: 0 2px 8px rgba(124,58,237,0.3); }
.submit-btn:disabled { opacity: 0.7; cursor: wait; }
.submit-btn.sm { padding: 10px 20px; font-size: 13px; }
.btn-shine {
  position: absolute; top: 0; left: -100%;
  width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  animation: shine 3s ease-in-out infinite;
}
@keyframes shine {
  0%   { left: -100%; }
  20%  { left: 150%; }
  100% { left: 150%; }
}

/* Demo button */
.demo-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: none;
  border: 1.5px dashed var(--inp-border);
  border-radius: 12px;
  padding: 10px;
  font-size: 12px; color: var(--txt2);
  cursor: pointer; font-family: inherit;
  transition: all 0.18s;
}
.demo-btn:hover {
  border-color: var(--acc);
  color: var(--acc);
  background: rgba(124,58,237,0.05);
}
.demo-btn strong { font-weight: 700; color: var(--acc); }

.spin { animation: spin360 0.8s linear infinite; }
@keyframes spin360 { to { transform: rotate(360deg); } }

/* Flip transition */
.flip-enter-active, .flip-leave-active { transition: all 0.18s ease; }
.flip-enter-from { opacity: 0; transform: scale(0.6) rotate(-30deg); }
.flip-leave-to   { opacity: 0; transform: scale(0.6) rotate(30deg); }

/* Footer */
.footer-txt {
  position: absolute; bottom: 20px;
  font-size: 11px; color: var(--txt2);
  text-align: center; opacity: 0.6;
}

/* ── MODAL ──────────────────────────────────────────────────── */
.modal-bg {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.modal {
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 28px;
  width: 100%; max-width: 380px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.2);
  animation: modal-up 0.22s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes modal-up {
  from { opacity: 0; transform: scale(0.94) translateY(16px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-head { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.modal-icon {
  width: 40px; height: 40px; flex-shrink: 0;
  border-radius: 12px;
  background: rgba(124,58,237,0.12);
  color: var(--acc);
  display: flex; align-items: center; justify-content: center;
}
.modal-head h3  { margin: 0 0 2px; font-size: 16px; font-weight: 700; color: var(--txt); }
.modal-head p   { margin: 0; font-size: 12px; color: var(--txt2); }
.modal-close {
  margin-left: auto; width: 30px; height: 30px;
  border-radius: 8px; border: 1px solid var(--border);
  background: var(--inp-bg); color: var(--txt2);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.modal-close:hover { color: var(--txt); border-color: var(--txt2); }

.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }
.outline-btn {
  border: 1.5px solid var(--border); background: var(--inp-bg);
  color: var(--txt); border-radius: 10px; padding: 10px 18px;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s;
  font-family: inherit;
}
.outline-btn:hover { border-color: var(--txt2); }

.success-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 8px 0; text-align: center;
}
.success-ring {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: rgba(16,185,129,0.1);
  border: 2px solid rgba(16,185,129,0.2);
  display: flex; align-items: center; justify-content: center;
  color: #10b981;
}
.success-state h4 { margin: 0; font-size: 18px; font-weight: 800; color: var(--txt); }
.success-state p  { margin: 0; font-size: 13px; color: var(--txt2); line-height: 1.5; }

/* ── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 960px) {
  .left-panel { display: none; }
  .right-panel { width: 100%; padding: 32px 24px; }
}
@media (max-width: 480px) {
  .glass-card { padding: 24px 20px; }
  .hero-title { font-size: 32px; }
}
</style>
