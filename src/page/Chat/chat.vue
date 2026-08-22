<template>
  <div class="chat-page">

    <!-- ── LEFT: Conversations ──────────────────────────────── -->
    <div class="chat-sidebar">

      <div class="cs-head">
        <div>
          <h2 class="cs-title">Xabarlar</h2>
          <p class="cs-sub">{{ onlineCount }} kishi online</p>
        </div>
      </div>

      <!-- WebSocket status -->
      <div class="ws-bar" :class="wsConnected ? 'ws-on' : 'ws-off'">
        <span class="ws-dot"></span>
        <span>{{ wsConnected ? 'Server bilan ulangan' : 'Ulanmoqda...' }}</span>
      </div>

      <!-- Search -->
      <div class="cs-search">
        <Search :size="13" class="s-ico" />
        <input v-model="searchQ" placeholder="Xodim qidirish..." />
      </div>

      <!-- Loading skeleton -->
      <div v-if="loadingUsers" class="conv-list">
        <div v-for="i in 5" :key="i" class="conv-item sk-row">
          <div class="sk-av"></div>
          <div class="sk-lines">
            <div class="sk-line sk-name"></div>
            <div class="sk-line sk-msg"></div>
          </div>
        </div>
      </div>

      <!-- Conversation list -->
      <div v-else class="conv-list">
        <div
          v-for="conv in filteredConvs"
          :key="conv.id"
          class="conv-item"
          :class="{ active: activeId === conv.id }"
          @click="selectConv(conv.id)"
        >
          <div class="c-av" :style="avStyle(conv)">
            {{ initials(conv.name) }}
            <span class="s-dot" :class="conv.online ? 's-on' : 's-off'"></span>
          </div>
          <div class="conv-info">
            <div class="conv-r1">
              <span class="conv-name">{{ conv.name }}</span>
              <span class="conv-time">{{ conv.lastTime }}</span>
            </div>
            <div class="conv-r2">
              <span class="conv-last" :class="{ 'fw-6': conv.unread > 0 }">{{ conv.lastMsg }}</span>
              <span v-if="conv.unread" class="unread-dot">{{ conv.unread }}</span>
            </div>
          </div>
        </div>

        <div v-if="filteredConvs.length === 0 && !loadingUsers" class="conv-empty">
          <UserX :size="28" />
          <p>Xodim topilmadi</p>
        </div>
      </div>
    </div>

    <!-- ── RIGHT: Chat window ────────────────────────────────── -->
    <div class="chat-main">

      <!-- Active conversation -->
      <template v-if="activeConv">

        <!-- Chat header -->
        <div class="chat-head">
          <div class="ch-left">
            <div class="c-av" :style="avStyle(activeConv)">
              {{ initials(activeConv.name) }}
              <span class="s-dot" :class="activeConv.online ? 's-on' : 's-off'"></span>
            </div>
            <div class="ch-meta">
              <span class="ch-name">{{ activeConv.name }}</span>
              <span class="ch-pos">{{ activeConv.online ? 'Online' : 'Offline' }}{{ activeConv.department ? ' · ' + activeConv.department : '' }}</span>
            </div>
          </div>
          <div class="ch-right">
            <button class="ch-btn" title="Qidirish" @click="searchInChat = !searchInChat"><Search :size="15" /></button>
            <button class="ch-btn" title="Ko'proq"><MoreVertical :size="15" /></button>
          </div>
        </div>

        <!-- In-chat search bar -->
        <div v-if="searchInChat" class="inchat-search">
          <Search :size="13" />
          <input v-model="chatSearchQ" placeholder="Xabarlarda qidirish..." />
          <button @click="searchInChat = false; chatSearchQ = ''"><X :size="14" /></button>
        </div>

        <!-- Messages area -->
        <div class="messages-area" ref="msgAreaRef">

          <div v-if="loadingMsgs" class="msgs-loading">
            <div v-for="i in 6" :key="i" class="sk-msg-row" :class="i % 2 === 0 ? 'sk-mine' : 'sk-theirs'">
              <div class="sk-msg-bbl"></div>
            </div>
          </div>

          <template v-else>
            <template v-for="(msgs, dateLabel) in groupedMessages" :key="dateLabel">
              <div class="date-sep">
                <span>{{ dateLabel }}</span>
              </div>
              <div
                v-for="msg in msgs"
                :key="msg.id"
                class="msg-wrap"
                :class="msg.mine ? 'mine' : 'theirs'"
              >
                <div v-if="!msg.mine" class="msg-av" :style="avStyle(activeConv)">
                  {{ initials(activeConv.name) }}
                </div>
                <div class="msg-bubble" :class="{ 'hl': chatSearchQ && msg.text.toLowerCase().includes(chatSearchQ.toLowerCase()) }">
                  <p>{{ msg.text }}</p>
                  <div class="msg-footer">
                    <span class="msg-time">{{ msg.time }}</span>
                    <template v-if="msg.mine">
                      <CheckCheck v-if="msg.read" :size="11" class="ico-read" />
                      <Check v-else :size="11" class="ico-sent" />
                    </template>
                  </div>
                </div>
              </div>
            </template>

            <!-- Typing indicator -->
            <div v-if="isTyping" class="msg-wrap theirs">
              <div class="msg-av" :style="avStyle(activeConv)">
                {{ initials(activeConv.name) }}
              </div>
              <div class="msg-bubble typing-bbl">
                <span class="tdot"></span>
                <span class="tdot"></span>
                <span class="tdot"></span>
              </div>
            </div>
          </template>
        </div>

        <!-- Input area -->
        <div class="input-area">
          <div class="inp-wrap">
            <input
              ref="inputRef"
              v-model="newMsg"
              :placeholder="`${activeConv.name}ga xabar yozing...`"
              @keydown.enter.exact.prevent="sendMsg"
            />
          </div>
          <button
            class="send-btn"
            @click="sendMsg"
            :disabled="!newMsg.trim()"
            :class="{ active: newMsg.trim() }"
          >
            <Send :size="15" />
          </button>
        </div>

      </template>

      <!-- No conversation selected -->
      <div v-else class="chat-empty">
        <div class="empty-icon-wrap">
          <MessageSquare :size="44" />
        </div>
        <h3>Suhbatni boshlang</h3>
        <p>Chap paneldan xodimni tanlang va xabar yuboring</p>
      </div>

    </div>

    <!-- ── Toast ──────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast.show" class="chat-toast" :class="'t-' + toast.type">
          {{ toast.msg }}
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import {
  Search, Send, MessageSquare, Check, CheckCheck,
  MoreVertical, UserX, X
} from 'lucide-vue-next'
import { api } from '@/api/api.js'

