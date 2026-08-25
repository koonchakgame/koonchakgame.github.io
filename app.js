const STORAGE_KEY = "row-guild-war-manager:v1";
const LANG_KEY = "row-guild-war-manager:language";

const JOBS = [
  "Swordsman",
  "Mage",
  "Archer",
  "Acolyte",
  "Thief",
  "Merchant",
  "Gunslinger",
  "Druid",
];

const I18N = {
  th: {
    "app.eyebrow": "ระบบจัดการข้อมูลกิลวอ",
    "nav.dashboard": "ภาพรวม",
    "nav.members": "สมาชิก",
    "nav.parties": "สนามกิลวอ",
    "nav.leave": "แจ้งลาวอ",
    "nav.attendance": "เช็คชื่อ",
    "nav.logs": "Log",
    "language.label": "ภาษา",
    "storage.autoSave": "บันทึกอัตโนมัติ",
    "storage.ready": "พร้อมใช้งาน",
    "storage.saved": "บันทึกแล้ว",
    "actions.export": "Export",
    "actions.import": "Import",
    "stats.totalMembers": "สมาชิกทั้งหมด",
    "stats.readyMembers": "พร้อมลงวอ",
    "stats.leaveMembers": "แจ้งลา",
    "stats.checkedMembers": "เช็คชื่อวันนี้",
    "dashboard.jobCount": "จำนวนสมาชิกตามอาชีพ",
    "dashboard.recentActivity": "กิจกรรมล่าสุด",
    "members.formTitle": "เพิ่ม / แก้ไขสมาชิก",
    "members.name": "ชื่อตัวละคร",
    "members.namePlaceholder": "เช่น LeaderKung",
    "members.job": "อาชีพ",
    "members.role": "บทบาทในวอ",
    "members.note": "หมายเหตุ",
    "members.notePlaceholder": "ของ, เวลาออนไลน์, หน้าที่พิเศษ",
    "members.save": "บันทึกสมาชิก",
    "members.reset": "ล้างฟอร์ม",
    "members.listTitle": "รายชื่อสมาชิก",
    "members.search": "ค้นหาชื่อ / อาชีพ",
    "parties.addMain": "เพิ่มปาร์ตี้สนามหลัก",
    "parties.addReserve": "เพิ่มปาร์ตี้สนามรอง",
    "parties.main": "สนามหลัก",
    "parties.reserve": "สนามรอง",
    "leave.formTitle": "แจ้งลาวอ",
    "leave.member": "สมาชิก",
    "leave.date": "วันที่",
    "leave.reason": "เหตุผล",
    "leave.reasonPlaceholder": "เช่น ติดงาน / ไม่อยู่บ้าน",
    "leave.save": "บันทึกการลา",
    "leave.listTitle": "รายการลาวอ",
    "leave.name": "ชื่อ",
    "leave.job": "อาชีพ",
    "attendance.title": "เช็คชื่อกิลวอ",
    "attendance.subtitle": "สถานะจะบันทึกแยกตามวันที่",
    "attendance.present": "มา",
    "attendance.late": "สาย",
    "attendance.absent": "ขาด",
    "logs.title": "ประวัติการเปลี่ยนแปลง",
    "logs.clear": "ล้าง Log",
    "state.emptyLogs": "ยังไม่มี log",
    "state.noMembersMatch": "ยังไม่มีสมาชิกที่ตรงกับเงื่อนไข",
    "state.noMainParties": "ยังไม่มีปาร์ตี้สนามหลัก",
    "state.noReserveParties": "ยังไม่มีปาร์ตี้สนามรอง",
    "state.deletedMember": "สมาชิกถูกลบ",
    "state.noLeaves": "ยังไม่มีรายการลาวอ",
    "state.noAttendanceMembers": "ยังไม่มีสมาชิกสำหรับเช็คชื่อ",
    "state.noChangeLogs": "ยังไม่มีประวัติการเปลี่ยนแปลง",
    "party.mainDefault": "Main Party",
    "party.reserveDefault": "Reserve Party",
    "party.slot": "ช่อง",
    "party.empty": "ว่าง",
    "party.chooseMember": "เลือกสมาชิกเพื่อแสดงอาชีพ",
    "party.memberSource": "ดึงข้อมูลจากรายชื่อสมาชิก",
    "confirm.deleteParty": "ลบปาร์ตี้นี้?",
    "confirm.deleteMember": "ลบสมาชิกนี้?",
    "confirm.clearLogs": "ล้างประวัติการเปลี่ยนแปลงทั้งหมด?",
    "alert.invalidJson": "ไฟล์ JSON ไม่ถูกต้อง",
    "log.init": "เริ่มระบบ",
    "log.initDetail": "สร้างข้อมูลตัวอย่างครั้งแรก",
    "log.recover": "กู้คืนข้อมูล",
    "log.recoverDetail": "ไฟล์ข้อมูลเดิมเสียหาย จึงใช้ข้อมูลตั้งต้น",
    "log.renameParty": "แก้ไขชื่อปาร์ตี้",
    "log.deleteParty": "ลบปาร์ตี้",
    "log.assignParty": "จัดสมาชิกลงปาร์ตี้",
    "log.editMember": "แก้ไขสมาชิก",
    "log.addMember": "เพิ่มสมาชิก",
    "log.deleteMember": "ลบสมาชิก",
    "log.addMainParty": "เพิ่มปาร์ตี้สนามหลัก",
    "log.addReserveParty": "เพิ่มปาร์ตี้สนามรอง",
    "log.leave": "แจ้งลาวอ",
    "log.deleteLeave": "ลบรายการลา",
    "log.attendance": "เช็คชื่อกิลวอ",
    "log.clearLogs": "ล้าง Log",
    "log.clearLogsDetail": "เริ่มบันทึกประวัติใหม่",
    "log.import": "Import ข้อมูล",
    "detail.partySlot": "{member} -> {party} ช่อง {slot}",
    "detail.leave": "{member} วันที่ {date}",
    "detail.attendance": "{member}: {status} ({date})",
    "detail.notFoundMember": "ไม่พบสมาชิก",
    "sample.note": "ตัวอย่างสมาชิก",
  },
  en: {
    "app.eyebrow": "Guild War Data Manager",
    "nav.dashboard": "Dashboard",
    "nav.members": "Members",
    "nav.parties": "War Fields",
    "nav.leave": "War Leave",
    "nav.attendance": "Attendance",
    "nav.logs": "Logs",
    "language.label": "Language",
    "storage.autoSave": "Auto save",
    "storage.ready": "Ready",
    "storage.saved": "Saved",
    "actions.export": "Export",
    "actions.import": "Import",
    "stats.totalMembers": "Total members",
    "stats.readyMembers": "Ready for war",
    "stats.leaveMembers": "On leave",
    "stats.checkedMembers": "Checked today",
    "dashboard.jobCount": "Members by job",
    "dashboard.recentActivity": "Recent activity",
    "members.formTitle": "Add / Edit Member",
    "members.name": "Character name",
    "members.namePlaceholder": "Example: LeaderKung",
    "members.job": "Job",
    "members.role": "War role",
    "members.note": "Note",
    "members.notePlaceholder": "Gear, online time, special duty",
    "members.save": "Save member",
    "members.reset": "Reset form",
    "members.listTitle": "Member list",
    "members.search": "Search name / job",
    "parties.addMain": "Add main party",
    "parties.addReserve": "Add reserve party",
    "parties.main": "Main field",
    "parties.reserve": "Reserve field",
    "leave.formTitle": "War Leave",
    "leave.member": "Member",
    "leave.date": "Date",
    "leave.reason": "Reason",
    "leave.reasonPlaceholder": "Example: Work / Away from home",
    "leave.save": "Save leave",
    "leave.listTitle": "Leave records",
    "leave.name": "Name",
    "leave.job": "Job",
    "attendance.title": "Guild War Attendance",
    "attendance.subtitle": "Status is saved separately for each date",
    "attendance.present": "Here",
    "attendance.late": "Late",
    "attendance.absent": "Absent",
    "logs.title": "Change history",
    "logs.clear": "Clear logs",
    "state.emptyLogs": "No logs yet",
    "state.noMembersMatch": "No members match this filter",
    "state.noMainParties": "No main field parties yet",
    "state.noReserveParties": "No reserve field parties yet",
    "state.deletedMember": "Deleted member",
    "state.noLeaves": "No leave records yet",
    "state.noAttendanceMembers": "No members available for attendance",
    "state.noChangeLogs": "No change history yet",
    "party.mainDefault": "Main Party",
    "party.reserveDefault": "Reserve Party",
    "party.slot": "Slot",
    "party.empty": "Empty",
    "party.chooseMember": "Choose a member to show job",
    "party.memberSource": "Pulled from member list",
    "confirm.deleteParty": "Delete this party?",
    "confirm.deleteMember": "Delete this member?",
    "confirm.clearLogs": "Clear all change history?",
    "alert.invalidJson": "Invalid JSON file",
    "log.init": "System started",
    "log.initDetail": "Created sample data for first use",
    "log.recover": "Data recovery",
    "log.recoverDetail": "Stored data was damaged, so starter data was used",
    "log.renameParty": "Renamed party",
    "log.deleteParty": "Deleted party",
    "log.assignParty": "Assigned party member",
    "log.editMember": "Edited member",
    "log.addMember": "Added member",
    "log.deleteMember": "Deleted member",
    "log.addMainParty": "Added main field party",
    "log.addReserveParty": "Added reserve field party",
    "log.leave": "War leave",
    "log.deleteLeave": "Deleted leave record",
    "log.attendance": "Guild war attendance",
    "log.clearLogs": "Cleared logs",
    "log.clearLogsDetail": "Started a new change history",
    "log.import": "Imported data",
    "detail.partySlot": "{member} -> {party} slot {slot}",
    "detail.leave": "{member} on {date}",
    "detail.attendance": "{member}: {status} ({date})",
    "detail.notFoundMember": "Member not found",
    "sample.note": "Sample member",
  },
};

