var views=["home","dashboard","login","create","editor","view"];
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function users(){try{return JSON.parse(store("woka_users")||"{}")}catch(e){return {}}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function $(id){return document.getElementById(id)}
function show(){
  var parts=(location.hash||"#home").slice(1).split("/");
  var h=parts[0];
  if(views.indexOf(h)<0)h="home";
  if((h==="dashboard"||h==="editor"||h==="view")&&!store("woka_me")){location.hash="#login";return}
  views.forEach(function(v){$("v-"+v).classList.toggle("show",v===h)});
  var me=store("woka_me");
  if(h==="dashboard")renderDash();if(h==="editor")renderEditor(parts[1]);if(h==="view")renderView(parts[1]);
  $("who").textContent=me?"Hi, "+me:"";
  var b=$("navbtn");
  b.textContent=me?"Log out":"Log in";
  b.setAttribute("href",me?"#home":"#login");
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",show);
$("navbtn").addEventListener("click",function(){if(store("woka_me")){try{localStorage.removeItem("woka_me")}catch(e){}}});
document.querySelector("[data-services]").addEventListener("click",function(e){
  e.preventDefault();location.hash="#home";
  setTimeout(function(){$("services").scrollIntoView({behavior:"smooth"})},50);
});
function tkey(){return "woka_t_"+String(store("woka_me")||"").toLowerCase()}
function templates(){try{return JSON.parse(store(tkey())||"[]")}catch(e){return []}}
function renderDash(){
  var me=store("woka_me"),t=templates(),m=$("mine");
  $("dwelcome").textContent="Welcome, "+me+".";
  if(!t.length){m.innerHTML='<div class="empty"><div class="zero">0</div><p>No templates yet. Choose one below to get started.</p></div>';return}
  m.innerHTML=t.map(function(x){
    var c={Simple:"t1",Modern:"t2",Creative:"t3"}[x.style]||"t1";
    return '<div class="card"><div class="thumb '+c+'"></div><b>'+esc(x.style)+' #'+x.n+'</b><span>Created '+esc(x.date)+'</span></div>';
  }).join("");
}
document.querySelectorAll("[data-pick]").forEach(function(b){
  b.addEventListener("click",function(){
    var t=templates();
    var id="t"+Date.now();t.push({id:id,style:b.dataset.pick,n:t.length+1,date:new Date().toLocaleDateString(),data:{name:store("woka_me")}});
    store(tkey(),JSON.stringify(t));
    location.hash="#editor/"+id;
  });
});
function say(id,text,ok){var m=$(id);m.textContent=text;m.className="msg"+(ok?" ok":"")}
$("createBtn").addEventListener("click",function(){
  var n=$("cn").value.trim(),p=$("cp").value,c=$("cc").value;
  if(!n)return say("cmsg","Please enter your full name.");
  if(p.length<8)return say("cmsg","Password needs at least 8 characters.");
  if(p!==c)return say("cmsg","Passwords do not match.");
  var u=users();var k=n.toLowerCase();
  if(u[k])return say("cmsg","That name already has an account. Try logging in.");
  u[k]={name:n,pw:p};
  store("woka_users",JSON.stringify(u));
  store("woka_me",n);
  say("cmsg","Account created!",true);
  setTimeout(function(){location.hash="#dashboard";show()},800);
});
$("loginBtn").addEventListener("click",function(){
  var n=$("ln").value.trim(),p=$("lp").value;
  if(!n||!p)return say("lmsg","Please fill in your name and password.");
  var u=users()[n.toLowerCase()];
  if(!u||u.pw!==p)return say("lmsg","Name or password is incorrect.");
  store("woka_me",u.name);
  say("lmsg","Welcome back, "+u.name+"!",true);
  setTimeout(function(){location.hash="#dashboard";show()},700);
});

var LISTS={
edu:{t:"Educational background",a:"Add education",f:[["school","School / University"],["degree","Degree / Course"],["years","Years (e.g. 2019 to 2023)"]]},
proj:{t:"Projects",a:"Add project",f:[["title","Project title"],["desc","Description","ta"],["link","Project link (optional)"]]},
work:{t:"Work experience",a:"Add experience",f:[["company","Company"],["role","Role"],["years","Years"],["desc","What you did","ta"]]},
soc:{t:"Social media / website links",a:"Add link",f:[["label","Platform (e.g. LinkedIn)"],["url","URL"]]}};
var cur=null,pic="";
function find(id){var t=templates();for(var i=0;i<t.length;i++)if(t[i].id===id)return{t:t,i:i};return null}
function rowHtml(k,v){v=v||{};return '<div class="row"><button type="button" class="rm">Remove</button>'+LISTS[k].f.map(function(f){var val=esc(v[f[0]]||"");return '<label>'+f[1]+'</label>'+(f[2]?'<textarea rows="3" data-f="'+f[0]+'">'+val+'</textarea>':'<input type="text" data-f="'+f[0]+'" value="'+val+'">')}).join("")+'</div>'}
function setPic(){$("epic").style.backgroundImage=pic?'url("'+pic+'")':"none"}
function renderEditor(id){
  var r=find(id);if(!r){location.hash="#dashboard";return}
  cur=id;var x=r.t[r.i],d=x.data||{};
  $("etitle").textContent=x.style.toUpperCase()+" PORTFOLIO";
  $("e-name").value=d.name||"";$("e-email").value=d.email||"";$("e-phone").value=d.phone||"";
  $("e-addr").value=d.address||"";$("e-about").value=d.about||"";$("e-skills").value=d.skills||"";
  pic=d.pic||"";setPic();$("efile").value="";say("emsg","");
  $("lists").innerHTML=Object.keys(LISTS).map(function(k){
    return '<h3>'+LISTS[k].t+'</h3><div id="l-'+k+'">'+(d[k]&&d[k].length?d[k]:[{}]).map(function(v){return rowHtml(k,v)}).join("")+'</div><button type="button" class="btn sm" data-add="'+k+'">'+LISTS[k].a+'</button>';
  }).join("");
}
$("v-editor").addEventListener("click",function(e){
  var t=e.target;
  if(t.classList.contains("rm"))t.parentNode.remove();
  if(t.dataset.add)$("l-"+t.dataset.add).insertAdjacentHTML("beforeend",rowHtml(t.dataset.add));
});
$("efile").addEventListener("change",function(){
  var f=this.files[0];if(!f)return;
  var fr=new FileReader();
  fr.onload=function(){var im=new Image();im.onload=function(){
    var c=document.createElement("canvas"),n=260,s=Math.min(im.width,im.height);
    c.width=c.height=n;c.getContext("2d").drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,n,n);
    pic=c.toDataURL("image/jpeg",.85);setPic()};
    im.onerror=function(){say("emsg","That file is not a readable image. Choose a JPG or PNG.")};
    im.src=fr.result};
  fr.readAsDataURL(f);
});
function collect(){
  var d={name:$("e-name").value.trim(),email:$("e-email").value.trim(),phone:$("e-phone").value.trim(),address:$("e-addr").value.trim(),about:$("e-about").value.trim(),skills:$("e-skills").value.trim(),pic:pic};
  Object.keys(LISTS).forEach(function(k){
    d[k]=[].map.call($("l-"+k).children,function(row){
      var o={},any=false;
      [].forEach.call(row.querySelectorAll("[data-f]"),function(i){o[i.dataset.f]=i.value.trim();if(o[i.dataset.f])any=true});
      return any?o:null}).filter(Boolean);
  });
  return d;
}
$("saveBtn").addEventListener("click",function(){
  var d=collect();
  if(!d.name)return say("emsg","Please enter your full name.");
  if(d.email&&!/^\S+@\S+\.\S+$/.test(d.email))return say("emsg","Enter a valid email address.");
  var r=find(cur);if(!r)return;
  r.t[r.i].data=d;
  try{localStorage.setItem(tkey(),JSON.stringify(r.t))}catch(e){return say("emsg","Could not save. Try a smaller profile picture.")}
  location.hash="#view/"+cur;
});
function url(u){u=String(u||"").trim();return u?(/^https?:\/\//i.test(u)?u:"https://"+u):""}
function sec(t,b){return b?'<section><h2>'+t+'</h2>'+b+'</section>':""}
function pf(d,style){
  var ct=[];
  if(d.email)ct.push('<a href="mailto:'+esc(d.email)+'">'+esc(d.email)+'</a>');
  if(d.phone)ct.push('<span>'+esc(d.phone)+'</span>');
  if(d.address)ct.push('<span>'+esc(d.address)+'</span>');
  var soc=(d.soc||[]).map(function(x){return '<a href="'+esc(url(x.url))+'" target="_blank" rel="noopener">'+esc(x.label||x.url)+'</a>'}).join("");
  var sk=(d.skills||"").split(",").map(function(z){return z.trim()}).filter(Boolean);
  var grid=function(a,fn){return a&&a.length?'<div class="grid">'+a.map(fn).join("")+'</div>':""};
  return '<div class="pf p-'+style.toLowerCase()+'"><div class="pfh">'+(d.pic?'<img class="av" src="'+esc(d.pic)+'" alt="'+esc(d.name)+'">':"")+
    '<div><h1>'+esc(d.name||"Your name")+'</h1><div class="ct">'+ct.join("")+'</div>'+(soc?'<div class="soc">'+soc+'</div>':"")+'</div></div><div class="bd">'+
    sec("About me",d.about?'<p>'+esc(d.about).replace(/\n/g,"<br>")+'</p>':"")+
    sec("Skills",sk.length?'<ul class="chips">'+sk.map(function(z){return '<li>'+esc(z)+'</li>'}).join("")+'</ul>':"")+
    sec("Projects",grid(d.proj,function(x){return '<div class="it"><b>'+esc(x.title||"")+'</b><p>'+esc(x.desc||"")+'</p>'+(x.link?'<a href="'+esc(url(x.link))+'" target="_blank" rel="noopener">View project</a>':"")+'</div>'}))+
    sec("Work experience",grid(d.work,function(x){return '<div class="it"><b>'+esc(x.role||"")+'</b><span>'+esc(x.company||"")+'</span><small>'+esc(x.years||"")+'</small><p>'+esc(x.desc||"")+'</p></div>'}))+
    sec("Education",grid(d.edu,function(x){return '<div class="it"><b>'+esc(x.degree||"")+'</b><span>'+esc(x.school||"")+'</span><small>'+esc(x.years||"")+'</small></div>'}))+
    '</div></div>';
}
function renderView(id){
  var r=find(id);if(!r){location.hash="#dashboard";return}
  var x=r.t[r.i];
  $("editLink").setAttribute("href","#editor/"+x.id);
  $("pfwrap").innerHTML=pf(x.data||{},x.style);
}
function renderDash(){
  var me=store("woka_me"),t=templates(),m=$("mine"),ch=false;
  $("dwelcome").textContent="Welcome, "+me+".";
  t.forEach(function(x,i){if(!x.id){x.id="t"+i+Date.now();ch=true}});
  if(ch)store(tkey(),JSON.stringify(t));
  var n=t.length,by={};
  t.forEach(function(x){by[x.style]=(by[x.style]||0)+1});
  $("tcount").innerHTML='<span class="badge">'+n+'</span> '+(n===1?"template":"templates")+' created'+(n?' &middot; '+Object.keys(by).map(function(k){return by[k]+' '+k}).join(', '):'');
  if(!n){m.innerHTML='<div class="empty"><div class="zero">0</div><p>No templates yet. Choose one below to get started.</p></div>';return}
  m.innerHTML=t.map(function(x){
    var d=x.data||{},c=function(a){return (d[a]||[]).length},sk=(d.skills||"").split(",").filter(function(z){return z.trim()}).length;
    var rows=[["Name",d.name],["Email",d.email],["Contact",d.phone],["Address",d.address]].filter(function(r){return r[1]}).map(function(r){return '<div><b>'+r[0]+':</b> '+esc(r[1])+'</div>'}).join("");
    var cnt=[c("proj")+" projects",sk+" skills",c("work")+" jobs",c("edu")+" education",c("soc")+" links"].join(" &middot; ");
    return '<div class="card"><div class="pv">'+pf(d,x.style)+'</div><b>'+esc(x.style)+' #'+x.n+'</b><span>Created '+esc(x.date)+'</span><div class="facts">'+(rows||'<div>No details added yet.</div>')+'<div>'+cnt+'</div></div><div class="acts"><a class="btn sm" href="#editor/'+x.id+'">Edit</a><a class="btn sm" href="#view/'+x.id+'">View</a><button class="btn sm" data-del="'+x.id+'">Delete</button></div></div>';
  }).join("");
  fit();
}
function fit(){[].forEach.call(document.querySelectorAll(".pv"),function(p){var w=p.clientWidth;if(!w)return;p.firstChild.style.transform="scale("+(w/900)+")";p.style.height=Math.round(w*.9)+"px"})}
window.addEventListener("resize",fit);
$("mine").addEventListener("click",function(e){
  var id=e.target.dataset.del;
  if(!id||!confirm("Delete this template?"))return;
  store(tkey(),JSON.stringify(templates().filter(function(x){return x.id!==id})));
  renderDash();
});
(function(){
  var tr=$("track"),tabs=[].slice.call(document.querySelectorAll(".tab")),sl=$("slider"),N=tabs.length,i=0,timer,paused=false,x0=null;
  function go(n){i=(n+N)%N;[].forEach.call(tr?tr.children:[],function(f,j){f.classList.toggle("on",j===i)});tabs.forEach(function(t,j){t.classList.toggle("on",j===i);t.setAttribute("aria-selected",j===i)})}
  function restart(){clearInterval(timer);if(window.matchMedia("(prefers-reduced-motion:reduce)").matches)return;timer=setInterval(function(){if(!paused&&!document.hidden&&$("v-home").classList.contains("show"))go(i+1)},4500)}
  tabs.forEach(function(t,j){t.addEventListener("click",function(){go(j);restart()})});  sl.addEventListener("mouseenter",function(){paused=true});sl.addEventListener("mouseleave",function(){paused=false});
  sl.addEventListener("focusin",function(){paused=true});sl.addEventListener("focusout",function(){paused=false});
  sl.addEventListener("keydown",function(e){if(e.key==="ArrowLeft"){go(i-1);restart()}if(e.key==="ArrowRight"){go(i+1);restart()}});
  sl.addEventListener("pointerdown",function(e){x0=e.clientX});
  sl.addEventListener("pointerup",function(e){if(x0===null)return;var d=e.clientX-x0;x0=null;if(Math.abs(d)>50){go(d<0?i+1:i-1);restart()}});
  $("useStyle").addEventListener("click",function(){location.hash=store("woka_me")?"#dashboard":"#create"});
  restart();
})();
show();
