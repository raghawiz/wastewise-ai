
import {chromium} from '@playwright/test';import fs from 'node:fs';import assert from 'node:assert/strict';
const browser=await chromium.launch({args:['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const context=await browser.newContext({permissions:['camera'],viewport:{width:390,height:844}});
const page=await context.newPage();await page.goto(process.env.TEST_URL || 'http://localhost:5173');
await page.getByRole('button',{name:'Use camera',exact:true}).click();await page.locator('video').waitFor();
await page.waitForFunction(()=>document.querySelector('video').videoWidth>0);
await page.getByRole('button',{name:'Capture photo'}).click();await page.locator('.preview').waitFor();console.log('PASS simulated camera capture');
await page.getByRole('button',{name:'Remove photo'}).click();
const b=fs.readFileSync('fixtures/paper.jpg').toString('base64');
const dt=await page.evaluateHandle(b=>{const d=new DataTransfer();d.items.add(new File([Uint8Array.from(atob(b),c=>c.charCodeAt(0))],'photo.jpg',{type:'image/jpeg'}));return d;},b);
await page.locator('.dropzone').dispatchEvent('drop',{dataTransfer:dt});await page.locator('.preview').waitFor();console.log('PASS drop preview');
await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Identify waste',exact:true}).click();
await page.getByRole('button',{name:'Cancel analysis'}).click();assert.equal(await page.locator('.result-content').count(),0);console.log('PASS cancellation');
await context.route('**/huggingface.co/**',r=>r.abort());
await page.getByRole('button',{name:'Identify waste',exact:true}).click();await page.locator('.error').waitFor({timeout:60000});assert.equal(await page.locator('.result-content').count(),0);console.log('PASS model failure without fallback');
await page.getByRole('button',{name:'Remove photo'}).click();
await page.locator('#photo-upload').setInputFiles({name:'big.jpg',mimeType:'image/jpeg',buffer:Buffer.alloc(13*1024*1024)});assert.match(await page.locator('.error').innerText(),/12 MB/);console.log('PASS oversized rejection');
for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
console.log('PASS four viewport widths');
await page.getByRole('button',{name:'Special handling',exact:true}).click();assert.equal(await page.locator('.category-card').count(),3);console.log('PASS guide filter');
await page.getByRole('tab',{name:/Preprocessing/}).click();assert.match(await page.locator('#pipeline-detail').innerText(),/1024/);console.log('PASS interactive pipeline');
await browser.close();