const urlLang = new URLSearchParams(window.location.search).get("lang");
let currentLang = I18N[urlLang] ? urlLang : localStorage.getItem(LANG_KEY) || "th";
if (!I18N[currentLang]) currentLang = "th";

const today = () => new Date().toISOString().slice(0, 10);

const t = (key, params = {}) => {
  const template = I18N[currentLang]?.[key] ?? I18N.en[key] ?? key;
  return Object.entries(params).reduce(
    (value, [paramKey, paramValue]) => value.replaceAll(`{${paramKey}}`, paramValue),
    template,
  );
};

function createStarterState() {
  return {
    members: [
      { name: "GuildLeader", job: "Swordsman", role: "Tank", note: t("sample.note") },
      { name: "HealMain", job: "Acolyte", role: "Support", note: t("sample.note") },
      { name: "SharpShot", job: "Archer", role: "DPS", note: t("sample.note") },
      { name: "Arcane", job: "Mage", role: "DPS", note: t("sample.note") },
      { name: "Shadow", job: "Thief", role: "Control", note: t("sample.note") },
    ],
    parties: {
      main: [{ name: "Main Party 1", slots: [] }],
      reserve: [{ name: "Reserve Party 1", slots: [] }],
    },
    leaves: [],
    attendance: {},
    logs: [createLog("log.init", t("log.initDetail"))],
  };
}

