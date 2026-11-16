
export const categories = [
{id:'wet',name:'Wet / Biodegradable',short:'Wet waste',color:'#669b43',symbol:'leaf',examples:'Fruit peels · food scraps · vegetables',action:'Keep separate for wet-waste collection or suitable composting.',why:'Organic material can become compost or biogas when kept free of plastic.',avoid:'Never mix wrappers, glass or chemicals with food scraps.'},
{id:'recycle',name:'Dry / Recyclable',short:'Recyclable',color:'#368aab',symbol:'recycle',examples:'Clean paper · bottles · metal cans',action:'Empty, clean if needed, and dry. Give to a dry-waste collector accepting this material.',why:'Clean, separated materials are easier to recover. Local acceptance still matters.',avoid:'A recycling symbol alone does not guarantee local recyclability.'},
{id:'residual',name:'Dry / Non-Recyclable',short:'Residual waste',color:'#a77d4a',symbol:'trash',examples:'Multilayer wrappers · soiled packaging',action:'Keep apart from recyclable materials and use the local reject-waste collection route.',why:'Mixed materials or contamination can prevent ordinary recycling.',avoid:'Do not burn, litter or put plastic in compost.'},
{id:'hazard',name:'Hazardous Waste',short:'Special handling',color:'#c66a43',symbol:'battery',examples:'Batteries · paint · chemical containers',action:'Keep separate and contact an authorised collection or take-back point.',why:'These materials may harm people or contaminate water, soil and recycling.',avoid:'Do not open, crush, burn, rinse or empty hazardous containers into drains.'},
{id:'ewaste',name:'E-Waste',short:'E-waste',color:'#8071b5',symbol:'phone',examples:'Phones · chargers · circuit boards',action:'Use a producer take-back service or registered e-waste recycler.',why:'Electronics contain recoverable materials and components requiring controlled treatment.',avoid:'Do not dismantle, burn or mix with household recyclables.'},
{id:'sanitary',name:'Sanitary Waste',short:'Sanitary waste',color:'#b36c8d',symbol:'shield',examples:'Used diapers · pads · hygiene waste',action:'Wrap securely, store separately, and hand over through your local sanitary-waste collection.',why:'Separate containment protects sanitation workers and prevents contamination.',avoid:'Do not flush, recycle or compost disposable sanitary products.'}
];
const raw=[
['banana','Banana peel','wet','a banana peel', 'Remove stickers. Collect with food scraps; home composting is suitable.'],
['wholefruit','Whole fruit','wet','a banana, apple or whole fruit','If still edible, use or share it first. If spoiled, remove packaging and use wet-waste collection.'],
['fruit','Fruit scraps','wet','apple cores and fruit peels','Remove plastic labels and keep with wet waste.'],
['vegetables','Vegetable scraps','wet','vegetable peelings and scraps','Keep free of packaging; compost or use wet-waste collection.'],
['food','Food leftovers','wet','leftover cooked food on a plate','Separate food from its container. Use wet-waste collection; meat and oily food need a suitable composting system.'],
['leaves','Fallen leaves','wet','a pile of dry fallen leaves','Compost or use garden-waste collection. Do not burn.'],
['eggs','Eggshells','wet','broken eggshells','Collect with wet waste or crush for suitable composting.'],
['bottle','Plastic bottle','recycle','a plastic bottle','Empty it, rinse only if needed, and keep dry. Check local plastic acceptance. Do not apply this guidance to chemical bottles.'],
['glass','Glass bottle','recycle','an empty glass bottle','Empty and keep separate if your collector requires it. Protect workers from sharp edges; wrap and label broken glass.'],
['can','Metal drink can','recycle','an empty aluminum beverage can','Empty and drain. Place with accepted dry recyclables.'],
['paper','Paper / newspaper','recycle','sheets of paper or newspaper','Keep clean and dry. Wet, heavily greasy or laminated paper needs different handling.'],
['cardboard','Cardboard box','recycle','a cardboard box','Flatten clean cardboard. Separate heavily greasy portions and follow local compost/reject guidance.'],
['jar','Plastic food container','recycle','an empty rigid plastic food container','Empty and clean. Recycle only if your collector accepts its plastic type.'],
['wrapper','Snack wrapper','residual','a shiny chips packet or snack wrapper','Multilayer wrappers are often excluded from ordinary recycling. Use an accepted specialised collection if available; otherwise local rejects.'],
['tissue','Used tissue','residual','a crumpled paper tissue','Keep out of paper recycling. Follow local guidance; medical or bodily-fluid contamination requires special handling.'],
['foam','Foam packaging','residual','white polystyrene foam packaging','Keep intact to prevent litter. Use a specialist recycler if available; otherwise local rejects.'],
['ceramic','Broken ceramic','residual','a broken ceramic cup or plate','Wrap sharp pieces securely, label them, and confirm local collection. Do not mix ceramics with glass recycling.'],
['battery','Battery','hazard','a battery','Keep separate, dry and away from heat. For intact loose batteries, insulate exposed terminals where safe. Use authorised battery take-back. Do not handle leaking or swollen batteries.'],
['paint','Paint container','hazard','a paint can','Keep closed in its original container. Ask your local special-care collection service; do not pour paint into drains.'],
['chemical','Chemical container','hazard','a pesticide or chemical container','Leave labels intact and keep closed. Never reuse for food or rinse into drains. Contact an authorised collection service.'],
['bulb','Fluorescent lamp','hazard','a fluorescent light bulb or tube','Keep intact and separate. Use an authorised lamp collection point. For breakage, keep people away and seek local safe-cleanup guidance.'],
['phone','Mobile phone','ewaste','a mobile phone','If discarding, back up and erase personal data, remove SIM and memory cards, and use authorised take-back. Do not remove an embedded battery yourself.'],
['charger','Charger / cables','ewaste','a phone charger with electrical cables','Unplug and collect separately with e-waste. Use an authorised recycler or producer collection.'],
['board','Circuit board','ewaste','an electronic circuit board','Keep intact; do not burn or dismantle. Hand over to a registered e-waste recycler.'],
['laptop','Laptop','ewaste','a laptop computer','Consider repair or reuse first. If discarding, erase data and use authorised electronics take-back.'],
['diaper','Disposable diaper','sanitary','a disposable baby diaper','If used, wrap securely and store separately for local sanitary collection. Do not flush or put in recycling.'],
['pad','Sanitary pad','sanitary','a menstrual sanitary pad','If used, wrap in a suitable pouch or wrapping material and keep separate for sanitary collection. Do not flush.']
];
export const items=raw.map(([id,name,category,prompt,advice])=>({id,name,category,prompt,advice}));
export const exclusions=['a person or a portrait','an animal, insect, dog or cat','a landscape or a building','an empty surface with no object','several different waste items mixed together','a blurry unrecognizable object','clothing or a shoe','a medical syringe or needle'];
export const candidates=[...items.map(i=>i.prompt),...exclusions];
export function interpret(results) {
const ranked=results.filter(x=>Number.isFinite(x.score)).sort((a,b)=>b.score-a.score);
const first=ranked[0], next=ranked[1];
const item=items.find(i=>i.prompt===first?.label);
const uncertain=!item || first.score<0.5 || (next && first.score-next.score<0.08);
return {item,uncertain,ranked:ranked.slice(0,4),reason:!item?'This may be outside the supported waste examples, mixed waste, or an unclear photo.':uncertain?'Several descriptions match. Confirm the item before using disposal advice.':'This is a visual suggestion. Confirm the material and condition before disposal.'};
}
export function getAdvice(item,condition='clean'){
if(!item)return null;
let category=categories.find(c=>c.id===item.category);
let advice=item.advice;
if(condition==='chemical'){category=categories.find(c=>c.id==='hazard');advice='A chemically contaminated item needs special handling. Keep it closed and separate. Do not rinse, recycle or pour contents into drains. Contact an authorised collection service.';}
else if(condition==='soiled' && ['paper','cardboard'].includes(item.id)){category=categories.find(c=>c.id==='residual');advice='Keep heavily food-soiled paper/cardboard out of clean paper recycling. Separate clean portions. Use local composting guidance for suitable uncoated fibres; otherwise local rejects.';}
return {category,advice};
}
