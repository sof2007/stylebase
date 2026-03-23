// profile.js
const Profile = (() => {
  function render(u){
    if(!u){UI.showPage('catalog');return;}
    const myStyles=Catalog.getStyles().filter(s=>s.authorId===u.id);
    const totalDl=myStyles.reduce((a,s)=>a+(s.downloads||0),0);
    document.getElementById('profile-content').innerHTML=`
      <div class="profile-head">
        <div class="profile-avatar-lg">${u.username[0].toUpperCase()}</div>
        <div class="profile-info-main">
          <div class="profile-username">${u.username}${u.role==='admin'?'<span class="admin-badge" style="font-size:11px;margin-left:8px">ADMIN</span>':''}</div>
          <div class="profile-role">Роль: <span>${u.role==='admin'?'Администратор':'Участник'}</span></div>
          <div style="font-size:12px;color:var(--text-dim);margin-top:4px;">${u.email}</div>
        </div>
        <div class="profile-actions-head">
          <button class="btn-ghost" onclick="Profile.openEdit()">✏ Редактировать</button>
          <button class="btn-ghost" onclick="Profile.logout()">Выйти</button>
        </div>
      </div>
      <div class="profile-section">
        <div class="profile-section-title">Статистика</div>
        <div class="profile-stat-row">
          <div class="profile-stat-card"><div class="num">${myStyles.length}</div><div class="lbl">Стилей загружено</div></div>
          <div class="profile-stat-card"><div class="num">${totalDl}</div><div class="lbl">Скачиваний</div></div>
          <div class="profile-stat-card"><div class="num">${new Date(u.createdAt).toLocaleDateString('ru')}</div><div class="lbl">Дата регистрации</div></div>
        </div>
      </div>
      <div class="profile-section">
        <div class="profile-section-title">Мои стили</div>
        ${myStyles.length===0?'<div style="color:var(--text-dim);font-size:13px;">Вы ещё не загрузили ни одного стиля.</div>':
          `<div class="profile-style-list">${myStyles.map(s=>`
            <div class="profile-style-row">
              <div class="profile-style-info">
                <div class="profile-style-name">${s.name}</div>
                <div class="profile-style-meta">${UI.catLabel(s.category)} · ${s.downloads} скач. · ${new Date(s.uploadedAt).toLocaleDateString('ru')}</div>
              </div>
              <div class="profile-style-actions">
                <button class="btn-sm btn-sm-ghost" onclick="Upload.openEdit('${s.id}')">✏</button>
                <button class="btn-sm btn-sm-danger" onclick="Catalog.confirmDeleteStyle('${s.id}')">🗑</button>
              </div>
            </div>`).join('')}
          </div>`}
      </div>
      <div class="profile-section danger-zone">
        <div class="profile-section-title">Опасная зона</div>
        <p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">Удаление аккаунта необратимо. Все ваши стили также будут удалены.</p>
        <button class="btn-sm btn-sm-danger" style="padding:8px 16px;font-size:12px;" onclick="Profile.confirmDeleteAccount()">Удалить аккаунт</button>
      </div>`;
  }

  function openEdit(){
    const u=App.currentUser();
    document.getElementById('edit-username').value=u.username;
    document.getElementById('edit-email').value=u.email;
    document.getElementById('edit-password').value='';
    document.getElementById('edit-password2').value='';
    document.getElementById('edit-err').classList.remove('show');
    UI.openModal('edit-profile-modal');
  }

  async function saveEdit(){
    const u=App.currentUser();
    const err=document.getElementById('edit-err');
    const pw=document.getElementById('edit-password').value;
    const pw2=document.getElementById('edit-password2').value;
    if(pw&&pw!==pw2){err.textContent='Пароли не совпадают';err.classList.add('show');return;}
    try {
      const updated=await API.updateUser(u.id,{
        username:document.getElementById('edit-username').value.trim(),
        email:document.getElementById('edit-email').value.trim(),
        password:pw||undefined
      });
      err.classList.remove('show');
      UI.closeModal('edit-profile-modal');
      await App.afterLogin(updated.user);
      render(updated.user);
      UI.toast('✓','Профиль обновлён');
    } catch(e){err.textContent=e.message;err.classList.add('show');}
  }

  async function logout(){
    await API.logout();
    await App.afterLogout();
    UI.toast('','Вы вышли из аккаунта');
  }

  function confirmDeleteAccount(){
    UI.confirm('Удалить аккаунт?','Аккаунт и все ваши стили будут удалены безвозвратно.',async()=>{
      try{await API.deleteUser(App.currentUser().id);await App.afterLogout();UI.toast('🗑','Аккаунт удалён');}
      catch(e){UI.toast('⚠',e.message);}
    });
  }

  return{render,openEdit,saveEdit,logout,confirmDeleteAccount};
})();
