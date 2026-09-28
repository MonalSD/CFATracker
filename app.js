const EXAM_DATE = new Date("2027-02-26T00:00:00");
const START_DATE = new Date("2026-09-29T00:00:00");
const END_DATE = new Date("2027-02-25T00:00:00");
const STORAGE_KEY = "cfa-level1-2027-progress-v1";
const THEME_KEY = "cfa-level1-theme";

const firstPass = [
  ["2026-09-29","2026-10-10","Fixed Income","11–14%",38,"START NOW","https://cfa-practi-pdx-prod.insproserv.net/topics/2127/"],
  ["2026-10-11","2026-10-15","Alternative Investments","6–9%",18,"START NOW","https://cfa-practi-pdx-prod.insproserv.net/topics/2129/"],
  ["2026-10-16","2026-10-23","Derivatives","6–9%",24,"START NOW","https://cfa-practi-pdx-prod.insproserv.net/topics/2128/"],
  ["2026-10-24","2026-11-01","Portfolio Construction","8–12%",28,"START NOW","https://cfa-practi-pdx-prod.insproserv.net/topics/2130/"],
  ["2026-11-02","2026-11-08","Corporate Finance","6–9%",22,"START NOW","https://cfa-practi-pdx-prod.insproserv.net/topics/2124/"],
  ["2026-11-09","2026-11-21","Financial Statement Analysis","11–14%",42,"START NOW","https://cfa-practi-pdx-prod.insproserv.net/topics/2125/"],
  ["2026-11-22","2026-11-28","Economics","6–9%",22,"START NOW","https://cfa-practi-pdx-prod.insproserv.net/topics/2123/"],
  ["2026-11-29","2026-12-09","Equities","11–14%",36,"START NEXT","https://cfa-practi-pdx-prod.insproserv.net/topics/2126/"],
  ["2026-12-10","2026-12-17","Ethical and Professional Standards","10–15%",30,"START NEXT","https://cfa-practi-pdx-prod.insproserv.net/topics/2131/"],
  ["2026-12-18","2026-12-29","Quantitative Methods","11–14%",38,"START NEXT","https://cfa-practi-pdx-prod.insproserv.net/topics/2122/"]
];

const otherBlocks = [
  ["2026-12-30","2027-01-04","Catch-up + Mixed QBank"],
  ["2027-01-05","2027-01-08","Fixed Income + Alternatives Review"],
  ["2027-01-09","2027-01-12","Derivatives + Portfolio Review"],
  ["2027-01-13","2027-01-16","Corporate Finance + FSA Review"],
  ["2027-01-17","2027-01-19","Economics Review"],
  ["2027-01-20","2027-01-23","Equities Review"],
  ["2027-01-24","2027-01-26","Ethics Review"],
  ["2027-01-27","2027-01-30","Quant Review + Mixed QBank"],
  ["2027-01-31","2027-01-31","Mock Exam 1"],
  ["2027-02-01","2027-02-05","Mock 1 Remediation"],
  ["2027-02-06","2027-02-06","Mock Exam 2"],
  ["2027-02-07","2027-02-12","Mock 2 Remediation"],
  ["2027-02-13","2027-02-13","Mock Exam 3"],
  ["2027-02-14","2027-02-19","Mock 3 Remediation + Cumulative Review"],
  ["2027-02-20","2027-02-20","Mock Exam 4"],
  ["2027-02-21","2027-02-25","Final Review: Ethics + Formulas + Error Log"]
];

const mockDates = new Set(["2027-01-31","2027-02-06","2027-02-13","2027-02-20"]);
const plannedHoursByWeekday = [3,2,2,2,2,1,4]; // Sunday..Saturday

let progress = loadProgress();
let plan = buildPlan();

