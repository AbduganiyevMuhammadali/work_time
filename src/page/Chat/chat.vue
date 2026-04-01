<template>
  <div class="chat-page">

    <!-- ── LEFT: Conversations ──────────────────────────────── -->
    <div class="chat-sidebar">

      <div class="cs-head">
        <div>
          <h2 class="cs-title">Xabarlar</h2>
          <p class="cs-sub">{{ onlineCount }} kishi online</p>
        </div>
        <button class="new-btn" title="Yangi suhbat" @click="showNewChat = !showNewChat">
          <Edit3 :size="16" />
        </button>
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

      <!-- Conversation list -->
      <div class="conv-list">
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

        <div v-if="filteredConvs.length === 0" class="conv-empty">
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
              <span class="ch-pos">{{ activeConv.position }} · {{ activeConv.department }}</span>
            </div>
          </div>
          <div class="ch-right">
            <button class="ch-btn" title="Qo'ng'iroq"><Phone :size="15" /></button>
            <button class="ch-btn" title="Video qo'ng'iroq"><Video :size="15" /></button>
            <button class="ch-btn" title="Xabarda qidirish"><Search :size="15" /></button>
            <button class="ch-btn" title="Ko'proq"><MoreVertical :size="15" /></button>
          </div>
        </div>

        <!-- Messages area -->
        <div class="messages-area" ref="msgAreaRef">

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
              <div class="msg-bubble">
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

        </div>

        <!-- Input area -->
        <div class="input-area">
          <button class="inp-btn" title="Fayl biriktirish"><Paperclip :size="18" /></button>
          <div class="inp-wrap">
            <input
              ref="inputRef"
              v-model="newMsg"
              :placeholder="`${activeConv.name}ga xabar yozing...`"
              @keydown.enter.exact.prevent="sendMsg"
            />
            <button class="inp-btn sm" title="Emoji"><Smile :size="17" /></button>
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
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import {
  Search, Send, Phone, Video, Paperclip, Smile,
  MessageSquare, Edit3, Check, CheckCheck,
  MoreVertical, UserX
} from 'lucide-vue-next'

// ─────────────────────────────────────────────────────────────
// WebSocket setup
// TODO: o'z backend WebSocket URL'ingizni qo'ying:
//   const WS_URL = 'ws://your-api.com/ws/chat?token=USER_TOKEN'
//   let socket = null
// ─────────────────────────────────────────────────────────────
const wsConnected = ref(false)

onMounted(() => {
  // Real backend bo'lganda:
  // socket = new WebSocket(WS_URL)
  // socket.onopen    = () => { wsConnected.value = true }
  // socket.onclose   = () => { wsConnected.value = false }
  // socket.onmessage = (e) => handleIncoming(JSON.parse(e.data))

  // Demo: simulate connection after 900ms
  setTimeout(() => { wsConnected.value = true }, 900)

  if (conversations.value.length > 0) selectConv(conversations.value[0].id)
})

onUnmounted(() => {
  // socket?.close()
})

// function handleIncoming(data) {
//   const conv = conversations.value.find(c => c.id === data.from)
//   if (!conv) return
//   conv.messages.push({ id: Date.now(), text: data.text, time: nowStr(), mine: false, read: false })
//   conv.lastMsg  = data.text
//   conv.lastTime = nowStr()
//   if (activeId.value !== conv.id) conv.unread++
//   else scrollBottom()
// }

// ─── State ───────────────────────────────────────────────────
const searchQ    = ref('')
const activeId   = ref(null)
const newMsg     = ref('')
const isTyping   = ref(false)
const showNewChat = ref(false)
const msgAreaRef = ref(null)
const inputRef   = ref(null)
let   idSeq      = 200

