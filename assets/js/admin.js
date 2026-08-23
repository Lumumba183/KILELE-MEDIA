/* KILELE RADIO — admin.js (demo workspace) */
(function(){
"use strict";
if(!document.body || document.body.dataset.admin !== "1") return;

var SECTIONS = [
  ["overview","Overview"],["studio","Article Studio"],["ticker","Breaking Ticker"],
  ["podcasts","Podcasts"],["programmes","Programmes"],["ads","Ad Manager"],["access","Shifts & Access"]
];

var DEFAULT_USERS = [
  {id:"u1", name:"Teryani Mwadzaya", role:"Super Admin", winStart:"06:00", winEnd:"23:00",
   sections:SECTIONS.map(function(s){return s[0];})},
  {id:"u2", name:"Athman Luchi", role:"News Editor", winStart:"08:00", winEnd:"17:00",
   sections:["overview","studio","ticker","podcasts","programmes"]},
  {id:"u3", name:"Demo Journalist", role:"Journalist", winStart:"10:00", winEnd:"12:00",
   sections:["overview","studio"]},
  {id:"u4", name:"Demo Presenter", role:"Presenter / Producer", winStart:"12:00", winEnd:"15:00",
   sections:["overview","podcasts","programmes"]}
];

function load(k, d){ try{ var v = JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } }
function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }

var users = load("kilele_users", DEFAULT_USERS);
var drafts = load("kilele_drafts", []);
var tickerItems = load("kilele_ticker", [{text:"Welcome to the new Kilele Radio digital platform", expires:0}]);
var ads = load("kilele_ads", [
  {zone:"Top leaderboard (all pages)", advertiser:"— available —", until:""},
  {zone:"In-article rectangle", advertiser:"— available —", until:""},
  {zone:"Sidebar box", advertiser:"— available —", until:""},
  {zone:"Homepage takeover strip", advertiser:"— available —", until:""}
]);

var me = JSON.parse(localStorage.getItem("kilele_demo_user") || "null");
function myUser(){
  return users.find(function(x){ return x.name === (me && me.name); }) || me;
}
function allowed(sec){
  var u = myUser();
  return u && u.sections && u.sections.indexOf(sec) > -1;
}
function nairobiNow(){ return new Date(new Date().toLocaleString("en-US",{timeZone:"Africa/Nairobi"})); }
function inWindow(u){
  var n = nairobiNow(), m = n.getHours()*60+n.getMinutes();
  var a = u.winStart.split(":"), b = u.winEnd.split(":");
  return m >= (+a[0])*60+(+a[1]) && m < (+b[0])*60+(+b[1]);
}

/* ---- sidebar ---- */
var side = document.getElementById("admin-nav");
if(me){
  document.getElementById("as-name").textContent = me.name;
  document.getElementById("as-role").textContent = me.role + " · window " + me.winStart + "–" + me.winEnd + " EAT";
}
SECTIONS.forEach(function(s){
  if(!allowed(s[0])) return;
  var a = document.createElement("a");
  a.href = "#" + s[0]; a.dataset.sec = s[0]; a.textContent = s[1];
  side.appendChild(a);
});
var out = document.createElement("a");
out.href = "login.html"; out.textContent = "Sign out (demo)";
out.addEventListener("click", function(){ localStorage.removeItem("kilele_demo_user"); });
side.appendChild(out);

/* ---- section switching ---- */
function show(sec){
  if(!allowed(sec)){
    document.querySelectorAll(".admin-sec").forEach(function(x){ x.style.display = "none"; });
    document.getElementById("sec-denied").style.display = "block";
    return;
  }
  document.querySelectorAll(".admin-sec").forEach(function(x){ x.style.display = x.id === "sec-"+sec ? "block" : "none"; });
  document.querySelectorAll("#admin-nav a[data-sec]").forEach(function(a){ a.classList.toggle("active", a.dataset.sec === sec); });
}
document.querySelectorAll("#admin-nav a[data-sec]").forEach(function(a){
  a.addEventListener("click", function(e){ e.preventDefault(); location.hash = a.dataset.sec; show(a.dataset.sec); });
});
show((location.hash || "#overview").slice(1));

/* ---- overview ---- */
var D = window.KILELE_DATA || {articles:[]};
document.getElementById("st-articles").textContent = D.articles.length;
document.getElementById("st-drafts").textContent = drafts.length;
document.getElementById("st-users").textContent = users.length;
document.getElementById("st-ads").textContent = ads.filter(function(a){return a.advertiser.indexOf("available")===-1;}).length + " / " + ads.length;

/* ---- article studio ---- */
var imgInput = document.getElementById("f-image");
if(imgInput){
  imgInput.addEventListener("change", function(){
    var f = imgInput.files[0]; if(!f) return;
    var r = new FileReader();
    r.onload = function(){ var p = document.getElementById("img-preview"); p.src = r.result; p.style.display = "block"; };
    r.readAsDataURL(f);
  });
}
function renderDrafts(){
  var el = document.getElementById("draft-list");
  el.innerHTML = drafts.map(function(d, i){
    return '<tr><td><b>'+d.title+'</b></td><td>'+d.cat+'</td><td><span class="badge '+(d.status==="Published"?"on":"warn")+'">'+d.status+'</span></td>'+
           '<td>'+d.when+'</td><td><button class="small-btn red" data-del="'+i+'">Delete</button></td></tr>';
  }).join("") || '<tr><td colspan="5" style="color:var(--muted)">No stories created yet in this demo workspace.</td></tr>';
  el.querySelectorAll("[data-del]").forEach(function(b){
    b.addEventListener("click", function(){ drafts.splice(+b.dataset.del,1); save("kilele_drafts", drafts); renderDrafts(); });
  });
  document.getElementById("st-drafts").textContent = drafts.length;
}
renderDrafts();
function addDraft(status){
  var t = document.getElementById("f-title").value.trim();
  if(!t){ alert("Give the story a headline first."); return; }
  drafts.unshift({ title:t, cat:document.getElementById("f-cat").value,
    body:document.getElementById("f-body").value, status:status,
    when:new Date().toLocaleString("en-KE",{timeZone:"Africa/Nairobi"}) });
  save("kilele_drafts", drafts); renderDrafts();
  document.getElementById("f-title").value = ""; document.getElementById("f-body").value = "";
  alert(status === "Published" ? "Story published (demo)." : "Draft saved (demo).");
}
var bp = document.getElementById("btn-publish"), bd = document.getElementById("btn-draft");
if(bp) bp.addEventListener("click", function(){ addDraft("Published"); });
if(bd) bd.addEventListener("click", function(){ addDraft("Draft"); });

/* ---- ticker manager ---- */
function renderTicker(){
  var el = document.getElementById("ticker-list");
  el.innerHTML = tickerItems.map(function(t, i){
    return '<tr><td>'+t.text+'</td><td>'+(t.expires ? new Date(t.expires).toLocaleString("en-KE") : "No expiry")+'</td>'+
           '<td><button class="small-btn red" data-tdel="'+i+'">Remove</button></td></tr>';
  }).join("") || '<tr><td colspan="3" style="color:var(--muted)">Ticker empty — the homepage shows latest headlines instead.</td></tr>';
  el.querySelectorAll("[data-tdel]").forEach(function(b){
    b.addEventListener("click", function(){ tickerItems.splice(+b.dataset.tdel,1); save("kilele_ticker", tickerItems); renderTicker(); });
  });
}
renderTicker();
var bt = document.getElementById("btn-ticker");
if(bt) bt.addEventListener("click", function(){
  var txt = document.getElementById("t-text").value.trim(); if(!txt) return;
  var hrs = +document.getElementById("t-expiry").value;
  tickerItems.unshift({text:txt, expires: hrs ? Date.now()+hrs*3600*1000 : 0});
  save("kilele_ticker", tickerItems); renderTicker();
  document.getElementById("t-text").value = "";
  alert("Ticker updated — open the homepage in this browser to see it scroll.");
});

/* ---- ads manager ---- */
function renderAds(){
  document.getElementById("ads-list").innerHTML = ads.map(function(a, i){
    return '<tr><td><b>'+a.zone+'</b></td><td><input type="text" value="'+a.advertiser+'" data-adv="'+i+'"></td>'+
           '<td><input type="text" value="'+a.until+'" placeholder="e.g. 30 Sep 2026" data-auntil="'+i+'" style="width:130px"></td></tr>';
  }).join("");
  document.querySelectorAll("[data-adv]").forEach(function(inp){
    inp.addEventListener("change", function(){ ads[+inp.dataset.adv].advertiser = inp.value; save("kilele_ads", ads); });
  });
  document.querySelectorAll("[data-auntil]").forEach(function(inp){
    inp.addEventListener("change", function(){ ads[+inp.dataset.auntil].until = inp.value; save("kilele_ads", ads); });
  });
}
renderAds();

/* ---- shifts & access ---- */
function renderUsers(){
  var el = document.getElementById("users-list");
  el.innerHTML = users.map(function(u, i){
    var secs = SECTIONS.map(function(s){
      var on = u.sections.indexOf(s[0]) > -1;
      return '<label style="display:inline-flex;align-items:center;gap:4px;margin:2px 8px 2px 0;font-size:12px">'+
        '<input type="checkbox" data-usec="'+i+'" data-sec="'+s[0]+'" '+(on?"checked":"")+'> '+s[1]+'</label>';
    }).join("");
    return '<tr><td><b>'+u.name+'</b><br><small style="color:var(--muted)">'+u.role+'</small></td>'+
      '<td style="white-space:nowrap"><input type="time" value="'+u.winStart+'" data-ustart="'+i+'"> – <input type="time" value="'+u.winEnd+'" data-uend="'+i+'"></td>'+
      '<td>'+(inWindow(u) ? '<span class="badge on">In window — login works</span>' : '<span class="badge off">Outside window — logged out</span>')+'</td>'+
      '<td>'+secs+'</td></tr>';
  }).join("");
  el.querySelectorAll("[data-ustart]").forEach(function(inp){
    inp.addEventListener("change", function(){ users[+inp.dataset.ustart].winStart = inp.value; save("kilele_users", users); renderUsers(); });
  });
  el.querySelectorAll("[data-uend]").forEach(function(inp){
    inp.addEventListener("change", function(){ users[+inp.dataset.uend].winEnd = inp.value; save("kilele_users", users); renderUsers(); });
  });
  el.querySelectorAll("[data-usec]").forEach(function(cb){
    cb.addEventListener("change", function(){
      var u = users[+cb.dataset.usec];
      var ix = u.sections.indexOf(cb.dataset.sec);
      if(cb.checked && ix === -1) u.sections.push(cb.dataset.sec);
      if(!cb.checked && ix > -1) u.sections.splice(ix,1);
      save("kilele_users", users);
    });
  });
}
renderUsers();
setInterval(renderUsers, 60000);
var br = document.getElementById("btn-reset");
if(br) br.addEventListener("click", function(){
  ["kilele_users","kilele_drafts","kilele_ticker","kilele_ads"].forEach(function(k){ localStorage.removeItem(k); });
  location.reload();
});
})();
