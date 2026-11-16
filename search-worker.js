/* On-demand search over 117,888 real scientific publication titles.
   Parsing and ranking run off the main UI thread. Extracted claims are NOT full-text indexed. */
import {paperScore} from './search-core.mjs';
let data=null;
let loading=null;
async function ensurePapers(){
  if(data)return data;
  if(!loading)loading=(async()=>{
    const response=await fetch(new URL('./data/papers.json',import.meta.url));
    if(!response.ok)throw Error('HTTP '+response.status+' при загрузке публикаций');
    const parsed=await response.json();
    if(!Array.isArray(parsed?.title)||!Array.isArray(parsed?.venue)||!Array.isArray(parsed?.year)||
       parsed.title.length!==parsed.year.length||
       parsed.venue.length!==parsed.title.length)
       throw Error('Некорректный формат каталога публикаций');
    data=parsed;
    return data;
  })();
  try{return await loading}catch(e){loading=null;throw e}
}
self.onmessage=async({data:message})=>{
  if(message.type!=='search')return;
  const seq=message.seq;
  try{
    const corpus=await ensurePapers();
    const query=String(message.query||'').slice(0,120);
    const year=String(message.year||'all'),venue=String(message.venue||'all');
    const offset=Math.max(0,Math.min(240,Number(message.offset)||0));
    const limit=Math.min(30,Math.max(1,Number(message.limit)||24));
    let count=0;
    const found=[];
    for(let i=0;i<corpus.title.length;i++){
      if(year!=='all'&&String(corpus.year[i])!==year)continue;
      if(venue!=='all'&&String(corpus.venue[i])!==venue)continue;
      const score=paperScore(corpus.title[i],corpus.venue[i],corpus.year[i],query);
      if(!score)continue;
      count++;
      found.push({i,score});
    }
    found.sort((a,b)=>b.score-a.score||b.i-a.i);
    const items=found.slice(offset,offset+limit).map(({i})=>({
      index:i,title:String(corpus.title[i]||''),venue:String(corpus.venue[i]||''),
      year:Number(corpus.year[i]),url:String(corpus.url?.[i]||'')
    }));
    self.postMessage({type:'results',seq,count,items,total:corpus.title.length});
  }catch(e){
    self.postMessage({type:'error',seq,error:String(e?.message||e)});
  }
};
