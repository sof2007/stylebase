// ============================================================
//  analyze.js — анализ CSS-файла, построение превью-данных
// ============================================================

const Analyzer = (() => {

  function analyse(css, name) {
    const lo = css.toLowerCase();
    const hexes = [...css.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)].map(m => m[0]);

    function lum(h) {
      h = h.replace('#', '');
      if (h.length === 3) h = h.split('').map(c => c + c).join('');
      const r = parseInt(h.slice(0, 2), 16),
            g = parseInt(h.slice(2, 4), 16),
            b = parseInt(h.slice(4, 6), 16);
      return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    const shadows  = css.match(/box-shadow\s*:[^;}{]+/gi) || [];
    const isGlass  = lo.includes('backdrop-filter') || lo.includes('blur(');
    const isNeu    = shadows.length >= 2 && lo.includes('inset') &&
                     (lo.includes('#b8') || lo.includes('#fff'));
    const isSkeu   = !isNeu && lo.includes('inset') &&
                     (lo.includes('gradient') || lo.includes('text-shadow'));
    const isMat    = !isGlass && !isNeu && !isSkeu && shadows.length > 0;

    let accent = '#6c63ff';
    for (const h of hexes) { const l = lum(h); if (l > 30 && l < 200) { accent = h; break; } }

    const neuBg = hexes.find(h => lum(h) > 185) || '#e0e5ec';
    const neuDk = hexes.find(h => lum(h) > 100 && lum(h) < 185) || '#b8bec7';
    const rM    = css.match(/border-radius\s*:\s*([\d.]+px)/i);
    const radius = rM ? Math.min(parseFloat(rM[1]), 32) + 'px' : '6px';

    let bg, cardStyle, labelColor, titleColor, subColor, btnStyle, type;

    if (isGlass) {
      const grad = css.match(/background\s*:\s*(linear-gradient[^;}{]+)/i);
      bg = grad ? grad[1].trim() : 'linear-gradient(135deg,#4776e6,#8e54e9)';
      cardStyle = `background:rgba(255,255,255,.18);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.28);border-radius:${radius};padding:14px 16px;`;
      labelColor='rgba(255,255,255,.6)'; titleColor='white'; subColor='rgba(255,255,255,.65)';
      btnStyle=`background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);border-radius:8px;padding:5px 14px;font-size:11px;font-weight:600;color:white;cursor:default;`;
      type='Glassmorphism';
    } else if (isNeu) {
      bg = neuBg;
      cardStyle=`background:${neuBg};border-radius:${radius};padding:14px 16px;box-shadow:6px 6px 14px ${neuDk},-6px -6px 14px #fff;`;
      labelColor='#8a9ab0'; titleColor='#3a4450'; subColor='#7a8896';
      btnStyle=`background:${neuBg};border:none;border-radius:8px;padding:5px 14px;font-size:11px;font-weight:600;color:#5d6b7a;cursor:default;box-shadow:3px 3px 6px ${neuDk},-3px -3px 6px #fff;`;
      type='Neumorphism';
    } else if (isSkeu) {
      bg='linear-gradient(145deg,#c8c8c8,#e8e8e8)';
      cardStyle=`background:linear-gradient(180deg,#f0f0f0,#d0d0d0);border:1px solid #b0b0b0;border-radius:${radius};padding:14px 16px;box-shadow:4px 4px 8px #999,-2px -2px 6px #fff,inset 0 1px 0 rgba(255,255,255,.9);`;
      labelColor='#888'; titleColor='#222'; subColor='#666';
      btnStyle=`background:linear-gradient(180deg,#f5f5f5,#ccc);border:1px solid #999;border-radius:6px;padding:5px 14px;font-size:11px;font-weight:600;color:#333;cursor:default;`;
      type='Skeuomorphism';
    } else if (isMat) {
      bg='#fafafa';
      cardStyle=`background:white;border-radius:${radius};padding:14px 16px;box-shadow:0 2px 8px rgba(0,0,0,.12),0 1px 3px rgba(0,0,0,.08);`;
      labelColor=accent; titleColor='#212121'; subColor='#757575';
      btnStyle=`background:${accent};border:none;border-radius:4px;padding:5px 14px;font-size:11px;font-weight:500;color:white;cursor:default;`;
      type='Material-like';
    } else {
      bg=accent;
      cardStyle=`background:white;border-radius:${radius};padding:14px 16px;`;
      labelColor=accent; titleColor='#1a1a1a'; subColor='#555';
      btnStyle=`background:${accent};border:none;border-radius:3px;padding:5px 14px;font-size:10px;font-weight:700;color:white;text-transform:uppercase;cursor:default;`;
      type='Flat-like';
    }

    return { bg, cardStyle, labelColor, titleColor, subColor, btnStyle, type, name };
  }

  // Строит HTML превью-блока по данным анализа или встроенного стиля
  function buildPreview(styleData, height = 180) {
    const { bg, cardStyle, labelColor, titleColor, subColor, btnStyle, name,
            previewBg, previewBg: _, ...rest } = styleData;
    const bgVal = styleData.previewBg || bg || '#1a1a24';
    const cs    = styleData.cardStyle  || cardStyle || '';
    const lc    = styleData.labelColor || labelColor || '#888';
    const tc    = styleData.titleColor || titleColor || '#fff';
    const sc    = styleData.subColor   || subColor   || '#666';
    const bs    = styleData.btnStyle   || btnStyle   || '';
    const nm    = styleData.name       || name       || 'Стиль';

    return `<div style="width:100%;height:${height}px;background:${bgVal};display:flex;align-items:center;justify-content:center;padding:16px;">
      <div style="${cs}width:196px;font-family:sans-serif;">
        <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:${lc};margin-bottom:3px;opacity:.8;">Карточка</div>
        <div style="font-size:13px;font-weight:600;color:${tc};margin-bottom:3px;">${nm}</div>
        <div style="font-size:10px;color:${sc};margin-bottom:12px;">Пример компонента</div>
        <button style="${bs}font-family:sans-serif;">Применить</button>
      </div>
    </div>`;
  }

  return { analyse, buildPreview };
})();