// ─── Current user (from localStorage) ────────────────────────
const me = (() => {
  try { return JSON.parse(localStorage.getItem('wt_user') || 'null') } catch { return null }
})()
const myId = me?.id || me?.user_id || null

// ─── State ───────────────────────────────────────────────────
const searchQ      = ref('')
const activeId     = ref(null)
const newMsg       = ref('')
const isTyping     = ref(false)
const msgAreaRef   = ref(null)
const inputRef     = ref(null)
const loadingUsers = ref(true)
const loadingMsgs  = ref(false)
const wsConnected  = ref(false)
const searchInChat = ref(false)
const chatSearchQ  = ref('')
let   idSeq        = 10000
let   socket       = null
let   reconnectTimer = null

// ─── Conversations ────────────────────────────────────────────
// Each: { id, name, department, color, online, unread, lastMsg, lastTime, messages[] }
const conversations = ref([])

// ─── Toast ────────────────────────────────────────────────────
const toast = ref({ show: false, msg: '', type: 'info' })
let toastTimer = null
function showToast(msg, type = 'info') {
  clearTimeout(toastTimer)
  toast.value = { show: true, msg, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3500)
}

// ─── Notification & Sound ─────────────────────────────────────
function requestNotifPerm() {
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function notifyNewMessage(conv, text) {
  // Browser notification (only when tab is hidden)
  if (document.hidden && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const n = new Notification(`💬 ${conv.name}`, {
      body: text,
      icon: '/favicon.ico',
      tag:  `chat-${conv.id}`,
    })
    n.onclick = () => { window.focus(); n.close() }
  }

  // Play sound via AudioContext (works without a file)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioCtx = window.AudioContext || /** @type {any} */ (window).webkitAudioContext
    const ctx  = new AudioCtx()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
    osc.onended = () => ctx.close()
  } catch { /* audio not supported */ }
}

