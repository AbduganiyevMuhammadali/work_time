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

        <!-- Ism + Familiya -->
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

        <!-- Username + Rol -->
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

        <!-- Parol -->
        <div class="form-row">
          <div class="form-group">
            <label>Parol <span v-if="!isEdit" class="req">*</span><span v-else class="hint-lbl"> (o'zgartirish uchun)</span></label>
            <div class="pwd-wrap">
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="••••••••"
                :required="!isEdit"
              />
              <button type="button" class="eye-btn" @click="showPwd = !showPwd">
                <EyeOff v-if="showPwd" :size="15" />
                <Eye v-else :size="15" />
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>Parolni tasdiqlash</label>
            <div class="pwd-wrap">
              <input
                v-model="form.confirmPassword"
                :type="showCPwd ? 'text' : 'password'"
                placeholder="••••••••"
              />
              <button type="button" class="eye-btn" @click="showCPwd = !showCPwd">
                <EyeOff v-if="showCPwd" :size="15" />
                <Eye v-else :size="15" />
              </button>
            </div>
          </div>
        </div>

        <!-- Lavozim + Bo'lim -->
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

        <!-- Telefon + Holat -->
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

        <!-- Ish vaqti -->
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

        <!-- Ish kunlari picker -->
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

        <!-- Actions -->
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="$emit('close')">
            Bekor qilish
          </button>
          <button type="submit" class="save-btn">
            <Check :size="15" />
            {{ isEdit ? 'Saqlash' : "Qo'shish" }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { X, Check, Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps({ employee: { type: Object, default: null } })
const emit  = defineEmits(['close', 'save'])

const DAY_SHORT = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
const DAY_FULL  = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']
const ROLES     = [
  { value: 'Admin', label: 'Admin',  color: '#7c3aed' },
  { value: 'HR',    label: 'HR',     color: '#0891b2' },
  { value: 'Xodim', label: 'Xodim', color: '#059669' },
]

const isEdit  = computed(() => !!props.employee)
const showPwd = ref(false)
const showCPwd= ref(false)

const buildForm = () => {
  if (props.employee) {
    const parts = (props.employee.name || '').trim().split(' ')
    return {
      firstName:       parts[0] || '',
      lastName:        parts.slice(1).join(' ') || '',
      username:        props.employee.username   || '',
      role:            props.employee.role       || 'Xodim',
      password:        '',
      confirmPassword: '',
      position:        props.employee.position   || '',
      department:      props.employee.department || '',
      phone:           props.employee.phone      || '',
      status:          props.employee.status     || 'active',
      startTime:       props.employee.startTime  || '09:00',
      endTime:         props.employee.endTime    || '18:00',
      workDays:        [...(props.employee.workDays || [0,1,2,3,4])].map(Number),
    }
  }
  return {
    firstName: '', lastName: '', username: '', role: 'Xodim',
    password: '', confirmPassword: '',
    position: '', department: '', phone: '', status: 'active',
    startTime: '09:00', endTime: '18:00',
    workDays: [0, 1, 2, 3, 4],
  }
}

const form = ref(buildForm())

const toggleDay = (i) => {
  const idx = form.value.workDays.indexOf(i)
  if (idx === -1) form.value.workDays.push(i)
  else form.value.workDays.splice(idx, 1)
}

const submit = () => {
  const name = `${form.value.firstName.trim()} ${form.value.lastName.trim()}`.trim()
  emit('save', {
    ...(props.employee || {}),
    name,
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
  max-width: 560px;
  max-height: 90vh;
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

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--t1);
}

.modal-sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--t3);
}

.close-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--t3);
  transition: all 0.15s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: var(--border);
  color: var(--t1);
}

/* ── FORM ───────────────────────────────────────────────── */
.modal-form {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group.full {
  flex: none;
}

label {
  font-size: 12px;
  font-weight: 500;
  color: var(--t2);
}

.req {
  color: #dc2626;
  margin-left: 2px;
}

input,
select {
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

input:focus,
select:focus {
  border-color: var(--accent-br);
  box-shadow: 0 0 0 2px var(--accent-bg);
}

input::placeholder {
  color: var(--t4);
}

/* ── ROLE PICKER ────────────────────────────────────────── */
.role-picker {
  display: flex;
  gap: 6px;
}

.role-btn {
  flex: 1;
  padding: 7px 6px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--t2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.role-btn:hover {
  border-color: var(--accent-br);
  background: var(--accent-hv);
}

/* ── PASSWORD ────────────────────────────────────────────── */
.pwd-wrap {
  position: relative;
  display: flex;
}

.pwd-wrap input {
  padding-right: 36px;
}

.eye-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--t3);
  display: flex;
  align-items: center;
  padding: 0;
}

.eye-btn:hover {
  color: var(--t1);
}

.hint-lbl {
  font-size: 11px;
  color: var(--t4);
  font-weight: 400;
}

/* ── DAYS PICKER ────────────────────────────────────────── */
.days-picker {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.day-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 7px 6px;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: var(--surface2);
  cursor: pointer;
  transition: all 0.15s;
  min-width: 48px;
  flex: 1;
}

.day-btn:hover {
  border-color: var(--accent-br);
  background: var(--accent-hv);
}

.day-btn.day-on {
  background: var(--accent-bg);
  border-color: var(--accent-br);
  color: var(--accent);
}

.day-short {
  font-size: 12px;
  font-weight: 700;
  color: inherit;
}

.day-name {
  font-size: 9px;
  color: var(--t4);
  white-space: nowrap;
}

.day-btn.day-on .day-name {
  color: var(--accent);
  opacity: 0.75;
}

:global(.layout.dark) .day-btn.day-on {
  background: rgba(167, 139, 250, 0.15);
  border-color: rgba(167, 139, 250, 0.35);
  color: #a78bfa;
}

:global(.layout.dark) .day-btn.day-on .day-name {
  color: #a78bfa;
}

.days-hint {
  margin: 6px 0 0;
  font-size: 11px;
  color: var(--t4);
}

/* ── ACTIONS ────────────────────────────────────────────── */
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 4px;
}

.cancel-btn {
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--t2);
  border-radius: 8px;
  padding: 9px 18px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.cancel-btn:hover {
  background: var(--border);
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.save-btn:hover {
  opacity: 0.88;
}

/* ── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width: 500px) {
  .form-row { flex-direction: column; }
  .day-btn  { min-width: 38px; padding: 6px 4px; }
  .day-name { display: none; }
}
</style>
