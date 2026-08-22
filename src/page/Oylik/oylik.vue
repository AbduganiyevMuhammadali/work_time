<template>
  <div class="salary-page">

    <!-- ══ TABS ══ -->
    <div class="tabs-bar">
      <button
        v-for="tab in tabs" :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" :size="15" />
        {{ tab.label }}
      </button>
    </div>

    <!-- ════════════════════════════════════════════════════════
         TAB 1 — OYLIK HISOB-KITOB
    ═════════════════════════════════════════════════════════ -->
    <template v-if="activeTab === 'salary'">

      <!-- ── STAT CARDS ── -->
      <div class="stats-grid">
        <div class="stat-card" style="--ca:#7c3aed;--ca-bg:#ede9fe">
          <div class="stat-icon"><Banknote :size="18" /></div>
          <div class="stat-body">
            <span class="stat-val">{{ fmt(totalFund) }}</span>
            <span class="stat-lbl">Jami oylik fondi</span>
          </div>
        </div>
        <div class="stat-card" style="--ca:#2563eb;--ca-bg:#dbeafe">
          <div class="stat-icon"><CreditCard :size="18" /></div>
          <div class="stat-body">
            <span class="stat-val">{{ fmt(totalAdvances) }}</span>
            <span class="stat-lbl">Berilgan avanslar</span>
          </div>
        </div>
        <div class="stat-card" style="--ca:#dc2626;--ca-bg:#fee2e2">
          <div class="stat-icon"><ShieldAlert :size="18" /></div>
          <div class="stat-body">
            <span class="stat-val">{{ fmt(totalFines) }}</span>
            <span class="stat-lbl">Jarimalar</span>
          </div>
        </div>
        <div class="stat-card" style="--ca:#059669;--ca-bg:#d1fae5">
          <div class="stat-icon"><TrendingUp :size="18" /></div>
          <div class="stat-body">
            <span class="stat-val">{{ fmt(totalNet) }}</span>
            <span class="stat-lbl">To'lash kerak</span>
          </div>
        </div>
      </div>

      <!-- ── TABLE CARD ── -->
      <div class="table-card">
        <div class="card-head">
          <div class="card-title-group">
            <h2 class="card-title">Oylik hisob-kitob</h2>
            <span class="card-sub">{{ MONTHS[month - 1] }}, {{ year }}</span>
          </div>
          <div class="head-controls">
            <select v-model="month" class="sel" @change="loadSalaries">
              <option v-for="(m, i) in MONTHS" :key="i" :value="i + 1">{{ m }}</option>
            </select>
            <select v-model="year" class="sel" @change="loadSalaries">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
            <button class="icon-btn" @click="loadSalaries" :disabled="salLoading" title="Yangilash">
              <RefreshCw size="14" :class="{ spin: salLoading }" />
            </button>
            <button class="pay-all-btn" @click="payAll" :disabled="salLoading || saving">
              <CheckCheck :size="15" /><span>Hammasini to'lash</span>
            </button>
          </div>
        </div>

        <div v-if="salError" class="err-bar">{{ salError }}</div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Xodim</th>
                <th>Ish kunlari</th>
                <th>Asosiy oylik</th>
                <th>Bonus / Avans / Jarima</th>
                <th>Sof oylik</th>
                <th>Holat</th>
                <th class="th-act">Amallar</th>
              </tr>
            </thead>
            <tbody>
              <!-- Skeleton -->
              <template v-if="salLoading">
                <tr v-for="n in 6" :key="n">
                  <td><div class="emp-cell"><div class="sk sk-av"></div><div class="sk sk-lg"></div></div></td>
                  <td><div class="sk sk-md"></div></td>
                  <td><div class="sk sk-lg"></div></td>
                  <td><div class="sk sk-xl"></div></td>
                  <td><div class="sk sk-lg"></div></td>
                  <td><div class="sk sk-md"></div></td>
                  <td><div class="sk sk-sm"></div></td>
                </tr>
              </template>

              <!-- Rows -->
              <template v-else>
                <tr
                  v-for="emp in salaries" :key="emp.id"
                  :class="{ 'row-paid': emp.paid }"
                >
                  <!-- Xodim -->
                  <td>
                    <div class="emp-cell">
                      <div class="av" :style="{ background: emp.color + '22', color: emp.color }">
                        {{ initials(emp.name) }}
                      </div>
                      <div class="emp-info">
                        <span class="emp-name">{{ emp.name }}</span>
                        <span class="emp-dept">{{ emp.position || emp.department || '—' }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Ish kunlari -->
                  <td>
                    <div class="days-wrap">
                      <div class="days-header">
                        <span class="days-num">{{ emp.workedDays }}</span>
                        <span class="days-of">/ {{ emp.totalWorkDays }} kun</span>
                        <span class="days-pct">{{ pct(emp.workedDays, emp.totalWorkDays) }}%</span>
                      </div>
                      <div class="days-bar-bg">
                        <div
                          class="days-bar-fill"
                          :style="{ width: pct(emp.workedDays, emp.totalWorkDays) + '%', background: emp.color }"
                        ></div>
                      </div>
                    </div>
                  </td>

                  <!-- Asosiy oylik -->
                  <td>
                    <div class="base-sal-wrap">
                      <span class="base-sal-num">{{ fmtN(calcBaseSalary(emp)) }}</span>
                      <span
                        v-if="emp.to_count_time"
                        class="prop-badge"
                        :title="`Ish kunlari bo'yicha: ${emp.workedDays}/${emp.totalWorkDays}`"
                      >Nisbiy</span>
                      <span v-if="emp.salary > 0 && emp.to_count_time" class="base-sal-of">
                        {{ fmtN(emp.salary) }}dan
                      </span>
                    </div>
                  </td>

                  <!-- Bonus / Avans / Jarima — bitta ustunda -->
                  <td>
                    <div class="adj-row">
                      <!-- Bonus -->
                      <button
                        class="adj-chip adj-green"
                        :disabled="emp.paid"
                        @click="openBonusModal(emp)"
                        :title="emp.paid ? '' : 'Bonus belgilash'"
                      >
                        <span class="adj-lbl">Bonus</span>
                        <span class="adj-val">{{ emp.bonus > 0 ? '+' + fmtN(emp.bonus) : '—' }}</span>
                      </button>

                      <!-- Avans -->
                      <button
                        class="adj-chip adj-blue"
                        :disabled="emp.paid"
                        @click="openAdvModal(emp)"
                        :title="emp.paid ? '' : 'Avans ushlab qolish'"
                      >
                        <span class="adj-lbl">
                          Avans
                          <span v-if="emp.advance_balance > 0" class="adj-debt-dot" :title="'Jami qarz: ' + fmtN(emp.advance_balance)">!</span>
                        </span>
                        <span class="adj-val">{{ emp.advance > 0 ? '-' + fmtN(emp.advance) : '—' }}</span>
                      </button>

                      <!-- Jarima -->
                      <button
                        class="adj-chip adj-red"
                        :disabled="emp.paid"
                        @click="openFineModal(emp)"
                        :title="emp.paid ? '' : 'Jarima qo\'shish'"
                      >
                        <span class="adj-lbl">Jarima</span>
                        <span class="adj-val">
                          <template v-if="emp.fine > 0">-{{ fmtN(emp.fine) }}</template>
                          <template v-else>—</template>
                        </span>
                      </button>
                    </div>

                    <!-- Avans qarz ko'rsatgichi -->
                    <div v-if="emp.advance_balance > 0" class="debt-indicator">
                      <span class="debt-dot"></span>
                      Jami avans qarzi: <strong>{{ fmtN(emp.advance_balance) }}</strong>
                    </div>
                  </td>

                  <!-- Sof oylik -->
                  <td>
                    <div class="net-wrap">
                      <span class="net-amount" :style="{ color: emp.color }">
                        {{ fmtN(net(emp)) }}
                      </span>
                      <div class="net-formula">
                        <span>{{ fmtN(calcBaseSalary(emp)) }}</span>
                        <span v-if="emp.bonus > 0" class="f-green">+{{ fmtN(emp.bonus) }}</span>
                        <span v-if="emp.advance > 0" class="f-red">-{{ fmtN(emp.advance) }}</span>
                        <span v-if="emp.fine > 0" class="f-red">-{{ fmtN(emp.fine) }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Holat -->
                  <td>
                    <div class="status-wrap">
                      <span :class="['s-badge', emp.paid ? 'paid' : 'pending']">
                        <CheckCircle2 v-if="emp.paid" :size="12" />
                        <Clock v-else :size="12" />
                        {{ emp.paid ? "To'landi" : 'Kutilmoqda' }}
                      </span>
                      <p v-if="emp.paid && emp.paid_at" class="paid-date">{{ fmtDate(emp.paid_at) }}</p>
                    </div>
                  </td>

                  <!-- Amallar -->
                  <td class="act-cell">
                    <div class="act-inner">
                      <button
                        :class="['act-btn', emp.paid ? 'act-paid' : 'act-pay']"
                        :disabled="emp.paid"
                        :title="emp.paid ? 'To\'langan' : 'Oylikni to\'lash'"
                        @click="openPayModal(emp)"
                      ><DollarSign :size="14" /></button>
                      <button class="act-btn act-eye" title="Batafsil" @click="openDetail(emp)">
                        <Eye :size="14" />
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Empty state -->
                <tr v-if="salaries.length === 0">
                  <td colspan="7" class="empty-cell">
                    <Users :size="36" />
                    <p>Xodimlar topilmadi</p>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <span>{{ paidCount }}/{{ salaries.length }} ta to'langan</span>
          <span class="footer-right">To'lanmagan jami: <strong>{{ fmt(totalNet) }}</strong></span>
        </div>
      </div>

    </template>

    <!-- ════════════════════════════════════════════════════════
         TAB 2 — JARIMA QOIDALARI
    ═════════════════════════════════════════════════════════ -->
    <template v-if="activeTab === 'penalties'">

      <div class="table-card">
        <div class="card-head">
          <div class="card-title-group">
            <h2 class="card-title">Jarima qoidalari</h2>
            <span class="card-sub">Face ID kechikish jarimalar jadvali</span>
          </div>
          <div class="head-controls">
            <button class="icon-btn" @click="loadPenalties" :disabled="penLoading" title="Yangilash">
              <RefreshCw size="14" :class="{ spin: penLoading }" />
            </button>
            <button class="pay-all-btn" @click="openPenModal(null)">
              <Plus :size="15" /><span>Yangi qoida</span>
            </button>
          </div>
        </div>

        <div v-if="penError" class="err-bar">{{ penError }}</div>

        <!-- Info banner -->
        <div class="info-bar">
          <Info :size="15" />
          <span>Ushbu jadval Face ID orqali kechikkan xodimlar uchun avtomatik jarima hisoblashda ishlatiladi. Kechikish daqiqasi belgilangan oraliqqa tushsa, tegishli jarima qo'llaniladi.</span>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Kechikish (dan, daqiqa)</th>
                <th>Kechikish (gacha, daqiqa)</th>
                <th>Jarima miqdori</th>
                <th>Yaratilgan</th>
                <th class="th-act">Amallar</th>
              </tr>
            </thead>
            <tbody>
              <!-- Skeleton -->
              <template v-if="penLoading">
                <tr v-for="n in 4" :key="n">
                  <td><div class="sk sk-sm"></div></td>
                  <td><div class="sk sk-md"></div></td>
                  <td><div class="sk sk-md"></div></td>
                  <td><div class="sk sk-lg"></div></td>
                  <td><div class="sk sk-md"></div></td>
                  <td><div class="sk sk-sm"></div></td>
                </tr>
              </template>

              <template v-else>
                <tr v-for="(p, idx) in penalties" :key="p.id">
                  <td class="idx-cell">{{ idx + 1 }}</td>
                  <td>
                    <span class="range-chip">{{ p.min_time }} daq</span>
                  </td>
                  <td>
                    <span class="range-chip">{{ p.max_time }} daq</span>
                  </td>
                  <td class="mc mc-red mc-bold">{{ fmtN(p.summa) }}</td>
                  <td class="date-cell">{{ fmtDate(p.createdAt) }}</td>
                  <td class="act-cell">
                    <button class="act-btn act-eye" title="Tahrirlash" @click="openPenModal(p)">
                      <Pencil :size="14" />
                    </button>
                    <button class="act-btn act-del" title="O'chirish" @click="deletePenalty(p)">
                      <Trash2 :size="14" />
                    </button>
                  </td>
                </tr>

                <tr v-if="penalties.length === 0">
                  <td colspan="6" class="empty-cell">
                    <ShieldAlert :size="36" />
                    <p>Jarima qoidalari mavjud emas</p>
                    <button class="btn-pay" @click="openPenModal(null)">
                      <Plus :size="14" /> Birinchi qoidani qo'shish
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div class="table-footer" v-if="penalties.length > 0">
          <span>Jami {{ penalties.length }} ta qoida</span>
          <span class="footer-right">
            Maksimal jarima: <strong>{{ fmtN(maxPenalty) }}</strong>
          </span>
        </div>
      </div>

    </template>

    <!-- ══════════════ TOAST ══════════════ -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast', toast.type]">
        <CheckCircle2 v-if="toast.type === 'success'" :size="16" />
        <XCircle v-else :size="16" />
        {{ toast.msg }}
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════════════════
         MODALS
    ═══════════════════════════════════════════════════════ -->

    <!-- PAY MODAL -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="payM.open" class="overlay" @click.self="payM.open = false">
          <div class="modal">
            <div class="mhead">
              <h3 class="mtitle">Oylikni to'lash</h3>
              <button class="mclose" @click="payM.open = false"><X :size="18" /></button>
            </div>
            <div class="mbody">
              <div class="mprofile">
                <div class="mav" :style="{ background: payM.emp?.color + '22', color: payM.emp?.color }">
                  {{ payM.emp ? initials(payM.emp.name) : '' }}
                </div>
                <div>
                  <p class="mname">{{ payM.emp?.name }}</p>
                  <p class="mdept">{{ payM.emp?.position }}</p>
                </div>
              </div>
              <div class="msummary">
                <div class="mrow">
                  <span>Asosiy oylik</span>
                  <span>{{ fmtN(calcBaseSalary(payM.emp)) }}</span>
                </div>
                <div class="mrow mgreen"><span>Bonus</span><span>+{{ fmtN(payM.emp?.bonus) }}</span></div>
                <div class="mrow mblue">
                  <span>Avans ushlanadi</span>
                  <span>-{{ fmtN(payM.emp?.advance) }}</span>
                </div>
                <div class="mrow" v-if="payM.emp?.advance_balance > 0" style="font-size:11px;opacity:0.7">
                  <span>Umumiy avans qarzi</span>
                  <span style="color:#dc2626">{{ fmtN(payM.emp?.advance_balance) }}</span>
                </div>
                <div class="mrow mred"><span>Jarima (Face ID)</span><span>-{{ fmtN(payM.emp?.faceIdFine) }}</span></div>
                <div class="mrow mred"><span>Jarima (qo'lda)</span><span>-{{ fmtN(payM.emp?.manualFine) }}</span></div>
                <div class="mrow mtotal">
                  <span>Sof oylik</span>
                  <span>{{ payM.emp ? fmtN(net(payM.emp)) : '' }}</span>
                </div>
              </div>
            </div>
            <div class="mfoot">
              <button class="btn-cancel" @click="payM.open = false">Bekor</button>
              <button class="btn-pay" @click="confirmPay" :disabled="saving">
                <DollarSign :size="15" /> {{ saving ? 'Saqlanmoqda…' : "To'lash" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- BONUS MODAL -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="bonusM.open" class="overlay" @click.self="bonusM.open = false">
          <div class="modal modal-sm">
            <div class="mhead">
              <h3 class="mtitle">Bonus belgilash</h3>
              <button class="mclose" @click="bonusM.open = false"><X :size="18" /></button>
            </div>
            <div class="mbody">
              <div class="mprofile">
                <div class="mav mav-sm" :style="{ background: bonusM.emp?.color + '22', color: bonusM.emp?.color }">
                  {{ initials(bonusM.emp?.name) }}
                </div>
                <p class="mname">{{ bonusM.emp?.name }}</p>
              </div>
              <div class="fgroup">
                <label class="flabel">Bonus miqdori (so'm)</label>
                <input
                  v-model.number="bonusM.amount"
                  type="number" class="finput" min="0"
                  placeholder="500 000"
                  @keyup.enter="saveBonus"
                />
              </div>
            </div>
            <div class="mfoot">
              <button class="btn-cancel" @click="bonusM.open = false">Bekor</button>
              <button class="btn-pay" @click="saveBonus" :disabled="saving">
                {{ saving ? 'Saqlanmoqda…' : 'Saqlash' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- AVANS MODAL -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="advM.open" class="overlay" @click.self="advM.open = false">
          <div class="modal modal-sm">
            <div class="mhead">
              <h3 class="mtitle">Oylikdan avans ushlab qolish</h3>
              <button class="mclose" @click="advM.open = false"><X :size="18" /></button>
            </div>
            <div class="mbody">
              <div class="mprofile">
                <div class="mav mav-sm" :style="{ background: advM.emp?.color + '22', color: advM.emp?.color }">
                  {{ initials(advM.emp?.name) }}
                </div>
                <div>
                  <p class="mname">{{ advM.emp?.name }}</p>
                  <p class="mdept" v-if="advM.emp?.advance_balance > 0" style="color:#dc2626">
                    Jami avans qarzi: <strong>{{ fmtN(advM.emp?.advance_balance) }}</strong>
                  </p>
                  <p class="mdept" v-else style="color:#059669">Faol avans qarzi yo'q</p>
                </div>
              </div>
              <div class="fgroup">
                <label class="flabel">Bu oyda ushlab qolish miqdori (so'm)</label>
                <input
                  v-model.number="advM.amount"
                  type="number" class="finput" min="0"
                  placeholder="0"
                  @keyup.enter="saveAdv"
                />
              </div>
              <div v-if="advM.emp?.advance_balance > 0" class="adv-quick-btns">
                <button class="adv-quick-btn" @click="advM.amount = advM.emp?.advance_balance">
                  To'liq qarzni ushlab qolish ({{ fmtN(advM.emp?.advance_balance) }})
                </button>
              </div>
              <p class="adv-hint">
                Oylik to'langanda bu miqdor avans jadvalidagi qarzdan avtomatik chegiriladi.
              </p>
            </div>
            <div class="mfoot">
              <button class="btn-cancel" @click="advM.open = false">Bekor</button>
              <button class="btn-pay" @click="saveAdv" :disabled="saving">
                {{ saving ? 'Saqlanmoqda…' : 'Saqlash' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- FINE MODAL -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="fineM.open" class="overlay" @click.self="fineM.open = false">
          <div class="modal modal-sm">
            <div class="mhead">
              <h3 class="mtitle">Jarima qo'shish</h3>
              <button class="mclose" @click="fineM.open = false"><X :size="18" /></button>
            </div>
            <div class="mbody">
              <div class="mprofile">
                <div class="mav mav-sm" :style="{ background: fineM.emp?.color + '22', color: fineM.emp?.color }">
                  {{ initials(fineM.emp?.name) }}
                </div>
                <p class="mname">{{ fineM.emp?.name }}</p>
              </div>
              <div class="fgroup">
                <label class="flabel">Miqdor (so'm)</label>
                <input
                  v-model.number="fineM.amount"
                  type="number" class="finput" min="1"
                  placeholder="50 000"
                />
              </div>
              <div class="fgroup">
                <label class="flabel">Sababi</label>
                <input
                  v-model="fineM.reason"
                  type="text" class="finput"
                  placeholder="Kech kelish, sifatsiz ish…"
                  @keyup.enter="saveFine"
                />
              </div>
            </div>
            <div class="mfoot">
              <button class="btn-cancel" @click="fineM.open = false">Bekor</button>
              <button
                class="btn-danger"
                @click="saveFine"
                :disabled="saving || fineM.amount <= 0"
              >{{ saving ? 'Saqlanmoqda…' : "Qo'shish" }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- DETAIL MODAL -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="detM.open" class="overlay" @click.self="detM.open = false">
          <div class="modal">
            <div class="mhead">
              <h3 class="mtitle">Oylik tafsiloti</h3>
              <button class="mclose" @click="detM.open = false"><X :size="18" /></button>
            </div>
            <div class="mbody" v-if="detM.emp">
              <div class="mprofile">
                <div class="mav" :style="{ background: detM.emp.color + '22', color: detM.emp.color }">
                  {{ initials(detM.emp.name) }}
                </div>
                <div>
                  <p class="mname">{{ detM.emp.name }}</p>
                  <p class="mdept">{{ detM.emp.position }} · {{ detM.emp.department }}</p>
                </div>
              </div>

              <div class="det-grid">
                <div class="det-item">
                  <span class="det-lbl">Ish kunlari</span>
                  <span class="det-val">{{ detM.emp.workedDays }}/{{ detM.emp.totalWorkDays }}</span>
                </div>
                <div class="det-item">
                  <span class="det-lbl">Davomat %</span>
                  <span class="det-val">{{ pct(detM.emp.workedDays, detM.emp.totalWorkDays) }}%</span>
                </div>
                <div class="det-item">
                  <span class="det-lbl">Asosiy oylik</span>
                  <span class="det-val">{{ fmtN(calcBaseSalary(detM.emp)) }}</span>
                </div>
                <div class="det-item">
                  <span class="det-lbl">Bonus</span>
                  <span class="det-val mgreen">+{{ fmtN(detM.emp.bonus) }}</span>
                </div>
                <div class="det-item">
                  <span class="det-lbl">Oylikdan ushlanadi</span>
                  <span class="det-val mblue">-{{ fmtN(detM.emp.advance) }}</span>
                </div>
                <div class="det-item" v-if="detM.emp.advance_balance > 0">
                  <span class="det-lbl">Umumiy avans qarzi</span>
                  <span class="det-val mred">{{ fmtN(detM.emp.advance_balance) }}</span>
                </div>
                <div class="det-item">
                  <span class="det-lbl">Face ID jarima</span>
                  <span class="det-val mred">-{{ fmtN(detM.emp.faceIdFine) }}</span>
                </div>
                <div class="det-item">
                  <span class="det-lbl">Qo'lda jarima</span>
                  <span class="det-val mred">-{{ fmtN(detM.emp.manualFine) }}</span>
                </div>
                <div class="det-item">
                  <span class="det-lbl">Holat</span>
                  <span :class="['s-badge', detM.emp.paid ? 'paid' : 'pending']">
                    {{ detM.emp.paid ? "To'landi" : 'Kutilmoqda' }}
                  </span>
                </div>
              </div>

              <div class="det-net">
                <span>Sof oylik</span>
                <span class="det-net-val">{{ fmtN(net(detM.emp)) }}</span>
              </div>

              <div v-if="detM.emp.note" class="det-note">
                <span class="det-lbl">Izoh:</span> {{ detM.emp.note }}
              </div>
            </div>
            <div class="mfoot">
              <button class="btn-cancel" @click="detM.open = false">Yopish</button>
              <button
                v-if="detM.emp && !detM.emp.paid"
                class="btn-pay"
                @click="openPayModal(detM.emp); detM.open = false"
              ><DollarSign :size="15" /> To'lash</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- PENALTY RULE MODAL -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="penM.open" class="overlay" @click.self="penM.open = false">
          <div class="modal modal-sm">
            <div class="mhead">
              <h3 class="mtitle">{{ penM.id ? 'Qoidani tahrirlash' : 'Yangi jarima qoidasi' }}</h3>
              <button class="mclose" @click="penM.open = false"><X :size="18" /></button>
            </div>
            <div class="mbody">
              <div class="frow">
                <div class="fgroup">
                  <label class="flabel">Kechikish (dan, daqiqa)</label>
                  <input v-model.number="penM.min_time" type="number" class="finput" min="0" placeholder="0" />
                </div>
                <div class="fgroup">
                  <label class="flabel">Kechikish (gacha, daqiqa)</label>
                  <input v-model.number="penM.max_time" type="number" class="finput" min="1" placeholder="30" />
                </div>
              </div>
              <div class="fgroup">
                <label class="flabel">Jarima miqdori (so'm)</label>
                <input
                  v-model.number="penM.summa"
                  type="number" class="finput" min="0"
                  placeholder="50 000"
                  @keyup.enter="savePenalty"
                />
              </div>
              <div v-if="penM.err" class="finput-err">{{ penM.err }}</div>
            </div>
            <div class="mfoot">
              <button class="btn-cancel" @click="penM.open = false">Bekor</button>
              <button class="btn-pay" @click="savePenalty" :disabled="saving">
                {{ saving ? 'Saqlanmoqda…' : 'Saqlash' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Banknote, CreditCard, ShieldAlert, TrendingUp,
  CheckCheck, DollarSign, Eye,
  X, CheckCircle2, XCircle, Clock, RefreshCw,
  Plus, Pencil, Trash2, Info, Users, BadgeDollarSign
} from 'lucide-vue-next'
import { api } from '@/api/api.js'

// ── Tabs ─────────────────────────────────────────────────
const tabs = [
  { key: 'salary',    label: 'Oylik hisob-kitob', icon: BadgeDollarSign },
  { key: 'penalties', label: 'Jarima qoidalari',  icon: ShieldAlert },
]
const activeTab = ref('salary')

// ── Constants ─────────────────────────────────────────────
const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
const now    = new Date()
const month  = ref(now.getMonth() + 1)
const year   = ref(now.getFullYear())
const years  = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]

const saving = ref(false)

// ── Toast ─────────────────────────────────────────────────
const toast = ref({ show: false, msg: '', type: 'success' })
let toastTimer = null
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.value = { show: true, msg, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3000)
}

// ── Formatters ────────────────────────────────────────────
const initials = (n) => (n || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
const pct      = (a, b) => b ? Math.round(a / b * 100) : 0

const fmtN = (v) => {
  const n = Number(v) || 0
  return n.toLocaleString('uz-UZ') + " so'm"
}
const fmt = (v) => {
  const n = Number(v) || 0
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + " mln so'm"
  return n.toLocaleString('uz-UZ') + " so'm"
}
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
  : ''

/**
 * to_count_time = true → vaqt hisobi bo'yicha (nisbiy oylik)
 * to_count_time = false → belgilangan oylik to'liq
 */
const calcBaseSalary = (e) => {
  if (!e) return 0
  if (e.to_count_time && e.totalWorkDays > 0) {
    return Math.round((e.salary || 0) * e.workedDays / e.totalWorkDays)
  }
  return e.salary || 0
}

/** Sof oylik */
const net = (e) => {
  if (!e) return 0
  return Math.max(0, calcBaseSalary(e) + (e.bonus || 0) - (e.advance || 0) - (e.fine || 0))
}

// ══════════════════════════════════════════════════════════
// OYLIK TAB
// ══════════════════════════════════════════════════════════
const salLoading = ref(false)
const salError   = ref('')
const salaries   = ref([])

// Stats
const totalFund     = computed(() => salaries.value.reduce((a, e) => a + (e.salary || 0), 0))
const totalAdvances = computed(() => salaries.value.reduce((a, e) => a + (e.advance || 0), 0))
const totalFines    = computed(() => salaries.value.reduce((a, e) => a + (e.fine || 0), 0))
const totalNet      = computed(() => salaries.value.filter(e => !e.paid).reduce((a, e) => a + net(e), 0))
const paidCount     = computed(() => salaries.value.filter(e => e.paid).length)

async function loadSalaries() {
  salLoading.value = true
  salError.value   = ''
  try {
    const res = await api.getSalaries(month.value, year.value)
    salaries.value = res.data || []
  } catch (e) {
    salError.value = e.message || "Ma'lumot yuklanmadi"
  } finally {
    salLoading.value = false
  }
}

// ── Pay ───────────────────────────────────────────────────
const payM = ref({ open: false, emp: null })
const openPayModal = (emp) => { payM.value = { open: true, emp } }

async function confirmPay() {
  if (!payM.value.emp) return
  saving.value = true
  try {
    await api.updateSalary(payM.value.emp.id, { month: month.value, year: year.value, paid: true })
    await loadSalaries()
    payM.value.open = false
    showToast(`${payM.value.emp?.name} oylig'i to'landi`)
  } catch (e) {
    showToast(e.message, 'error')
  } finally { saving.value = false }
}

async function payAll() {
  const unpaid = salaries.value.filter(e => !e.paid)
  if (!unpaid.length) { showToast("Barcha oyliklar to'langan", 'error'); return }
  if (!confirm(`${unpaid.length} ta xodim oyligini to'langan deb belgilamoqchimisiz?`)) return
  saving.value = true
  try {
    await Promise.all(unpaid.map(e =>
      api.updateSalary(e.id, { month: month.value, year: year.value, paid: true })
    ))
    await loadSalaries()
    showToast(`${unpaid.length} ta xodim oylig'i to'landi`)
  } catch (e) {
    showToast(e.message, 'error')
  } finally { saving.value = false }
}

// ── Bonus ─────────────────────────────────────────────────
const bonusM = ref({ open: false, emp: null, amount: 0 })
const openBonusModal = (emp) => { bonusM.value = { open: true, emp, amount: emp.bonus || 0 } }

async function saveBonus() {
  if (!bonusM.value.emp) return
  saving.value = true
  try {
    await api.updateSalary(bonusM.value.emp.id, {
      month: month.value, year: year.value,
      bonus: bonusM.value.amount,
    })
    await loadSalaries()
    bonusM.value.open = false
    showToast('Bonus saqlandi')
  } catch (e) {
    showToast(e.message, 'error')
  } finally { saving.value = false }
}

// ── Avans ─────────────────────────────────────────────────
const advM = ref({ open: false, emp: null, amount: 0 })
const openAdvModal = (emp) => { advM.value = { open: true, emp, amount: emp.advance || 0 } }

async function saveAdv() {
  if (!advM.value.emp) return
  saving.value = true
  try {
    await api.updateSalary(advM.value.emp.id, {
      month: month.value, year: year.value,
      advance: advM.value.amount,
    })
    await loadSalaries()
    advM.value.open = false
    showToast('Avans saqlandi')
  } catch (e) {
    showToast(e.message, 'error')
  } finally { saving.value = false }
}

// ── Fine ──────────────────────────────────────────────────
const fineM = ref({ open: false, emp: null, amount: 0, reason: '' })
const openFineModal = (emp) => { fineM.value = { open: true, emp, amount: 0, reason: '' } }

async function saveFine() {
  if (!fineM.value.emp || fineM.value.amount <= 0) return
  saving.value = true
  try {
    await api.addFine(fineM.value.emp.id, {
      month: month.value, year: year.value,
      amount: fineM.value.amount,
      note:   fineM.value.reason,
    })
    await loadSalaries()
    fineM.value.open = false
    showToast("Jarima qo'shildi")
  } catch (e) {
    showToast(e.message, 'error')
  } finally { saving.value = false }
}

// ── Detail ────────────────────────────────────────────────
const detM = ref({ open: false, emp: null })
const openDetail = (emp) => { detM.value = { open: true, emp } }

// ══════════════════════════════════════════════════════════
// PENALTIES TAB
// ══════════════════════════════════════════════════════════
const penLoading = ref(false)
const penError   = ref('')
const penalties  = ref([])

const maxPenalty = computed(() =>
  penalties.value.reduce((m, p) => Math.max(m, parseFloat(p.summa) || 0), 0)
)

async function loadPenalties() {
  penLoading.value = true
  penError.value   = ''
  try {
    const rows = await api.getPenalties()
    penalties.value = rows || []
  } catch (e) {
    penError.value = e.message || "Ma'lumot yuklanmadi"
  } finally {
    penLoading.value = false
  }
}

// ── Penalty modal ─────────────────────────────────────────
const penM = ref({ open: false, id: null, min_time: 0, max_time: 30, summa: 0, err: '' })

function openPenModal(row) {
  penM.value = row
    ? { open: true, id: row.id, min_time: row.min_time, max_time: row.max_time, summa: parseFloat(row.summa), err: '' }
    : { open: true, id: null, min_time: 0, max_time: 30, summa: 0, err: '' }
}

function validatePen() {
  if (penM.value.min_time == null || penM.value.min_time < 0) return 'Minimal vaqt 0 dan katta yoki teng bo\'lishi kerak'
  if (!penM.value.max_time || penM.value.max_time <= penM.value.min_time) return 'Maksimal vaqt minimal vaqtdan katta bo\'lishi kerak'
  if (!penM.value.summa || penM.value.summa <= 0) return 'Jarima miqdori 0 dan katta bo\'lishi kerak'
  return ''
}

async function savePenalty() {
  penM.value.err = validatePen()
  if (penM.value.err) return
  saving.value = true
  try {
    const body = { min_time: penM.value.min_time, max_time: penM.value.max_time, summa: penM.value.summa }
    if (penM.value.id) {
      await api.updatePenalty(penM.value.id, body)
      showToast('Qoida yangilandi')
    } else {
      await api.createPenalty(body)
      showToast("Yangi qoida qo'shildi")
    }
    await loadPenalties()
    penM.value.open = false
  } catch (e) {
    showToast(e.message, 'error')
  } finally { saving.value = false }
}

async function deletePenalty(row) {
  if (!confirm(`"${row.min_time}–${row.max_time} daqiqa" qoidasini o'chirishni tasdiqlaysizmi?`)) return
  saving.value = true
  try {
    await api.deletePenalty(row.id)
    await loadPenalties()
    showToast("Qoida o'chirildi")
  } catch (e) {
    showToast(e.message, 'error')
  } finally { saving.value = false }
}

// ── Init ──────────────────────────────────────────────────
onMounted(() => {
  loadSalaries()
  loadPenalties()
})
</script>

<style scoped>
.salary-page {
  padding: 24px;
  background: var(--bg);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}

/* ── TABS ────────────────────────────────────────────────── */
.tabs-bar {
  display: flex;
  gap: 6px;
  background: var(--surface);
  border-radius: 12px;
  padding: 5px;
  box-shadow: 0 1px 4px var(--shadow-sm);
  width: fit-content;
}
.tab-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 8px; border: none;
  font-size: 13px; font-weight: 600; cursor: pointer;
  background: none; color: var(--t3);
  font-family: inherit; transition: all 0.18s;
}
.tab-btn:hover { color: var(--t1); background: var(--surface2); }
.tab-btn.active {
  background: var(--accent); color: #fff;
  box-shadow: 0 2px 8px rgba(124,58,237,0.3);
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
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 1px 4px var(--shadow-sm);
  border-bottom: 3px solid var(--ca);
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px var(--shadow-md); }
.stat-icon {
  width: 44px; height: 44px; border-radius: 11px;
  background: var(--ca-bg); color: var(--ca);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
:global(.layout.dark) .stat-icon { background: color-mix(in srgb, var(--ca) 15%, transparent); }
.stat-val { display: block; font-size: 17px; font-weight: 700; color: var(--t1); line-height: 1.1; white-space: nowrap; }
.stat-lbl { display: block; font-size: 11.5px; color: var(--t3); margin-top: 3px; }

/* ── TABLE CARD ─────────────────────────────────────────── */
.table-card {
  background: var(--surface);
  border-radius: 14px;
  box-shadow: 0 1px 6px var(--shadow-sm);
  overflow: hidden;
}
.card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--border);
  gap: 12px; flex-wrap: wrap;
}
.card-title-group { display: flex; align-items: baseline; gap: 10px; }
.card-title { font-size: 16px; font-weight: 700; color: var(--t1); margin: 0; }
.card-sub   { font-size: 13px; color: var(--t3); }
.head-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.sel {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 8px; padding: 7px 10px;
  font-size: 13px; color: var(--t2); outline: none; cursor: pointer;
  font-family: inherit;
}
.sel:focus { border-color: var(--accent-br); }

.icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid var(--border); background: var(--surface2);
  color: var(--t3); cursor: pointer; transition: all 0.15s;
}
.icon-btn:hover { background: var(--accent-hv); color: var(--accent); }

.pay-all-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px; border: none;
  background: var(--accent); color: #fff;
  font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: opacity 0.15s;
}
.pay-all-btn:hover { opacity: 0.88; }
.pay-all-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.err-bar {
  margin: 12px 20px 0;
  padding: 10px 14px;
  background: #fee2e2; color: #dc2626;
  border-radius: 8px; font-size: 13px;
}

/* Info bar */
.info-bar {
  display: flex; align-items: flex-start; gap: 10px;
  margin: 12px 20px 0;
  padding: 12px 14px;
  background: #dbeafe; color: #1d4ed8;
  border-radius: 8px; font-size: 12.5px; line-height: 1.5;
}
:global(.layout.dark) .info-bar { background: rgba(37,99,235,0.15); color: #93c5fd; }
.info-bar svg { flex-shrink: 0; margin-top: 1px; }

/* ── TABLE ──────────────────────────────────────────────── */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }

thead th {
  background: var(--surface2);
  padding: 10px 16px;
  font-size: 10.5px; font-weight: 700; color: var(--t4);
  text-transform: uppercase; letter-spacing: 0.06em;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.th-act { width: 80px; text-align: center; }

tbody tr {
  border-bottom: 1px solid var(--border2);
  transition: background-color 0.12s;
}
tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: var(--accent-hv); }
tbody tr.row-paid { opacity: 0.55; }

td { padding: 13px 16px; color: var(--t2); vertical-align: middle; }

.idx-cell { font-size: 12px; color: var(--t4); font-weight: 700; width: 40px; }
.date-cell { font-size: 12px; color: var(--t4); white-space: nowrap; }

/* ── XODIM ──────────────────────────────────────────────── */
.emp-cell { display: flex; align-items: center; gap: 11px; }
.av {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800;
}
.emp-info { display: flex; flex-direction: column; gap: 2px; }
.emp-name { font-size: 13px; font-weight: 600; color: var(--t1); white-space: nowrap; }
.emp-dept { font-size: 11px; color: var(--t4); }

/* ── ISH KUNLARI ────────────────────────────────────────── */
.days-wrap   { display: flex; flex-direction: column; gap: 6px; min-width: 100px; }
.days-header { display: flex; align-items: baseline; gap: 5px; }
.days-num    { font-size: 18px; font-weight: 800; color: var(--t1); line-height: 1; }
.days-of     { font-size: 11px; color: var(--t4); }
.days-pct    { margin-left: auto; font-size: 11px; font-weight: 700; color: var(--t3); }
.days-bar-bg   { height: 5px; background: var(--border2); border-radius: 3px; overflow: hidden; }
.days-bar-fill { height: 5px; border-radius: 3px; transition: width 0.5s ease; min-width: 3px; }

/* ── ASOSIY OYLIK ───────────────────────────────────────── */
.base-sal-wrap { display: flex; flex-direction: column; gap: 3px; }
.base-sal-num  { font-size: 14px; font-weight: 700; color: var(--t1); white-space: nowrap; }
.base-sal-of   { font-size: 10.5px; color: var(--t4); }
.prop-badge {
  display: inline-flex; align-items: center;
  padding: 1px 6px; border-radius: 4px;
  background: #fef3c7; color: #92400e;
  font-size: 10px; font-weight: 700; width: fit-content;
}
:global(.layout.dark) .prop-badge { background: rgba(217,119,6,0.2); color: #fbbf24; }

/* ── BONUS / AVANS / JARIMA ─────────────────────────────── */
.adj-row {
  display: flex; gap: 6px; flex-wrap: wrap;
}

.adj-chip {
  display: flex; flex-direction: column; gap: 2px;
  padding: 6px 10px; border-radius: 8px; border: 1px solid transparent;
  cursor: pointer; font-family: inherit; text-align: left;
  transition: all 0.15s; min-width: 80px;
}
.adj-chip:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

.adj-lbl {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.04em; display: flex; align-items: center; gap: 4px;
}
.adj-val { font-size: 12px; font-weight: 700; }

/* Green — bonus */
.adj-green {
  background: #f0fdf4; border-color: #bbf7d0; color: #166534;
}
.adj-green:not(:disabled):hover {
  background: #dcfce7; border-color: #4ade80;
}
:global(.layout.dark) .adj-green {
  background: rgba(5,150,105,0.1); border-color: rgba(5,150,105,0.25); color: #34d399;
}

/* Blue — avans */
.adj-blue {
  background: #eff6ff; border-color: #bfdbfe; color: #1e40af;
}
.adj-blue:not(:disabled):hover {
  background: #dbeafe; border-color: #60a5fa;
}
:global(.layout.dark) .adj-blue {
  background: rgba(37,99,235,0.1); border-color: rgba(37,99,235,0.25); color: #60a5fa;
}

/* Red — jarima */
.adj-red {
  background: #fff7f7; border-color: #fecaca; color: #991b1b;
}
.adj-red:not(:disabled):hover {
  background: #fee2e2; border-color: #f87171;
}
:global(.layout.dark) .adj-red {
  background: rgba(220,38,38,0.1); border-color: rgba(220,38,38,0.25); color: #f87171;
}

/* Avans qarz dot */
.adj-debt-dot {
  display: inline-flex; align-items: center; justify-content: center;
  width: 14px; height: 14px; border-radius: 50%;
  background: #dc2626; color: #fff;
  font-size: 9px; font-weight: 800; flex-shrink: 0;
}

/* Debt indicator below adj-row */
.debt-indicator {
  margin-top: 5px;
  display: flex; align-items: center; gap: 5px;
  font-size: 10.5px; color: #dc2626; font-weight: 500;
}
.debt-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #dc2626; flex-shrink: 0;
  animation: pulse-dot 1.5s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.7); }
}

/* ── SOF OYLIK ──────────────────────────────────────────── */
.net-wrap    { display: flex; flex-direction: column; gap: 4px; }
.net-amount  {
  font-size: 16px; font-weight: 800;
  white-space: nowrap; line-height: 1.1;
}
.net-formula {
  display: flex; flex-wrap: wrap; gap: 3px; align-items: center;
  font-size: 10px; color: var(--t4);
}
.net-formula span { white-space: nowrap; }
.f-green { color: #059669; font-weight: 600; }
.f-red   { color: #dc2626; font-weight: 600; }

/* ── HOLAT ──────────────────────────────────────────────── */
.status-wrap { display: flex; flex-direction: column; gap: 3px; }

.s-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 20px;
  font-size: 11.5px; font-weight: 700; white-space: nowrap; width: fit-content;
}
.paid    { background: #d1fae5; color: #059669; }
.pending { background: #fef3c7; color: #d97706; }
:global(.layout.dark) .paid    { background: rgba(5,150,105,0.2); color: #34d399; }
:global(.layout.dark) .pending { background: rgba(217,119,6,0.2); color: #fbbf24; }

.paid-date { font-size: 10.5px; color: var(--t4); margin: 0; }

/* ── AMALLAR ────────────────────────────────────────────── */
.act-cell  { text-align: center; }
.act-inner { display: flex; gap: 6px; align-items: center; justify-content: center; }
.act-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid var(--border); background: var(--surface2);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--t3); transition: all 0.15s;
}
.act-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.act-pay:not(:disabled):hover { background: #d1fae5; border-color: #6ee7b7; color: #059669; }
.act-paid   { background: #d1fae5; border-color: #6ee7b7; color: #059669; }
.act-eye:hover { background: var(--accent-bg); border-color: var(--accent-br); color: var(--accent); }
.act-del:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }

/* Range chip (jarima qoidalari tab uchun) */
.range-chip {
  display: inline-block; padding: 3px 10px; border-radius: 20px;
  background: var(--surface2); border: 1px solid var(--border);
  font-size: 12px; font-weight: 600; color: var(--t2);
}

/* Empty state */
.empty-cell {
  text-align: center; padding: 48px 20px !important;
  color: var(--t4); display: table-cell; vertical-align: middle;
}
.empty-cell svg { opacity: 0.35; margin-bottom: 12px; display: block; margin-inline: auto; }
.empty-cell p   { font-size: 13px; margin: 0 0 14px; }

/* Footer */
.table-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 20px; border-top: 1px solid var(--border);
  font-size: 13px; color: var(--t3);
}
.footer-right { font-size: 13px; color: var(--t2); }
.footer-right strong { color: var(--accent); }

/* ── SKELETON ───────────────────────────────────────────── */
.sk {
  background: linear-gradient(90deg, var(--border) 25%, var(--border2) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
  border-radius: 5px; height: 12px;
}
.sk-av { width: 38px; height: 38px; border-radius: 50%; }
.sk-sm { width: 50px; }
.sk-md { width: 80px; }
.sk-lg { width: 120px; }
.sk-xl { width: 200px; height: 52px; border-radius: 8px; }

@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.spin { animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── TOAST ──────────────────────────────────────────────── */
.toast {
  position: fixed; bottom: 28px; right: 28px; z-index: 9999;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 20px; border-radius: 10px;
  font-size: 13px; font-weight: 600;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  pointer-events: none;
}
.toast.success { background: #059669; color: #fff; }
.toast.error   { background: #dc2626; color: #fff; }

.toast-enter-active { animation: slideUp 0.3s ease; }
.toast-leave-active { animation: slideUp 0.25s ease reverse; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── MODALS ─────────────────────────────────────────────── */
.overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.45); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal {
  background: var(--surface); border-radius: 16px;
  width: 100%; max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  overflow: hidden;
}
.modal-sm { max-width: 380px; }

.mhead {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--border);
}
.mtitle { font-size: 15px; font-weight: 700; color: var(--t1); margin: 0; }
.mclose {
  width: 30px; height: 30px; border-radius: 8px;
  border: none; background: var(--surface2); color: var(--t3);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.mclose:hover { background: var(--accent-bg); color: var(--accent); }

.mbody { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

.mprofile { display: flex; align-items: center; gap: 12px; }
.mav {
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800;
}
.mav-sm { width: 36px; height: 36px; font-size: 11px; }
.mname { font-size: 15px; font-weight: 700; color: var(--t1); margin: 0; }
.mdept { font-size: 12px; color: var(--t4); margin: 2px 0 0; }

.msummary { display: flex; flex-direction: column; gap: 2px; background: var(--surface2); border-radius: 10px; padding: 14px; }
.mrow {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 0; border-bottom: 1px solid var(--border2);
  font-size: 13px; color: var(--t2);
}
.mrow:last-child { border-bottom: none; }
.mrow span:last-child { font-weight: 600; }
.mgreen span:last-child { color: #059669; }
.mblue  span:last-child { color: #2563eb; }
.mred   span:last-child { color: #dc2626; }
.mtotal { margin-top: 4px; padding-top: 10px; border-top: 2px solid var(--border) !important; }
.mtotal span { font-size: 15px; font-weight: 800; color: var(--t1); }

/* Form */
.frow { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.fgroup { display: flex; flex-direction: column; gap: 6px; }
.flabel { font-size: 12px; font-weight: 600; color: var(--t3); }
.finput {
  border: 1.5px solid var(--border); border-radius: 8px;
  padding: 9px 12px; font-size: 13px; color: var(--t1);
  background: var(--surface2); outline: none;
  font-family: inherit; transition: border-color 0.15s;
}
.finput:focus { border-color: var(--accent-br); }
.finput-err { font-size: 12px; color: #dc2626; padding: 6px 10px; background: #fee2e2; border-radius: 7px; }

/* Detail */
.det-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 12px; background: var(--surface2); border-radius: 10px; padding: 14px;
}
.det-item { display: flex; flex-direction: column; gap: 3px; }
.det-lbl  { font-size: 11px; color: var(--t4); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.det-val  { font-size: 14px; font-weight: 700; color: var(--t1); }
.det-val.mgreen { color: #059669; }
.det-val.mblue  { color: #2563eb; }
.det-val.mred   { color: #dc2626; }

.det-net {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 14px; background: var(--accent-bg);
  border: 1px solid var(--accent-br); border-radius: 10px;
}
.det-net-val { font-size: 18px; font-weight: 800; color: var(--accent); }

.det-note {
  font-size: 12.5px; color: var(--t3);
  padding: 10px 14px; background: var(--surface2); border-radius: 8px;
}

/* Footer */
.mfoot {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 20px; border-top: 1px solid var(--border);
}
.btn-cancel {
  padding: 9px 18px; border-radius: 8px; border: 1px solid var(--border);
  background: none; color: var(--t2); font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-cancel:hover { background: var(--surface2); }
.btn-pay {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 20px; border-radius: 8px; border: none;
  background: var(--accent); color: #fff;
  font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: opacity 0.15s;
}
.btn-pay:hover { opacity: 0.88; }
.btn-pay:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger {
  padding: 9px 20px; border-radius: 8px; border: none;
  background: #dc2626; color: #fff;
  font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: opacity 0.15s;
}
.btn-danger:hover { opacity: 0.88; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

/* Modal transition */
.modal-enter-active { animation: modalIn 0.25s ease; }
.modal-leave-active { animation: modalIn 0.2s ease reverse; }
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ── AVANS CELL ─────────────────────────────────────────── */
.adv-cell-wrap { display: flex; flex-direction: column; gap: 3px; }
.adv-balance-tag {
  font-size: 10px; font-weight: 600; color: #dc2626;
  background: #fee2e2; border-radius: 4px; padding: 1px 6px;
  white-space: nowrap; cursor: help;
}
:global(.layout.dark) .adv-balance-tag { background: rgba(220,38,38,0.15); }

/* ── AVANS MODAL ────────────────────────────────────────── */
.adv-quick-btns { display: flex; flex-direction: column; gap: 6px; }
.adv-quick-btn {
  padding: 8px 12px; border-radius: 8px;
  border: 1px solid var(--accent-br); background: var(--accent-bg);
  color: var(--accent); font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.15s; text-align: left;
}
.adv-quick-btn:hover { background: var(--accent); color: #fff; }
.adv-hint {
  font-size: 11.5px; color: var(--t4); margin: 0;
  padding: 8px 10px; background: var(--surface2); border-radius: 7px;
}
</style>