// ─── Helpers ──────────────────────────────────────────────────
const initials = (name = '') => name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
const avStyle  = (conv) => ({ background: (conv.color || '#7c3aed') + '22', color: conv.color || '#7c3aed' })

function nowStr() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function fmtTime(iso) {
  if (!iso) return nowStr()
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function dateLabel(iso) {
  if (!iso) return 'Bugun'
  const d     = new Date(iso)
  const today = new Date()
  const yest  = new Date(today); yest.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Bugun'
  if (d.toDateString() === yest.toDateString())  return 'Kecha'
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long' })
}

const scrollBottom = async () => {
  await nextTick()
  if (msgAreaRef.value) msgAreaRef.value.scrollTop = msgAreaRef.value.scrollHeight
}

// ─── Load users ───────────────────────────────────────────────
async function loadUsers() {
  loadingUsers.value = true
  try {
    const users = await api.getUsers()
    const arr   = Array.isArray(users) ? users : []

    // Get unread counts
    let unreadMap = {}
    if (myId) {
      try {
        const r = await api.getChatUnreadCounts(myId)
        unreadMap = r.counts || {}
      } catch { /* ignore */ }
    }

    conversations.value = arr
      .filter(u => u.id !== myId)
      .map(u => ({
        id:         u.id,
        name:       u.fullname || u.username || 'Xodim',
        department: u.department || '',
        color:      u.color || '#7c3aed',
        online:     false,
        unread:     unreadMap[u.id] || 0,
        lastMsg:    '',
        lastTime:   '',
        messages:   [],
        loaded:     false,
      }))
  } catch (e) {
    showToast('Xodimlar yuklanmadi: ' + (e.message || 'xatolik'), 'error')
  } finally {
    loadingUsers.value = false
  }
}

// ─── Load message history for a conversation ──────────────────
async function loadHistory(conv) {
  if (conv.loaded || !myId) return
  loadingMsgs.value = true
  try {
    const res = await api.getChatHistory(conv.id, myId)
    conv.messages = (res.data || []).map(m => ({
      id:   m.id,
      text: m.text,
      time: fmtTime(m.createdAt),
      date: dateLabel(m.createdAt),
      mine: m.from_user_id === myId,
      read: m.read,
    }))
    if (conv.messages.length > 0) {
      const last = conv.messages[conv.messages.length - 1]
      conv.lastMsg  = last.text
      conv.lastTime = last.time
    }
    conv.loaded = true
    conv.unread = 0
  } catch (e) {
    showToast('Xabarlar yuklanmadi', 'error')
  } finally {
    loadingMsgs.value = false
  }
}

// ─── WebSocket ────────────────────────────────────────────────
function connectWS() {
  if (!myId) return
  const token = localStorage.getItem('wt_token')
  if (!token) return

  const wsUrl = `ws://${window.location.host}/ws/chat?token=${token}`
  socket = new WebSocket(wsUrl)

  socket.onopen = () => {
    wsConnected.value = true
    clearTimeout(reconnectTimer)
  }

  socket.onclose = () => {
    wsConnected.value = false
    socket = null
    // Auto-reconnect after 4 seconds
    reconnectTimer = setTimeout(connectWS, 4000)
  }

  socket.onerror = () => {
    wsConnected.value = false
  }

  socket.onmessage = (e) => {
    let data
    try { data = JSON.parse(e.data) } catch { return }
    handleWsEvent(data)
  }
}

function handleWsEvent(data) {
  if (data.type === 'online') {
    const conv = conversations.value.find(c => c.id === data.userId)
    if (conv) conv.online = true
  }

  if (data.type === 'offline') {
    const conv = conversations.value.find(c => c.id === data.userId)
    if (conv) conv.online = false
  }

  if (data.type === 'message') {
    // Incoming message from someone else (or echo from our own send)
    const peerId = data.mine ? data.to : data.from
    const conv   = conversations.value.find(c => c.id === peerId)
    if (!conv) return

    const msg = {
      id:   data.id || ++idSeq,
      text: data.text,
      time: fmtTime(data.time),
      date: dateLabel(data.time),
      mine: !!data.mine,
      read: false,
    }

    conv.messages.push(msg)
    conv.lastMsg  = data.text
    conv.lastTime = msg.time

    if (activeId.value === conv.id) {
      scrollBottom()
      // Mark as read
      sendWsRead(conv.id)
    } else if (!data.mine) {
      conv.unread++
      notifyNewMessage(conv, data.text)
    }
  }

  if (data.type === 'read') {
    // The other user read our messages
    const conv = conversations.value.find(c => c.id === data.by)
    if (conv) conv.messages.forEach(m => { if (m.mine) m.read = true })
  }
}

function sendWsRead(peerId) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'read', peer: peerId }))
  }
}