const conversations = ref([
  {
    id: 1, name: 'Alisher Karimov', position: 'Dasturchi', department: 'IT',
    color: '#7c3aed', online: true, unread: 2,
    lastTime: '14:32', lastMsg: "Loyiha tayyor bo'ldimi?",
    messages: [
      { id: 1, text: "Salom! Loyiha bo'yicha yangilik bormi?",       time: '14:20', mine: false, read: true,  date: 'Bugun' },
      { id: 2, text: 'Ha, deyarli tayyor. Faqat test qilish qoldi.', time: '14:22', mine: true,  read: true,  date: 'Bugun' },
      { id: 3, text: "Qachon tayyor bo'ladi?",                        time: '14:25', mine: false, read: true,  date: 'Bugun' },
      { id: 4, text: 'Bugun kechqurun tayyor bo\'ladi.',              time: '14:28', mine: true,  read: true,  date: 'Bugun' },
      { id: 5, text: "Loyiha tayyor bo'ldimi?",                       time: '14:32', mine: false, read: false, date: 'Bugun' },
    ],
  },
  {
    id: 2, name: 'Malika Yusupova', position: 'Dizayner', department: 'Design',
    color: '#059669', online: true, unread: 0,
    lastTime: '13:15', lastMsg: 'Rahmat!',
    messages: [
      { id: 1, text: "Malika, yangi dizaynni ko'rib chiqdingizmi?",  time: '13:10', mine: true,  read: true, date: 'Bugun' },
      { id: 2, text: 'Ha, juda chiroyli chiqibdi!',                   time: '13:12', mine: false, read: true, date: 'Bugun' },
      { id: 3, text: "O'zgartirishlar kerakmi?",                      time: '13:13', mine: true,  read: true, date: 'Bugun' },
      { id: 4, text: 'Rahmat!',                                       time: '13:15', mine: false, read: true, date: 'Bugun' },
    ],
  },
  {
    id: 3, name: "Jamshid To'xtaev", position: 'Menejir', department: 'HR',
    color: '#2563eb', online: false, unread: 0,
    lastTime: 'Kecha', lastMsg: "Yig'ilish soat 10 da",
    messages: [
      { id: 1, text: "Ertaga yig'ilish bo'ladi",   time: '09:00', mine: false, read: true, date: 'Kecha' },
      { id: 2, text: 'Qaysi vaqtda?',               time: '09:05', mine: true,  read: true, date: 'Kecha' },
      { id: 3, text: "Yig'ilish soat 10 da",        time: '09:10', mine: false, read: true, date: 'Kecha' },
    ],
  },
  {
    id: 4, name: 'Nodira Ergasheva', position: 'Buxgalter', department: 'Moliya',
    color: '#d97706', online: false, unread: 1,
    lastTime: 'Kecha', lastMsg: 'Hisob-kitob yuborildi',
    messages: [
      { id: 1, text: 'Mart oyi hisobini tayyorladim',  time: '17:30', mine: false, read: true,  date: 'Kecha' },
      { id: 2, text: "Ko'rib chiqaman",                time: '17:35', mine: true,  read: true,  date: 'Kecha' },
      { id: 3, text: 'Hisob-kitob yuborildi',          time: '18:00', mine: false, read: false, date: 'Kecha' },
    ],
  },
  {
    id: 5, name: 'Sardor Nazarov', position: 'Sotuvchi', department: 'Savdo',
    color: '#dc2626', online: true, unread: 0,
    lastTime: '11:42', lastMsg: 'OK, tushundim',
    messages: [
      { id: 1, text: 'Yangi mijoz bilan shartnoma imzolandi', time: '11:40', mine: true,  read: true, date: 'Bugun' },
      { id: 2, text: 'OK, tushundim',                         time: '11:42', mine: false, read: true, date: 'Bugun' },
    ],
  },
  {
    id: 6, name: 'Zulfiya Xoliqova', position: "Tizim ma'muri", department: 'IT',
    color: '#0891b2', online: true, unread: 0,
    lastTime: '10:20', lastMsg: 'Server yangilandi',
    messages: [
      { id: 1, text: 'Server yangilash kerak', time: '10:15', mine: true,  read: true, date: 'Bugun' },
      { id: 2, text: 'Server yangilandi',       time: '10:20', mine: false, read: true, date: 'Bugun' },
    ],
  },
])

// ─── Computed ─────────────────────────────────────────────────
const activeConv   = computed(() => conversations.value.find(c => c.id === activeId.value))
const onlineCount  = computed(() => conversations.value.filter(c => c.online).length)

