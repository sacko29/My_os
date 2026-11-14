const $ = (id) => document.getElementById(id);
const KEY = "my-os-v1";
let state = JSON.parse(localStorage.getItem(KEY) || '{"focus":"","tasks":[]}');
let interval = null, remaining = 120;

$("today").textContent = new Intl.DateTimeFormat("fr-FR",{weekday:"long",day:"numeric",month:"long"}).format(new Date());
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function render(){
  $("focusText").textContent = state.focus || "Aucune priorité définie. Choisis une petite action.";
  $("taskCount").textContent = state.tasks.filter(t=>!t.done).length;
  $("taskList").innerHTML = "";
  state.tasks.forEach((task,index)=>{
    const li=document.createElement("li"); if(task.done) li.className="done";
    const check=document.createElement("input");check.type="checkbox";check.checked=task.done;
    check.addEventListener("change",()=>{state.tasks[index].done=check.checked;save();render();});
    const label=document.createElement("label");label.textContent=task.text;
    const del=document.createElement("button");del.className="delete";del.textContent="×";del.setAttribute("aria-label","Supprimer");
    del.addEventListener("click",()=>{state.tasks.splice(index,1);save();render();});
    li.append(check,label,del);$("taskList").append(li);
  });
}
$("changeFocusBtn").addEventListener("click",()=>{
  const value=prompt("Quelle est la prochaine petite action ? (une seule)");
  if(value!==null){state.focus=value.trim();save();render();}
});
$("taskForm").addEventListener("submit",e=>{
  e.preventDefault();const value=$("taskInput").value.trim();if(!value)return;
  state.tasks.push({text:value,done:false});$("taskInput").value="";save();render();
});
function displayTimer(){$("timer").textContent=String(Math.floor(remaining/60)).padStart(2,"0")+":"+String(remaining%60).padStart(2,"0");}
$("startBtn").addEventListener("click",()=>{
  if(!state.focus){$("changeFocusBtn").click();if(!state.focus)return;}
  remaining=120;displayTimer();$("timerBox").classList.remove("hidden");$("startBtn").classList.add("hidden");
  interval=setInterval(()=>{remaining--;displayTimer();if(remaining<=0){clearInterval(interval);interval=null;$("timerBox").querySelector("p").textContent="Les 2 minutes sont passées. Tu peux continuer ou t’arrêter : le démarrage est déjà fait."; $("stopBtn").textContent="Fermer";}},1000);
});
$("stopBtn").addEventListener("click",()=>{
  if(interval)clearInterval(interval);interval=null;$("timerBox").classList.add("hidden");$("startBtn").classList.remove("hidden");
});
document.querySelectorAll("[data-block]").forEach(btn=>btn.addEventListener("click",()=>{
  const b=btn.dataset.block;
  const replies={
    "Je n’ai pas envie":"Réduis la tâche : fais seulement 2 minutes. Tu n’as pas besoin d’avoir envie pour essayer.",
    "Je ne sais pas par où commencer":"Écris la toute première action physique : ouvrir le cahier, lire le titre, sortir le matériel…",
    "Je suis fatigué":"Choisis une pause réelle ou une tâche légère. Évite de confondre repos et culpabilité.",
    "Je manque de temps":"Choisis la version minimale utile. Une petite étape vaut mieux qu’un plan impossible."
  };
  $("blockReply").textContent=replies[b];
}));
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();