// ─── Computed ─────────────────────────────────────────────────
const activeConv = computed(() => conversations.value.find(c => c.id === activeId.value))
const onlineCount = computed(() => conversations.value.filter(c => c.online).length)

const filteredConvs = computed(() => {
  const q = searchQ.value.toLowerCase()
  return conversations.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.department.toLowerCase().includes(q)
  )
})

const groupedMessages = computed(() => {
  if (!activeConv.value) return {}
  const q      = chatSearchQ.value.toLowerCase()
  const source = q
    ? activeConv.value.messages.filter(m => m.text.toLowerCase().includes(q))
    : activeConv.value.messages
  const groups = {}
  for (const msg of source) {
    const key = msg.date || 'Bugun'
    if (!groups[key]) groups[key] = []
    groups[key].push(msg)
  }
  return groups
})

// ─── Actions ──────────────────────────────────────────────────
async function selectConv(id) {
  activeId.value = id
  const conv = conversations.value.find(c => c.id === id)
  if (!conv) return
  conv.unread = 0

  await loadHistory(conv)
  scrollBottom()
  nextTick(() => inputRef.value?.focus())

  // Mark read via WS or REST
  if (socket?.readyState === WebSocket.OPEN) {
    sendWsRead(id)
  } else if (myId) {
    api.markChatRead(id, myId).catch(() => {})
  }
}

async function sendMsg() {
  const text = newMsg.value.trim()
  if (!text || !activeConv.value || !myId) return

  const conv    = activeConv.value
  const tempId  = ++idSeq
  const timeStr = nowStr()

  // Optimistic: add immediately
  conv.messages.push({
    id:   tempId,
    text,
    time: timeStr,
    date: 'Bugun',
    mine: true,
    read: false,
  })
  conv.lastMsg  = text
  conv.lastTime = timeStr
  newMsg.value  = ''
  scrollBottom()

  if (socket?.readyState === WebSocket.OPEN) {
    // Send via WebSocket (server echoes back with real id)
    socket.send(JSON.stringify({ type: 'message', to: conv.id, text }))
  } else {
    // Fallback: REST
    try {
      await api.sendChatMessage({ from_user_id: myId, to_user_id: conv.id, text })
    } catch (e) {
      showToast('Xabar yuborilmadi: ' + (e.message || 'xatolik'), 'error')
      // Remove the optimistic message
      const idx = conv.messages.findIndex(m => m.id === tempId)
      if (idx !== -1) conv.messages.splice(idx, 1)
    }
  }
}

