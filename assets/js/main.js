/* KILELE RADIO — main.js */
(function(){
"use strict";
var STREAM = "https://stream.zeno.fm/zbmsvkzenegvv";
var D = window.KILELE_DATA || {articles:[],shows:[]};

/* ---------- Date in top bar ---------- */
function tickClock(){
  var el = document.getElementById("tb-date");
  if(!el) return;
  var o = {timeZone:"Africa/Nairobi",weekday:"short",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"};
  el.textContent = new Date().toLocaleString("en-KE", o) + " EAT";
}
tickClock(); setInterval(tickClock, 30000);

/* ---------- Mobile nav ---------- */
var burger = document.getElementById("burger");
if(burger){ burger.addEventListener("click", function(){ document.getElementById("mainnav").classList.toggle("open"); }); }

/* ---------- Header search ---------- */
var hs = document.getElementById("hdr-search");
if(hs){ hs.addEventListener("keydown", function(e){ if(e.key==="Enter" && hs.value.trim()){ location.href = "/news.html?q=" + encodeURIComponent(hs.value.trim()); } }); }

/* ---------- On Air Now (from schedule) ---------- */
function nairobiNow(){ return new Date(new Date().toLocaleString("en-US",{timeZone:"Africa/Nairobi"})); }
function currentShow(){
  var n = nairobiNow(), day = n.getDay(), mins = n.getHours()*60 + n.getMinutes();
  for(var i=0;i<D.shows.length;i++){
    var s = D.shows[i];
    if(s.days.indexOf(day) === -1) continue;
    var st = s.start.split(":"), en = s.end.split(":");
    var sm = (+st[0])*60+(+st[1]), em = (+en[0])*60+(+en[1]);
    if(mins >= sm && mins < em) return s;
  }
  return null;
}
function renderOnAir(){
  var s = currentShow();
  document.querySelectorAll(".js-onair-name").forEach(function(el){ el.textContent = s ? s.name : "Non-stop Music Mix"; });
  document.querySelectorAll(".js-onair-host").forEach(function(el){ el.textContent = s ? ("with " + s.host + " · " + s.start + "–" + s.end + " EAT") : "Kilele Radio · 24/7 stream"; });
}
renderOnAir(); setInterval(renderOnAir, 60000);

/* ---------- Persistent player ---------- */
var audio = null, playing = false;
function ensureAudio(){
  if(!audio){ audio = new Audio(STREAM); audio.preload = "none"; }
  return audio;
}
function setPlayUI(){
  document.querySelectorAll(".js-play-icon").forEach(function(el){ el.textContent = playing ? "❚❚" : "▶"; });
  document.querySelectorAll(".js-play-label").forEach(function(el){ el.textContent = playing ? "Pause Live" : "Listen Live"; });
  var st = document.getElementById("pb-status");
  if(st) st.textContent = playing ? "Streaming live now" : "Tap play to start the live stream";
}
function togglePlay(){
  var a = ensureAudio();
  if(playing){ a.pause(); playing = false; }
  else { a.play().catch(function(){}); playing = true; }
  setPlayUI();
}
document.querySelectorAll(".js-play").forEach(function(b){ b.addEventListener("click", togglePlay); });
var vol = document.getElementById("pb-vol");
if(vol){ vol.addEventListener("input", function(){ if(audio) audio.volume = vol.value; }); }
setPlayUI();

/* ---------- Breaking ticker ---------- */
function renderTicker(){
  var t = document.getElementById("ticker-track");
  if(!t) return;
  var items = [];
  try{
    var demo = JSON.parse(localStorage.getItem("kilele_ticker") || "[]");
    var now = Date.now();
    items = demo.filter(function(x){ return !x.expires || x.expires > now; }).map(function(x){ return {title:x.text, url:"#"}; });
  }catch(e){}
  if(!items.length){
    items = D.articles.slice(0, 10).map(function(a){ return {title:a.title, url:"/a/" + a.slug + ".html"}; });
  }
  var html = items.map(function(i){ return '<a href="'+i.url+'">● '+i.title+'</a>'; }).join("");
  t.innerHTML = html + html; /* duplicate for seamless loop */
}
renderTicker();

/* ---------- News page: search + filter ---------- */
var nl = document.getElementById("news-list");
if(nl){
  var q = new URLSearchParams(location.search).get("q") || "";
  var si = document.getElementById("search-input");
  if(si) si.value = q;
  var activeCat = "all";
  function catName(id){ return (D.cats[id]||["News"])[0]; }
  function card(a){
    var img = a.img ? '<div class="thumb"><img loading="lazy" src="'+a.img+'" alt=""></div>'
                    : '<div class="thumb"><div class="ph" style="background:linear-gradient(135deg,'+a.c1+','+a.c2+')"><span>'+catName(a.cat)+'</span></div></div>';
    return '<article class="card">'+img+'<div class="body"><span class="chip">'+catName(a.cat)+'</span>'+
      '<h3><a href="/a/'+a.slug+'.html">'+a.title+'</a></h3>'+
      '<p class="excerpt">'+a.excerpt+'</p><div class="meta"><span>'+a.date+'</span><span>·</span><span>'+a.mins+' min read</span></div></div></article>';
  }
  function render(){
    var term = (si ? si.value : "").toLowerCase();
    var list = D.articles.filter(function(a){
      return (activeCat==="all" || a.cat===activeCat) &&
             (!term || a.title.toLowerCase().indexOf(term)>-1 || a.excerpt.toLowerCase().indexOf(term)>-1);
    });
    nl.innerHTML = list.slice(0,60).map(card).join("") || '<p style="color:var(--muted)">No stories match your search.</p>';
    var cnt = document.getElementById("news-count");
    if(cnt) cnt.textContent = list.length + (list.length===1?" story":" stories") + (activeCat==="all"?" across all desks":" in this desk");
  }
  document.querySelectorAll(".filter-chips button").forEach(function(b){
    b.addEventListener("click", function(){
      document.querySelectorAll(".filter-chips button").forEach(function(x){x.classList.remove("active");});
      b.classList.add("active"); activeCat = b.dataset.cat; render();
    });
  });
  if(si) si.addEventListener("input", render);
  render();
}

/* ---------- Admin demo gate ---------- */
if(document.body.dataset.admin === "1"){
  var u = null;
  try{ u = JSON.parse(localStorage.getItem("kilele_demo_user")||"null"); }catch(e){}
  if(!u){ location.href = "/login.html"; }
  else{
    var n2 = nairobiNow(), mins2 = n2.getHours()*60+n2.getMinutes();
    var sp = u.winStart.split(":"), ep = u.winEnd.split(":");
    var ok = mins2 >= (+sp[0])*60+(+sp[1]) && mins2 < (+ep[0])*60+(+ep[1]);
    if(!ok){
      document.getElementById("admin-app").innerHTML =
        '<div class="locked"><div style="font-size:44px">⏰</div><h2>Outside your allocated window</h2>'+
        '<p style="color:var(--muted)">Your shift-based access is active <b>'+u.winStart+'–'+u.winEnd+' EAT</b>. '+
        'The current station time is <b>'+n2.toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"})+'</b>, so this session has ended automatically.</p>'+
        '<p style="margin-top:18px"><a class="btn" href="login.html">Back to Staff Login</a></p></div>';
    }
  }
}
})();
