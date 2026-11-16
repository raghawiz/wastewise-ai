
import test from 'node:test';
import assert from 'node:assert/strict';
import {items,categories,interpret,getAdvice} from '../src/data.js';
test('every catalogue item maps to exactly one valid category and advice',()=>{for(const item of items){assert.equal(categories.filter(c=>c.id===item.category).length,1);assert.ok(getAdvice(item).advice.length>20);}assert.equal(new Set(items.map(i=>i.id)).size,items.length);});
test('known high-scoring match remains a suggestion, close results require review',()=>{assert.equal(interpret([{label:items[0].prompt,score:.7},{label:items[1].prompt,score:.1}]).uncertain,false);assert.equal(interpret([{label:items[0].prompt,score:.3},{label:items[1].prompt,score:.28}]).uncertain,true);});
test('non-waste and invalid output do not receive a waste category',()=>{assert.equal(interpret([{label:'a dog or a cat',score:.99}]).item,undefined);assert.equal(interpret([]).uncertain,true);assert.equal(interpret([{label:items[0].prompt,score:NaN}]).uncertain,true);});
test('chemical contamination overrides ordinary recycling and food-soiled fibres are excluded',()=>{for(const i of items)assert.equal(getAdvice(i,'chemical').category.id,'hazard');assert.equal(getAdvice(items.find(i=>i.id==='paper'),'soiled').category.id,'residual');assert.equal(getAdvice(items.find(i=>i.id==='cardboard'),'clean').category.id,'recycle');});
test('special waste does not enter ordinary streams',()=>{for(const [id,category] of [['battery','hazard'],['phone','ewaste'],['pad','sanitary'],['diaper','sanitary']])assert.equal(getAdvice(items.find(i=>i.id===id)).category.id,category);});
