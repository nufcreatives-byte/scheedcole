import {chromium} from 'playwright';
import {mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';

const root = mkdtempSync(join(tmpdir(), 'scheed-cms-test-'));
let server, browser;
const readJson = name => JSON.parse(readFileSync(join(root, 'cms-preparation', name + '.json'), 'utf8'));
const saveJson = (name, value) => writeFileSync(join(root, 'cms-preparation', name + '.json'), JSON.stringify(value, null, 2));
try {
  cpSync(process.cwd(), root, {recursive:true, filter: path => !path.includes('/.git') && !path.includes('/node_modules')});
  server = spawn('python3', ['-m', 'http.server', '18765', '--bind', '127.0.0.1'], {cwd: root, stdio:'ignore'});
  let connected = false;
  for (let i=0; i<50; i++) { try { const r=await fetch('http://127.0.0.1:18765/index.html'); if(r.ok){connected=true;break} } catch {} await new Promise(r=>setTimeout(r,100)); }
  assert.ok(connected, 'Test server did not start');
  browser = await chromium.launch({headless:true});
  const desktop = await browser.newContext({viewport:{width:1440,height:900}});
  const page = await desktop.newPage();
  const base='http://127.0.0.1:18765/';
  const projects=readJson('projects'), press=readJson('press'), specific=readJson('press-pages'), home=readJson('home');
  assert.equal(projects.projects.length,12); assert.equal(press.articles.length,63); assert.equal(specific.pages.length,17);
  const norm = s => (s || '').replace(/\s+/g,' ').trim();
  for (const p of projects.projects) {
    const original = readFileSync(join(root,p.project_url),'utf8');
    await page.goto(base+p.project_url); await page.waitForLoadState('networkidle');
    const snapshot=await page.evaluate(html=>{
      const doc=new DOMParser().parseFromString(html,'text/html');
      const all=[...document.querySelectorAll('main p, main h2, main h3, main figcaption, main .landmark-stat strong, main .landmark-stat span')]
        .filter(n=>!n.closest('.page-hero')&&!n.closest('a')&&!n.querySelector('a')&&n.textContent.trim());
      return {originalEm:doc.querySelectorAll('main em').length, currentEm:document.querySelectorAll('main em').length, originalImgs:doc.querySelectorAll('main img').length, currentImgs:document.querySelectorAll('main img').length, blocks:all.map(n=>n.innerText)};
    },original);
    assert.equal(snapshot.currentEm,snapshot.originalEm,p.title+': italic formatting changed');
    assert.equal(snapshot.currentImgs,snapshot.originalImgs,p.title+': image count changed');
    assert.equal(snapshot.blocks.length,(p.page_blocks||[]).length,p.title+': block count');
    for(const b of p.page_blocks||[]) assert.equal(norm(snapshot.blocks[b.position]),norm(b.text),p.title+': block '+b.position);
  }
  for(const entry of specific.pages) {
    await page.goto(base+entry.page); await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('.press-list .press-card').count(),entry.articles.length,entry.page+': press card count');
  }
  home.hero_role='TEMPORARY HOME TEST'; saveJson('home',home);
  projects.projects[0].page_intro='Temporary detail intro';
  projects.projects[0].page_blocks.find(x=>x.position===10).text='Temporary story test';
  projects.projects[0].page_gallery=[...(projects.projects[0].page_gallery||[]),{image:'images/about-studio.jpg',alt:'Temporary gallery image'}];
  projects.projects.push({id:'test-project-123',title:'Temporary Project',metadata:'Test location',type:'Test type',description:'Test description',image:'images/about-studio.jpg',image_alt:'Test cover',page_story:'Longer test story',page_gallery:[{image:'images/miss-lou.jpg',alt:'Extra test photo'}]});
  saveJson('projects',projects);
  press.articles.unshift({title:'Temporary Press Test',source_date:'Test · 2026',date:'2026-10-27',project:'Test',url:'https://example.com/'}); saveJson('press',press);
  specific.pages.find(x=>x.page==='press-hellshire-beach.html').articles[0].title='Temporary Project Press Test'; saveJson('press-pages',specific);
  await page.goto(base+'index.html'); await page.getByText('TEMPORARY HOME TEST').waitFor();
  await page.goto(base+'work.html'); await page.getByRole('heading',{name:'Temporary Project'}).waitFor();
  const link=page.locator('.editorial-project').filter({hasText:'Temporary Project'}).getByRole('link',{name:'PROJECT'}); await link.click();
  await page.getByRole('heading',{name:'Temporary Project'}).waitFor();
  assert.equal(await page.locator('img[alt="Extra test photo"]').count(),1);
  assert.equal(await page.getByText('Longer test story').count(),1);
  await page.goto(base+'press.html'); await page.getByText('Temporary Press Test').waitFor();
  await page.goto(base+'project-together-we-rise.html'); await page.getByText('Temporary detail intro').waitFor();
  await page.getByText('Temporary story test').waitFor();
  assert.equal(await page.locator('img[alt="Temporary gallery image"]').count(),1);
  await page.goto(base+'press-hellshire-beach.html'); await page.getByText('Temporary Project Press Test').waitFor();
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const m=await mobile.newPage();
  for(const path of ['index.html','work.html','press.html','project-together-we-rise.html','project-view.html?id=test-project-123']) {
    await m.goto(base+path); await m.waitForLoadState('networkidle');
    const dimensions=await m.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    assert.ok(dimensions.scroll<=dimensions.width+2,path+': horizontal overflow '+JSON.stringify(dimensions));
    const menu=m.locator('.menu-toggle');
    assert.ok(await menu.isVisible(),path+': missing mobile menu');
    await menu.click(); assert.equal(await menu.getAttribute('aria-expanded'),'true',path+': mobile menu did not open');
    await menu.click(); assert.equal(await menu.getAttribute('aria-expanded'),'false',path+': mobile menu did not close');
  }
  console.log('PASS: 12 original project layouts, 17 project press pages, editor data updates, new project, gallery, press and five mobile pages.');
} finally {
  if(browser) await browser.close();
  if(server) server.kill();
  rmSync(root,{recursive:true,force:true});
}
