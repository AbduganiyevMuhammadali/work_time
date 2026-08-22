<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">

      <!-- Header -->
      <div class="modal-head">
        <div>
          <h3 class="modal-title">
            {{ isEdit ? 'Xodimni tahrirlash' : "Xodim qo'shish" }}
          </h3>
          <p class="modal-sub">
            {{ isEdit ? form.firstName + ' ' + form.lastName : "Yangi xodim ma'lumotlari" }}
          </p>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <X :size="18" />
        </button>
      </div>

      <!-- Form -->
      <form class="modal-form" @submit.prevent="submit">

        <!-- ── RASM ────────────────────────────────────────── -->
        <div class="photo-section">

          <!-- Avatar preview -->
          <div class="photo-preview" :style="previewStyle" @click="triggerFileInput">
            <img v-if="photoPreview" :src="photoPreview" alt="Rasm" class="photo-img" />
            <div v-else class="photo-initials">
              <span>{{ autoInitials }}</span>
            </div>
            <div class="photo-overlay">
              <ImageIcon :size="18" />
              <span>Rasm tanlash</span>
            </div>
          </div>

          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden-file"
            @change="onFileChange"
          />

          <!-- Amallar -->
          <div class="photo-actions-col">
            <div class="photo-btns">
              <button type="button" class="photo-action-btn" @click="triggerFileInput">
                <Upload :size="14" /> Fayl yuklash
              </button>
              <button type="button" class="photo-action-btn cam-btn" @click="openCamera">
                <Camera :size="14" /> Kameradan olish
              </button>
            </div>
            <p class="photo-hint">JPEG, PNG, WEBP — max 5 MB</p>
            <button v-if="photoPreview" type="button" class="photo-remove-btn" @click.stop="removePhoto">
              <Trash2 :size="13" /> O'chirish
            </button>
          </div>
        </div>

        <!-- ── KAMERA overlay ─────────────────────────────── -->
        <Teleport to="body">
          <Transition name="cam-fade">
            <div v-if="cameraOpen" class="cam-overlay" @click.self="closeCamera">
              <div class="cam-box">
                <div class="cam-head">
                  <h4 class="cam-title">Suratga olish</h4>
                  <button type="button" class="cam-close" @click="closeCamera">
                    <X :size="18" />
                  </button>
                </div>

                <!-- Video yoki xato -->
                <div class="cam-viewport">
                  <video
                    v-show="!camError"
                    ref="videoRef"
                    class="cam-video"
                    autoplay
                    playsinline
                    muted
                  ></video>
                  <div v-if="camError" class="cam-error">
                    <CameraOff :size="36" />
                    <p>{{ camError }}</p>
                  </div>
                  <!-- Countdown overlay -->
                  <div v-if="countdown > 0" class="cam-countdown">{{ countdown }}</div>
                  <!-- Mirror guideline -->
                  <div v-if="!camError" class="cam-guide"></div>
                </div>

                <!-- Canvas (yashirin, rasm olish uchun) -->
                <canvas ref="canvasRef" class="hidden-file"></canvas>

                <!-- Boshqaruv -->
                <div class="cam-controls">
                  <button
                    v-if="!camError"
                    type="button"
                    class="cam-capture-btn"
                    @click="capturePhoto"
                    :disabled="countdown > 0"
                    title="Suratga olish (Enter)"
                  >
                    <span class="shutter-ring">
                      <span class="shutter-inner"></span>
                    </span>
                  </button>
                  <button
                    v-if="!camError && cameras.length > 1"
                    type="button"
                    class="cam-flip-btn"
                    @click="flipCamera"
                    title="Kamerani almashtirish"
                  >
                    <RefreshCw :size="18" />
                  </button>
                </div>

              </div>
            </div>
          </Transition>
        </Teleport>

        <!-- ── Ism + Familiya ─────────────────────────────── -->
        <div class="form-row">
          <div class="form-group">
            <label>Ism <span class="req">*</span></label>
            <input v-model="form.firstName" placeholder="Ali" required />
          </div>
          <div class="form-group">
            <label>Familiya <span class="req">*</span></label>
            <input v-model="form.lastName" placeholder="Karimov" required />
          </div>
        </div>

        <!-- ── Username + Rol ─────────────────────────────── -->
        <div class="form-row">
          <div class="form-group">
            <label>Username <span class="req">*</span></label>
            <input v-model="form.username" placeholder="ali_karimov" :required="!isEdit" />
          </div>
          <div class="form-group">
            <label>Rol <span class="req">*</span></label>
            <div class="role-picker">
              <button
                v-for="r in ROLES"
                :key="r.value"
                type="button"
                :class="['role-btn', form.role === r.value ? 'role-on' : '']"
                :style="form.role === r.value ? { background: r.color + '22', borderColor: r.color, color: r.color } : {}"
                @click="form.role = r.value"
              >{{ r.label }}</button>
            </div>
          </div>
        </div>

        <!-- ── Parol ──────────────────────────────────────── -->
        <div class="form-row">
          <div class="form-group">
            <label>Parol <span v-if="!isEdit" class="req">*</span><span v-else class="hint-lbl"> (o'zgartirish uchun)</span></label>
            <div class="pwd-wrap">
              <input v-model="form.password" :type="showPwd ? 'text' : 'password'" placeholder="••••••••" :required="!isEdit" />
              <button type="button" class="eye-btn" @click="showPwd = !showPwd">
                <EyeOff v-if="showPwd" :size="15" /><Eye v-else :size="15" />
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>Parolni tasdiqlash</label>
            <div class="pwd-wrap">
              <input v-model="form.confirmPassword" :type="showCPwd ? 'text' : 'password'" placeholder="••••••••" />
              <button type="button" class="eye-btn" @click="showCPwd = !showCPwd">
                <EyeOff v-if="showCPwd" :size="15" /><Eye v-else :size="15" />
              </button>
            </div>
          </div>
        </div>

        <!-- ── Lavozim + Bo'lim ───────────────────────────── -->
        <div class="form-row">
          <div class="form-group">
            <label>Lavozim <span class="req">*</span></label>
            <input v-model="form.position" placeholder="Dasturchi" required />
          </div>
          <div class="form-group">
            <label>Bo'lim</label>
            <input v-model="form.department" placeholder="IT" />
          </div>
        </div>

        <!-- ── Telefon + Holat ────────────────────────────── -->
        <div class="form-row">
          <div class="form-group">
            <label>Telefon</label>
            <input v-model="form.phone" placeholder="+998 90 123 45 67" />
          </div>
          <div class="form-group">
            <label>Holat</label>
            <select v-model="form.status">
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
              <option value="leave">Ta'tilda</option>
            </select>
          </div>
        </div>

        <!-- ── Oylik + Vaqt hisobi ────────────────────────── -->
        <div class="form-row">
          <div class="form-group">
            <label>Oylik maoshi (so'm)</label>
            <input v-model.number="form.salary" type="number" min="0" step="1000" placeholder="3 000 000" />
          </div>
          <div class="form-group form-group--center">
            <label>Vaqt bo'yicha hisob</label>
            <label class="toggle-wrap">
              <input type="checkbox" v-model="form.to_count_time" class="toggle-cb" />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-lbl">{{ form.to_count_time ? 'Ish kunlariga qarab' : "To'liq oylik" }}</span>
            </label>
          </div>
        </div>

        <!-- ── Face ID nomi ───────────────────────────────── -->
        <div class="form-row">
          <div class="form-group">
            <label>
              Face ID nomi
              <span class="hint-lbl"> (kamerada ro'yxatdan o'tgan ism)</span>
            </label>
            <div class="face-id-wrap">
              <input v-model="form.face_id_name" :placeholder="fullName || 'Kameradagi ism...'" />
              <button
                v-if="fullName && form.face_id_name !== fullName"
                type="button"
                class="face-autofill"
                @click="form.face_id_name = fullName"
                title="To'liq ismni qo'yish"
              >
                <UserCheck :size="14" /> Ismdan to'ldirish
              </button>
            </div>
            <p class="face-hint">Bo'sh qoldirilsa, to'liq ism avtomatik qo'yiladi</p>
          </div>
        </div>

        <!-- ── Ish vaqti ──────────────────────────────────── -->
        <div class="form-row">
          <div class="form-group">
            <label>Ish boshlanishi</label>
            <input type="time" v-model="form.startTime" />
          </div>
          <div class="form-group">
            <label>Ish tugashi</label>
            <input type="time" v-model="form.endTime" />
          </div>
        </div>

        <!-- ── Ish kunlari ────────────────────────────────── -->
        <div class="form-group full">
          <label>Ish kunlari <span class="req">*</span></label>
          <div class="days-picker">
            <button
              v-for="(d, i) in DAY_FULL"
              :key="i"
              type="button"
              :class="['day-btn', form.workDays.includes(i) ? 'day-on' : '']"
              @click="toggleDay(i)"
            >
              <span class="day-short">{{ DAY_SHORT[i] }}</span>
              <span class="day-name">{{ d }}</span>
            </button>
          </div>
          <p class="days-hint">
            {{ form.workDays.length }} ish kuni,
            {{ 7 - form.workDays.length }} dam olish kuni
          </p>
        </div>

        <!-- ── Amallar ─────────────────────────────────────── -->
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="$emit('close')">Bekor qilish</button>
          <button type="submit" class="save-btn" :disabled="saving">
            <Loader2 v-if="saving" :size="15" class="spin" />
            <Check v-else :size="15" />
            {{ saving ? 'Saqlanmoqda...' : (isEdit ? 'Saqlash' : "Qo'shish") }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import {
  X, Check, Eye, EyeOff, Camera, CameraOff, Trash2,
  UserCheck, Loader2, Upload, ImageIcon, RefreshCw
} from 'lucide-vue-next'

const props = defineProps({ employee: { type: Object, default: null } })
const emit  = defineEmits(['close', 'save'])

const DAY_SHORT = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
const DAY_FULL  = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']
const ROLES     = [
  { value: 'Admin', label: 'Admin',  color: '#7c3aed' },
  { value: 'HR',    label: 'HR',     color: '#0891b2' },
  { value: 'Xodim', label: 'Xodim', color: '#059669' },
]

const isEdit    = computed(() => !!props.employee)
const showPwd   = ref(false)
const showCPwd  = ref(false)
const saving    = ref(false)
const fileInputRef = ref(null)

// ── Photo state ────────────────────────────────────────────────
const selectedFile   = ref(null)
const photoPreview   = ref(props.employee?.photo || null)
const removeExisting = ref(false)

const triggerFileInput = () => fileInputRef.value?.click()

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  selectedFile.value   = file
  photoPreview.value   = URL.createObjectURL(file)
  removeExisting.value = false
}

function removePhoto() {
  selectedFile.value   = null
  photoPreview.value   = null
  removeExisting.value = true
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// ── Camera state ───────────────────────────────────────────────
const cameraOpen = ref(false)
const camError   = ref('')
const countdown  = ref(0)
const videoRef   = ref(null)
const canvasRef  = ref(null)
const cameras    = ref([])       // MediaDeviceInfo[]
let   camIndex   = 0
let   stream     = null
let   countTimer = null

async function openCamera() {
  camError.value = ''
  cameraOpen.value = true
  await startStream()
}

async function startStream() {
  // Stop existing stream
  stopStream()
  try {
    // Enumerate cameras
    const devices = await navigator.mediaDevices.enumerateDevices()
    cameras.value = devices.filter(d => d.kind === 'videoinput')
    if (cameras.value.length === 0) {
      camError.value = 'Kamera topilmadi'
      return
    }
    const deviceId = cameras.value[camIndex]?.deviceId
    stream = await navigator.mediaDevices.getUserMedia({
      video: deviceId ? { deviceId: { exact: deviceId }, width: 640, height: 480 } : { width: 640, height: 480 },
      audio: false,
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
  } catch (e) {
    const msg = e.name === 'NotAllowedError'
      ? 'Kameraga ruxsat berilmadi'
      : e.name === 'NotFoundError'
        ? 'Kamera topilmadi'
        : 'Kamera ochmadi: ' + e.message
    camError.value = msg
  }
}

function stopStream() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
  }
}

function closeCamera() {
  clearInterval(countTimer)
  countdown.value  = 0
  stopStream()
  cameraOpen.value = false
  camError.value   = ''
}

async function flipCamera() {
  camIndex = (camIndex + 1) % cameras.value.length
  await startStream()
}

function capturePhoto() {
  if (countdown.value > 0) return
  // 3-2-1 countdown then snap
  countdown.value = 3
  countTimer = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(countTimer)
      snap()
    }
  }, 1000)
}

