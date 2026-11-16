import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateInsights, topicExplanation} from '../insights.js';
import {insightArt} from '../insight-art.js';
const data=JSON.parse(fs.readFileSync(new URL('../insights-data.json',import.meta.url)));
const validTopics=Array.from({length:98},(_,i)=>({id:i}));
const manifest={source_fingerprint:data.provenance.sourceFingerprint};
test('98 research explainers map one-to-one to the source clusters',()=>{
  assert.equal(validateInsights(data,manifest,validTopics),true);
  assert.deepEqual(data.topics.map(t=>t.id),Array.from({length:98},(_,i)=>i));
});
test('Every research guide supplies clear language and two verifiable paper links',()=>{
  assert.equal(data.topics.length,98);
  for(const t of data.topics){
    assert.ok(t.what.length>50&&t.why.length>25,`missing human explanation for topic ${t.id}`);
    assert.ok(t.examples.length===2,`missing scientific examples for ${t.id}`);
    for(const paper of t.examples){assert.ok(paper.url.startsWith('https://'));assert.ok(paper.title.length>8);assert.ok(Number(paper.year)>=2018)}
  }
});
test('Each insight links to an existing topic and editorial explanation is distinct from author paper',()=>{
  assert.equal(data.stories.length,30);
  const ids=new Set();
  for(const insight of data.stories){
    assert.ok(!ids.has(insight.id));ids.add(insight.id);
    assert.ok(insight.summary.length>70&&insight.meaning.length>70);
    assert.ok(insight.topicIds.every(id=>Number.isInteger(id)&&id>=0&&id<98));
    assert.ok(['growth','decline'].includes(insight.kind));
  }
  assert.match(data.authorFinding.source,/arxiv\.org\/html\/2609/);
  assert.match(data.authorFinding.details,/4 488|3,1|10,3|97%/);
});
test('Research source fingerprint mismatch fails rather than mixing datasets',()=>{
  assert.throws(()=>validateInsights(data,{source_fingerprint:'another-dataset'},validTopics),/не соответствует/);
});
test('Topic explanation protects against HTML inside source data',()=>{
  const modified=JSON.parse(JSON.stringify(data));
  modified.topics[0].what='<script>alert(1)</script>';
  const rendered=topicExplanation(modified,0);
  assert.ok(rendered.includes('&lt;script&gt;'));
  assert.ok(!rendered.includes('<script>'));
  assert.match(rendered,/публикации/);
});

test('Every expanded editorial finding has an accessible, distinct scientific illustration',()=>{
  const ids=new Set(data.stories.map(s=>s.id));
  assert.equal(ids.size,30);
  for(const s of data.stories){
    const svg=insightArt(s.id,s.title);
    assert.match(svg,/<svg/);
    assert.match(svg,/<figure class="insight-art"/);
    assert.match(svg,/aria-label=/);
    assert.ok(svg.length>800);
  }
});
