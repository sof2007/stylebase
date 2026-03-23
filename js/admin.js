// admin.js
const Admin = (() => {
  async function render(){
    if(!App.isAdmin()){UI.showPage('catalog');return;}
    await renderUsers();
  }

  async function switchTab(tab,btn){
    document.getElementById('admin-users-panel').style.display=tab==='users'?'':'none';
    document.getElementById('admin-styles-panel').style.display=tab==='styles'?'':'none';
    document.querySelectorAll('.admin-tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    if(tab==='users') await renderUsers(); else renderStyles();
  }

  async function renderUsers(){
    let users=[];
    try{users=await API.getAllUsers();}catch{}
    document.getElementById('admin-users-body').innerHTML=users.map(u=>`
      <div class="admin-table-row">
        <span>${u.username}${u.role==='admin'?'<span class="admin-badge" style="margin-left:6px">A</span>':''}</span>
        <span style="color:var(--text-dim)">${u.email}</span>
        <span>${u.stylesCount||0}</span>
        <span>${u.downloads||0}</span>
        <div class="tbl-actions">
          ${u.role!=='admin'?`<button class="btn-sm btn-sm-danger" onclick="Admin.deleteUser('${u.id}')">Удалить</button>`:'<span style="color:var(--text-dim);font-size:11px">—</span>'}
        </div>
      </div>`).join('')||'<div style="padding:20px;color:var(--text-dim)">Нет пользователей</div>';
  }

  function renderStyles(){
    const styles=Catalog.getStyles();
    document.getElementById('admin-styles-body').innerHTML=styles.length===0?
      '<div style="padding:20px;color:var(--text-dim)">Нет загруженных стилей</div>':
      styles.map(s=>`<div class="admin-table-row">
        <span>${s.name}</span><span style="color:var(--accent)">@${s.authorName}</span>
        <span>${UI.catLabel(s.category)}</span><span>${s.downloads}</span>
        <div class="tbl-actions"><button class="btn-sm btn-sm-danger" onclick="Catalog.confirmDeleteStyle('${s.id}')">Удалить</button></div>
      </div>`).join('');
  }

  function deleteUser(uid){
    UI.confirm('Удалить пользователя?','Аккаунт и все его стили будут удалены.',async()=>{
      try{await API.deleteUser(uid);await render();await Catalog.renderAll();UI.toast('🗑','Пользователь удалён');}
      catch(e){UI.toast('⚠',e.message);}
    });
  }

  return{render,switchTab,renderUsers,renderStyles,deleteUser};
})();
