// ============================================================
//  data.js — встроенные стили каталога и их CSS-содержимое
// ============================================================

const BUILTIN = [
  {
    id:'skeu', name:'Skeuomorphism', nameRu:'Скевоморфизм', year:'2000-е',
    category:'3d', tags:['Реализм','Тени','Apple iOS'],
    desc:'Имитация физических объектов. Кнопки и иконки воспроизводят облик реальных предметов.',
    pros:'Интуитивен для новичков', cons:'Выглядит устаревшим',
    previewBg:'linear-gradient(145deg,#c8c8c8,#e8e8e8)',
    cardStyle:`background:linear-gradient(145deg,#f0f0f0,#d0d0d0);border:1px solid #b0b0b0;border-radius:8px;padding:14px 16px;box-shadow:4px 4px 8px #999,-2px -2px 6px #fff,inset 0 1px 0 rgba(255,255,255,.9);`,
    labelColor:'#888', titleColor:'#222', subColor:'#666',
    btnStyle:`background:linear-gradient(145deg,#e8e8e8,#c0c0c0);border:1px solid #999;border-radius:6px;padding:5px 14px;font-size:11px;font-weight:600;color:#333;cursor:default;box-shadow:2px 2px 5px #aaa,-1px -1px 3px #fff;`
  },
  {
    id:'flat', name:'Flat Design', nameRu:'Плоский дизайн', year:'2012',
    category:'minimal', tags:['Минимализм','Microsoft','Яркие цвета'],
    desc:'Двумерные элементы без теней. Яркая палитра и чистая типографика.',
    pros:'Быстрая загрузка, адаптивность', cons:'Может быть малоинформативным',
    previewBg:'#2ecc71',
    cardStyle:`background:white;border-radius:3px;padding:14px 16px;`,
    labelColor:'#2ecc71', titleColor:'#1a1a1a', subColor:'#555',
    btnStyle:`background:#2ecc71;border:none;border-radius:2px;padding:5px 14px;font-size:10px;font-weight:700;color:white;text-transform:uppercase;letter-spacing:.5px;cursor:default;`
  },
  {
    id:'material', name:'Material Design', nameRu:'Материальный дизайн', year:'2014',
    category:'modern', tags:['Google','Android','Анимация'],
    desc:'Язык дизайна от Google. Элементы подчиняются физике — имеют глубину и тени.',
    pros:'Системность, документация', cons:'Может казаться «гугловским»',
    previewBg:'#fafafa',
    cardStyle:`background:white;border-radius:4px;padding:14px 16px;box-shadow:0 2px 8px rgba(0,0,0,.12),0 1px 3px rgba(0,0,0,.08);`,
    labelColor:'#1976d2', titleColor:'#212121', subColor:'#757575',
    btnStyle:`background:#1976d2;border:none;border-radius:4px;padding:5px 14px;font-size:11px;font-weight:500;color:white;cursor:default;letter-spacing:.3px;`
  },
  {
    id:'neumorphism', name:'Neumorphism', nameRu:'Неоморфизм', year:'~2020',
    category:'3d', tags:['Мягкие тени','Тактильность','CSS'],
    desc:'Мягкие тени создают эффект выдавленных элементов. Тактильный интерфейс.',
    pros:'Высокая эстетика', cons:'Проблемы с доступностью',
    previewBg:'#e0e5ec',
    cardStyle:`background:#e0e5ec;border-radius:16px;padding:14px 16px;box-shadow:6px 6px 14px #b8bec7,-6px -6px 14px #fff;`,
    labelColor:'#8a9ab0', titleColor:'#3a4450', subColor:'#7a8896',
    btnStyle:`background:#e0e5ec;border:none;border-radius:8px;padding:5px 14px;font-size:11px;font-weight:600;color:#5d6b7a;cursor:default;box-shadow:3px 3px 6px #b8bec7,-3px -3px 6px #fff;`
  },
  {
    id:'glassmorphism', name:'Glassmorphism', nameRu:'Глассморфизм', year:'2021',
    category:'modern', tags:['Стекло','Blur','macOS'],
    desc:'Полупрозрачные панели с размытым фоном. Ощущение глубины и слоёв.',
    pros:'Современный вид', cons:'Нужна работа с контрастом',
    previewBg:'linear-gradient(135deg,#667eea,#764ba2,#f093fb)',
    cardStyle:`background:rgba(255,255,255,.18);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.28);border-radius:14px;padding:14px 16px;`,
    labelColor:'rgba(255,255,255,.6)', titleColor:'white', subColor:'rgba(255,255,255,.65)',
    btnStyle:`background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);border-radius:8px;padding:5px 14px;font-size:11px;font-weight:600;color:white;cursor:default;`
  }
];