let state = loadState();

const elements = {
  pageTitle: document.querySelector("#pageTitle"),
  saveStatus: document.querySelector("#saveStatus"),
  totalMembers: document.querySelector("#totalMembers"),
  readyMembers: document.querySelector("#readyMembers"),
  leaveMembers: document.querySelector("#leaveMembers"),
  checkedMembers: document.querySelector("#checkedMembers"),
  jobSummary: document.querySelector("#jobSummary"),
  recentLogs: document.querySelector("#recentLogs"),
  memberForm: document.querySelector("#memberForm"),
  memberOriginalName: document.querySelector("#memberId"), // ใช้ซ้ำเป็นช่องเก็บบันทึกชื่อเดิมตอนแก้ไข
  memberName: document.querySelector("#memberName"),
  memberJob: document.querySelector("#memberJob"),
  memberNote: document.querySelector("#memberNote"),
  memberSearch: document.querySelector("#memberSearch"),
  memberGroups: document.querySelector("#memberGroups"),
  resetMemberForm: document.querySelector("#resetMemberForm"),
  addMainParty: document.querySelector("#addMainParty"),
  addReserveParty: document.querySelector("#addReserveParty"),
  mainParties: document.querySelector("#mainParties"),
  reserveParties: document.querySelector("#reserveParties"),
  leaveForm: document.querySelector("#leaveForm"),
  leaveMember: document.querySelector("#leaveMember"),
  leaveDate: document.querySelector("#leaveDate"),
  leaveReason: document.querySelector("#leaveReason"),
  leaveRows: document.querySelector("#leaveRows"),
  attendanceDate: document.querySelector("#attendanceDate"),
  attendanceGrid: document.querySelector("#attendanceGrid"),
  logList: document.querySelector("#logList"),
  clearLogs: document.querySelector("#clearLogs"),
  exportBtn: document.querySelector("#exportBtn"),
  importFile: document.querySelector("#importFile"),
};

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return createStarterState();

  try {
    const parsed = JSON.parse(stored);
    return {
      members: parsed.members ?? [],
      parties: {
        main: parsed.parties?.main ?? [],
        reserve: parsed.parties?.reserve ?? [],
      },
      leaves: parsed.leaves ?? [],
      attendance: parsed.attendance ?? {},
      logs: parsed.logs ?? [],
    };
  } catch {
    const starter = createStarterState();
    starter.logs.unshift(createLog("log.recover", t("log.recoverDetail")));
    return starter;
  }
}

