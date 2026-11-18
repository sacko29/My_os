import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const VERSION="0.3.0", REPO="sacko29/My_os", KEY="my-os-data-v3";
const $=id=>document.getElementById(id);
const DAYS=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
const courses=[
 ["Lundi","Géologie · Physique · Maths · Maths"],
 ["Mardi","Chimie · Physique · Chimie · Physique"],
 ["Mercredi","Chimie · Philosophie · Français · Français"],
 ["Jeudi","Anglais · Maths · Maths · Anglais"],
 ["Vendredi","Biologie · Biologie"],
 ["Samedi","Pas de cours indiqué"],
 ["Dimanche","Pas de cours indiqué"]
];
const restitutions=[
 {day:"Lundi",subject:"Chimie",prep:"Dimanche"},
 {day:"Mardi",subject:"Philosophie",prep:"Lundi"},
 {day:"Mercredi",subject:"Anglais",prep:"Mardi"},
 {day:"Jeudi",subject:"Biologie",prep:"Mercredi"},
 {day:"Vendredi",subject:"Géologie",prep:"Jeudi"},
 {day:"Samedi",subject:"Physique",prep:"Vendredi"}
];
function emptyData(){return {tasks:[],xp:0,started:0,done:0,activeDays:[],prepDone:{},times:{prep:"18:00",daily:"08:00",review:"20:30"}}}
function normalizeData(s){return {tasks:Array.isArray(s.tasks)?s.tasks.map((t,i)=>({id:t.id||Date.now()+i,text:String(t.text||""),done:!!t.done,created:t.created||new Date().toISOString()})):[],xp:Number(s.xp||0),started:Number(s.started||0),done:Number(s.done||0),activeDays:Array.isArray(s.activeDays)?s.activeDays:[],prepDone:s.prepDone||{},times:{prep:s.times?.prep||"18:00",daily:s.times?.daily||"08:00",review:s.times?.review||"20:30"}}}
function load(){try{const current=localStorage.getItem(KEY);if(current)return normalizeData(JSON.parse(current));
 const old=localStorage.getItem("my-os-v1");if(old){const s=JSON.parse(old);const migrated=normalizeData({tasks:s.tasks||[]});localStorage.setItem(KEY,JSON.stringify(migrated));return migrated}
 const v2=localStorage.getItem("my-os-v2");if(v2){const s=JSON.parse(v2);const migrated=normalizeData({tasks:s.tasks||[],xp:s.xp||0,started:s.totals?.started||0,done:s.totals?.done||0});localStorage.setItem(KEY,JSON.stringify(migrated));return migrated}
 return emptyData()}catch{return emptyData()}}
