export function createAtmosphere(onChange = () => {}) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let preference = null;
  try { preference = localStorage.getItem('awei-world-motion'); } catch { /* Storage may be disabled. */ }
  let playing = preference === null ? !media.matches : preference === 'playing' && !media.matches;
  function sync() {
    document.documentElement.dataset.motion = playing ? 'playing' : 'paused';
    document.querySelectorAll('[data-world-motion], #toggle-motion').forEach(button => {
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', playing ? '暂停全站动态' : '开启全站动态');
    });
    const label = document.querySelector('#motion-label');
    if (label) label.textContent = playing ? '小岛漫游中' : '漫游已暂停';
    const symbol = document.querySelector('#motion-symbol');
    if (symbol) symbol.textContent = playing ? 'Ⅱ' : '▷';
    document.querySelectorAll('[data-motion-text]').forEach(e => {e.textContent = playing ? '暂停动态' : '开启动画';});
    onChange(playing);
  }
  function setPlaying(value, save = false) {
    playing = Boolean(value);
    if (save) {
      preference = playing ? 'playing' : 'paused';
      try {localStorage.setItem('awei-world-motion', preference);} catch { /* Continue without persistence. */ }
    }
    sync();
  }
  document.querySelectorAll('[data-world-motion], #toggle-motion').forEach(button => {
    button.addEventListener('click', () => setPlaying(!playing, true));
  });
  media.addEventListener('change', event => setPlaying(event.matches ? false : preference !== 'paused'));
  sync();
  return {isPlaying:()=>playing, setPlaying};
}

export function setupSupply() {
  const button = document.querySelector('#supply-button');
  const toast = document.querySelector('#supply-toast');
  if (!button || !toast) return;
  const tips = [
    {title:'成长蘑菇：先做一个小闭环。',body:'选一个今天就能验证的小问题。先让输入、处理和输出跑通，再加新能力。',href:'articles/markdown-export.html'},
    {title:'地图碎片：先把思路画清楚。',body:'把复杂流程拆成几步，标出输入、输出与需要人工确认的位置。',href:'articles/diagram-export.html'},
    {title:'背包整理：交付前，再看一遍。',body:'检查文档是否清楚、图表是否清晰、分享的内容是否适合接收者。',href:'articles/pdf-to-images.html'}
  ];
  let index = 0;
  button.addEventListener('click', () => {
    const tip = tips[index++ % tips.length];
    document.querySelector('#supply-tip-title').textContent = tip.title;
    document.querySelector('#supply-tip-body').textContent = tip.body;
    document.querySelector('#supply-tip-link').href = tip.href;
    toast.hidden = false;
    button.classList.remove('popped');
    requestAnimationFrame(() => button.classList.add('popped'));
  });
  button.addEventListener('animationend', event => {if (event.animationName === 'coin-pop') button.classList.remove('popped');});
  document.querySelector('#close-supply').addEventListener('click', () => {toast.hidden=true;button.focus({preventScroll:true});});
  document.addEventListener('keydown', event => {if (event.key === 'Escape' && !toast.hidden) toast.hidden=true;});
}

export function updateReadingProgress() {
  const bar = document.querySelector('#reading-progress');
  if (!bar) return;
  const content = document.querySelector('.article-prose');
  let scheduled = false;
  const update = () => {
    const rect = content.getBoundingClientRect();
    const scrollable = Math.max(1, content.offsetHeight-innerHeight*.5);
    const ratio = Math.max(0,Math.min(1,(-rect.top+100)/scrollable));
    bar.style.transform=`scaleX(${ratio})`;
    scheduled=false;
  };
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',update);update();
}
