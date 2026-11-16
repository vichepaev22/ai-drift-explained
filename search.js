/* Unified, accessible Atlas search. Source-backed topics and editorial findings
   are instant; original paper titles are searched in a background Web Worker. */
import {searchEditorial,tokens} from './search-core.mjs';

export function initSearch({getData,topicName,go,openTopic,openInsight,openPaper,esc,fmt,years,venues}){
  const input=document.getElementById('search-query');
  const list=document.getElementById('search-results');
  const countNode=document.getElementById('search-count');
  const stateNode=document.getElementById('search-state');
  const more=document.getElementById('search-more');
  const year=document.getElementById('search-year');
  const venue=document.getElementById('search-venue');
  const clear=document.getElementById('search-clear');
  const typeButtons=[...document.querySelectorAll('[data-search-type]')];
  const suggestions=document.getElementById('search-suggestions');
  if(!input||!list||!more)throw Error('Не найден интерфейс глобального поиска');
  for(const y of years)year.add(new Option(y,y));
  for(const v of venues)venue.add(new Option(v,v));
  let type='all',worker=null,seq=0,timer,editorial=[],localLimit=12;
  let papers=[],paperCount=null,paperError='',loading=false,requested=false;
  const cap=24;
  const label={topic:'НАУЧНОЕ НАПРАВЛЕНИЕ',insight:'ВЫВОД И ОБЪЯСНЕНИЕ',paper:'НАУЧНАЯ ПУБЛИКАЦИЯ'};
  function safeUrl(value){
    try{const u=new URL(String(value));return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}
  }
  function syncFilters(){
    typeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.searchType===type)));
    const paperEnabled=type==='all'||type==='papers';
    year.disabled=!paperEnabled;
    venue.disabled=!paperEnabled;
    clear.hidden=!input.value;
  }
  function paperVisible(){return type==='all'||type==='papers'}
  function card(result){
    const type=result.type;
    const meta=type==='topic'?fmt(result.count)+' статей · график и примеры':
               type==='insight'?'Объяснение простым языком · источники':
               esc(result.venue)+' · '+esc(result.year);
    const excerpt=result.description?'<p>'+esc(result.description)+'</p>':'';
    const url=type==='paper'?safeUrl(result.url):null;
    return '<article class="search-result">'+
      '<button type="button" class="search-result-main" data-search-open="'+esc(type)+'" data-search-id="'+esc(result.id??result.index)+'">'+
      '<span class="search-result-kind">'+label[type]+'</span>'+
      '<strong>'+esc(result.title)+'</strong>'+excerpt+
      '<span class="search-result-meta">'+meta+'</span></button>'+
      (url?'<a class="search-source-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Читать оригинал ↗</a>':'')+
      '</article>';
  }
  function render(){
    syncFilters();
    const query=input.value.trim();
    const hasQuery=tokens(query).join('').length>=2;
    suggestions.hidden=Boolean(hasQuery);
    if(!hasQuery){
      countNode.textContent='Поиск по 98 направлениям, 30 выводам и названиям 117 888 статей';
      stateNode.textContent='';
      list.innerHTML='<div class="search-empty"><span class="search-empty-glyph">⌕</span><strong>Что вас интересует в искусственном интеллекте?</strong><p>Введите тему, технологию, название исследования или конференцию. Можно искать по-русски и по-английски.</p></div>';
      more.hidden=true;return;
    }
    const shown=editorial.slice(0,localLimit);
    const merged=[...shown,...(paperVisible()?papers:[])];
    list.innerHTML=merged.map(card).join('')||
      (loading?'<div class="search-empty">Ищем научные публикации…</div>':
      '<div class="search-empty"><strong>Совпадений пока нет</strong><p>Попробуйте другой термин, английское название или измените фильтры.</p></div>');
    const topicCount=editorial.filter(x=>x.type==='topic').length;
    const findingCount=editorial.filter(x=>x.type==='insight').length;
    const localCounts=(type==='papers'?[]:[topicCount+' тем',findingCount+' выводов']);
    const paperCounts=paperVisible()?[paperCount===null?'публикации: поиск…':fmt(paperCount)+' публикаций']:[];
    countNode.textContent='Найдено: '+[...localCounts,...paperCounts].join(' · ');
    stateNode.textContent=paperError?
      'Не удалось загрузить каталог публикаций: '+paperError+'; поиск по темам и выводам продолжает работать.':
      loading?'Проверяем названия публикаций в научном корпусе…':
      paperVisible()&&paperCount!==null?'Поиск по заголовкам статей, конференциям и годам. Полные тексты и 570 179 извлечённых тезисов пока не индексируются.':'';
    more.hidden=loading||!(editorial.length>localLimit||paperVisible()&&paperCount!==null&&papers.length<paperCount);
    if(!more.hidden)more.textContent='Показать ещё результаты →';
    list.querySelectorAll('[data-search-open]').forEach(button=>button.addEventListener('click',()=>{
      const selectedType=button.dataset.searchOpen,id=button.dataset.searchId;
      if(selectedType==='topic')openTopic(Number(id));
      else if(selectedType==='insight')openInsight(id);
      else {
        const item=papers.find(p=>String(p.index)===id);
        if(item)openPaper(item);
      }
    }));
  }
  function ensureWorker(){
    if(worker)return worker;
    worker=new Worker(new URL('./search-worker.js',import.meta.url),{type:'module'});
    worker.addEventListener('message',({data})=>{
      if(data.seq!==seq)return;
      loading=false;requested=false;
      if(data.type==='error'){paperError=data.error||'Ошибка';paperCount=null;render();return}
      paperError='';paperCount=data.count;
      papers.push(...data.items.filter(item=>!papers.some(old=>old.index===item.index)));
      render();
    });
    worker.addEventListener('error',()=>{
      loading=false;paperError='Ошибка поиска в фоновом потоке';paperCount=null;render();
    });
    return worker;
  }
  function loadPapers(offset=0){
    if(loading)return;
    loading=true;requested=true;
    const current=++seq;
    try{
      ensureWorker().postMessage({
        type:'search',seq:current,query:input.value.trim(),
        year:year.value,venue:venue.value,offset,limit:cap
      });
    }catch(e){loading=false;paperError=String(e.message||e)}
    render();
  }
  function search(){
    clearTimeout(timer);seq++;
    editorial=[];papers=[];paperCount=null;paperError='';loading=false;
    localLimit=12;
    const text=input.value.trim();
    if(tokens(text).join('').length>=2){
      const d=getData();
      editorial=searchEditorial(d.topics||[],d.insights?.stories||[],d.insights?.topics||[],topicName,text,type);
      if(paperVisible())loadPapers(0);
    }
    render();
  }
  function delayedSearch(){clearTimeout(timer);timer=setTimeout(search,200)}
  input.addEventListener('input',delayedSearch);
  input.addEventListener('keydown',e=>{if(e.key==='Escape'&&input.value){input.value='';search()}});
  clear.addEventListener('click',()=>{input.value='';search();input.focus()});
  typeButtons.forEach(b=>b.addEventListener('click',()=>{type=b.dataset.searchType;search()}));
  year.addEventListener('change',search);
  venue.addEventListener('change',search);
  more.addEventListener('click',()=>{
    if(editorial.length>localLimit)localLimit+=12;
    if(paperVisible()&&paperCount!==null&&papers.length<paperCount)loadPapers(papers.length);
    else render();
  });
  suggestions.querySelectorAll('[data-query]').forEach(b=>b.addEventListener('click',()=>{
    input.value=b.dataset.query;search();input.focus();
  }));
  document.getElementById('global-search-btn').addEventListener('click',()=>focus());
  document.addEventListener('keydown',e=>{
    const editable=e.target?.matches?.('input,textarea,select,[contenteditable="true"]');
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k' ||
        e.key==='/'&&!editable&&!e.altKey&&!e.ctrlKey&&!e.metaKey){
      e.preventDefault();focus();
    }
  });
  function focus(){go('search');input.focus({preventScroll:true});input.select()}
  render();
  return {refresh:search,focus};
}