function snap() {
  const video  = videoRef.value
  const canvas = canvasRef.value
  if (!video || !canvas) return

  canvas.width  = video.videoWidth  || 640
  canvas.height = video.videoHeight || 480
  const ctx = canvas.getContext('2d')
  // Mirror horizontally (selfie style)
  ctx.translate(canvas.width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, 0, 0)

  canvas.toBlob(blob => {
    if (!blob) return
    const file = new File([blob], `webcam_${Date.now()}.jpg`, { type: 'image/jpeg' })
    selectedFile.value   = file
    photoPreview.value   = URL.createObjectURL(file)
    removeExisting.value = false
    closeCamera()
  }, 'image/jpeg', 0.92)
}

// Keyboard: Enter → capture, Escape → close
function onKeydown(e) {
  if (!cameraOpen.value) return
  if (e.key === 'Escape') closeCamera()
  if (e.key === 'Enter')  capturePhoto()
}
window.addEventListener('keydown', onKeydown)
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  closeCamera()
})

// ── Form ───────────────────────────────────────────────────────
const buildForm = () => {
  if (props.employee) {
    const parts = (props.employee.name || '').trim().split(' ')
    return {
      firstName:       parts[0] || '',
      lastName:        parts.slice(1).join(' ') || '',
      username:        props.employee.username   || '',
      role:            props.employee.role       || 'Xodim',
      password: '', confirmPassword: '',
      position:        props.employee.position   || '',
      department:      props.employee.department || '',
      phone:           props.employee.phone      || '',
      status:          props.employee.status     || 'active',
      startTime:       props.employee.startTime  || '09:00',
      endTime:         props.employee.endTime    || '18:00',
      workDays:        [...(props.employee.workDays || [0,1,2,3,4])].map(Number),
      salary:          props.employee.salary     || 0,
      to_count_time:   !!props.employee.to_count_time,
      face_id_name:    props.employee.face_id_name || '',
    }
  }
  return {
    firstName: '', lastName: '', username: '', role: 'Xodim',
    password: '', confirmPassword: '',
    position: '', department: '', phone: '', status: 'active',
    startTime: '09:00', endTime: '18:00',
    workDays: [0, 1, 2, 3, 4],
    salary: 0, to_count_time: false, face_id_name: '',
  }
}

