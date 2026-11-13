import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildProfile} from '../metrics.mjs';

const papers = {
  id: ['a','b','c','d'],
  year: [2018,2026,2026,2025],
  venue: ['ACL','NeurIPS','ACL','ICML']
};
const members = {
  // Intentionally interleaved; paper 1 repeats the same topic.
  paper:   [1,0,1,3,1,2,0,1,3],
  cluster: [2,2,2,4,3,2,2,2,-1]
};

test('distinct papers are counted once per topic even with interleaved claims', () => {
  const p=buildProfile(members,papers,{venue:'all',y0:2018,y1:2026},5);
  assert.equal(p.papers,4);
  assert.equal(p.claims,9);
  assert.deepEqual([...p.countClaims],[0,0,6,1,1]);
  assert.deepEqual([...p.countPapers],[0,0,3,1,1]);
});
test('conference and dates filter both papers and claims', () => {
  const p=buildProfile(members,papers,{venue:'NeurIPS',y0:2024,y1:2026},5);
  assert.equal(p.papers,1);
  assert.equal(p.claims,4);
  assert.equal(p.countClaims[2],3);
  assert.equal(p.countPapers[2],1);
  assert.equal(p.countPapers[3],1);
});
test('empty selection gives valid zeros', () => {
  const p=buildProfile(members,papers,{venue:'ICLR',y0:2026,y1:2026},5);
  assert.equal(p.papers,0);
  assert.equal(p.claims,0);
});
test('reversed dates are rejected instead of silently showing zero', () => {
  assert.throws(()=>buildProfile(members,papers,{venue:'all',y0:2026,y1:2018},5), RangeError);
});
test('mismatched datasets are rejected', () => {
  assert.throws(()=>buildProfile({paper:[0],cluster:[]},papers,{venue:'all',y0:2018,y1:2026},5),TypeError);
});