const CSS_FILES = {
  skeu:`/* ===== SKEUOMORPHISM — StyleBase =====
 * Скевоморфизм: имитация физических объектов
 */
:root {
  --skeu-bg: #d6d6d6;
  --skeu-light: #f0f0f0;
  --skeu-shadow: #999;
}
body { background: var(--skeu-bg); font-family: 'Helvetica Neue', Arial, sans-serif; }
.skeu-btn {
  background: linear-gradient(145deg, #e8e8e8, #c0c0c0);
  border: none; border-radius: 8px; padding: 12px 24px;
  font-weight: bold; color: #333; cursor: pointer;
  box-shadow: 4px 4px 8px #999, -2px -2px 6px #fff,
              inset 0 1px 0 rgba(255,255,255,.8),
              inset 0 -1px 0 rgba(0,0,0,.1);
  text-shadow: 0 1px 0 rgba(255,255,255,.7);
  transition: box-shadow .1s;
}
.skeu-btn:active {
  box-shadow: inset 3px 3px 6px #999, inset -2px -2px 5px #fff;
}
.skeu-card {
  background: linear-gradient(145deg, #e0e0e0, #c8c8c8);
  border-radius: 12px; padding: 20px;
  box-shadow: 6px 6px 14px #aaa, -4px -4px 10px #fff,
              inset 0 1px 0 rgba(255,255,255,.9);
}
.skeu-input {
  background: linear-gradient(145deg, #c8c8c8, #e8e8e8);
  border: 1px solid #aaa; border-radius: 6px;
  padding: 10px 14px; color: #333;
  box-shadow: inset 3px 3px 6px #bbb, inset -2px -2px 5px #fff;
}`,

  flat:`/* ===== FLAT DESIGN — StyleBase =====
 * Плоский дизайн: минимализм без теней
 */
:root {
  --flat-primary: #2ecc71;
  --flat-dark: #27ae60;
  --flat-text: #2c3e50;
}
body { background: #f5f5f5; font-family: 'Segoe UI', Arial, sans-serif; }
.flat-btn {
  background: var(--flat-primary); color: white;
  border: none; border-radius: 4px; padding: 12px 24px;
  font-weight: 700; text-transform: uppercase;
  letter-spacing: .5px; font-size: 13px; cursor: pointer;
  transition: background .2s;
}
.flat-btn:hover { background: var(--flat-dark); }
.flat-card { background: white; border-radius: 4px; padding: 16px; }
.flat-chip {
  background: var(--flat-primary); color: white;
  padding: 4px 12px; border-radius: 2px;
  font-size: 11px; font-weight: 700; letter-spacing: .5px;
  text-transform: uppercase; display: inline-block;
}`,

  material:`/* ===== MATERIAL DESIGN — StyleBase =====
 * Материальный дизайн: физика и глубина
 */
:root {
  --mat-primary: #1976d2;
  --mat-accent: #ff4081;
}
body { background: #fafafa; font-family: 'Roboto', 'Segoe UI', Arial, sans-serif; }
.mat-btn {
  background: var(--mat-primary); color: white;
  border: none; border-radius: 4px; padding: 10px 24px;
  box-shadow: 0 2px 8px rgba(25,118,210,.4), 0 1px 3px rgba(0,0,0,.12);
  font-weight: 500; letter-spacing: .5px;
  text-transform: uppercase; font-size: 14px; cursor: pointer;
  transition: box-shadow .2s, transform .1s;
}
.mat-btn:hover {
  box-shadow: 0 6px 20px rgba(25,118,210,.5);
  transform: translateY(-1px);
}
.mat-card {
  background: white; border-radius: 4px; padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.08);
}
.mat-fab {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--mat-accent);
  box-shadow: 0 6px 20px rgba(255,64,129,.4);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 24px; border: none; cursor: pointer;
}`,

  neumorphism:`/* ===== NEUMORPHISM — StyleBase =====
 * Неоморфизм: мягкие тени, тактильность
 */
:root {
  --neu-bg: #e0e5ec;
  --neu-dark: #b8bec7;
  --neu-light: #ffffff;
}
body { background: var(--neu-bg); font-family: 'Segoe UI', Arial, sans-serif; }
.neu-card {
  background: var(--neu-bg); border-radius: 16px; padding: 20px;
  box-shadow: 8px 8px 20px var(--neu-dark), -8px -8px 20px var(--neu-light);
}
.neu-btn {
  background: var(--neu-bg); border: none; border-radius: 10px;
  padding: 12px 24px;
  box-shadow: 4px 4px 10px var(--neu-dark), -4px -4px 10px var(--neu-light);
  color: #666; font-weight: 500; cursor: pointer;
}
.neu-btn:active {
  box-shadow: inset 4px 4px 10px var(--neu-dark),
              inset -4px -4px 10px var(--neu-light);
}
.neu-input {
  background: var(--neu-bg); border: none; border-radius: 8px;
  padding: 12px 16px;
  box-shadow: inset 3px 3px 8px var(--neu-dark),
              inset -3px -3px 8px var(--neu-light);
  color: #555; outline: none;
}`,

  glassmorphism:`/* ===== GLASSMORPHISM — StyleBase =====
 * Глассморфизм: матовое стекло, глубина
 */
body {
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
  min-height: 100vh;
}
.glass-card {
  background: rgba(255,255,255,.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 16px; padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,.2);
  color: white;
}
.glass-btn {
  background: rgba(255,255,255,.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,.25);
  border-radius: 8px; color: white; padding: 10px 20px;
  font-weight: 500; cursor: pointer;
  transition: background .2s, transform .15s;
}
.glass-btn:hover {
  background: rgba(255,255,255,.22);
  transform: translateY(-1px);
}
.glass-input {
  background: rgba(255,255,255,.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 8px; padding: 10px 16px;
  color: white; outline: none;
}
.glass-input::placeholder { color: rgba(255,255,255,.5); }
.glass-nav {
  background: rgba(255,255,255,.08);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255,255,255,.1);
  padding: 0 24px; height: 60px;
  display: flex; align-items: center;
}`
};