const form = ref(buildForm())

// ── Computed helpers ───────────────────────────────────────────
const fullName = computed(() =>
  `${form.value.firstName.trim()} ${form.value.lastName.trim()}`.trim()
)

const autoInitials = computed(() =>
  fullName.value
    ? fullName.value.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : '?'
)

const empColor = computed(() => props.employee?.color || '#7c3aed')

const previewStyle = computed(() => ({
  background: photoPreview.value ? 'transparent' : empColor.value + '22',
  color: empColor.value,
}))

// ── Actions ────────────────────────────────────────────────────
const toggleDay = (i) => {
  const idx = form.value.workDays.indexOf(i)
  if (idx === -1) form.value.workDays.push(i)
  else form.value.workDays.splice(idx, 1)
}

const submit = () => {
  emit('save', {
    ...(props.employee || {}),
    name:            fullName.value,
    username:        form.value.username,
    role:            form.value.role,
    password:        form.value.password        || undefined,
    confirmPassword: form.value.confirmPassword || undefined,
    position:        form.value.position,
    department:      form.value.department,
    phone:           form.value.phone,
    status:          form.value.status,
    startTime:       form.value.startTime,
    endTime:         form.value.endTime,
    workDays:        [...form.value.workDays].sort((a, b) => a - b),
    salary:          form.value.salary || 0,
    to_count_time:   form.value.to_count_time,
    face_id_name:    form.value.face_id_name || null,
    // photo info for parent
    _selectedFile:   selectedFile.value,
    _removePhoto:    removeExisting.value,
  })
}
</script>

