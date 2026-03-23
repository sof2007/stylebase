// ui.js
const UI = (() => {
  function toast(icon,msg){
    document.getElementById('toast-icon').textContent=icon;
    document.getElementById('toast-msg').textContent=msg;
    const el=document.getElementById('toast');
    el.classList.add('show'); clearTimeout(el._t);
    el._t=setTimeout(()=>el.classList.remove('show'),3500);
  }
  function openModal(id){document.getElementById(id).classList.add('open');}
  function closeModal(id){document.getElementById(id).classList.remove('open');}
  function closeAll(){document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open'));}
  function showPage(page){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('page-'+page).classList.add('active');
    const m={catalog:0,guide:1};
    document.querySelectorAll('nav button:not(#nav-admin)').forEach((b,i)=>b.classList.toggle('active',m[page]===i));
    window.scrollTo(0,0);
  }
  function confirm(title,text,cb){
    document.getElementById('confirm-title').textContent=title;
    document.getElementById('confirm-text').textContent=text;
    document.getElementById('confirm-ok').onclick=()=>{closeModal('confirm-modal');cb();};
    openModal('confirm-modal');
  }
  function renderHeader(user){
    const hr=document.getElementById('header-right');
    const adminNav=document.getElementById('nav-admin');
    if(!user){
      hr.innerHTML=`<button class="btn-ghost" onclick="UI.openModal('auth-modal')">Войти</button>
        <button class="btn-accent" onclick="App.openUpload()">+ Загрузить</button>`;
      adminNav.style.display='none'; return;
    }
    hr.innerHTML=`<button class="btn-accent" onclick="App.openUpload()">+ Загрузить</button>
      <div class="user-chip" onclick="App.showProfile()">
        <div class="user-avatar">${user.username[0].toUpperCase()}</div>
        <span class="user-name">${user.username}</span>
        ${user.role==='admin'?'<span class="admin-badge">ADMIN</span>':''}
      </div>`;
    adminNav.style.display=user.role==='admin'?'':'none';
  }
  function catLabel(c){return{minimal:'Минимализм','3d':'Объёмные',modern:'Современные',dark:'Тёмные',other:'Другое'}[c]||c||'—';}
  return{toast,openModal,closeModal,closeAll,showPage,confirm,renderHeader,catLabel};
})();

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.modal-overlay').forEach(m=>{
    m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');});
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')UI.closeAll();});
});
