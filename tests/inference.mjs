
import {chromium} from '@playwright/test';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')console.log('BROWSER',m.text().slice(0,350));});
await page.goto('http://localhost:5173');
await page.screenshot({path:'desktop.png',fullPage:true});
console.log('TITLE',await page.title());
console.log('DESKTOP_OVERFLOW',await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'mobile.png',fullPage:true});
console.log('MOBILE_OVERFLOW',await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
await page.setViewportSize({width:1440,height:1000});
await page.locator('#photo-upload').setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('no')});
console.log('UNSUPPORTED',await page.getByRole('alert').innerText());
await page.locator('#photo-upload').setInputFiles({name:'bad.jpg',mimeType:'image/jpeg',buffer:Buffer.from('bad')});
console.log('CORRUPT',await page.getByRole('alert').innerText());
const results=[];
for(const name of ['cardboard','glass','plastic','metal','paper','trash','battery0','battery1','biological0','biological1']){
await page.locator('#photo-upload').setInputFiles('fixtures/'+name+'.jpg');
await page.locator('.preview').waitFor();
await page.getByRole('checkbox').check();
const start=Date.now();await page.getByRole('button',{name:'Identify waste',exact:true}).click();
await page.waitForFunction(()=>document.querySelector('.result-content')||document.querySelector('.error'),{},{timeout:310000});
if(await page.locator('.error').count()){console.log('INFERENCE_FAILURE',await page.locator('.error').innerText());break;}
const row={name,timeMs:Date.now()-start,title:await page.locator('.item-title').innerText(),flag:await page.locator('.result-flag').innerText(),matches:await page.locator('.matches').innerText()};results.push(row);console.log('INFERENCE',JSON.stringify(row));
await page.screenshot({path:'result-'+name+'.png',fullPage:true});
}
if(await page.locator('#correction').count()){
await page.locator('#correction').selectOption('battery');await page.getByRole('button',{name:'Confirm & show disposal'}).click();
console.log('CORRECTION',await page.locator('.disposal-card').innerText());
await page.locator('#correction').selectOption('bottle');await page.locator('#condition').selectOption('chemical');await page.getByRole('button',{name:'Confirm & show disposal'}).click();
console.log('CONTAMINATION',await page.locator('.category-badge').innerText());
}
console.log('PAGE_ERRORS',JSON.stringify(errors));fs.writeFileSync('qa-results.json',JSON.stringify({results,errors},null,2));await browser.close();