<style scoped>
/* ── BACKDROP ───────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 16px;
}

/* ── MODAL BOX ──────────────────────────────────────────── */
.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 580px;
  max-height: 92vh;
  overflow-y: auto;
  animation: modal-in 0.2s ease;
}

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ── HEADER ─────────────────────────────────────────────── */
.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 0;
}

.modal-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--t1); }
.modal-sub   { margin: 4px 0 0; font-size: 12px; color: var(--t3); }

.close-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--t3);
  transition: all 0.15s; flex-shrink: 0;
}
.close-btn:hover { background: var(--border); color: var(--t1); }

/* ── PHOTO SECTION ──────────────────────────────────────── */
.photo-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px 0;
}

.photo-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 2px dashed var(--border);
  transition: border-color 0.15s;
}
.photo-preview:hover { border-color: var(--accent); }
.photo-preview:hover .photo-overlay { opacity: 1; }

.photo-img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}

.photo-initials {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 700;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.55);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 50%;
}

.hidden-file { display: none; }

/* photo action buttons column */
.photo-actions-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.photo-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.photo-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--t2);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.photo-action-btn:hover { border-color: var(--accent-br); color: var(--accent); background: var(--accent-bg); }

.cam-btn { border-color: #059669; color: #059669; }
.cam-btn:hover { background: #d1fae5; border-color: #059669; color: #059669; }
:global(.layout.dark) .cam-btn:hover { background: rgba(5,150,105,0.15); }

.photo-hint {
  margin: 0;
  font-size: 11px;
  color: var(--t4);
}

.photo-remove-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: 1px solid #dc2626;
  color: #dc2626;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.photo-remove-btn:hover { background: #fee2e2; }
:global(.layout.dark) .photo-remove-btn:hover { background: rgba(220,38,38,0.15); }

/* ── FORM ───────────────────────────────────────────────── */
.modal-form {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row { display: flex; gap: 12px; }

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group.full { flex: none; }

label { font-size: 12px; font-weight: 500; color: var(--t2); }
.req  { color: #dc2626; margin-left: 2px; }

input, select {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--t1);
  background: var(--surface2);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}
input:focus, select:focus {
  border-color: var(--accent-br);
  box-shadow: 0 0 0 2px var(--accent-bg);
}
input::placeholder { color: var(--t4); }

/* ── ROLE PICKER ────────────────────────────────────────── */
.role-picker { display: flex; gap: 6px; }
.role-btn {
  flex: 1; padding: 7px 6px;
  border-radius: 8px; border: 1px solid var(--border);
  background: var(--surface2); color: var(--t2);
  font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.15s;
}
.role-btn:hover { border-color: var(--accent-br); background: var(--accent-hv); }

/* ── PASSWORD ────────────────────────────────────────────── */
.pwd-wrap { position: relative; display: flex; }
.pwd-wrap input { padding-right: 36px; }
.eye-btn {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: var(--t3);
  display: flex; align-items: center; padding: 0;
}
.eye-btn:hover { color: var(--t1); }
.hint-lbl { font-size: 11px; color: var(--t4); font-weight: 400; }

/* ── FACE ID ─────────────────────────────────────────────── */
.face-id-wrap {
  display: flex;
  gap: 8px;
  align-items: stretch;
}
.face-id-wrap input { flex: 1; }
.face-autofill {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  padding: 0 10px;
  border: 1px solid var(--accent-br);
  background: var(--accent-bg);
  color: var(--accent);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.face-autofill:hover { opacity: 0.8; }
.face-hint { margin: 3px 0 0; font-size: 10px; color: var(--t4); }

/* ── DAYS PICKER ────────────────────────────────────────── */
.days-picker { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
.day-btn {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 7px 6px; border-radius: 9px; border: 1px solid var(--border);
  background: var(--surface2); cursor: pointer; transition: all 0.15s;
  min-width: 48px; flex: 1;
}
.day-btn:hover { border-color: var(--accent-br); background: var(--accent-hv); }
.day-btn.day-on { background: var(--accent-bg); border-color: var(--accent-br); color: var(--accent); }
.day-short { font-size: 12px; font-weight: 700; color: inherit; }
.day-name  { font-size: 9px; color: var(--t4); white-space: nowrap; }
.day-btn.day-on .day-name { color: var(--accent); opacity: 0.75; }
:global(.layout.dark) .day-btn.day-on { background: rgba(167,139,250,0.15); border-color: rgba(167,139,250,0.35); color: #a78bfa; }
:global(.layout.dark) .day-btn.day-on .day-name { color: #a78bfa; }
.days-hint { margin: 6px 0 0; font-size: 11px; color: var(--t4); }

/* ── ACTIONS ────────────────────────────────────────────── */
.modal-actions {
  display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px;
}
.cancel-btn {
  border: 1px solid var(--border); background: var(--surface2);
  color: var(--t2); border-radius: 8px;
  padding: 9px 18px; font-size: 13px; cursor: pointer; transition: all 0.15s;
}
.cancel-btn:hover { background: var(--border); }
.save-btn {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent); color: #fff; border: none;
  border-radius: 8px; padding: 9px 20px;
  font-size: 13px; font-weight: 500; cursor: pointer; transition: opacity 0.15s;
}
.save-btn:hover:not(:disabled) { opacity: 0.88; }
.save-btn:disabled { opacity: 0.6; cursor: default; }

/* ── SPIN ───────────────────────────────────────────────── */
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── TOGGLE ─────────────────────────────────────────────── */
.form-group--center { justify-content: center; }
.toggle-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; margin-top: 4px; }
.toggle-cb { display: none; }
.toggle-track { position: relative; width: 40px; height: 22px; background: var(--border); border-radius: 11px; transition: background 0.2s; flex-shrink: 0; }
.toggle-cb:checked + .toggle-track { background: var(--accent); }
.toggle-thumb { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle-cb:checked + .toggle-track .toggle-thumb { transform: translateX(18px); }
.toggle-lbl { font-size: 12.5px; color: var(--t2); font-weight: 500; }

/* ── CAMERA OVERLAY ──────────────────────────────────────── */
.cam-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 16px;
}

.cam-box {
  background: #111;
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
}

.cam-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #1a1a1a;
}

.cam-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.cam-close {
  background: rgba(255,255,255,0.08);
  border: none;
  color: #fff;
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.cam-close:hover { background: rgba(255,255,255,0.16); }

.cam-viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  background: #000;
  overflow: hidden;
}

.cam-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scaleX(-1); /* mirror for selfie */
}

.cam-guide {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(255,255,255,0.15);
  pointer-events: none;
  /* oval face guide */
  border-radius: 50%;
  margin: 12% 20%;
}

.cam-countdown {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 96px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 2px 24px rgba(0,0,0,0.7);
  animation: cnt-pulse 0.9s ease-in-out infinite;
  pointer-events: none;
}
@keyframes cnt-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.15); opacity: 0.75; }
}