function saveState(action, detail) {
  if (action) {
    state.logs.unshift(createLog(action, detail));
    state.logs = state.logs.slice(0, 500);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  elements.saveStatus.textContent = `${t("storage.saved")} ${new Date().toLocaleTimeString(locale())}`;
  render();
}

function createLog(action, detail) {
  return {
    at: new Date().toISOString(),
    action,
    detail,
  };
}

function locale() {
  return currentLang === "th" ? "th-TH" : "en-US";
}

function byName(first, second) {
  return first.name.localeCompare(second.name, locale());
}

function memberByName(name) {
  return state.members.find((member) => member.name === name);
}

function membersByJob() {
  return JOBS.map((job) => ({
    job,
    members: state.members.filter((member) => member.job === job).sort(byName),
  })).filter((group) => group.members.length > 0);
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  document.querySelectorAll(".lang-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });
  const activeTab = document.querySelector(".nav-tab.active");
  elements.pageTitle.textContent = activeTab ? t(`nav.${activeTab.dataset.tab}`) : t("nav.dashboard");
}

function render() {
  applyTranslations();
  renderDashboard();
  renderMemberOptions();
  renderMembers();
  renderParties("main", elements.mainParties);
  renderParties("reserve", elements.reserveParties);
  renderLeaves();
  renderAttendance();
  renderLogs();
}

function renderDashboard() {
  const leaveToday = new Set(state.leaves.filter((item) => item.date === today()).map((item) => item.memberName));
  const attendanceToday = state.attendance[today()] ?? {};
  elements.totalMembers.textContent = state.members.length;
  elements.leaveMembers.textContent = leaveToday.size;
  elements.readyMembers.textContent = Math.max(state.members.length - leaveToday.size, 0);
  elements.checkedMembers.textContent = Object.values(attendanceToday).filter(Boolean).length;

  const maxCount = Math.max(...JOBS.map((job) => state.members.filter((member) => member.job === job).length), 1);
  elements.jobSummary.innerHTML = JOBS.map((job) => {
    const count = state.members.filter((member) => member.job === job).length;
    return `
      <div class="job-row">
        <strong>${job}</strong>
        <div class="job-bar"><span style="width: ${(count / maxCount) * 100}%"></span></div>
        <span>${count}</span>
      </div>
    `;
  }).join("");

  elements.recentLogs.innerHTML = state.logs.slice(0, 6).map(logHtml).join("") || emptyState(t("state.emptyLogs"));
}

function renderMemberOptions() {
  const currentJob = elements.memberJob.value;
  elements.memberJob.innerHTML = JOBS.map((job) => `<option value="${job}">${job}</option>`).join("");
  if (currentJob) elements.memberJob.value = currentJob;

  const memberOptions = [...state.members]
    .sort(byName)
    .map((member) => `<option value="${escapeHtml(member.name)}">${escapeHtml(member.name)} (${member.job})</option>`)
    .join("");
  elements.leaveMember.innerHTML = memberOptions;
}

function renderMembers() {
  const keyword = elements.memberSearch.value.trim().toLowerCase();
  const groups = membersByJob()
    .map((group) => ({
      ...group,
      members: group.members.filter((member) =>
        `${member.name} ${member.job} ${member.role} ${member.note}`.toLowerCase().includes(keyword),
      ),
    }))
    .filter((group) => group.members.length > 0);

  elements.memberGroups.innerHTML = groups.map((group) => `
    <h4 class="job-group-title">${group.job} (${group.members.length})</h4>
    ${group.members.map(memberCardHtml).join("")}
  `).join("") || emptyState(t("state.noMembersMatch"));
}

function memberCardHtml(member) {
  return `
    <article class="member-card">
      <div>
        <strong>${escapeHtml(member.name)}</strong>
        <div class="member-meta">${member.job} · ${member.role}${member.note ? ` · ${escapeHtml(member.note)}` : ""}</div>
      </div>
      <div class="member-actions">
        <button class="btn btn-outline-secondary edit-member" data-name="${escapeHtml(member.name)}" type="button" aria-label="${t("members.formTitle")}">✎</button>
        <button class="btn btn-outline-danger delete-member" data-name="${escapeHtml(member.name)}" type="button" aria-label="${t("log.deleteMember")}">×</button>
      </div>
    </article>
  `;
}

function renderParties(type, container) {
  container.innerHTML = "";
  state.parties[type].forEach((party, partyIndex) => {
    const template = document.querySelector("#partyTemplate").content.cloneNode(true);
    const card = template.querySelector(".party-card");
    const nameInput = template.querySelector(".party-name-input");
    const deleteButton = template.querySelector(".delete-party");
    const slots = template.querySelector(".party-slots");

    nameInput.value = party.name;
    nameInput.addEventListener("change", () => {
      const defaultName = `${t(type === "main" ? "party.mainDefault" : "party.reserveDefault")} ${partyIndex + 1}`;
      party.name = nameInput.value.trim() || defaultName;
      saveState("log.renameParty", party.name);
    });

    deleteButton.addEventListener("click", () => {
      if (!confirm(t("confirm.deleteParty"))) return;
      state.parties[type].splice(partyIndex, 1);
      saveState("log.deleteParty", party.name);
    });

    for (let slotIndex = 0; slotIndex < 5; slotIndex += 1) {
      slots.appendChild(createPartySlot(party, slotIndex));
    }

    container.appendChild(template);
  });

  if (state.parties[type].length === 0) {
    container.innerHTML = emptyState(t(type === "main" ? "state.noMainParties" : "state.noReserveParties"));
  }
}

function createPartySlot(party, slotIndex) {
  const memberName = party.slots[slotIndex] ?? "";
  const member = memberByName(memberName);
  const slot = document.createElement("div");
  slot.className = "party-slot";
  slot.innerHTML = `
    <div class="slot-title">
      <span>${t("party.slot")} ${slotIndex + 1}</span>
      <span>${member ? member.role : t("party.empty")}</span>
    </div>
    <select class="form-select form-select-sm" aria-label="${t("party.slot")} ${slotIndex + 1}">
      <option value="">${t("party.empty")}</option>
      ${[...state.members].sort(byName).map((item) => `
        <option value="${escapeHtml(item.name)}" ${item.name === memberName ? "selected" : ""}>${escapeHtml(item.name)}</option>
      `).join("")}
    </select>
    <div class="slot-job">${member ? member.job : t("party.chooseMember")}</div>
    <div class="slot-meta">${member?.note ? escapeHtml(member.note) : t("party.memberSource")}</div>
  `;
  slot.querySelector("select").addEventListener("change", (event) => {
    party.slots[slotIndex] = event.target.value;
    party.slots = party.slots.map((value) => value || "").slice(0, 5);
    const selected = memberByName(event.target.value);
    saveState("log.assignParty", t("detail.partySlot", {
      member: selected?.name ?? t("party.empty"),
      party: party.name,
      slot: slotIndex + 1,
    }));
  });
  return slot;
}

function renderLeaves() {
  const rows = [...state.leaves].map((item, index) => ({ ...item, originalIndex: index }))
    .sort((first, second) => second.date.localeCompare(first.date));
  
  elements.leaveRows.innerHTML = rows.map((item) => {
    const member = memberByName(item.memberName);
    return `
      <tr>
        <td>${item.date}</td>
        <td>${escapeHtml(item.memberName ?? t("state.deletedMember"))}</td>
        <td>${member?.job ?? "-"}</td>
        <td>${escapeHtml(item.reason)}</td>
        <td><button class="btn btn-outline-danger btn-sm delete-leave" data-index="${item.originalIndex}" type="button" aria-label="${t("log.deleteLeave")}">×</button></td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="5" class="empty-state">${t("state.noLeaves")}</td></tr>`;
}

function renderAttendance() {
  const date = elements.attendanceDate.value || today();
  const dayAttendance = state.attendance[date] ?? {};
  elements.attendanceGrid.innerHTML = [...state.members].sort(byName).map((member) => {
    const status = dayAttendance[member.name] ?? "";
    return `
      <article class="attendance-card">
        <div>
          <strong>${escapeHtml(member.name)}</strong>
          <div class="member-meta">${member.job} · ${member.role}</div>
        </div>
        <div class="attendance-actions" data-member-name="${escapeHtml(member.name)}">
          <button class="status-button present ${status === "present" ? "active" : ""}" data-status="present" type="button">${t("attendance.present")}</button>
          <button class="status-button late ${status === "late" ? "active" : ""}" data-status="late" type="button">${t("attendance.late")}</button>
          <button class="status-button absent ${status === "absent" ? "active" : ""}" data-status="absent" type="button">${t("attendance.absent")}</button>
        </div>
      </article>
    `;
  }).join("") || emptyState(t("state.noAttendanceMembers"));
}

function renderLogs() {
  elements.logList.innerHTML = state.logs.map(logHtml).join("") || emptyState(t("state.noChangeLogs"));
}

function logHtml(log) {
  return `
    <article class="log-item">
      <strong>${escapeHtml(t(log.action))}</strong>
      <span>${escapeHtml(log.detail)}</span>
      <span class="log-meta">${new Date(log.at).toLocaleString(locale())}</span>
    </article>
  `;
}

function emptyState(text) {
  return `<div class="empty-state">${text}</div>`;
}

function resetMemberForm() {
  elements.memberForm.reset();
  elements.memberOriginalName.value = "";
  elements.memberJob.value = JOBS[0];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelectorAll(".nav-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".nav-tab, .tab-panel").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}`).classList.add("active");
    elements.pageTitle.textContent = t(`nav.${tab.dataset.tab}`);
  });
});

document.querySelectorAll(".lang-button").forEach((button) => {
  button.addEventListener("click", () => {
    currentLang = button.dataset.lang;
    localStorage.setItem(LANG_KEY, currentLang);
    render();
  });
});

elements.memberForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const originalName = elements.memberOriginalName.value;
  const newName = elements.memberName.value.trim();
  const existing = memberByName(originalName);

  const payload = {
    name: newName,
    job: elements.memberJob.value,
    note: elements.memberNote.value.trim(),
  };

  if (existing) {
    // อัปเดตชื่อในรายการปาร์ตี้และการแจ้งลาหากมีการเปลี่ยนชื่อ
    if (originalName !== newName) {
      state.parties.main.forEach(p => p.slots = p.slots.map(s => s === originalName ? newName : s));
      state.parties.reserve.forEach(p => p.slots = p.slots.map(s => s === originalName ? newName : s));
      state.leaves.forEach(l => { if (l.memberName === originalName) l.memberName = newName; });
      Object.keys(state.attendance).forEach(d => {
        if (state.attendance[d][originalName]) {
          state.attendance[d][newName] = state.attendance[d][originalName];
          delete state.attendance[d][originalName];
        }
      });
    }
    Object.assign(existing, payload);
    saveState("log.editMember", payload.name);
  } else {
    state.members.push(payload);
    saveState("log.addMember", payload.name);
  }
  resetMemberForm();
});

