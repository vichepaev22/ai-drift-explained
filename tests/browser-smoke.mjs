import {chromium} from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(fileURLToPath(new URL('../_site/',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const name=pathname==='/'?'index.html':pathname.substring(1);
  const file=path.resolve(root,name);
  if(!(file===root||file.startsWith(root+path.sep))){res.writeHead(403);res.end();return}
  fs.stat(file,(err,info)=>{
    if(err||!info.isFile()){res.writeHead(404);res.end();return}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
let browser,page;const errors=[];
try {
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  page=await browser.newPage({viewport:{width:1360,height:850}});
  page.on('pageerror',e=>errors.push('Page error: '+e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push('Console error: '+m.text())});
  page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url())});
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForFunction(()=>document.querySelector('#dataset-status')?.textContent.includes('Научная база доступна'),null,{timeout:30000});
  console.log('PASS: scientific metadata loaded');
  await page.locator('[data-view="topics"]').click();
  assert.equal(await page.locator('#view-topics').isVisible(),true,'Topics must become visible');
  assert.match(await page.locator('#breadcrumb-name').innerText(),/ТЕМЫ/);
  await page.locator('#topic-search').fill('агенты');
  await page.waitForTimeout(450);
  assert.ok(await page.locator('#topics-list .topic-row').count()>0,'Topic search should match agents');
  console.log('PASS: navigation and topic search');
  await page.locator('[data-view="trends"]').click();
  assert.equal(await page.locator('#view-trends').isVisible(),true);
  await page.locator('#clear-trajectories').click();
  assert.match(await page.locator('#trend-chart').innerText(),/Выберите/,'Clear should empty graph');
  await page.locator('#gainers .trend-row').first().click();
  assert.ok(await page.locator('#trend-chart svg').count()>0,'Selected trend must render chart');
  console.log('PASS: trends clear and reselect');
  await page.locator('[data-view="compare"]').click();
  await page.waitForFunction(()=>document.querySelector('#compare-summary')?.textContent.includes('статей'),null,{timeout:60000});
  assert.ok(await page.locator('#compare-chart .compare-row').count()>0,'Compare must show rows');
  console.log('PASS: paper comparison');
  await page.locator('[data-view="map"]').click();
  await page.waitForFunction(()=>document.querySelector('#map-selection')?.textContent.includes('Отрисовано'),null,{timeout:80000});
  await page.locator('#map-year').selectOption('2026');
  await page.waitForTimeout(500);
  assert.match(await page.locator('#map-selection').innerText(),/Отрисовано/);
  await page.locator('#map-reset').click();
  assert.equal(await page.locator('#map-year').inputValue(),'2026','Fit must not reset year filter');
  await page.locator('#map-zoom-in').click();
  await page.locator('#map-zoom-out').click();
  console.log('PASS: map rendering, filters and controls');
  await page.setViewportSize({width:390,height:844});
  await page.locator('#menu-btn').click();
  assert.equal(await page.locator('#primary-nav').evaluate(el=>el.classList.contains('open')),true);
  await page.locator('#sidebar-backdrop').click({position:{x:350,y:350}});
  assert.equal(await page.locator('#primary-nav').evaluate(el=>el.classList.contains('open')),false);
  console.log('PASS: mobile sidebar');
  if(errors.length)console.warn('Non-fatal browser warnings:',errors.slice(0,12));
} catch(e) {
  console.error('FAIL: browser smoke test:',e.message);
  if(page){try{await page.screenshot({path:'browser-smoke-failure.png',fullPage:true})}catch{}}
  if(errors.length)console.error('Browser errors:',errors.slice(0,20));
  process.exitCode=1;
} finally {
  await browser?.close();await new Promise(resolve=>server.close(resolve));
}
