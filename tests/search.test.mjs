import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fold,tokens,stem,paperScore,paperTokenOptions,searchEditorial} from '../search-core.mjs';

const topics=[
  {id:0,label:'AI agent evaluation',keywords:['agent','planning'],papers:120},
  {id:1,label:'Vision-language models',keywords:['vision','language'],papers:180},
  {id:2,label:'Chain-of-thought reasoning',keywords:['reasoning','steps'],papers:220}
];
const details=[
  {what:'Изучают поведение автономных ИИ-агентов в задачах',why:'Это помогает находить ошибки'},
  {what:'Объединяют текст и изображения в одной модели',why:'Нужны для понимания документов'},
  {what:'Анализируют цепочки рассуждений моделей',why:'Позволяют проверять длинные задачи'}
];
const stories=[
  {id:'agents',title:'ИИ-агенты становятся отдельным направлением исследований',summary:'Создают тесты для проверки агентов',meaning:'Они могут ошибаться'},
  {id:'multimodal',title:'Текст и изображения объединяются в одной системе',summary:'Связь текста и картинок',meaning:'Потенциально полезно для документов'}
];
const names=['Оценка ИИ-агентов','Мультимодальные языковые модели','Эффективность цепочек рассуждений'];
const search=(query,type='all')=>searchEditorial(topics,stories,details,t=>names[t.id],query,type);

test('Russian spelling, keyboard queries and basic normalization are stable',()=>{
  assert.equal(fold('Ёж'), 'еж');
  assert.deepEqual(tokens('ИИ-агенты / RAG 2026'),['ии','агенты','rag','2026']);
  assert.equal(stem('рассуждения'),stem('рассуждений'));
  assert.equal(stem('агенты'),'агент');
});
test('Search across translated topic titles and actual editorial explanations',()=>{
  assert.equal(search('агенты').some(r=>r.type==='topic'&&r.id===0),true);
  assert.equal(search('агенты').some(r=>r.type==='insight'&&r.id==='agents'),true);
  assert.equal(search('рассуждения').some(r=>r.type==='topic'&&r.id===2),true);
  assert.equal(search('документов').some(r=>r.type==='topic'&&r.id===1),true);
  assert.equal(search('что-то совершенно неизвестное').length,0);
});
test('Category filters are strict and do not fabricate papers',()=>{
  assert.ok(search('агент','topics').every(r=>r.type==='topic'));
  assert.ok(search('агент','insights').every(r=>r.type==='insight'));
  assert.equal(search('агент','papers').length,0);
});
test('Russian queries map to actual English research paper titles',()=>{
  assert.ok(paperTokenOptions('агенты').includes('agent'));
  assert.ok(paperScore('Towards Reliable Agent Planning','NeurIPS',2025,'агенты')>0);
  assert.ok(paperScore('Learning to Speak with Voice Models','ICML',2026,'голос')>0);
  assert.ok(paperScore('Visual Reasoning with Vision-Language Models','CVPR',2024,'рассуждения')>0);
  assert.ok(paperScore('Chain-of-Thought Reasoning','ACL',2025,'reasoning')>0);
  assert.ok(paperScore('Robust Representations','ICML',2023,'2023')>0);
  assert.equal(paperScore('Stochastic Optimization','ICML',2025,'квантовая картошка'),0);
});