elements.memberGroups.addEventListener("click", (event) => {
  const editButton = event.target.closest(".edit-member");
  const deleteButton = event.target.closest(".delete-member");

  if (editButton) {
    const member = memberByName(editButton.dataset.name);
    elements.memberOriginalName.value = member.name;
    elements.memberName.value = member.name;
    elements.memberJob.value = member.job;
    elements.memberNote.value = member.note;
  }

  if (deleteButton) {
    const name = deleteButton.dataset.name;
    if (!confirm(t("confirm.deleteMember"))) return;
    state.members = state.members.filter((item) => item.name !== name);
    state.parties.main.forEach((party) => party.slots = party.slots.map((s) => s === name ? "" : s));
    state.parties.reserve.forEach((party) => party.slots = party.slots.map((s) => s === name ? "" : s));
    saveState("log.deleteMember", name);
  }
});

elements.memberSearch.addEventListener("input", renderMembers);
elements.resetMemberForm.addEventListener("click", resetMemberForm);

elements.addMainParty.addEventListener("click", () => {
  const name = `${t("party.mainDefault")} ${state.parties.main.length + 1}`;
  state.parties.main.push({ name, slots: [] });
  saveState("log.addMainParty", name);
});

elements.addReserveParty.addEventListener("click", () => {
  const name = `${t("party.reserveDefault")} ${state.parties.reserve.length + 1}`;
  state.parties.reserve.push({ name, slots: [] });
  saveState("log.addReserveParty", name);
});