let data=load(), latestRelease=null;
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function todayName(){return DAYS[new Date().getDay()]}
function nextPrep(){const t=todayName();return restitutions.find(r=>r.prep===t)||null}
function render(){
 $("today").textContent=new Intl.DateTimeFormat("fr-FR",{weekday:"long",day:"numeric",month:"long"}).format(new Date());
 $("taskCount").textContent=data.tasks.filter(t=>!t.done).length;
 $("tasks").replaceChildren();
 data.tasks.forEach(t=>{const li=document.createElement("li"),c=document.createElement("input"),s=document.createElement("span");c.type="checkbox";c.checked=!!t.done;c.addEventListener("change",()=>{t.done=c.checked;if(t.done){data.done++;data.xp+=10}else{data.done=Math.max(0,data.done-1);data.xp=Math.max(0,data.xp-10)}save();render()});s.textContent=t.text;li.className=t.done?"done":"";li.append(c,s);$("tasks").append(li)});
 const prep=nextPrep();$("nextPrepTitle").textContent=prep?`${prep.subject} pour demain`:"Pas de restitution à préparer aujourd'hui";
 $("nextPrepText").textContent=prep?(data.prepDone[prep.day]?"Préparation marquée comme prête.":"Prépare cette matière aujourd'hui pour la restitution de demain."):"Profite de ce temps pour revoir les points difficiles.";
 $("prepDone").disabled=!prep;$("prepDone").textContent=prep&&data.prepDone[prep.day]?"Préparation validée":"Marquer comme prêt";
 $("courses").innerHTML=courses.map(([d,m])=>`<div class="day"><b>${d}</b><span>${m}</span></div>`).join("");
 $("restitutions").innerHTML=restitutions.map(r=>`<div class="day"><b>${r.day} · ${r.subject}</b><span>À réviser le ${r.prep}</span></div>`).join("");
 $("doneStat").textContent=data.done;$("startStat").textContent=data.started;$("xpStat").textContent=data.xp;$("streakStat").textContent=data.activeDays.length;
 const pct=data.started?Math.min(100,Math.round(data.done/data.started*100)):0;$("progressBar").style.width=pct+"%";$("progressText").textContent=`${pct}% de tes tâches commencées ont été terminées.`;
 $("prepTime").value=data.times.prep;$("dailyTime").value=data.times.daily;$("reviewTime").value=data.times.review;$("versionLabel").textContent=VERSION;
}
function markActive(){const d=new Date().toISOString().slice(0,10);if(!data.activeDays.includes(d))data.activeDays.push(d);data.activeDays=data.activeDays.slice(-30)}
$("taskForm").addEventListener("submit",e=>{e.preventDefault();const text=$("taskInput").value.trim();if(!text)return;data.tasks.push({id:Date.now(),text,done:false,created:new Date().toISOString()});$("taskInput").value="";save();render()});
$("focusBtn").addEventListener("click",()=>{const text=prompt("Quelle est ta prochaine petite action ?");if(text?.trim()){$("todayTitle").textContent=text.trim();$("todayAdvice").textContent="Commence par deux minutes. Le but est de démarrer.";data.started++;data.xp+=5;markActive();save();render();$("todayTitle").textContent=text.trim()}});
$("prepDone").addEventListener("click",()=>{const p=nextPrep();if(!p)return;data.prepDone[p.day]=true;data.xp+=5;markActive();save();render()});
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab,.view").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active")}));
$("saveTimes").addEventListener("click",async()=>{data.times={prep:$("prepTime").value,daily:$("dailyTime").value,review:$("reviewTime").value};save();$("notifStatus").textContent="Heures enregistrées. Active les notifications pour programmer les rappels.";await scheduleUpcoming();});
async function requestNotificationPermission(){if(!Capacitor.isNativePlatform()){$("notifStatus").textContent="Les notifications fiables nécessitent l'APK Android, pas la version web.";return false}const p=await LocalNotifications.requestPermissions();const ok=p.display==="granted";$("notifStatus").textContent=ok?"Notifications autorisées. Programmation des prochains rappels…":"Autorisation refusée dans Android.";return ok}
$("allowNotifications").addEventListener("click",async()=>{if(await requestNotificationPermission())await scheduleUpcoming()});
function atTime(date,time){const [h,m]=time.split(":").map(Number);const d=new Date(date);d.setHours(h,m,0,0);return d}
function nextDateForDay(day,time,offset=0){const target=DAYS.indexOf(day),now=new Date();let delta=(target-now.getDay()+7)%7;if(delta===0&&atTime(now,time)<=now)delta=7;delta+=offset;return atTime(new Date(now.getFullYear(),now.getMonth(),now.getDate()+delta),time)}
async function scheduleUpcoming(){
 if(!Capacitor.isNativePlatform())return;
 const p=await LocalNotifications.checkPermissions();if(p.display!=="granted")return;
 const pending=await LocalNotifications.getPending();if(pending.notifications.length)await LocalNotifications.cancel({notifications:pending.notifications.map(n=>({id:n.id}))});
 const notifications=[];let id=100;
 // Rappels de préparation : chaque veille de restitution.
 for(const r of restitutions){const at=nextDateForDay(r.prep,data.times.prep);notifications.push({id:id++,title:`MY OS · Préparation ${r.subject}`,body:`Prépare la restitution de ${r.subject} prévue demain.`,schedule:{at,allowWhileIdle:true}})}
 // Petit bilan quotidien.
 const reviewAt=atTime(new Date(),data.times.review);const review=reviewAt>new Date()?reviewAt:new Date(reviewAt.getTime()+86400000);
 notifications.push({id:id++,title:"MY OS · Petit bilan",body:"Qu'as-tu réussi à commencer aujourd'hui ?",schedule:{at:review,allowWhileIdle:true}});
 try{await LocalNotifications.schedule({notifications});$("notifStatus").textContent=`${notifications.length} rappels programmés. Ouvre MY OS après les avoir reçus pour renouveler le planning.`}
 catch(e){$("notifStatus").textContent="Erreur de programmation : "+e.message}
}
$("exportData").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({...data,exportedAt:new Date().toISOString(),appVersion:VERSION},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="my-os-sauvegarde.json";a.click();URL.revokeObjectURL(url);$("updateStatus").textContent="Sauvegarde exportée. Garde ce fichier dans un endroit sûr."});
$("importData").addEventListener("change",async e=>{const file=e.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed.tasks))throw new Error("Fichier de sauvegarde invalide");data=normalizeData(parsed);save();render();$("updateStatus").textContent="Sauvegarde importée avec succès."}catch(err){$("updateStatus").textContent="Import impossible : "+err.message}e.target.value=""});
$("checkUpdate").addEventListener("click",async()=>{ $("updateStatus").textContent="Vérification…";try{const r=await fetch(`https://api.github.com/repos/${REPO}/releases/latest`,{cache:"no-store"});if(!r.ok)throw new Error("Aucune Release publiée pour le moment.");const release=await r.json();latestRelease=release;const tag=(release.tag_name||"").replace(/^v/,"");$("updateStatus").textContent=tag&&tag!==VERSION?`Version ${tag} disponible : ${release.name||"mise à jour"}.`:`Tu utilises la dernière version publiée (${VERSION}).`;$("openRelease").classList.toggle("hidden",!tag||tag===VERSION); }catch(e){$("updateStatus").textContent="Impossible de vérifier : "+e.message}});
$("openRelease").addEventListener("click",()=>{if(latestRelease?.html_url)window.open(latestRelease.html_url,"_blank","noopener")});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
if(Capacitor.isNativePlatform())LocalNotifications.checkPermissions().then(p=>$("notifStatus").textContent=p.display==="granted"?"Notifications autorisées.":"Active les notifications pour recevoir tes rappels.");
