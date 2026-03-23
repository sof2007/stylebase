// catalog.js — единый каталог с сервера
const Catalog = (() => {
  const CATS = [
    {value:'all',label:'Все категории'},{value:'minimal',label:'Минимализм'},
    {value:'3d',label:'Объёмные'},{value:'modern',label:'Современные'},
    {value:'dark',label:'Тёмные'},{value:'other',label:'Другое'}
  ];
  let filter='all', source='all', ddOpen=false, _styles=[];

  function initDropdown() {
    const btn=document.getElementById('filter-dropdown-btn');
    const menu=document.getElementById('filter-dropdown-menu');
    menu.innerHTML=CATS.map(c=>`<div class="dd-item${c.value==='all'?' active':''}"
      onclick="Catalog.setFilter('${c.value}',this)">${c.label}</div>`).join('');
    btn.addEventListener('click',e=>{e.stopPropagation();ddOpen=!ddOpen;
      menu.classList.toggle('open',ddOpen);btn.classList.toggle('open',ddOpen);});
    document.addEventListener('click',()=>{ddOpen=false;
      menu.classList.remove('open');btn.classList.remove('open');});
  }

  function setFilter(val,el){
    filter=val;
    document.querySelectorAll('.dd-item').forEach(i=>i.classList.remove('active'));
    if(el) el.classList.add('active');
    const cat=CATS.find(c=>c.value===val);
    document.getElementById('filter-dropdown-label').textContent=cat?cat.label:'Все категории';
    _renderGrid();
  }

  function setSource(val,el){
    source=val;
    document.querySelectorAll('.src-tab').forEach(b=>b.classList.remove('active'));
    if(el) el.classList.add('active');
    _renderGrid();
  }

  async function renderAll(){
    try { _styles = await API.getStyles(); } catch { _styles=[]; }
    initDropdown();
    _renderGrid();
  }

  function _renderGrid(){
    const q=(document.getElementById('search-input')?.value||'').toLowerCase();
    const u=App.currentUser(); const isAdmin=App.isAdmin();
    const grid=document.getElementById('catalog-grid');

    const bi=BUILTIN.map(s=>({...s,_type:'builtin'}));
    const us=_styles.map(s=>({...s,_type:'user'}));
    let all=[...bi,...us];
    if(source==='builtin') all=bi;
    else if(source==='user') all=us;

    const out=all.filter(s=>{
      const mf=filter==='all'||s.category===filter;
      const ms=!q||(s.name||'').toLowerCase().includes(q)||
        (s.nameRu||'').toLowerCase().includes(q)||
        (s.desc||'').toLowerCase().includes(q)||
        (s.authorName||'').toLowerCase().includes(q);
      return mf&&ms;
    });

    document.getElementById('catalog-badge').textContent=out.length;
    if(!out.length){grid.innerHTML='<div class="no-results">Ничего не найдено</div>';return;}
    grid.innerHTML=out.map(s=>s._type==='builtin'?_bCard(s):_uCard(s,u,isAdmin)).join('');
  }

  function _bCard(s){
    return `<div class="style-card" onclick="Catalog.openBuiltinPreview('${s.id}')">
      <div class="card-preview">${Analyzer.buildPreview(s,180)}</div>
      <div class="card-body">
        <div class="card-header"><div class="card-name">${s.name}</div><div class="card-year">${s.year}</div></div>
        <div class="card-desc">${s.desc}</div>
        <div class="card-tags">${s.tags.map(t=>`<span class="tag">${t}</span>`).join('')}<span class="tag tag-builtin">Базовый</span></div>
        <div class="card-actions">
          <button class="btn-preview" onclick="event.stopPropagation();Catalog.openBuiltinPreview('${s.id}')">🔍 Просмотр</button>
          <button class="btn-download" onclick="event.stopPropagation();Catalog.downloadBuiltin('${s.id}')">⬇ CSS</button>
        </div>
      </div>
    </div>`;
  }

  function _uCard(s,u,isAdmin){
    const a=s._analysis||{};
    const ph=Analyzer.buildPreview({...a,name:s.name},180);
    const own=u&&u.id===s.authorId;
    return `<div class="style-card" onclick="Catalog.openUserPreview('${s.id}')">
      <div class="card-owner-badge">@${s.authorName}</div>
      <div class="card-preview">${ph}</div>
      <div class="card-body">
        <div class="card-header"><div class="card-name">${s.name}</div><div class="card-year">${UI.catLabel(s.category)}</div></div>
        <div class="card-desc">${s.desc||'Без описания'}</div>
        <div class="card-tags">
          ${a.type?`<span class="tag">${a.type}</span>`:''}
          <span class="tag" style="color:var(--accent)">@${s.authorName}</span>
        </div>
        <div class="card-actions">
          <button class="btn-preview" onclick="event.stopPropagation();Catalog.openUserPreview('${s.id}')">🔍 Просмотр</button>
          <button class="btn-download" onclick="event.stopPropagation();Catalog.downloadUser('${s.id}')">⬇ CSS</button>
          ${own?`<button class="btn-edit-card" onclick="event.stopPropagation();Upload.openEdit('${s.id}')">✏</button>`:''}
          ${(own||isAdmin)?`<button class="btn-del-card" onclick="event.stopPropagation();Catalog.confirmDeleteStyle('${s.id}')">🗑</button>`:''}
        </div>
      </div>
    </div>`;
  }

  function openBuiltinPreview(id){
    const s=BUILTIN.find(x=>x.id===id); if(!s) return;
    _preview({
      title:`${s.name} — ${s.nameRu}`, prev:Analyzer.buildPreview(s,280),
      det:`<div class="detail-item"><div class="detail-label">Год</div><div class="detail-value">${s.year}</div></div>
        <div class="detail-item"><div class="detail-label">Категория</div><div class="detail-value">${UI.catLabel(s.category)}</div></div>
        <div class="detail-item"><div class="detail-label" style="color:var(--accent)">Плюсы</div><div class="detail-value" style="color:var(--accent)">${s.pros}</div></div>
        <div class="detail-item"><div class="detail-label" style="color:#ff8080">Ограничения</div><div class="detail-value" style="color:#ff8080">${s.cons}</div></div>`,
      css:CSS_FILES[id]||'', dl:()=>downloadBuiltin(id)
    });
  }

  function openUserPreview(id){
    const s=_styles.find(x=>x.id===id); if(!s) return;
    const a=s._analysis||{};
    _preview({
      title:s.name, prev:Analyzer.buildPreview({...a,name:s.name},280),
      det:`<div class="detail-item"><div class="detail-label">Автор</div><div class="detail-value">@${s.authorName}</div></div>
        <div class="detail-item"><div class="detail-label">Категория</div><div class="detail-value">${UI.catLabel(s.category)}</div></div>
        <div class="detail-item"><div class="detail-label">Тип стиля</div><div class="detail-value">${a.type||'—'}</div></div>
        <div class="detail-item"><div class="detail-label">Скачиваний</div><div class="detail-value">${s.downloads}</div></div>`,
      css:s.cssContent||'', dl:()=>downloadUser(id)
    });
  }

  function _preview({title,prev,det,css,dl}){
    document.getElementById('modal-title').textContent=title;
    document.getElementById('modal-preview').innerHTML=prev;
    document.getElementById('modal-details').innerHTML=det;
    document.getElementById('modal-css').textContent=css.slice(0,600)+(css.length>600?'\n/* ... */':'');
    document.getElementById('modal-dl-btn').onclick=dl;
    UI.openModal('preview-modal');
  }

  async function downloadBuiltin(id){
    const s=BUILTIN.find(x=>x.id===id); if(!s) return;
    _trigger(CSS_FILES[id]||`/* ${s.name} */`, s.id+'.css');
    try { await API.trackDownloadBuiltin(); await App.refreshStats(); } catch{}
    UI.toast('⬇',`«${s.id}.css» скачан!`);
  }

  async function downloadUser(id){
    const s=_styles.find(x=>x.id===id); if(!s) return;
    _trigger(s.cssContent, s.fileName||s.name.toLowerCase().replace(/\s+/g,'-')+'.css');
    try { await API.trackDownloadUser(id); await App.refreshStats(); await renderAll(); } catch{}
    UI.toast('⬇',`«${s.name}» скачан!`);
  }

  function _trigger(content,fname){
    const url=URL.createObjectURL(new Blob([content],{type:'text/css'}));
    const a=document.createElement('a'); a.href=url; a.download=fname; a.click();
    URL.revokeObjectURL(url);
  }

  function confirmDeleteStyle(id){
    UI.confirm('Удалить стиль?','Стиль будет удалён безвозвратно.',async()=>{
      try { await API.deleteStyle(id); await renderAll(); UI.toast('🗑','Стиль удалён'); }
      catch(e){ UI.toast('⚠',e.message); }
    });
  }

  function getStyles(){ return _styles; }

  return {initDropdown,setFilter,setSource,renderAll,getStyles,
    openBuiltinPreview,openUserPreview,downloadBuiltin,downloadUser,confirmDeleteStyle};
})();