const filteredConvs = computed(() => {
  const q = searchQ.value.toLowerCase()
  return conversations.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.position.toLowerCase().includes(q) ||
    c.department.toLowerCase().includes(q)
  )
})

const groupedMessages = computed(() => {
  if (!activeConv.value) return {}
  const groups = {}
  for (const msg of activeConv.value.messages) {
    const key = msg.date || 'Bugun'
    if (!groups[key]) groups[key] = []
    groups[key].push(msg)
  }
  return groups
})

// ─── Helpers ──────────────────────────────────────────────────
const initials = (name) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
const avStyle  = (conv) => ({ background: conv.color + '22', color: conv.color })
const nowStr   = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const scrollBottom = async () => {
  await nextTick()
  if (msgAreaRef.value) msgAreaRef.value.scrollTop = msgAreaRef.value.scrollHeight
}

// ─── Actions ──────────────────────────────────────────────────
const selectConv = (id) => {
  activeId.value = id
  const conv = conversations.value.find(c => c.id === id)
  if (conv) conv.unread = 0
  scrollBottom()
  nextTick(() => inputRef.value?.focus())
}

const sendMsg = () => {
  const text = newMsg.value.trim()
  if (!text || !activeConv.value) return

  const msg = { id: ++idSeq, text, time: nowStr(), mine: true, read: false, date: 'Bugun' }
  activeConv.value.messages.push(msg)
  activeConv.value.lastMsg  = text
  activeConv.value.lastTime = nowStr()
  newMsg.value = ''
  scrollBottom()

  // Real WS:
  // socket.send(JSON.stringify({ to: activeConv.value.id, text }))

  // Demo: auto reply if online
  if (activeConv.value.online) simulateReply()
}

const REPLIES = [
  "Tushundim, rahmat!",
  "Yaxshi, ko'rib chiqaman.",
  "OK!",
  "Albatta, hoziroq hal qilaman.",
  "Ma'lumot uchun rahmat!",
  "Bir oz vaqt bering...",
  "Juda soz! Davom etamiz.",
  "Bajariladi.",
]

const simulateReply = () => {
  const convId = activeId.value
  setTimeout(() => {
    isTyping.value = true
    scrollBottom()
    setTimeout(() => {
      isTyping.value = false
      const conv = conversations.value.find(c => c.id === convId)
      if (!conv) return
      const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)]
      conv.messages.push({ id: ++idSeq, text: reply, time: nowStr(), mine: false, read: false, date: 'Bugun' })
      conv.lastMsg  = reply
      conv.lastTime = nowStr()
      scrollBottom()
    }, 1200 + Math.random() * 1500)
  }, 500)
}
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

.new-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--t3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.new-btn:hover { background: var(--accent-bg); color: var(--accent); border-color: var(--accent-br); }

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
.ws-on .ws-dot  { animation: pulse-dot 2s ease-in-out infinite; }
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
.conv-item:hover   { background: var(--surface2); }
.conv-item.active  { background: var(--accent-bg); border-left-color: var(--accent); }

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

.ch-right {
  display: flex;
  gap: 4px;
}

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

.msg-bubble p { margin: 0 0 4px; }

.msg-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}

.msg-time {
  font-size: 10px;
  opacity: 0.65;
}

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
  padding: 8px 12px;
  transition: border-color 0.15s;
}
.inp-wrap:focus-within { border-color: var(--accent-br); }
.inp-wrap input {
  flex: 1; border: none; outline: none;
  background: transparent;
  font-size: 13px; color: var(--t1);
}
.inp-wrap input::placeholder { color: var(--t4); }

.inp-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--t3);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}
.inp-btn:hover { color: var(--accent); border-color: var(--accent-br); }
.inp-btn.sm { width: 28px; height: 28px; border: none; background: transparent; }

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

/* ── RESPONSIVE ───────────────────────────────────────────── */
@media (max-width: 700px) {
  .chat-sidebar { width: 64px; }
  .conv-info, .cs-title, .cs-sub, .ws-bar span, .cs-search input { display: none; }
  .cs-head { justify-content: center; }
  .cs-search { margin: 8px; padding: 6px; justify-content: center; }
  .conv-item { padding: 8px; justify-content: center; }
}
</style>
