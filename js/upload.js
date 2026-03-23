// upload.js
const Upload = (() => {
  let _file=null, _editingId=null;

  function openNew(){
    if(!App.currentUser()){UI.openModal('auth-modal');UI.toast('⚠','Для загрузки нужно войти');return;}
    _reset(); _editingId=null;
    document.getElementById('upload-modal-title').textContent='Загрузить стиль';
    document.getElementById('upload-submit-btn').textContent='✓ Опубликовать';
    UI.openModal('upload-modal');
  }

  function openEdit(id){
    const s=Catalog.getStyles().find(x=>x.id===id); if(!s) return;
    _reset(); _editingId=id;
    document.getElementById('upload-modal-title').textContent='Редактировать стиль';
    document.getElementById('upload-submit-btn').textContent='✓ Сохранить';
    document.getElementById('style-name').value=s.name;
    document.getElementById('style-cat').value=s.category;
    document.getElementById('style-desc').value=s.desc||'';
    UI.openModal('upload-modal');
  }

  function _reset(){
    _file=null;
    document.getElementById('style-name').value='';
    document.getElementById('style-cat').value='minimal';
    document.getElementById('style-desc').value='';
    document.getElementById('file-info').classList.remove('show');
  }

  function handleFile(input){
    const f=input.files[0]; if(!f) return;
    _file=f;
    document.getElementById('file-name-show').textContent=f.name;
    document.getElementById('file-info').classList.add('show');
  }

  function initDrop(){
    const zone=document.getElementById('upload-zone');
    zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag');});
    zone.addEventListener('dragleave',()=>zone.classList.remove('drag'));
    zone.addEventListener('drop',e=>{
      e.preventDefault();zone.classList.remove('drag');
      const f=e.dataTransfer.files[0];
      if(f&&f.name.endsWith('.css')){_file=f;document.getElementById('file-name-show').textContent=f.name;document.getElementById('file-info').classList.add('show');}
      else UI.toast('⚠','Нужен .css файл');
    });
  }

  async function submit(){
    const name=document.getElementById('style-name').value.trim();
    const cat=document.getElementById('style-cat').value;
    const desc=document.getElementById('style-desc').value.trim();
    if(!name){UI.toast('⚠','Введите название');return;}
    if(!App.currentUser()){UI.toast('⚠','Нужно войти');return;}

    const btn=document.getElementById('upload-submit-btn');
    btn.textContent='Загрузка...'; btn.disabled=true;

    try {
      if(_editingId){
        const payload={name,category:cat,desc};
        if(_file){
          const css=await _readFile(_file);
          payload.cssContent=css; payload.fileName=_file.name;
          payload.analysis=Analyzer.analyse(css,name);
        }
        await API.updateStyle(_editingId,payload);
        UI.closeModal('upload-modal');
        await Catalog.renderAll();
        UI.toast('✓',`«${name}» обновлён!`);
      } else {
        if(!_file){UI.toast('⚠','Прикрепите CSS-файл');return;}
        const css=await _readFile(_file);
        const analysis=Analyzer.analyse(css,name);
        await API.addStyle({name,category:cat,desc,cssContent:css,fileName:_file.name,analysis});
        UI.closeModal('upload-modal');
        await Catalog.renderAll();
        await App.refreshStats();
        UI.showPage('catalog');
        UI.toast('✓',`«${name}» опубликован! Тип: ${analysis.type}`);
      }
    } catch(e){
      UI.toast('⚠',e.message);
    } finally {
      btn.textContent=_editingId?'✓ Сохранить':'✓ Опубликовать';
      btn.disabled=false;
    }
  }

  function _readFile(file){
    return new Promise((res,rej)=>{
      const r=new FileReader();
      r.onload=e=>res(e.target.result);
      r.onerror=()=>rej(new Error('Ошибка чтения файла'));
      r.readAsText(file);
    });
  }

  return {openNew,openEdit,handleFile,initDrop,submit};
})();