.cam-error {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px;
  color: #9ca3af;
  font-size: 13px;
  padding: 24px;
  text-align: center;
}

.cam-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px 16px;
  background: #1a1a1a;
  position: relative;
}

/* Shutter button */
.cam-capture-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
}
.cam-capture-btn:active { transform: scale(0.94); }
.cam-capture-btn:disabled { opacity: 0.5; cursor: default; }

.shutter-ring {
  width: 64px; height: 64px;
  border-radius: 50%;
  border: 4px solid #fff;
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s;
}
.cam-capture-btn:not(:disabled):hover .shutter-ring { border-color: #a78bfa; }

.shutter-inner {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: #fff;
  transition: background 0.15s;
}
.cam-capture-btn:not(:disabled):hover .shutter-inner { background: #a78bfa; }

/* Flip button */
.cam-flip-btn {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.1);
  border: none;
  color: #fff;
  width: 40px; height: 40px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.cam-flip-btn:hover { background: rgba(255,255,255,0.2); }

/* Transition */
.cam-fade-enter-active, .cam-fade-leave-active { transition: opacity 0.2s ease; }
.cam-fade-enter-from,  .cam-fade-leave-to      { opacity: 0; }

/* ── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width: 500px) {
  .form-row { flex-direction: column; }
  .day-btn  { min-width: 38px; padding: 6px 4px; }
  .day-name { display: none; }
  .photo-section { flex-direction: column; align-items: flex-start; }
  .photo-btns { flex-direction: column; }
}
</style>