elements.leaveDate.value = today();
elements.leaveForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const memberName = elements.leaveMember.value;
  state.leaves.push({
    memberName: memberName,
    date: elements.leaveDate.value,
    reason: elements.leaveReason.value.trim(),
  });
  elements.leaveReason.value = "";
  saveState("log.leave", t("detail.leave", {
    member: memberName || t("detail.notFoundMember"),
    date: elements.leaveDate.value,
  }));
});

elements.leaveRows.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-leave");
  if (!button) return;
  const index = Number.parseInt(button.dataset.index, 10);
  const leave = state.leaves[index];
  state.leaves.splice(index, 1);
  saveState("log.deleteLeave", leave?.date ?? "-");
});

elements.attendanceDate.value = today();
elements.attendanceDate.addEventListener("change", renderAttendance);
elements.attendanceGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".status-button");
  if (!button) return;
  const memberName = button.parentElement.dataset.memberName;
  const date = elements.attendanceDate.value;
  state.attendance[date] ??= {};
  state.attendance[date][memberName] = button.dataset.status;
  saveState("log.attendance", t("detail.attendance", {
    member: memberName || t("detail.notFoundMember"),
    status: button.textContent,
    date,
  }));
});

elements.clearLogs.addEventListener("click", () => {
  if (!confirm(t("confirm.clearLogs"))) return;
  state.logs = [createLog("log.clearLogs", t("log.clearLogsDetail"))];
  saveState();
});

elements.exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `row-guild-war-backup-${today()}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

elements.importFile.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    if (!Array.isArray(imported.members) || !imported.parties) throw new Error("invalid");
    state = imported;
    saveState("log.import", file.name);
  } catch {
    alert(t("alert.invalidJson"));
  } finally {
    event.target.value = "";
  }
});

render();
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));