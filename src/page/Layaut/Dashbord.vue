<script setup>
import { ref, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  CalendarCheck2,
  Calendar1,
  UserRoundCheck,
  BadgeDollarSign,
  Wallet,
  MessageSquare,
  Settings,
  Bell,
  Search,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  Cpu,
  CalendarOff,
  Menu,
  X,
  UsersRound
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const darkMode = ref(false)
const notifCount = ref(5)
const searchQuery = ref('')
const sidebarOpen = ref(false)

provide('darkMode', darkMode)

const navSections = [
  {
    label: 'ASOSIY',
    items: [
      { to: '/',         icon: LayoutDashboard, label: 'Dashboard',         badge: null },
      { to: '/davomat',  icon: CalendarCheck2,  label: 'Davomat',           badge: null },
      { to: '/kalendar', icon: Calendar1,        label: 'Kalendar',          badge: null },
    ]
  },
  {
    label: 'BOSHQARUV',
    items: [
      { to: '/xodimlar', icon: UserRoundCheck,   label: 'Xodimlar',          badge: null },
      { to: '/oylik',    icon: BadgeDollarSign,  label: 'Oylik & Jarimalar', badge: null },
      { to: '/avanslar', icon: Wallet,           label: 'Avanslar',          badge: null },
      { to: '/tatil',    icon: CalendarOff,      label: "Ta'til so'rovlari", badge: 3    },
      { to: '/chat',     icon: MessageSquare,    label: 'Chat',              badge: 3    },
    ]
  },
  {
    label: 'TIZIM',
    items: [
      { to: '/users',    icon: UsersRound,      label: 'Foydalanuvchilar',  badge: null, adminOnly: true },
      { to: '/settings', icon: Settings,         label: 'Sozlamalar',        badge: null },
    ]
  }
]

// Bottom navigation — eng ko'p ishlatiladigan sahifalar
const bottomNavItems = [
  { to: '/',         icon: LayoutDashboard, label: 'Bosh' },
  { to: '/davomat',  icon: CalendarCheck2,  label: 'Davomat' },
  { to: '/xodimlar', icon: UserRoundCheck,  label: 'Xodimlar' },
  { to: '/chat',     icon: MessageSquare,   label: 'Chat', badge: 3 },
]

// localStorage dan real user ma'lumotlari
const _u = JSON.parse(localStorage.getItem('wt_user') || '{}')
const userProfile = {
  name:     _u.name     || 'Foydalanuvchi',
  role:     _u.role     || '',
  initials: (_u.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
  color:    _u.role === 'Admin' ? '#7c3aed' : _u.role === 'HR' ? '#0891b2' : '#059669'
}

// Route o'zgarganda sidebarni yopish
watch(() => route.path, () => { sidebarOpen.value = false })

function isActive(path) {
  return route.path === path
}

function logout() {
  localStorage.removeItem('wt_token')
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="layout" :class="{ dark: darkMode }">

    <!-- ─── Mobile overlay ─── -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="sidebar-overlay"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- ─── Sidebar ─── -->
    <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">

      <!-- Logo + close button (mobile) -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <Cpu size="18" color="#fff" />
        </div>
        <span class="logo-text">Work<strong>Time</strong></span>
        <button class="sidebar-close" @click="sidebarOpen = false">
          <X size="18" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div v-for="section in navSections" :key="section.label" class="nav-section">
          <p class="nav-label">{{ section.label }}</p>
          <router-link
            v-for="item in section.items"
            v-show="!item.adminOnly || userProfile.role === 'Admin'"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            :class="{ active: isActive(item.to) }"
          >
            <span class="nav-icon">
              <component :is="item.icon" size="17" />
            </span>
            <span class="nav-text">{{ item.label }}</span>
            <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
          </router-link>
        </div>
      </nav>

      <!-- User Profile -->
      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar" :style="{ background: userProfile.color }">
            {{ userProfile.initials }}
          </div>
          <div class="user-info">
            <p class="user-name">{{ userProfile.name }}</p>
            <p class="user-role">{{ userProfile.role }}</p>
          </div>
          <button class="logout-btn" title="Chiqish" @click="logout">
            <LogOut size="15" />
          </button>
        </div>
      </div>

    </aside>

    <!-- ─── Main ─── -->
    <div class="main-wrap">

      <!-- Navbar -->
      <header class="navbar">
        <!-- Hamburger (mobile) -->
        <button class="hamburger" @click="sidebarOpen = true">
          <Menu size="20" />
        </button>

        <!-- Logo (mobile only, in navbar) -->
        <div class="navbar-logo-mobile">
          <div class="logo-icon-sm">
            <Cpu size="14" color="#fff" />
          </div>
          <span class="logo-text-sm">Work<strong>Time</strong></span>
        </div>

        <div class="search-box">
          <Search size="15" class="search-icon-inner" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Qidirish..."
            class="search-input"
          />
          <kbd class="kbd">⌘K</kbd>
        </div>

        <div class="navbar-right">
          <button
            class="icon-btn theme-btn"
            @click="darkMode = !darkMode"
            :title="darkMode ? 'Yorug\' rejim' : 'Qorong\'u rejim'"
          >
            <Transition name="spin" mode="out-in">
              <Sun v-if="darkMode" key="sun" size="18" />
              <Moon v-else key="moon" size="18" />
            </Transition>
          </button>

          <button class="icon-btn notif-btn">
            <Bell size="18" />
            <span v-if="notifCount" class="notif-dot">{{ notifCount }}</span>
          </button>

          <div class="nav-divider"></div>

          <div class="nav-user">
            <div class="nav-avatar" :style="{ background: userProfile.color }">
              {{ userProfile.initials }}
            </div>
            <div class="nav-user-info">
              <p class="nav-user-name">{{ userProfile.name }}</p>
              <p class="nav-user-role">{{ userProfile.role }}</p>
            </div>
            <ChevronDown size="14" class="nav-chevron" />
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="page-content">
        <router-view />
      </main>

      <!-- ─── Bottom navigation (mobile only) ─── -->
      <nav class="bottom-nav">
        <router-link
          v-for="item in bottomNavItems"
          :key="item.to"
          :to="item.to"
          class="bottom-nav-item"
          :class="{ active: isActive(item.to) }"
        >
          <span class="bottom-nav-icon">
            <component :is="item.icon" size="21" />
            <span v-if="item.badge" class="bottom-badge">{{ item.badge }}</span>
          </span>
          <span class="bottom-nav-label">{{ item.label }}</span>
        </router-link>

        <!-- Menu tugmasi -->
        <button
          class="bottom-nav-item"
          :class="{ active: sidebarOpen }"
          @click="sidebarOpen = true"
        >
          <span class="bottom-nav-icon">
            <Menu size="21" />
          </span>
          <span class="bottom-nav-label">Menu</span>
        </button>
      </nav>

    </div>
  </div>
</template>

<style scoped>
/* ════════════════════════════════════════
   CSS DESIGN TOKENS — Light theme
   ════════════════════════════════════════ */
.layout {
  --bg:        #f5f6fa;
  --surface:   #ffffff;
  --surface2:  #fafafa;
  --border:    #e5e7eb;
  --border2:   #f3f4f6;
  --t1:  #111827;
  --t2:  #374151;
  --t3:  #6b7280;
  --t4:  #9ca3af;
  --t5:  #d1d5db;
  --accent:    #7c3aed;
  --accent2:   #8b5cf6;
  --accent-bg: #ede9fe;
  --accent-hv: #f5f3ff;
  --accent-br: #c4b5fd;
  --shadow-sm: rgba(0, 0, 0, 0.05);
  --shadow-md: rgba(0, 0, 0, 0.09);
  --logout-hv-bg:    #fee2e2;
  --logout-hv-color: #dc2626;
  --notif-border:    #ffffff;
}

/* ════════════════════════════════════════
   CSS DESIGN TOKENS — Dark theme
   ════════════════════════════════════════ */
.layout.dark {
  --bg:        #0f0e1b;
  --surface:   #19182a;
  --surface2:  #201f33;
  --border:    #2c2a42;
  --border2:   #252340;
  --t1:  #ede9ff;
  --t2:  #c4bfdd;
  --t3:  #7b788e;
  --t4:  #4f4d62;
  --t5:  #34324a;
  --accent:    #a78bfa;
  --accent2:   #8b5cf6;
  --accent-bg: rgba(139, 92, 246, 0.18);
  --accent-hv: rgba(139, 92, 246, 0.12);
  --accent-br: rgba(167, 139, 250, 0.4);
  --shadow-sm: rgba(0, 0, 0, 0.3);
  --shadow-md: rgba(0, 0, 0, 0.45);
  --logout-hv-bg:    rgba(239, 68, 68, 0.15);
  --logout-hv-color: #f87171;
  --notif-border:    #19182a;
}

/* ════════════════════════════════════════
   Base
   ════════════════════════════════════════ */
* { box-sizing: border-box; }

.layout {
  display: flex;
  height: 100vh;
  background: var(--bg);
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  color: var(--t1);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* ════════════════════════════════════════
   Mobile overlay
   ════════════════════════════════════════ */
.sidebar-overlay {
  display: none;
}

/* ════════════════════════════════════════
   Sidebar
   ════════════════════════════════════════ */
.sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  box-shadow: 2px 0 16px var(--shadow-sm);
}

.sidebar-close { display: none; }

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 20px 18px;
  border-bottom: 1px solid var(--border2);
  transition: border-color 0.3s ease;
}

.logo-icon {
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
}

.logo-text {
  font-size: 17px;
  color: var(--t1);
  letter-spacing: -0.3px;
  transition: color 0.3s ease;
  flex: 1;
}

.logo-text strong {
  font-weight: 800;
  color: var(--accent);
  transition: color 0.3s ease;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-section { margin-bottom: 8px; }

.nav-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--t5);
  letter-spacing: 0.8px;
  padding: 0 8px 6px;
  margin: 0;
  transition: color 0.3s ease;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--t3);
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-item:hover {
  background: var(--accent-hv);
  color: var(--accent);
}

.nav-item:hover .nav-icon { color: var(--accent); }

.nav-item.active {
  background: linear-gradient(135deg, #7c3aed, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
}

.nav-item.active .nav-icon { color: #fff; }

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  color: var(--t4);
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.nav-text { flex: 1; }

.nav-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ef4444;
  color: #fff;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item.active .nav-badge { background: rgba(255, 255, 255, 0.25); }

/* Sidebar footer */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border2);
  transition: border-color 0.3s ease;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: var(--surface2);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.user-card:hover { background: var(--accent-hv); }

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-info { flex: 1; min-width: 0; }

.user-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--t1);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.user-role {
  font-size: 11px;
  color: var(--t4);
  margin: 0;
  transition: color 0.3s ease;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  border-radius: 8px;
  color: var(--t4);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.logout-btn:hover {
  background: var(--logout-hv-bg);
  color: var(--logout-hv-color);
}

/* ════════════════════════════════════════
   Main wrap
   ════════════════════════════════════════ */
.main-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* ════════════════════════════════════════
   Navbar
   ════════════════════════════════════════ */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  height: 64px;
  flex-shrink: 0;
  gap: 16px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.hamburger {
  display: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  background: none;
  border-radius: 10px;
  color: var(--t3);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.hamburger:hover {
  background: var(--accent-hv);
  color: var(--accent);
}

.navbar-logo-mobile { display: none; }

/* Search */
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0 12px;
  height: 38px;
  width: 320px;
  transition: background-color 0.3s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-box:focus-within {
  border-color: var(--accent-br);
  box-shadow: 0 0 0 3px var(--accent-bg);
  background: var(--surface);
}

.search-icon-inner {
  color: var(--t5);
  flex-shrink: 0;
  transition: color 0.3s ease;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: var(--t2);
  font-family: inherit;
  transition: color 0.3s ease;
}

.search-input::placeholder { color: var(--t4); }

.kbd {
  font-size: 10px;
  color: var(--t4);
  background: var(--border2);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 2px 6px;
  font-family: inherit;
  white-space: nowrap;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

/* Navbar right */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  background: none;
  border-radius: 10px;
  color: var(--t3);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
  position: relative;
}

.icon-btn:hover {
  background: var(--accent-hv);
  color: var(--accent);
}

.spin-enter-active, .spin-leave-active {
  transition: transform 0.25s ease, opacity 0.2s ease;
}
.spin-enter-from {
  transform: rotate(-90deg) scale(0.7);
  opacity: 0;
}
.spin-leave-to {
  transform: rotate(90deg) scale(0.7);
  opacity: 0;
}

.notif-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 16px;
  height: 16px;
  background: #ef4444;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  border: 2px solid var(--notif-border);
  transition: border-color 0.3s ease;
}

.nav-divider {
  width: 1px;
  height: 28px;
  background: var(--border);
  margin: 0 6px;
  transition: background-color 0.3s ease;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.nav-user:hover { background: var(--surface2); }

.nav-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.nav-user-info { line-height: 1; }

.nav-user-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--t1);
  margin: 0 0 2px;
  transition: color 0.3s ease;
}

.nav-user-role {
  font-size: 11px;
  color: var(--t4);
  margin: 0;
  transition: color 0.3s ease;
}

.nav-chevron {
  color: var(--t4);
  transition: color 0.3s ease;
}

/* ════════════════════════════════════════
   Page content
   ════════════════════════════════════════ */
.page-content {
  flex: 1;
  overflow-y: auto;
}

/* ════════════════════════════════════════
   Bottom nav (desktop: hidden)
   ════════════════════════════════════════ */
.bottom-nav { display: none; }

/* ════════════════════════════════════════
   Transitions
   ════════════════════════════════════════ */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ════════════════════════════════════════
   MOBILE — max-width: 768px
   ════════════════════════════════════════ */
@media (max-width: 768px) {

  /* Sidebar: fixed overlay, slides from left */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition:
      transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
      background-color 0.3s ease,
      border-color 0.3s ease;
    min-width: 260px;
    width: 260px;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.18);
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  /* Close button inside sidebar header */
  .sidebar-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: none;
    background: none;
    border-radius: 8px;
    color: var(--t4);
    cursor: pointer;
    margin-left: auto;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .sidebar-close:hover {
    background: var(--accent-hv);
    color: var(--accent);
  }

  /* Overlay behind sidebar */
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 199;
    backdrop-filter: blur(2px);
  }

  /* Main wrap: full width */
  .main-wrap {
    width: 100%;
  }

  /* Navbar */
  .navbar {
    padding: 0 12px;
    gap: 8px;
  }

  .hamburger {
    display: flex;
  }

  /* Logo in navbar (mobile only) */
  .navbar-logo-mobile {
    display: flex;
    align-items: center;
    gap: 7px;
    flex: 1;
  }

  .logo-icon-sm {
    width: 26px;
    height: 26px;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 3px 8px rgba(124, 58, 237, 0.35);
  }

  .logo-text-sm {
    font-size: 15px;
    color: var(--t1);
    letter-spacing: -0.3px;
    transition: color 0.3s ease;
  }

  .logo-text-sm strong {
    font-weight: 800;
    color: var(--accent);
  }

  /* Hide search on small mobile */
  .search-box {
    display: none;
  }

  /* Hide user info text in navbar */
  .nav-user-info,
  .nav-chevron,
  .nav-divider {
    display: none;
  }

  .nav-user {
    padding: 6px;
  }

  /* Page content: bottom padding for bottom nav */
  .page-content {
    padding-bottom: 64px;
  }

  /* Bottom nav */
  .bottom-nav {
    display: flex;
    align-items: center;
    justify-content: space-around;
    background: var(--surface);
    border-top: 1px solid var(--border);
    height: 64px;
    flex-shrink: 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 0 4px;
    transition: background-color 0.3s ease, border-color 0.3s ease;
    box-shadow: 0 -4px 20px var(--shadow-sm);
  }

  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    flex: 1;
    padding: 8px 4px;
    border: none;
    background: none;
    border-radius: 12px;
    color: var(--t4);
    text-decoration: none;
    font-family: inherit;
    cursor: pointer;
    transition: color 0.15s ease, background-color 0.15s ease;
    position: relative;
  }

  .bottom-nav-item.active {
    color: var(--accent);
  }

  .bottom-nav-item.active .bottom-nav-icon::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background: var(--accent);
    border-radius: 50%;
  }

  .bottom-nav-icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bottom-badge {
    position: absolute;
    top: -5px;
    right: -8px;
    min-width: 16px;
    height: 16px;
    background: #ef4444;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
    border: 2px solid var(--surface);
  }

  .bottom-nav-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }
}

/* ════════════════════════════════════════
   TABLET — 769px to 1024px
   ════════════════════════════════════════ */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 200px;
    min-width: 200px;
  }

  .search-box {
    width: 220px;
  }

  .nav-user-info { display: none; }
  .nav-chevron { display: none; }
}
</style>
