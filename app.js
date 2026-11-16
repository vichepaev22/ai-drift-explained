import {buildProfile} from './metrics.mjs';
import {validateInsights, topicExplanation, wireInsights, revealInsight} from './insights.js?v=20261116-search01';
import {initSearch} from './search.js?v=20261116-search01';

const B='./data/',Y=[2018,2019,2020,2021,2022,2023,2024,2025,2026],V=['AACL','ACL','COLING','CVPR','EACL','ECCV','EMNLP','ICCV','ICLR','ICML','NAACL','NeurIPS'];
const R=['Сходимость градиентной оптимизации','Сравнение с лучшими результатами','Устойчивость к атакам','Графовые нейронные сети','Сегментация изображений','Оценка многоязычных LLM','Послойное обучение','Эффективность цепочек рассуждений','Аудиоязыковые модели','Ответы на вопросы','Диалоговые модели от начала до конца','Проектирование молекул и белков','Оценка мультимодальных моделей зрения и языка','Трёхмерный гауссов сплаттинг','Алгоритмы обучения с подкреплением','Оценка трёхмерной позы','Обучение с малой разметкой','Нейронный машинный перевод','Мультимодальные большие языковые модели','Генерация с поиском знаний (RAG)','Оценка ИИ-агентов','Дистилляция знаний','Эффективные диффузионные модели','3D-моделирование лица','Совместное извлечение сущностей и связей','Оценка причинно-следственных методов','Восстановление изображений','Обнаружение объектов','Удаление лишних токенов','Эффективное внимание','Визуальные трансформеры','Векторные представления текста','Обучение без накопленного сожаления','Абстрактивное суммирование','Оптимизация политик вне текущей выборки','Вариационное байесовское глубокое обучение','Обучение на единичных примерах и без примеров','Нейросетевые решатели уравнений','Глубина по одному изображению','Обучение роботов действием','Управляемая диффузия текста в изображение','Машинное обучение с дифференциальной приватностью','Генерация кода большими языковыми моделями','Распознавание действий на видео','Биомедицинские большие языковые модели','Фундаментальные модели временных рядов','Оптимизация промптов','Глубокое обучение по облакам точек','Нейронная неявная 3D-реконструкция','Синтаксический анализ нейросетями','Обнаружение аномалий','Квантование нейросетей','Эффективные трансформеры','Адаптация между доменами','Сквозное автономное вождение','Федеративное обучение','Эффективные представления видео','Ответы на визуальные вопросы со знаниями','Снижение сожаления в бандитных задачах','Сжатие изображений нейросетями','Определение политической позиции в тексте','Анализ тональности по аспектам','Подписи к изображениям и видео','Перенос произвольного стиля изображения','Предотвращение катастрофического забывания','Нейронная генерация текста','Низкоранговая адаптация (LoRA)','Визуальное отслеживание объектов','LLM как судья (оценщик)','Генеративные модели Plug-and-Play','Обнаружение и снижение галлюцинаций','Извлечение событий','Генерация и редактирование изображений по тексту','Распознавание эмоций','Трёхмерное обнаружение объектов LiDAR','Обучение LLM с подкреплением','Заполнение графов знаний','Поиск между разными модальностями','Реконструкция одетого цифрового человека','Достоверные объяснения моделей','Эффективное обучение импульсных нейросетей','Оценка неопределённости','Оценка положения руки и предмета','Масштабируемая кластеризация','Эффективная классификация ImageNet','Повторная идентификация человека','Стабильное обучение GAN','Классические бенчмарки классификации изображений','Автоматическая проверка фактов','Устойчивые водяные знаки генеративного ИИ','Оптимизация предпочтений','Рекомендательные системы','Оценка оптического потока','Фундаментальные модели ЭЭГ','Предсказание траекторий','Контроль качества разметки','Генерация историй','Обучение с малым числом параметров'];
let atlasSearch=null;
const D={topics:[],insights:null,manifest:null,map:null,members:null,papers:null,shards:new Map(),loading:null},S={view:'overview',topic:null,sort:'growth',mapTopic:null,mapYear:'all',mapColor:'topic',quality:'medium',topn:10,lines:new Set(),linesInitialized:false,metric:'papers',mapInst:null};
const el=id=>document.getElementById(id),fmt=x=>Number(x||0).toLocaleString('ru-RU'),pct=x=>Number(x||0).toFixed(1).replace('.',',')+'%',sgn=x=>(x>=0?'+':'')+Number(x).toFixed(1).replace('.',','),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const title=t=>R[t?.id]||t?.label||'Без тематической группы',T=id=>D.topics.find(t=>t.id===id),hue=i=>(i*137.508+174)%360,col=i=>`hsl(${hue(i)} 75% 66%)`;
const q=(name)=>el(name),sorted=(mode)=>[...D.topics].sort((a,b)=>mode==='fall'?a.deltaPp-b.deltaPp:mode==='largest'?b.papers-a.papers:mode==='alpha'?title(a).localeCompare(title(b),'ru'):b.deltaPp-a.deltaPp);
const pause=(fn,ms=200)=>{let tid;return(...args)=>{clearTimeout(tid);tid=setTimeout(()=>fn(...args),ms)}};
// Lightweight morphology-aware search for Russian topic labels.
const fold=s=>String(s??'').toLowerCase().replaceAll('ё','е');
const wordRoot=s=>fold(s).replace(/(иями|ями|ами|ого|ому|ему|ыми|ими|ов|ев|ей|ой|ый|ий|ые|ая|ое|ых|ах|ях|ям|ам|ом|ем|а|я|ы|и|у|ю|е|о)$/,'');
function matchesSearch(haystack,query){
  const h=fold(haystack),words=h.split(/[^a-zа-я0-9]+/i).filter(Boolean);
  return fold(query).split(/\s+/).filter(Boolean).every(q=>{
    const root=wordRoot(q);
    return h.includes(q)||words.some(w=>w.startsWith(q)||(root.length>=3&&wordRoot(w).startsWith(root)));
  });
}
let toastTimer;function toast(msg){const e=q('toast');e.textContent=msg;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),3300)}
async function get(path){let r=await fetch(B+path);if(!r.ok)throw Error(`${path} — HTTP ${r.status}`);return r.json()}
async function loadCore(){try{const [a,m,explanations]=await Promise.all([get('topics.json'),get('manifest.json'),fetch('./insights-data.json').then(r=>{if(!r.ok)throw Error('Объяснения не загрузились: '+r.status);return r.json()})]);D.topics=a.topics;D.manifest=m;validateInsights(explanations,m,D.topics);D.insights=explanations;q('stat-papers').textContent=fmt(m.counts.papers);q('stat-claims').textContent=fmt(m.counts.claims);q('stat-topics').textContent=fmt(m.counts.topics);q('dataset-status').textContent='Научная база доступна';wireInsights(D.insights,D.topics,title,id=>{S.topic=id;q('topic-search').value='';go('topics')});atlasSearch?.refresh();renderSignals();mapTopics();topics();trends();compareSelectors();compare();}catch(e){console.error(e);q('dataset-status').textContent='Не удалось загрузить данные';q('signals').innerHTML='<div class="loading-card">Не удалось загрузить научную базу. Проверьте подключение или попробуйте ещё раз. <button type="button" class="mini-btn" id="retry-data">Повторить загрузку</button></div>';q('retry-data').onclick=loadCore;toast('Ошибка загрузки данных: '+e.message)}}
function go(v,record=true){if(!['overview','search','insights','map','topics','trends','compare','methods'].includes(v))v='overview';const navWasOpen=document.querySelector('.sidebar').classList.contains('open');S.view=v;document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id==='view-'+v));document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===v));q('breadcrumb-name').textContent=({overview:'ОБЗОР',search:'ПОИСК',insights:'ВЫВОДЫ',map:'КАРТА',topics:'ТЕМЫ',trends:'ТРЕНДЫ',compare:'СРАВНЕНИЕ',methods:'МЕТОДИКА'})[v];closeMobileNav();window.scrollTo(0,0);if(navWasOpen){const heading=document.querySelector('#view-'+v+' h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}}if(record&&location.hash!=='#'+v)history.pushState(null,'','#'+v);if(v==='search')requestAnimationFrame(()=>q('search-query')?.focus({preventScroll:true}));if(v==='map')window.DriftMap?.start();if(v==='compare')compare();if(v==='topics')topics();if(v==='trends')trends()}
function renderSignals(){const rising=sorted('growth')[0],fall=sorted('fall')[0],largest=[...D.topics].sort((x,y)=>y.share.at(-1)-x.share.at(-1))[0];q('signals').innerHTML=[['САМЫЙ БЫСТРЫЙ РОСТ',rising,true],['НАИБОЛЬШЕЕ СНИЖЕНИЕ',fall,false],['КРУПНЕЙШАЯ ТЕМА 2026',largest,true]].map(([label,t,up])=>`<div class="signal"><div class="tag ${up?'positive':'negative'}">${label}</div><h3>${esc(title(t))}</h3><div class="signal-delta ${up?'':'neg'}">${sgn(t.deltaPp)} п.п.</div><small>Доля статей: ${pct(t.share[0])} → ${pct(t.share.at(-1))}</small></div>`).join('')}
function mapTopics(){if(!D.topics.length)return;const query=q('map-topic-search').value.toLowerCase();q('map-topic-list').innerHTML=sorted('growth').filter(t=>matchesSearch(title(t)+' '+t.label+' '+t.keywords.join(' '),query)).map(t=>`<button class="map-topic-row ${S.mapTopic===t.id?'selected':''}" data-cluster="${t.id}"><i class="color-swatch" style="background:${col(t.id)}"></i><b>${esc(title(t))}</b><span>${sgn(t.deltaPp)}</span></button>`).join('');q('map-topic-list').querySelectorAll('button').forEach(b=>b.onclick=()=>{S.mapTopic=+b.dataset.cluster;q('map-all-topics').classList.remove('selected');mapTopics();window.DriftMap?.repaint();})}
function topics(){if(!D.topics.length)return;const query=q('topic-search').value.toLowerCase().trim();const entries=sorted(S.sort).filter(t=>matchesSearch(title(t)+' '+t.label+' '+t.keywords.join(' '),query));if(!entries.some(t=>t.id===S.topic))S.topic=entries[0]?.id??null;q('topics-list').innerHTML=entries.map(t=>`<button class="topic-row ${S.topic===t.id?'active':''}" data-id="${t.id}"><div><div class="topic-name">${esc(title(t))}</div><small>${fmt(t.papers)} статей · ${fmt(t.size)} тезисов</small></div><span class="delta ${t.deltaPp<0?'down':'up'}">${sgn(t.deltaPp)} п.п.</span></button>`).join('')||'<div class="no-data">По запросу ничего не найдено</div>';q('topics-list').querySelectorAll('button').forEach(e=>e.onclick=()=>{S.topic=+e.dataset.id;topics()});topicDetail()}
function chart(series){const W=860,H=238,L=43,R=18,U=17,B=36,max=Math.max(1,...series.flatMap(s=>s.values))*1.15,X=i=>L+i*(W-L-R)/8,ordinate=v=>H-B-v/max*(H-U-B);let s='';for(let j=0;j<=4;j++){const v=j*max/4,y=ordinate(v);s+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" stroke="#40516a" stroke-opacity=".55"/><text x="${L-7}" y="${y+4}" text-anchor="end">${v.toFixed(1)}</text>`}Y.forEach((y,i)=>s+=`<text x="${X(i)}" y="${H-10}" text-anchor="middle">${y}</text>`);for(const line of series){const c=col(line.id);s+=`<polyline points="${line.values.map((v,i)=>`${X(i)},${ordinate(v)}`).join(' ')}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;line.values.forEach((v,i)=>s+=`<circle cx="${X(i)}" cy="${ordinate(v)}" r="3.2" fill="${c}"><title>${esc(title(T(line.id)))} · ${Y[i]}: ${pct(v)}</title></circle>`)}return `<svg class="svg-chart" role="img" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-label="Динамика по годам">${s}</svg>`}
function topicDetail(){const t=T(S.topic);if(!t){q('topic-detail').innerHTML='<div class="empty-state">Тема не найдена. Попробуйте другой запрос.</div>';return;}q('topic-detail').innerHTML=`<div class="eyebrow muted">ТЕМА ${String(t.id+1).padStart(2,'0')} / 98</div><h2>${esc(title(t))}</h2><div class="en">Исходное название: ${esc(t.label)}</div><div class="topic-meta"><div><strong>${fmt(t.papers)}</strong><span>научных статей</span></div><div><strong>${fmt(t.size)}</strong><span>утверждений</span></div><div><strong style="color:${t.deltaPp<0?'var(--orange)':'var(--aqua)'}">${sgn(t.deltaPp)} п.п.</strong><span>2018 → 2026</span></div></div><h3 style="font-size:13px">Доля публикаций с результатами по этой теме, %</h3>${topicExplanation(D.insights,t.id)}<div class="chart-surface">${chart([{id:t.id,values:t.share}])}</div><p class="detail-keywords">Слова исходного кластера: ${t.keywords.map(k=>`<span class="keyword">${esc(k)}</span>`).join('')}</p><div class="detail-actions"><button class="primary-btn" id="topic-open-map">Показать на карте ↗</button><button class="ghost-btn" id="topic-open-paper">Открыть научный тезис →</button><button class="mini-btn" id="topic-open-trend">Добавить на график ↗</button></div>`;q('topic-open-map').onclick=()=>{S.mapTopic=t.id;go('map');mapTopics();window.DriftMap?.repaint()};q('topic-open-paper').onclick=()=>window.DriftMap?.openTopic(t.id);q('topic-open-trend').onclick=()=>{if(S.lines.size>=6&&!S.lines.has(t.id))return toast('Выберите не более шести направлений');S.lines.add(t.id);go('trends')}}
function trends(){if(!D.topics.length)return;for(let [mode,target] of [['growth','gainers'],['fall','losers']]){const list=sorted(mode).slice(0,S.topn),max=Math.max(1,...list.map(t=>Math.abs(t.deltaPp)));q(target).innerHTML=list.map(t=>`<div class="trend-row ${S.lines.has(t.id)?'active':''}" role="button" tabindex="0" data-id="${t.id}"><div class="trend-row-head"><span>${esc(title(t))}</span><b class="delta ${t.deltaPp<0?'down':'up'}">${sgn(t.deltaPp)} п.п.</b></div><div class="trend-row-bar"><div class="trend-row-fill ${t.deltaPp<0?'neg':''}" style="width:${100*Math.abs(t.deltaPp)/max}%"></div></div></div>`).join('');q(target).querySelectorAll('.trend-row').forEach(x=>{const fn=()=>{const id=+x.dataset.id;if(S.lines.has(id))S.lines.delete(id);else if(S.lines.size>=6){toast('Выберите до шести направлений')}else S.lines.add(id);trends()};x.onclick=fn;x.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}}})}if(!S.linesInitialized){S.linesInitialized=true;S.lines.add(sorted('growth')[0].id);S.lines.add(sorted('fall')[0].id)}const list=[...S.lines].map(id=>T(id)).filter(Boolean);q('trend-chart').innerHTML=list.length?chart(list.map(t=>({id:t.id,values:t.share}))):'<div class="empty-state">Выберите одну или несколько тем в рейтинге, чтобы увидеть динамику.</div>';q('trend-legend').innerHTML=list.map(t=>`<span><i style="background:${col(t.id)}"></i>${esc(title(t))}</span>`).join('');const rise=sorted('growth')[0],fall=sorted('fall')[0];q('trend-takeaway').innerHTML=`<strong>Как читать этот рейтинг:</strong> среди научных групп сильнее всего увеличилась доля работ по теме «${esc(title(rise))}» (${sgn(rise.deltaPp)} п.п.); уменьшилась — по теме «${esc(title(fall))}» (${sgn(fall.deltaPp)} п.п.). Это <em>доли публикаций</em>, а не оценка полезности технологий. <button type="button" data-goto="insights" class="inline-go">Посмотреть объяснения ↗</button>`;q('trend-takeaway').querySelector('button').onclick=()=>go('insights')}
let selectorsReady=false;function compareSelectors(){if(selectorsReady)return;selectorsReady=true;['a','b'].forEach(side=>{const sel=q(`cmp-${side}-venue`),s=q(`cmp-${side}-start`),e=q(`cmp-${side}-end`);for(const v of V)sel.add(new Option(v,v));for(const y of Y){s.add(new Option(y,y));e.add(new Option(y,y))}s.value=side==='a'?'2018':'2024';e.value=side==='a'?'2021':'2026';[sel,s,e].forEach(el=>el.addEventListener('change',compare))})}
function cfg(side){return{venue:q(`cmp-${side}-venue`).value,y0:+q(`cmp-${side}-start`).value,y1:+q(`cmp-${side}-end`).value}}
function profile(conf){return buildProfile(D.members,D.papers,conf,D.topics.length)}
let compareDelay;function compare(){if(!D.topics.length||S.view!=='compare')return;clearTimeout(compareDelay);q('compare-chart').innerHTML='<div class="empty-state">Считаем доли научных тем в двух выборках…</div>';compareDelay=setTimeout(async()=>{try{await loadFull();const A=profile(cfg('a')),Z=profile(cfg('b')),m=S.metric;const rows=D.topics.map(t=>{let a=100*(m==='papers'?A.countPapers[t.id]/Math.max(1,A.papers):A.countClaims[t.id]/Math.max(1,A.claims)),b=100*(m==='papers'?Z.countPapers[t.id]/Math.max(1,Z.papers):Z.countClaims[t.id]/Math.max(1,Z.claims));return{id:t.id,a,b,d:a-b}}).sort((x,y)=>Math.abs(y.d)-Math.abs(x.d)).slice(0,30),max=Math.max(1,...rows.map(x=>Math.abs(x.d)));q('compare-summary').textContent=`A: ${fmt(A.papers)} статей · B: ${fmt(Z.papers)} статей`;if(!A.papers||!Z.papers){q('compare-interpretation').textContent='В одной выборке нет публикаций. Для интерпретации выберите другое сочетание годов и конференций.';q('compare-chart').innerHTML='<div class="empty-state">В одной из выборок нет публикаций. Измените конференцию или годы.</div>';return}const lead=rows[0];q('compare-interpretation').innerHTML=lead?`<strong>Как понимать сравнение:</strong> самое заметное различие по выбранной метрике — «${esc(title(T(lead.id)))}». В выборке A доля ${lead.d>=0?'выше':'ниже'}, чем в B, на ${Math.abs(lead.d).toFixed(1).replace('.',',')} п.п. Это сравнение состава публикаций, а не вывод о том, что одна конференция качественнее другой.`:'';q('compare-chart').innerHTML=rows.map(t=>`<div class="compare-row" role="button" tabindex="0" data-id="${t.id}" title="A: ${pct(t.a)}; B: ${pct(t.b)}"><span class="name">${esc(title(T(t.id)))}</span><span class="diff-axis"><i class="diff-bar ${t.d<0?'negative':''}" style="left:${t.d<0?50-48*Math.abs(t.d)/max:50}%;width:${48*Math.abs(t.d)/max}%"></i></span><span class="diff-value" style="color:${t.d<0?'var(--pink)':'var(--aqua)'}">${sgn(t.d)} п.п.</span></div>`).join('');q('compare-chart').querySelectorAll('.compare-row').forEach(x=>{const open=()=>{S.topic=+x.dataset.id;go('topics')};x.onclick=open;x.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}}});}catch(e){q('compare-chart').innerHTML='<div class="empty-state">Ошибка получения данных: '+esc(e.message)+'</div>'}},160)}
async function loadFull(){
  if(D.map&&D.members&&D.papers)return;
  if(D.loading)return D.loading;
  D.loading=(async()=>{
    const [map,members,papers]=await Promise.all([get('map.json'),get('members.json'),get('papers.json')]);
    if(!Array.isArray(map?.x)||!Array.isArray(map?.y)||
       !Array.isArray(members?.cluster)||!Array.isArray(members?.paper)||!Array.isArray(members?.year)||
       !Array.isArray(papers?.id)||!Array.isArray(papers?.year)||!Array.isArray(papers?.venue)||
       map.x.length!==map.y.length||map.x.length!==members.cluster.length||
       map.x.length!==members.year.length||map.x.length!==members.paper.length||
       papers.id.length!==papers.year.length||papers.id.length!==papers.venue.length)
      throw Error('Формат научных данных повреждён или неполон');
    if(D.manifest && (map.x.length!==D.manifest.counts.claims||
       papers.id.length!==D.manifest.counts.papers))
      throw Error('Количество публикаций не соответствует исходному набору');
    D.map=map;D.members=members;D.papers=papers;
  })();
  try{await D.loading}finally{D.loading=null}
}
async function getClaim(p,c){
  const count=Number(D.manifest?.claimShards)||165,idx=p%count;
  if(!D.shards.has(idx)){
    const shard=await get(`claims-${String(idx).padStart(2,'0')}.json`);
    D.shards.set(idx,shard);
  }
  const arr=D.shards.get(idx)[String(p)]||[];
  const hit=arr.find(x=>Number(x[1])===Number(c));
  return {text:hit?.[0]||'Точный тезис для этой точки не найден в научном наборе.',exact:Boolean(hit)};
}
function safeLink(url){
  try{const u=new URL(String(url));return ['http:','https:'].includes(u.protocol)?u.href:null}catch{return null}
}
function drawerOpen(){
  const dialog=q('claim-drawer');
  if(!dialog.open)dialog.showModal();
}
function drawerClose(){
  const dialog=q('claim-drawer');
  if(dialog.open)dialog.close();
}
function closeMobileNav(restoreFocus=false){
  const sidebar=document.querySelector('.sidebar');
  const wasOpen=sidebar.classList.contains('open');
  sidebar.classList.remove('open');
  sidebar.removeAttribute('role');
  sidebar.removeAttribute('aria-modal');
  q('sidebar-backdrop').hidden=true;
  q('menu-btn').setAttribute('aria-expanded','false');
  document.querySelector('.workspace').inert=false;
  if(restoreFocus&&wasOpen)q('menu-btn').focus();
}
function setMobileNav(open){
  if(!open){closeMobileNav(true);return}
  if(!window.matchMedia('(max-width:760px)').matches)return;
  const sidebar=document.querySelector('.sidebar');
  sidebar.classList.add('open');
  sidebar.setAttribute('role','dialog');
  sidebar.setAttribute('aria-modal','true');
  q('sidebar-backdrop').hidden=false;
  q('menu-btn').setAttribute('aria-expanded','true');
  document.querySelector('.workspace').inert=true;
  (sidebar.querySelector('.nav-link.active')||sidebar.querySelector('a'))?.focus();
}