// ─── Lifecycle ────────────────────────────────────────────────
onMounted(async () => {
  requestNotifPerm()
  await loadUsers()
  connectWS()
  if (conversations.value.length > 0) selectConv(conversations.value[0].id)
})

onUnmounted(() => {
  clearTimeout(reconnectTimer)
  clearTimeout(toastTimer)
  socket?.close()
})
</script>

<style scoped>
/* ── LAYOUT ───────────────────────────────────────────────── */
.chat-page {
  display: flex;
  height: calc(100vh - 64px);
  background: var(--bg);
  overflow: hidden;
}

/* ── SIDEBAR ──────────────────────────────────────────────── */
.chat-sidebar {
  width: 300px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cs-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 16px 12px;
}

.cs-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--t1);
}

.cs-sub {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--t4);
}

/* WS bar */
.ws-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 16px;
  font-size: 11px;
  font-weight: 500;
  border-bottom: 1px solid var(--border2);
}
.ws-on  { color: #059669; background: #d1fae5; }
.ws-off { color: #d97706; background: #fef3c7; }
:global(.layout.dark) .ws-on  { background: rgba(5,150,105,0.12); }
:global(.layout.dark) .ws-off { background: rgba(217,119,6,0.12); }
.ws-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}
.ws-on .ws-dot { animation: pulse-dot 2s ease-in-out infinite; }
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* Search */
.cs-search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 12px;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface2);
}
.cs-search:focus-within { border-color: var(--accent-br); }
.s-ico { color: var(--t4); flex-shrink: 0; }
.cs-search input {
  border: none; outline: none;
  background: transparent;
  font-size: 12px; color: var(--t1);
  width: 100%;
}
.cs-search input::placeholder { color: var(--t4); }

/* Conversation list */
.conv-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.conv-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.12s;
  border-left: 3px solid transparent;
}
.conv-item:hover  { background: var(--surface2); }
.conv-item.active { background: var(--accent-bg); border-left-color: var(--accent); }

.conv-info { flex: 1; overflow: hidden; }

.conv-r1, .conv-r2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}

.conv-name {
  font-size: 13px; font-weight: 600;
  color: var(--t1); white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.conv-time { font-size: 10px; color: var(--t4); flex-shrink: 0; }
.conv-last {
  font-size: 11px; color: var(--t4);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.conv-last.fw-6 { color: var(--t2); font-weight: 600; }

.unread-dot {
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  flex-shrink: 0;
}

.conv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 16px;
  color: var(--t4);
  font-size: 13px;
}

/* ── SKELETON ─────────────────────────────────────────────── */
.sk-row { pointer-events: none; }
.sk-av {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: var(--border2);
  flex-shrink: 0;
  animation: sk-pulse 1.4s ease-in-out infinite;
}
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-line {
  border-radius: 4px;
  background: var(--border2);
  animation: sk-pulse 1.4s ease-in-out infinite;
}
.sk-name { height: 11px; width: 60%; }
.sk-msg  { height: 9px;  width: 80%; }
@keyframes sk-pulse {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

.sk-msg-row { display: flex; padding: 4px 0; }
.sk-mine    { justify-content: flex-end; }
.sk-theirs  { justify-content: flex-start; }
.sk-msg-bbl {
  width: 180px; height: 38px;
  border-radius: 14px;
  background: var(--border2);
  animation: sk-pulse 1.4s ease-in-out infinite;
}

/* ── AVATAR ───────────────────────────────────────────────── */
.c-av {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.s-dot {
  position: absolute;
  bottom: 1px; right: 1px;
  width: 9px; height: 9px;
  border-radius: 50%;
  border: 2px solid var(--surface);
}
.s-on  { background: #22c55e; }
.s-off { background: #d1d5db; }

/* ── MAIN CHAT ────────────────────────────────────────────── */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
}

/* Chat header */
.chat-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  gap: 12px;
}

.ch-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ch-meta { display: flex; flex-direction: column; gap: 2px; }
.ch-name { font-size: 14px; font-weight: 600; color: var(--t1); }
.ch-pos  { font-size: 11px; color: var(--t4); }

.ch-right { display: flex; gap: 4px; }

.ch-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--t3);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.ch-btn:hover { background: var(--accent-bg); color: var(--accent); border-color: var(--accent-br); }

/* In-chat search */
.inchat-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  color: var(--t4);
}
.inchat-search input {
  flex: 1; border: none; outline: none;
  background: transparent;
  font-size: 13px; color: var(--t1);
}
.inchat-search button {
  background: none; border: none; cursor: pointer; color: var(--t4);
  display: flex; align-items: center;
}
.inchat-search button:hover { color: var(--t2); }

/* Messages area */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scroll-behavior: smooth;
}

