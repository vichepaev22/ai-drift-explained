/* Pure, deterministic search and ranking. No network calls or generated facts. */
export function fold(value) {
  return String(value ?? '').normalize('NFKC').toLowerCase().replaceAll('ё','е');
}
export function tokens(value) {
  return fold(value).match(/[a-zа-я0-9]+/g) || [];
}
const endings = /(ениями|ениях|ением|ения|ениями|иями|ями|ами|ого|ому|ему|ыми|ими|ость|ости|ение|ений|ского|ских|овой|овые|овый|ов|ев|ей|ой|ый|ий|ые|ая|ое|ых|ах|ях|ям|ам|ом|ем|а|я|ы|и|у|ю|е|о)$/;
export function stem(value) {
  const t=fold(value);
  return t.length > 4 ? t.replace(endings,'') : t;
}
function matchesToken(text, wordList, value) {
  const q=fold(value), root=stem(q);
  if (text.includes(q)) return true;
  if (root.length < 3) return false;
  return wordList.some(w => w.startsWith(root));
}
function scoreFields(fields, query) {
  const parts=tokens(query);
  if(!parts.length) return 0;
  const normalized=fields.map(([value,weight])=>({text:fold(value),weight}));
  const analyzed=normalized.map(f=>({...f,words:tokens(f.text)}));
  if(!parts.every(part=>analyzed.some(f=>matchesToken(f.text,f.words,part))))return 0;
  let score=0;
  for(const part of parts) {
    score+=Math.max(...analyzed.map(f=>matchesToken(f.text,f.words,part)?f.weight:0));
  }
  const phrase=fold(query).trim();
  if(phrase.length>=3){
    if(analyzed[0]?.text===phrase) score+=1000;
    else if(analyzed[0]?.text.startsWith(phrase))score+=250;
    else if(analyzed[0]?.text.includes(phrase))score+=120;
  }
  return score;
}
const aliases = [
  ['агент',['agent']],['рассужд',['reasoning','reason']],['мультимод',['multimodal','vision-language']],
  ['голос',['voice','speech']],['реч',['speech']],['аудио',['audio','speech']],
  ['изображ',['image','vision']],['картин',['image']],['зрен',['vision','visual']],
  ['видео',['video']],['робот',['robot']],['код',['code','coding']],
  ['генерац',['generation','generative']],['генератив',['generative','generation']],
  ['безопасн',['safety','security']],['атак',['attack','adversarial']],
  ['биомед',['biomedical','medical']],['медицин',['medical','clinical']],
  ['белк',['protein']],['молекул',['molecule']],['граф',['graph']],
  ['памят',['memory']],['перевод',['translation']],['рекоменда',['recommendation']],
  ['галлюцин',['hallucination']],['поиск',['retrieval','search']],
  ['обучени',['learning','training']],['трансформер',['transformer']],
  ['диффуз',['diffusion']],['приватн',['privacy']],['причин',['causal']],
  ['объяснен',['explainability','interpretability']],['водян',['watermark']],
  ['сжат',['compression']],['оценк',['evaluation','benchmark']],
  ['времен',['time']],['движен',['motion']],['траектор',['trajectory']],
  ['модел',['model']],['языков',['language']],['нейросет',['neural']],
  ['предпочтен',['preference']],['суммариз',['summarization']],
  ['провер',['verification','fact-check']],['фактов',['fact-check']]
];
export function paperTokenOptions(part) {
  const options=[fold(part)];
  const root=stem(part);
  if (/[а-я]/.test(part)) {
    for(const [ru,en] of aliases)if(root.startsWith(ru)||ru.startsWith(root)&&root.length>=4)options.push(...en);
  }
  return [...new Set(options)];
}
export function paperScore(title,venue,year,query) {
  const parts=tokens(query);
  if(!parts.length)return 0;
  const name=fold(title),conference=fold(venue),y=String(year);
  const words=tokens(name);
  let score=0;
  for(const part of parts){
    const choices=paperTokenOptions(part);
    const titleMatch=choices.some(x=>matchesToken(name,words,x));
    const metaMatch=choices.some(x=>conference.includes(x)||y===x);
    if(!titleMatch&&!metaMatch)return 0;
    score+=titleMatch?12:3;
  }
  const phrase=fold(query).trim();
  if(name===phrase)score+=600;
  else if(name.startsWith(phrase))score+=100;
  else if(name.includes(phrase))score+=50;
  return score;
}
export function searchEditorial(topics,stories,explanations,topicName,query,type='all'){
  if(!tokens(query).length)return [];
  const results=[];
  if(type==='all'||type==='topics') {
    for(const t of topics) {
      const info=explanations?.[t.id];
      const score=scoreFields([[topicName(t),55],[t.label,40],[t.keywords?.join(' '),28],[info?.what,10],[info?.why,8]],query);
      if(score)results.push({type:'topic',id:t.id,title:topicName(t),description:info?.what||t.label,score,count:t.papers});
    }
  }
  if(type==='all'||type==='insights') {
    for(const s of stories) {
      const score=scoreFields([[s.title,60],[s.summary,22],[s.meaning,14]],query);
      if(score)results.push({type:'insight',id:s.id,title:s.title,description:s.summary,score});
    }
  }
  return results.sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'ru'));
}