async function drawer(p,c){
  drawerOpen();
  q('drawer-content').innerHTML='<div class="loading-ring"></div>';
  try{
    const cl=await getClaim(p,c),pp=D.papers,link=safeLink(pp.url?.[p]),name=pp.title?.[p];
    q('drawer-content').innerHTML=`<div class="drawer-kicker">НАУЧНАЯ СТАТЬЯ · ${esc(pp.venue[p])} ${esc(pp.year[p])}</div>
      <h2>${esc(c<0?'Утверждение вне кластера':title(T(c)))}</h2>
      <p class="meta">Публикация: ${esc(name)}</p>
      <h3>${cl.exact?'Что утверждают исследователи':'Тезис не найден'}</h3>
      <p class="raw">${esc(cl.text)}</p>
      <p class="meta">${cl.exact?'Оригинальный научный текст сохранён без автоматического перевода.':'Данные не позволяют подтвердить точную формулировку выбранного тезиса.'}</p>
      ${link?`<a href="${esc(link)}" target="_blank" rel="noopener noreferrer">Открыть научную статью ↗</a>`:''}`;
  }catch(e){
    q('drawer-content').innerHTML='<h3>Не удалось загрузить публикацию</h3><p>'+esc(e.message)+'</p>';
  }
}
/* Paper search uses original bibliographic metadata; we do not invent paper abstracts. */
function paperSearchDrawer(paper) {
  drawerOpen();
  const link=safeLink(paper.url);
  q('drawer-content').innerHTML='<div class="drawer-kicker">НАУЧНАЯ ПУБЛИКАЦИЯ · '+esc(paper.venue)+' '+esc(paper.year)+'</div>'+
    '<h2>'+esc(paper.title)+'</h2>'+
    '<p class="meta">Это оригинальная научная статья из каталога Drift Inspector. Поиск нашёл совпадение в названии, году или конференции.</p>'+
    '<p>Чтобы изучить исследование, перейдите к оригинальной публикации. Извлечённые научные тезисы можно посмотреть на интерактивной карте.</p>'+
    (link?'<a href="'+esc(link)+'" target="_blank" rel="noopener noreferrer">Читать научную статью ↗</a>':'');
}
function initUI(){atlasSearch=initSearch({getData:()=>D,topicName:title,go,esc,fmt,years:Y,venues:V,openTopic:id=>{S.topic=id;q('topic-search').value='';go('topics')},openInsight:id=>{go('insights');revealInsight(D.insights,D.topics,title,topicId=>{S.topic=topicId;q('topic-search').value='';go('topics')},id)},openPaper:paperSearchDrawer});document.querySelectorAll('[data-goto]').forEach(e=>e.onclick=()=>go(e.dataset.goto));document.querySelectorAll('[data-view]').forEach(e=>e.onclick=()=>go(e.dataset.view));q('menu-btn').onclick=()=>setMobileNav(!document.querySelector('.sidebar').classList.contains('open'));q('sidebar-backdrop').onclick=()=>closeMobileNav(true);q('theme-btn').onclick=()=>{document.body.classList.toggle('light');localStorage.setItem('drift-theme',document.body.classList.contains('light')?'light':'dark')};if(localStorage.getItem('drift-theme')==='light')document.body.classList.add('light');Y.forEach(y=>q('map-year').add(new Option(y,y)));q('map-year').onchange=e=>{S.mapYear=e.target.value;window.DriftMap?.repaint()};q('map-color').onchange=e=>{S.mapColor=e.target.value;window.DriftMap?.repaint()};q('map-quality').onchange=e=>{S.quality=e.target.value;window.DriftMap?.repaint()};q('map-zoom-in').onclick=()=>window.DriftMap?.zoom?.(1.35);q('map-zoom-out').onclick=()=>window.DriftMap?.zoom?.(1/1.35);q('map-reset').onclick=()=>window.DriftMap?.reset();q('map-all-topics').onclick=()=>{S.mapTopic=null;q('map-all-topics').classList.add('selected');mapTopics();window.DriftMap?.repaint()};q('map-topic-search').oninput=pause(mapTopics);q('topic-search').oninput=pause(topics);q('topic-sort').onchange=e=>{S.sort=e.target.value;topics()};document.querySelectorAll('[data-topn]').forEach(e=>e.onclick=()=>{S.topn=+e.dataset.topn;document.querySelectorAll('[data-topn]').forEach(x=>x.classList.toggle('active',x===e));trends()});q('clear-trajectories').onclick=()=>{S.lines.clear();trends()};document.querySelectorAll('[data-metric]').forEach(e=>e.onclick=()=>{S.metric=e.dataset.metric;document.querySelectorAll('[data-metric]').forEach(x=>x.classList.toggle('active',x===e));compare()});q('drawer-close').onclick=drawerClose;
q('claim-drawer').addEventListener('click',e=>{if(e.target===e.currentTarget)drawerClose()});
document.addEventListener('keydown',e=>{
  const sidebar=document.querySelector('.sidebar');
  if(!sidebar.classList.contains('open'))return;
  if(e.key==='Escape'){e.preventDefault();closeMobileNav(true);return}
  if(e.key!=='Tab')return;
  const items=[...sidebar.querySelectorAll('a[href],button:not([disabled])')];
  if(!items.length)return;
  if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus()}
  else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus()}
});
window.matchMedia('(max-width:760px)').addEventListener('change',()=>closeMobileNav());
window.addEventListener('popstate',()=>go(location.hash.substring(1)||'overview',false));window.addEventListener('hashchange',()=>{const v=location.hash.substring(1)||'overview';if(v!==S.view)go(v,false)});window.DriftCore={D,S,R,Y,title,T,col,hue,fmt,pct,sgn,esc,q,toasts:toast,loadFull,drawer,drawerOpen,go};window.DriftMap={start:async()=>{const m=await import('./visual.js?v=20261115-01');Object.assign(window.DriftMap,m);return m.start()},repaint:()=>{},openTopic:async id=>{await loadFull();const i=D.members.cluster.indexOf(id);if(i>=0)drawer(D.members.paper[i],id);else toast('Для этой темы не найден исходный тезис')}};go(location.hash.substring(1)||'overview',false);loadCore();import('./visual.js?v=20261115-01').then(m=>m.initHero()).catch(e=>console.error('Three.js animation:',e))}
initUI();