.msgs-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.date-sep {
  text-align: center;
  margin: 12px 0 8px;
}
.date-sep span {
  font-size: 11px;
  color: var(--t4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 3px 12px;
}

.msg-wrap {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 4px;
}
.msg-wrap.mine   { flex-direction: row-reverse; }
.msg-wrap.theirs { flex-direction: row; }

.msg-av {
  width: 28px; height: 28px;
  border-radius: 50%;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.msg-bubble {
  max-width: 65%;
  padding: 9px 12px 6px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.45;
}
.mine .msg-bubble {
  background: var(--accent);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.theirs .msg-bubble {
  background: var(--surface);
  color: var(--t1);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}
.msg-bubble.hl { outline: 2px solid var(--accent); }

.msg-bubble p { margin: 0 0 4px; }

.msg-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}

.msg-time { font-size: 10px; opacity: 0.65; }
.ico-read { color: #93c5fd; }
.ico-sent { color: rgba(255,255,255,0.55); }

/* Typing animation */
.typing-bbl {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 14px !important;
  min-height: 38px;
}
.tdot {
  width: 7px; height: 7px;
  background: var(--t4);
  border-radius: 50%;
  animation: tdot-anim 1.2s ease-in-out infinite;
}
.tdot:nth-child(2) { animation-delay: 0.2s; }
.tdot:nth-child(3) { animation-delay: 0.4s; }
@keyframes tdot-anim {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40%            { transform: translateY(-6px); opacity: 1; }
}

/* ── INPUT AREA ───────────────────────────────────────────── */
.input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--surface);
  border-top: 1px solid var(--border);
}

.inp-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 8px 14px;
  transition: border-color 0.15s;
}
.inp-wrap:focus-within { border-color: var(--accent-br); }
.inp-wrap input {
  flex: 1; border: none; outline: none;
  background: transparent;
  font-size: 13px; color: var(--t1);
}
.inp-wrap input::placeholder { color: var(--t4); }

.send-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: none;
  background: var(--border2);
  color: var(--t4);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}
.send-btn.active { background: var(--accent); color: #fff; }
.send-btn.active:hover { opacity: 0.88; }
.send-btn:disabled { cursor: default; }

/* ── EMPTY STATE ──────────────────────────────────────────── */
.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--t4);
}
.empty-icon-wrap {
  width: 80px; height: 80px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.chat-empty h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--t2); }
.chat-empty p  { margin: 0; font-size: 13px; }

/* ── TOAST ────────────────────────────────────────────────── */
.chat-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  z-index: 9999;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  pointer-events: none;
}
.t-info    { background: #1e40af; color: #fff; }
.t-success { background: #065f46; color: #fff; }
.t-error   { background: #991b1b; color: #fff; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateX(-50%) translateY(12px); }

/* ── RESPONSIVE ───────────────────────────────────────────── */
@media (max-width: 700px) {
  .chat-sidebar { width: 64px; }
  .conv-info, .cs-title, .cs-sub, .ws-bar span, .cs-search input { display: none; }
  .cs-head { justify-content: center; }
  .cs-search { margin: 8px; padding: 6px; justify-content: center; }
  .conv-item { padding: 8px; justify-content: center; }
}
</style>
