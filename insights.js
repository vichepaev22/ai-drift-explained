/** Editorial layer for Drift Inspector data.
 * Source metrics are supplied by topics.json. Explanations and example papers
 * are editorial aids; never confuse them with a paper's own validated claim.
 */
const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function externalLink(url){
  try{const parsed=new URL(String(url));return ['https:','http:'].includes(parsed.protocol)?parsed.href:null}catch{return null}
}
const comma = value => Number(value).toFixed(1).replace('.',',');
export function validateInsights(data, manifest, topics){
  if(data?.version!==1 || data?.topics?.length!==98 || !Array.isArray(data.stories))throw Error('Неполные пояснения к научным темам');
  if(data.provenance?.sourceFingerprint!==manifest?.source_fingerprint)throw Error('Версия пояснений не соответствует научной базе');
  if(topics?.length!==98 || data.topics.some((t,i)=>t.id!==i || !t.what || !t.why || !Array.isArray(t.examples)))throw Error('Некорректная привязка пояснений к темам');
  for(const t of data.topics){for(const p of t.examples){if(!externalLink(p.url))throw Error('Недостоверная ссылка в карточке научной публикации')}}
  return true;
}
function sourcePapers(topic,limit=2){
  const papers=topic?.examples?.slice(0,limit)||[];
  return papers.map(p=>{
    const href=externalLink(p.url);
    return href?`<li><a href="${html(href)}" target="_blank" rel="noopener noreferrer">${html(p.title)}</a><span>${html(p.venue)} · ${html(p.year)}</span></li>`:'';
  }).join('');
}
export function topicExplanation(data, id){
  const t=data?.topics?.[id];
  if(!t||t.id!==id)return '';
  return `<div class="topic-explainer" aria-label="Объяснение научной темы">
    <div class="explain-eyebrow">ПОНЯТНО О ТЕМЕ · РЕДАКЦИОННОЕ ПОЯСНЕНИЕ</div>
    <h3>Что здесь исследуют?</h3><p>${html(t.what)}</p>
    <h3>Почему это интересно?</h3><p>${html(t.why)}</p>
    <details class="sources-disclosure"><summary>Посмотреть публикации из этой группы (${t.examples.length})</summary>
      <ul class="source-papers">${sourcePapers(t,2)}</ul>
      <p class="citation-note">Это примеры работ, отнесённых исследовательской системой к данной теме. Пояснение составлено по названиям научных групп и публикаций, а не является цитатой из статьи.</p>
    </details>
  </div>`;
}
export function renderInsights(data,topics,topicName,openTopic){
  const list=document.getElementById('insights-grid');
  if(!list||!data)return;
  const filters=document.querySelectorAll('[data-insight-filter]');
  const current=document.querySelector('[data-insight-filter][aria-pressed="true"]')?.dataset.insightFilter||'all';
  const stories=data.stories.filter(s=>current==='all'||s.kind===current);
  list.innerHTML=stories.map((s,index)=>{
    const topicStats=s.topicIds.map(id=>{
      const topic=topics[id];if(!topic)return '';
      const negative=topic.deltaPp<0;
      return `<button type="button" class="insight-topic" data-open-topic="${id}" title="Открыть тему с графиком">
        <span>${html(topicName(topic))}</span><strong class="${negative?'down':'up'}">${negative?'':'+'}${comma(topic.deltaPp)} п.п.</strong>
      </button>`;
    }).join('');
    const lead=data.topics[s.topicIds[0]];
    return `<article class="insight-card" aria-labelledby="insight-title-${html(s.id)}">
      <div class="insight-card-top"><span>НАБЛЮДЕНИЕ ${String(index+1).padStart(2,'0')}</span><span>${s.kind==='decline'?'ДОЛЯ СНИЖАЕТСЯ':'ДОЛЯ РАСТЁТ'}</span></div>
      <h2 id="insight-title-${html(s.id)}">${html(s.title)}</h2>
      <p class="insight-summary">${html(s.summary)}</p>
      <div class="insight-meaning"><b>Что это означает</b><p>${html(s.meaning)}</p></div>
      <div class="insight-evidence"><b>Цифры из научной базы, 2018 → 2026</b><div class="insight-topic-list">${topicStats}</div></div>
      <details class="sources-disclosure"><summary>Посмотреть примеры публикаций</summary>
        <ul class="source-papers">${sourcePapers(lead,2)}</ul>
        <p class="citation-note">Рост или снижение — это изменение доли статей по теме, а не качества технологии. Примеры работ показывают содержание направления и не служат единоличным доказательством общей тенденции.</p>
      </details>
    </article>`;
  }).join('')||'<div class="empty-state">Пока нет выводов для выбранной категории.</div>';
  list.querySelectorAll('[data-open-topic]').forEach(button=>button.addEventListener('click',()=>openTopic(Number(button.dataset.openTopic))));
  filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.insightFilter===current)));
  const count=document.getElementById('insight-count');
  if(count)count.textContent=`${stories.length} наблюдений`;
  const authors=data.authorFinding;
  const authorNode=document.getElementById('author-finding');
  if(authorNode&&authors){
    const source=externalLink(authors.source);
    authorNode.innerHTML=`<div class="explain-eyebrow">ВЫВОД АВТОРОВ · ОТДЕЛЬНАЯ ВЫБОРКА EMNLP 2020–2025</div>
      <h2>${html(authors.title)}</h2><p>${html(authors.text)}</p>
      <p class="author-details">${html(authors.details)}</p>
      ${source?`<a href="${html(source)}" target="_blank" rel="noopener noreferrer">Научная статья и методика авторов ↗</a>`:''}`;
  }
}
export function wireInsights(data,topics,topicName,openTopic){
  document.querySelectorAll('[data-insight-filter]').forEach(button=>{
    button.addEventListener('click',()=>{
      document.querySelectorAll('[data-insight-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      renderInsights(data,topics,topicName,openTopic);
    });
  });
  renderInsights(data,topics,topicName,openTopic);
}