function pad(n){ return String(n).padStart(2,"0"); }
function iso(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function parseISO(s){ const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d); }
function addDays(d,n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function sameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function todayLocal(){ const d = new Date(); return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }
function clamp(v,min,max){ return Math.max(min, Math.min(max,v)); }
function fmtDate(d, opts={day:"2-digit",month:"short",year:"numeric"}){ return new Intl.DateTimeFormat("en-GB",opts).format(d); }
function fmtShort(d){ return new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short"}).format(d); }
function pct(n){ return Number.isFinite(n) ? `${Math.round(n*100)}%` : "—"; }
function num(n, digits=1){ return Number.isFinite(n) ? n.toFixed(digits).replace(/\.0$/,"") : "0"; }

function focusFor(date){
  const s = iso(date);
  for(const [start,end,topic] of firstPass){
    if(s>=start && s<=end) return topic;
  }
  for(const [start,end,topic] of otherBlocks){
    if(s>=start && s<=end) return topic;
  }
  return "";
}
function phaseFor(date){
  if(date <= parseISO("2026-12-29")) return "Phase 1 — First Pass";
  if(date <= parseISO("2027-01-30")) return "Phase 2 — Consolidation";
  if(date <= parseISO("2027-02-20")) return "Phase 3 — Mock Cycle";
  return "Phase 4 — Final Review";
}
function plannedHours(date){
  return mockDates.has(iso(date)) ? 4.5 : plannedHoursByWeekday[date.getDay()];
}
function plannedQuestions(date){
  const phase = phaseFor(date);
  const day = date.getDay();
  if(mockDates.has(iso(date))) return 180;
  if(phase.includes("First Pass")) return [15,5,5,5,5,0,20][day];
  if(phase.includes("Consolidation")) return [40,20,20,20,20,10,50][day];
  if(phase.includes("Mock Cycle")) return [25,20,20,20,20,10,30][day];
  return [20,15,15,15,15,10,20][day];
}
function taskFor(date){
  const phase = phaseFor(date);
  const day = date.getDay();
  const focus = focusFor(date);
  if(mockDates.has(iso(date))) return "Full 180-question mock under exam conditions; log wrong and guessed answers.";
  if(phase.includes("First Pass")){
    if(day>=1 && day<=4) return "Learn new material + active recall + short practice set.";
    if(day===5) return "Light day: formulas/definitions + error-log cleanup.";
    if(day===6) return "Deep study + EOC/QBank set + review every mistake.";
    return "Cumulative review + catch-up + mixed questions from completed topics.";
  }
  if(phase.includes("Consolidation")){
    if(day>=1 && day<=4) return "Second-pass review + timed questions + repair weak concepts.";
    if(day===5) return "Light day: formulas, Ethics, and error log.";
    if(day===6) return "Large timed mixed-question block + detailed review.";
    return "Weak-area repair + cumulative recall + mixed questions.";
  }
  if(phase.includes("Mock Cycle")){
    if(focus.includes("Remediation")) return "Review wrong/guessed questions first; then drill the two weakest topics.";
    return "Timed mixed questions + focused remediation.";
  }
  return "No new content. Review Ethics, formulas, error log, and only high-yield weak spots.";
}
function buildPlan(){
  const arr = [];
  for(let d = new Date(START_DATE); d <= END_DATE; d = addDays(d,1)){
    arr.push({
      date: iso(d),
      dateObj: new Date(d),
      phase: phaseFor(d),
      focus: focusFor(d),
      task: taskFor(d),
      plannedHours: plannedHours(d),
      plannedQuestions: plannedQuestions(d)
    });
  }
  return arr;
}

function loadProgress(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function saveProgress(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  renderAll();
}
function entryFor(date){ return progress[date] || {}; }
function accuracy(e){
  const attempted = Number(e.attempted || 0);
  const correct = Number(e.correct || 0);
  return attempted > 0 ? correct / attempted : NaN;
}

function currentPlanDate(){
  const t = todayLocal();
  if(t < START_DATE) return START_DATE;
  if(t > END_DATE) return END_DATE;
  return t;
}

function renderNav(){
  const titleMap = {dashboard:"Dashboard",daily:"Daily Log",topics:"Topic Plan",weekly:"Weekly Plan"};
  document.querySelectorAll(".nav-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
      document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.view).classList.add("active");
      document.getElementById("viewTitle").textContent = titleMap[btn.dataset.view];
      if(btn.dataset.view==="dashboard") setTimeout(drawHoursChart, 20);
    });
  });
}

