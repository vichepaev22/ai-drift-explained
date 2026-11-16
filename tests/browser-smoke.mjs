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
  await page.locator('[data-view="insights"]').click();
  assert.equal(await page.locator('#view-insights').isVisible(),true,'Explanatory guide must open');
  assert.equal(await page.locator('#insights-grid .insight-card').count(),6,'Initial editorial list should be manageable');
  const columns=await page.locator('#insights-grid').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length);
  assert.equal(columns,1,'Insight cards must appear one per row on desktop');
  assert.equal(await page.locator('#insights-grid .insight-art svg').count(),6,'Each visible finding should have a thematic illustration');
  await page.locator('[data-insight-filter="decline"]').click();
  assert.equal(await page.locator('#insights-grid .insight-card').count(),5,'Decline filter must show five verified editorial findings');
  await page.locator('[data-insight-filter="all"]').click();
  assert.equal(await page.locator('#insights-grid .insight-card').count(),6,'Clear filter starts from the first six findings');
  for(let i=0;i<4;i++)await page.locator('#insights-more').click();
  assert.equal(await page.locator('#insights-grid .insight-card').count(),30,'Show more must reveal all 30 findings');
  assert.equal(await page.locator('#insights-grid .insight-art svg').count(),30,'All 30 findings have illustrations');
  const sourceLinks=await page.locator('#insights-grid .source-papers a').count();
  assert.ok(sourceLinks>=60,'Every finding should offer two example publications');
  await page.locator('#insights-grid .insight-card').first().locator('[data-open-topic]').first().click();
  assert.equal(await page.locator('#view-topics').isVisible(),true);
  assert.ok(await page.locator('#topic-detail .topic-explainer').count()>0,'Topic detail should include understandable explanation');
  assert.ok(await page.locator('#topic-detail .source-papers a').count()>=2,'Topic should link to original research');
  console.log('PASS: 30 illustrated findings, single-column layout, filters, sources and topic transitions');
  await page.locator('[data-view="topics"]').click();
  assert.equal(await page.locator('#view-topics').isVisible(),true,'Topics must become visible');
  assert.match(await page.locator('#breadcrumb-name').innerText(),/ТЕМЫ/);
  await page.locator('#topic-search').fill('агенты');
  await page.waitForTimeout(450);
  assert.ok(await page.locator('#topics-list .topic-row').count()>0,'Topic search should match agents');
  const topicsFont=await page.locator('#topics-list .topic-name').first().evaluate(node=>parseFloat(getComputedStyle(node).fontSize));
  assert.ok(topicsFont>=13.5,'Topic names should be readable (>=13.5px), got '+topicsFont);
  console.log('PASS: navigation, search and readable topic names');
  await page.locator('[data-view="trends"]').click();
  assert.match(await page.locator('#trend-takeaway').innerText(),/Как читать этот рейтинг/);
  assert.equal(await page.locator('#view-trends').isVisible(),true);
  await page.locator('#clear-trajectories').click();
  assert.match(await page.locator('#trend-chart').innerText(),/Выберите/,'Clear should empty graph');
  await page.locator('#gainers .trend-row').first().click();
  assert.ok(await page.locator('#trend-chart svg').count()>0,'Selected trend must render chart');
  const trendsFont=await page.locator('#gainers .trend-row-head').first().evaluate(node=>parseFloat(getComputedStyle(node).fontSize));
  assert.ok(trendsFont>=13,'Trend ranking labels too small: '+trendsFont);
  console.log('PASS: trends, reselect and readable ranking labels');
  await page.locator('[data-view="compare"]').click();
  await page.waitForFunction(()=>document.querySelector('#compare-summary')?.textContent.includes('статей'),null,{timeout:60000});
  assert.ok(await page.locator('#compare-chart .compare-row').count()>0,'Compare must show rows');
  assert.match(await page.locator('#compare-interpretation').innerText(),/Как понимать сравнение/);
  const compareFont=await page.locator('#compare-chart .compare-row .name').first().evaluate(node=>parseFloat(getComputedStyle(node).fontSize));
  const metricFont=await page.locator('#view-compare .chip').first().evaluate(node=>parseFloat(getComputedStyle(node).fontSize));
  assert.ok(compareFont>=13&&metricFont>=12.5,'Comparison typography too small: '+compareFont+'/'+metricFont);
  console.log('PASS: paper comparison and readable metric controls');
  await page.locator('[data-view="topics"]').click();
  await page.locator('#topic-search').fill('');
  await page.locator('#topic-open-paper').click();
  await page.waitForFunction(()=>document.querySelector('#claim-drawer')?.matches(':modal'),null,{timeout:10000});
  const articleDialog=await page.locator('#claim-drawer').evaluate(dialog=>({
    open:dialog.open, modal:dialog.matches(':modal'),
    focusInside:dialog.contains(document.activeElement)
  }));
  assert.ok(articleDialog.open&&articleDialog.modal&&articleDialog.focusInside,
    'Research article must open as accessible native modal: '+JSON.stringify(articleDialog));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#claim-drawer').evaluate(dialog=>dialog.open),false,
    'Escape must close native article dialog');
  console.log('PASS: native modal article drawer, focus and Escape dismissal');
  await page.locator('[data-view="map"]').click();
  await page.waitForFunction(()=>document.querySelector('#map-selection')?.textContent.includes('Отрисовано'),null,{timeout:80000});
  await page.locator('#map-year').selectOption('2026');
  await page.waitForTimeout(500);
  assert.match(await page.locator('#map-selection').innerText(),/Отрисовано/);
  await page.locator('#map-reset').click();
  assert.equal(await page.locator('#map-year').inputValue(),'2026','Fit must not reset year filter');
  await page.locator('#map-zoom-in').click();
  await page.locator('#map-zoom-out').click();
  const desktopMap=await page.evaluate(()=>({
    panelWidth:document.querySelector('.map-aside').getBoundingClientRect().width,
    topicFont:parseFloat(getComputedStyle(document.querySelector('.map-topic-row')).fontSize),
    titleFont:parseFloat(getComputedStyle(document.querySelector('.aside-title')).fontSize)
  }));
  assert.ok(desktopMap.panelWidth>=300,'Topics panel too narrow: '+JSON.stringify(desktopMap));
  assert.ok(desktopMap.topicFont>=13&&desktopMap.titleFont>=12,'Map labels too small: '+JSON.stringify(desktopMap));
  console.log('PASS: map controls, right-hand panel width and readable categories',desktopMap);
  await page.setViewportSize({width:390,height:844});
  await page.locator('#menu-btn').click();
  assert.equal(await page.locator('#primary-nav').evaluate(el=>el.classList.contains('open')),true);
  assert.equal(await page.locator('.workspace').evaluate(el=>el.inert),true,'Page behind mobile nav must be inert');
  assert.equal(await page.locator('#primary-nav').evaluate(el=>el.contains(document.activeElement)),true,
    'Focus must move inside mobile drawer');
  await page.locator('#sidebar-backdrop').click({position:{x:350,y:350}});
  assert.equal(await page.locator('#primary-nav').evaluate(el=>el.classList.contains('open')),false);
  assert.equal(await page.locator('.workspace').evaluate(el=>el.inert),false,'Page restored on close');
  await page.waitForTimeout(500); // ResizeObserver repaints at the new container size.
  const canvasShape=await page.locator('#map-canvas').evaluate(host=>{
    const canvas=host.querySelector('canvas');
    return canvas?{
      hostRatio:host.clientWidth/host.clientHeight,
      bufferRatio:canvas.width/canvas.height,
      width:host.clientWidth,bufferWidth:canvas.width
    }:null;
  });
  assert.ok(canvasShape&&Math.abs(canvasShape.hostRatio-canvasShape.bufferRatio)<.12,
    'Canvas drawing buffer must follow the container aspect ratio: '+JSON.stringify(canvasShape));
  const mobileMap=await page.evaluate(()=>({
    asideHeight:document.querySelector('.map-aside').getBoundingClientRect().height,
    canvasHeight:document.querySelector('#map-canvas').getBoundingClientRect().height,
    topicFont:parseFloat(getComputedStyle(document.querySelector('.map-topic-row')).fontSize),
    scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth
  }));
  assert.ok(mobileMap.asideHeight>=280&&mobileMap.canvasHeight>=380,'Map or topics panel too small on mobile: '+JSON.stringify(mobileMap));
  assert.ok(mobileMap.topicFont>=13,'Mobile topics font too small: '+mobileMap.topicFont);
  assert.ok(mobileMap.scrollWidth<=mobileMap.viewport+2,'Horizontal overflow on mobile: '+JSON.stringify(mobileMap));
  console.log('PASS: mobile sidebar and responsive map typography',mobileMap);
  const fatal=errors.filter(msg=>msg.startsWith('Page error:'));
  assert.equal(fatal.length,0,'Unexpected JavaScript error: '+JSON.stringify(fatal));
  if(errors.length)console.warn('Non-fatal browser warnings:',errors.slice(0,12));
} catch(e) {
  console.error('FAIL: browser smoke test:',e.message);
  if(page){try{await page.screenshot({path:'browser-smoke-failure.png',fullPage:true})}catch{}}
  if(errors.length)console.error('Browser errors:',errors.slice(0,20));
  process.exitCode=1;
} finally {
  await browser?.close();await new Promise(resolve=>server.close(resolve));
}
