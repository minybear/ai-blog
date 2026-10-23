import {createAtmosphere, setupSupply} from './world-ui.js?v=4';
const chapters = [
  {name:'新手村', en:'BEGINNER VILLAGE', icon:'⌂', title:'每一段冒险，都从一次好奇开始。', description:'第一次提问、第一次尝试、第一次做出东西。把起点和那些重要的转折留下来。', body:'从认识 AI 工具，到尝试解决一个身边的小问题。保持好奇，把第一次成功的输入、步骤和结果记下来，再向前走一小步。', href:'#journal', action:'看看冒险手记 ↗'},
  {name:'编程森林', en:'CODING FOREST', icon:'⌘', title:'把脑海里的想法，变成能用的作品。', description:'从需求到代码，从本地运行到部署。先用一个小工具，解决一个身边的问题。', body:'现有的 Markdown 转 PDF、图表导出和 PDF 转图片工具，是这片区域可以直接体验的作品。', href:'#works', action:'打开作品背包 ↗'},
  {name:'智能体城堡', en:'AGENT CASTLE', icon:'✦', title:'让工具，成为能协作的智能体。', description:'从一次对话，走向完整的工作流。这里是 Agent 应用与自动化的探索区域。', body:'探索 Agent 应用、工具调用与工作流编排。用清楚的流程图拆开复杂任务，再讨论哪些步骤适合自动化、哪些节点需要人来判断。', href:'articles/diagram-export.html', action:'先画一张工作流地图 ↗'},
  {name:'业务前线', en:'IN THE FIELD', icon:'⚑', title:'走进业务现场，解决真正的问题。', description:'理解场景、连接系统、推进交付。用真实案例呈现 FDE 方向的实践与能力。', body:'这里将记录需求梳理、业务系统接入、应用实施与交付复盘。案例正在整理，后续开放阅读。', href:'#cooperate', action:'聊聊业务需求 ↗'},
  {name:'阿伟基地', en:'AWEI’S BASE CAMP', icon:'☀', title:'把沿途的收获，分享给同行的人。', description:'作品、手记与一次新的连接。欢迎到基地坐坐，也欢迎一起开始下一段冒险。', body:'通过「阿伟AI说」、AI 编程社群、培训与一对一应用陪跑，分享实践方法，也与更多人一起创造。', href:'#cooperate', action:'开启联机合作 ↗'}
];
let selectedStage = 2;
let selectInScene = () => {};
let sceneApi;
const atmosphere = createAtmosphere(playing => sceneApi?.setMotion(playing));
setupSupply();

function selectStage(index) {
  selectedStage = index;
  const chapter = chapters[index];
  const number = String(index + 1).padStart(2, '0');
  document.querySelectorAll('[data-stage]').forEach(button => {
    const selected = Number(button.dataset.stage) === index;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('#stage-icon').textContent = chapter.icon;
  document.querySelector('#stage-eyebrow').textContent = `CHAPTER ${number} / ${chapter.en}`;
  document.querySelector('#stage-title').textContent = chapter.title;
  document.querySelector('#stage-description').textContent = chapter.description;
  document.querySelector('#stage-link').href = chapter.href;
  document.querySelector('#stage-link').setAttribute('aria-label', chapter.action.replace(' ↗', ''));
  document.querySelector('#chapter-label').textContent = `CHAPTER ${number} / ${chapter.en}`;
  document.querySelector('#chapter-title').textContent = chapter.name;
  document.querySelector('#chapter-body').textContent = chapter.body;
  document.querySelector('#chapter-action').href = chapter.href;
  document.querySelector('#chapter-action').textContent = chapter.action;
  selectInScene(index);
}

document.querySelectorAll('[data-stage]').forEach(button => {
  button.addEventListener('click', () => selectStage(Number(button.dataset.stage)));
});
selectStage(selectedStage);

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => {
      const active = item === button;
      item.classList.toggle('selected', active);
      item.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.work-card').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
    });
  });
});

const official = document.querySelector('#official-dialog');
let officialTrigger;
document.querySelector('[data-show-official]').addEventListener('click', event => {
  officialTrigger = event.currentTarget;
  document.querySelector('#official-copy-status').textContent = '';
  official.showModal();
  document.body.classList.add('is-locked');
});
document.querySelector('[data-close-official]').addEventListener('click', () => official.close());
official.addEventListener('click', event => {if (event.target === official) official.close();});
official.addEventListener('close', () => {
  document.body.classList.remove('is-locked');
  officialTrigger?.focus({preventScroll:true});
});
document.querySelector('#year').textContent = new Date().getFullYear();

const sectionLinks = [...document.querySelectorAll('.nav-links a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    });
  }, {rootMargin:'-15% 0px -55% 0px'});
  sectionLinks.forEach(link => {const section = document.querySelector(link.hash); if (section) observer.observe(section);});
}

function showSceneFallback(error) {
  document.querySelector('#scene-fallback').hidden = false;
  document.querySelector('#world-container').classList.add('fallback');
  document.querySelector('#world').hidden = true;
  document.querySelector('#reset-view').hidden = true;
  document.querySelector('.map-hint').textContent = '选择地点，探索每一段成长';
  console.warn('3D scene unavailable:', error?.message || 'WebGL context lost');
}

import('./scene.js?v=4').then(({createWorld}) => createWorld({
  canvas: document.querySelector('#world'),
  container: document.querySelector('#world-container'),
  onSelect: selectStage,
  onFallback: showSceneFallback,
  onReady: api => {
    sceneApi = api;
    selectInScene = api.select;
    selectInScene(selectedStage);
    api.setMotion(atmosphere.isPlaying());
    document.querySelector('#reset-view').addEventListener('click', api.reset);
  }
})).catch(showSceneFallback);