function renderTodayHeader(){
  const t = todayLocal();
  document.getElementById("todayPill").textContent = fmtDate(t,{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
  const d = currentPlanDate();
  const p = plan.find(x=>x.date===iso(d));
  const now = todayLocal();
  const days = Math.max(0, Math.ceil((EXAM_DATE-now)/86400000));
  document.getElementById("daysRemaining").textContent = days;

  if(now < START_DATE){
    document.getElementById("todayFocus").textContent = "Plan starts with Fixed Income";
    document.getElementById("todayTask").textContent = `Your first scheduled study day is ${fmtDate(START_DATE)}.`;
  } else if(now > END_DATE){
    document.getElementById("todayFocus").textContent = "Final review complete";
    document.getElementById("todayTask").textContent = "Exam day: 26 February 2027.";
  } else {
    document.getElementById("todayFocus").textContent = p.focus;
    document.getElementById("todayTask").textContent = p.task;
  }
  document.getElementById("todayHours").textContent = `${p ? p.plannedHours : 0}h planned`;
  document.getElementById("todayQuestions").textContent = `${p ? p.plannedQuestions : 0} questions`;
}

function kpiStats(){
  const actualHours = plan.reduce((s,p)=>s+Number(entryFor(p.date).hours||0),0);
  const questions = plan.reduce((s,p)=>s+Number(entryFor(p.date).attempted||0),0);
  const correct = plan.reduce((s,p)=>s+Number(entryFor(p.date).correct||0),0);
  const done = plan.filter(p=>entryFor(p.date).status==="Done").length;
  const plannedTotal = plan.reduce((s,p)=>s+p.plannedHours,0);

  const t = todayLocal();
  const planToDate = plan.filter(p=>p.dateObj<=t).reduce((s,p)=>s+p.plannedHours,0);
  const variance = actualHours - planToDate;
  return {actualHours,questions,correct,done,plannedTotal,planToDate,variance,overallAcc:questions?correct/questions:NaN};
}
function renderKPIs(){
  const k = kpiStats();
  const items = [
    ["Planned hours", num(k.plannedTotal), "Full plan"],
    ["Actual hours", num(k.actualHours), `${k.variance>=0?"+":""}${num(k.variance)}h vs plan to date`],
    ["Questions", String(k.questions), "Attempted"],
    ["Accuracy", pct(k.overallAcc), k.questions ? `${k.correct} correct` : "No questions logged"],
    ["Study days done", `${k.done}/150`, `${Math.round(k.done/150*100)}% complete`]
  ];
  document.getElementById("kpiGrid").innerHTML = items.map(([label,value,sub])=>
    `<article class="kpi"><span class="label">${label}</span><strong>${value}</strong><div class="sub">${sub}</div></article>`
  ).join("");
}

function renderCheckin(){
  const d = currentPlanDate();
  const key = iso(d);
  const e = entryFor(key);
  document.getElementById("checkinDate").textContent = fmtDate(d,{weekday:"long",day:"2-digit",month:"short"});
  document.getElementById("actualHours").value = e.hours ?? "";
  document.getElementById("attempted").value = e.attempted ?? "";
  document.getElementById("correct").value = e.correct ?? "";
  document.getElementById("confidence").value = e.confidence ?? "";
  document.getElementById("status").value = e.status ?? "Not Started";
  document.getElementById("notes").value = e.notes ?? "";
  updateAccuracyPreview();

  document.getElementById("checkinForm").onsubmit = ev=>{
    ev.preventDefault();
    progress[key] = {
      hours: Number(document.getElementById("actualHours").value || 0),
      attempted: Number(document.getElementById("attempted").value || 0),
      correct: Number(document.getElementById("correct").value || 0),
      confidence: document.getElementById("confidence").value,
      status: document.getElementById("status").value,
      notes: document.getElementById("notes").value.trim()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    const badge = document.getElementById("savedBadge");
    badge.textContent = "Saved ✓";
    setTimeout(()=>badge.textContent="Saved locally",1400);
    renderAll();
  };
  ["attempted","correct"].forEach(id=>document.getElementById(id).oninput=updateAccuracyPreview);
}
function updateAccuracyPreview(){
  const attempted = Number(document.getElementById("attempted").value || 0);
  const correct = Number(document.getElementById("correct").value || 0);
  document.getElementById("accuracyPreview").textContent = attempted ? `Accuracy: ${Math.round(correct/attempted*100)}%` : "";
}

function renderRoadmap(){
  document.getElementById("roadmap").innerHTML = firstPass.map((x,i)=>{
    const [start,end,topic,, ,priority] = x;
    return `<div class="roadmap-item ${priority==="START NOW"?"now":"next"}">
      <span class="roadmap-index">${i+1}</span>
      <div><div class="roadmap-title">${topic}</div><div class="roadmap-date">${fmtShort(parseISO(start))}–${fmtShort(parseISO(end))}</div></div>
      <span class="priority-pill ${priority==="START NOW"?"priority-now":"priority-next"}">${priority}</span>
    </div>`;
  }).join("");
}

function firstPassDays(topic){
  return plan.filter(p=>p.focus===topic && p.dateObj<=parseISO("2026-12-29"));
}
function topicMetrics(topic){
  const days = firstPassDays(topic);
  const target = days.reduce((s,p)=>s+p.plannedHours,0);
  const actual = days.reduce((s,p)=>s+Number(entryFor(p.date).hours||0),0);
  const attempted = days.reduce((s,p)=>s+Number(entryFor(p.date).attempted||0),0);
  const correct = days.reduce((s,p)=>s+Number(entryFor(p.date).correct||0),0);
  const done = days.filter(p=>entryFor(p.date).status==="Done").length;
  const completion = days.length ? done/days.length : 0;
  return {target,actual,attempted,correct,completion,accuracy:attempted?correct/attempted:NaN};
}
function renderTopicProgress(){
  document.getElementById("topicProgress").innerHTML = firstPass.map(x=>{
    const topic = x[2]; const m = topicMetrics(topic);
    return `<div class="topic-progress-item">
      <div class="topic-progress-top"><strong>${topic}</strong><span>${Math.round(m.completion*100)}% days complete · ${num(m.actual)}h</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.round(m.completion*100)}%"></div></div>
    </div>`;
  }).join("");
}

function statusClass(s){
  return {"Done":"status-done","Partial":"status-partial","Skipped":"status-skipped","Not Started":"status-not-started"}[s||"Not Started"];
}
function renderDailyTable(){
  const tbody = document.querySelector("#dailyTable tbody");
  const search = (document.getElementById("dailySearch").value || "").toLowerCase();
  const statusF = document.getElementById("statusFilter").value;
  const t = todayLocal();
  const rows = plan.filter(p=>{
    const e = entryFor(p.date);
    const hay = `${p.focus} ${p.phase} ${e.notes||""}`.toLowerCase();
    return (!search || hay.includes(search)) && (!statusF || (e.status||"Not Started")===statusF);
  });
  tbody.innerHTML = rows.map(p=>{
    const e = entryFor(p.date); const acc = accuracy(e);
    return `<tr data-date="${p.date}" class="${sameDay(p.dateObj,t)?"row-today":""}">
      <td><strong>${fmtShort(p.dateObj)}</strong><br><span class="muted">${p.dateObj.toLocaleDateString("en-GB",{weekday:"short"})}</span></td>
      <td>${p.phase.replace("Phase ","P")}</td>
      <td><strong>${p.focus}</strong><br><span class="muted">${p.task}</span></td>
      <td>${p.plannedHours}h<br><span class="muted">${p.plannedQuestions} Q</span></td>
      <td><input data-field="hours" type="number" step=".25" min="0" value="${e.hours ?? ""}" aria-label="Actual hours ${p.date}"></td>
      <td><input data-field="attempted" type="number" step="1" min="0" value="${e.attempted ?? ""}" aria-label="Questions attempted ${p.date}"></td>
      <td><input data-field="correct" type="number" step="1" min="0" value="${e.correct ?? ""}" aria-label="Correct answers ${p.date}"></td>
      <td>${pct(acc)}</td>
      <td><select data-field="confidence" aria-label="Confidence ${p.date}">
        <option value="" ${!e.confidence?"selected":""}>—</option>
        ${[1,2,3,4,5].map(v=>`<option value="${v}" ${String(e.confidence)===String(v)?"selected":""}>${v}</option>`).join("")}
      </select></td>
      <td><select data-field="status" aria-label="Status ${p.date}">
        ${["Not Started","Partial","Done","Skipped"].map(v=>`<option ${((e.status||"Not Started")===v)?"selected":""}>${v}</option>`).join("")}
      </select></td>
      <td><textarea data-field="notes" rows="2" aria-label="Notes ${p.date}">${escapeHtml(e.notes||"")}</textarea></td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll("input,select,textarea").forEach(el=>{
    el.addEventListener("change",()=>{
      const tr = el.closest("tr"); const date = tr.dataset.date;
      const obj = {...entryFor(date)};
      let val = el.value;
      if(["hours","attempted","correct"].includes(el.dataset.field)) val = Number(val||0);
      obj[el.dataset.field] = val;
      progress[date] = obj;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      renderAll();
    });
  });
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function renderTopicTable(){
  const tbody = document.querySelector("#topicTable tbody");
  tbody.innerHTML = firstPass.map((x,i)=>{
    const [start,end,topic,weight,targetHours,priority,url] = x;
    const m = topicMetrics(topic);
    return `<tr>
      <td>${i+1}</td>
      <td><span class="priority-pill ${priority==="START NOW"?"priority-now":"priority-next"}">${priority}</span></td>
      <td><strong>${topic}</strong></td>
      <td>${weight}</td>
      <td>${fmtShort(parseISO(start))}–${fmtShort(parseISO(end))}</td>
      <td>${targetHours}h</td>
      <td>${num(m.actual)}h</td>
      <td>${m.attempted}</td>
      <td>${pct(m.accuracy)}</td>
      <td><a href="${url}" target="_blank" rel="noreferrer">Open course ↗</a></td>
    </tr>`;
  }).join("");
}

function buildWeeks(){
  const weeks=[]; let start = new Date(START_DATE); let n=1;
  while(start<=END_DATE){
    const end = new Date(Math.min(addDays(start,6).getTime(),END_DATE.getTime()));
    const days = plan.filter(p=>p.dateObj>=start && p.dateObj<=end);
    const focuses = [...new Set(days.map(d=>d.focus))];
    weeks.push({n,start:new Date(start),end,days,focus:focuses.join(" / ")});
    start = addDays(end,1); n++;
  }
  return weeks;
}
function renderWeeklyTable(){
  const t=todayLocal();
  document.querySelector("#weeklyTable tbody").innerHTML = buildWeeks().map(w=>{
    const target=w.days.reduce((s,p)=>s+p.plannedHours,0);
    const actual=w.days.reduce((s,p)=>s+Number(entryFor(p.date).hours||0),0);
    const q=w.days.reduce((s,p)=>s+Number(entryFor(p.date).attempted||0),0);
    const c=w.days.reduce((s,p)=>s+Number(entryFor(p.date).correct||0),0);
    let status, cls;
    if(t < w.start){ status="Upcoming"; cls="week-upcoming"; }
    else if(actual >= target){ status="On / ahead"; cls="week-ahead"; }
    else if(t > w.end){ status="Behind"; cls="week-behind"; }
    else { status="In progress"; cls="week-on"; }
    return `<tr>
      <td>${w.n}</td><td>${fmtShort(w.start)}–${fmtShort(w.end)}</td><td>${w.focus}</td>
      <td>${num(target)}h</td><td>${num(actual)}h</td><td>${q}</td><td>${q?pct(c/q):"—"}</td>
      <td class="${cls}">${status}</td>
    </tr>`;
  }).join("");
}

function drawHoursChart(){
  const canvas = document.getElementById("hoursChart");
  if(!canvas || !canvas.clientWidth) return;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = 260;
  canvas.width = width*dpr; canvas.height = height*dpr;
  const ctx = canvas.getContext("2d"); ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,width,height);

  let plannedCum=0, actualCum=0;
  const chartToday = todayLocal();
  const points = plan.map(p=>{
    plannedCum += p.plannedHours;
    actualCum += Number(entryFor(p.date).hours||0);
    return {planned:plannedCum, actual:p.dateObj<=chartToday ? actualCum : null, date:p.dateObj};
  });
  const actualValues = points.map(p=>p.actual).filter(v=>v!==null);
  const maxY = Math.max(points.at(-1).planned, ...actualValues, 1);
  const padL=38,padR=12,padT=10,padB=26;
  const cw=width-padL-padR, ch=height-padT-padB;
  const styles = getComputedStyle(document.documentElement);
  const line = styles.getPropertyValue("--line").trim();
  const muted = styles.getPropertyValue("--muted").trim();
  const blue = styles.getPropertyValue("--blue").trim();

  ctx.strokeStyle=line; ctx.lineWidth=1;
  ctx.fillStyle=muted; ctx.font="11px system-ui";
  for(let i=0;i<=4;i++){
    const y=padT+ch*i/4;
    ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(width-padR,y); ctx.stroke();
    const val=Math.round(maxY*(1-i/4));
    ctx.fillText(String(val),4,y+4);
  }

  const xOf=i=>padL+cw*(i/(points.length-1));
  const yOf=v=>padT+ch*(1-v/maxY);

  function lineSeries(key,color,widthLine){
    ctx.beginPath();
    let started=false;
    points.forEach((p,i)=>{
      if(p[key]===null || p[key]===undefined) return;
      const x=xOf(i),y=yOf(p[key]);
      if(!started){ ctx.moveTo(x,y); started=true; } else ctx.lineTo(x,y);
    });
    ctx.strokeStyle=color; ctx.lineWidth=widthLine; ctx.lineJoin="round"; ctx.lineCap="round"; ctx.stroke();
  }
  lineSeries("planned","#91a4b7",1.8);
  lineSeries("actual",blue,2.7);

  const ticks=[0,Math.floor(points.length*.25),Math.floor(points.length*.5),Math.floor(points.length*.75),points.length-1];
  ticks.forEach(i=>{
    const x=xOf(i); const label=fmtShort(points[i].date);
    ctx.fillStyle=muted; ctx.fillText(label, clamp(x-18,padL,width-50), height-7);
  });
}

function renderAll(){
  progress = loadProgress();
  renderTodayHeader();
  renderKPIs();
  renderRoadmap();
  renderTopicProgress();
  renderDailyTable();
  renderTopicTable();
  renderWeeklyTable();
  drawHoursChart();
}

function setupFilters(){
  document.getElementById("dailySearch").addEventListener("input",renderDailyTable);
  document.getElementById("statusFilter").addEventListener("change",renderDailyTable);
  document.getElementById("jumpToday").addEventListener("click",()=>{
    const key=iso(currentPlanDate());
    const row=document.querySelector(`tr[data-date="${key}"]`);
    if(row) row.scrollIntoView({behavior:"smooth",block:"center"});
  });
}

function setupTheme(){
  const saved=localStorage.getItem(THEME_KEY);
  if(saved) document.documentElement.dataset.theme=saved;
  document.getElementById("themeToggle").addEventListener("click",()=>{
    const next=document.documentElement.dataset.theme==="dark"?"light":"dark";
    document.documentElement.dataset.theme=next;
    localStorage.setItem(THEME_KEY,next);
    drawHoursChart();
  });
}

function setupBackup(){
  document.getElementById("exportBtn").addEventListener("click",()=>{
    const payload={version:1,exportedAt:new Date().toISOString(),progress};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`cfa-level1-progress-${iso(todayLocal())}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  });

  document.getElementById("importInput").addEventListener("change",async ev=>{
    const file=ev.target.files?.[0]; if(!file) return;
    try{
      const data=JSON.parse(await file.text());
      if(!data.progress || typeof data.progress!=="object") throw new Error("Invalid backup");
      if(!confirm("Importing will replace the progress stored in this browser. Continue?")) return;
      progress=data.progress;
      localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));
      renderAll();
      alert("Backup imported.");
    }catch{
      alert("That file is not a valid CFA tracker backup.");
    }finally{
      ev.target.value="";
    }
  });
}

function init(){
  renderNav();
  renderCheckin();
  setupFilters();
  setupTheme();
  setupBackup();
  renderAll();
  window.addEventListener("resize",()=>requestAnimationFrame(drawHoursChart));
}
document.addEventListener("DOMContentLoaded",init);
