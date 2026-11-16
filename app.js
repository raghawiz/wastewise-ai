// WasteWise: static, Vercel-ready classroom website.
// Actual photo predictions use CLIP in the browser via Transformers.js.
// Example buttons are explicitly labelled illustrated examples, not predictions.

const MODEL_ID = 'Xenova/clip-vit-base-patch32';
const CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

const streams = {
  'organic': { name: 'Organic / wet waste', icon: '🍃', tint: '#d9f8a6', color: '#7ba73d', title: 'Wet / organic', advice: 'Keep food and garden scraps separately for composting or the municipal wet-waste collection. Remove plastic packaging first.', short: 'Food leftovers, fruit peels, garden leaves', examples: '🍃' },
  'recyclable': { name: 'Dry / recyclable', icon: '♻️', tint: '#bbd4fc', color: '#5e95e9', title: 'Dry / recyclable', advice: 'Empty and dry the material. Put it into the local dry-recycling stream only when that specific item is accepted. Plastic films and cartons vary by location.', short: 'Clean paper, plastic containers, glass, metals', examples: '🧴' },
  'reject': { name: 'Dry / residual waste', icon: '🗑️', tint: '#d5d8df', color: '#888f9e', title: 'Residual / reject', advice: 'Keep contaminated wrappers and other non-recyclable dry waste away from clean recycling and follow local residual-waste collection instructions.', short: 'Chips wrappers, soiled tissues, ceramics', examples: '🗑️' },
  'hazardous': { name: 'Hazardous / special', icon: '⚠️', tint: '#ffdea3', color: '#e7a73d', title: 'Hazardous / special', advice: 'Do not mix with ordinary waste. Use an authorized collection point. Never touch used sharps directly, and store loose batteries safely.', short: 'Batteries, chemicals, lamps, sharps', examples: '🔋' },
  'ewaste': { name: 'Electronic waste', icon: '🔌', tint: '#d7c3ff', color: '#aa86e9', title: 'E-waste', advice: 'Use an authorized e-waste collection or manufacturer take-back point. Back up and erase personal data from electronics first.', short: 'Phones, chargers, wires, circuit boards', examples: '📱' },
  'sanitary': { name: 'Sanitary / hygiene waste', icon: '🧤', tint: '#fac6e8', color: '#df83b3', title: 'Sanitary waste', advice: 'Wrap safely and keep separate from recyclables. Follow local instructions for sanitary waste; clinical or medical sharps need specialist handling.', short: 'Diapers, pads, used bandages, masks', examples: '🧤' },
};

// CLIP compares the image with each textual description. Not a calibrated classifier.
const items = [
  ['Banana peel','a discarded banana peel','organic'],
  ['Fruit scraps','a pile of discarded apple cores and orange fruit peels','organic'],
  ['Vegetable scraps','a pile of discarded vegetable skins and cuttings','organic'],
  ['Leftover food','leftover cooked food thrown away','organic'],
  ['Eggshells','discarded broken eggshells','organic'],
  ['Tea leaves','wet used tea leaves','organic'],
  ['Garden leaves','a pile of fallen dried garden leaves','organic'],
  ['Coffee grounds','used coffee grounds in a waste bowl','organic'],
  ['Plastic bottle','an empty clean plastic water bottle','recyclable'],
  ['Glass bottle','an empty transparent glass bottle','recyclable'],
  ['Metal can','an empty aluminum drink can','recyclable'],
  ['Metal tin','an empty food tin made of metal','recyclable'],
  ['Cardboard','a clean cardboard packaging box','recyclable'],
  ['Newspaper','old newspaper sheets for recycling','recyclable'],
  ['Office paper','used clean white printing paper','recyclable'],
  ['Plastic container','an empty clean plastic food container','recyclable'],
  ['Plastic bag','a clean plastic shopping bag','recyclable'],
  ['Drink carton','an empty milk or juice beverage carton','recyclable'],
  ['Chips packet','a discarded shiny chips packet wrapper','reject'],
  ['Snack wrapper','a dirty plastic snack food wrapper','reject'],
  ['Used tissue','a dirty used paper tissue','reject'],
  ['Greasy food box','a greasy used pizza takeaway box','reject'],
  ['Foam packaging','a piece of white thermocol foam packaging','reject'],
  ['Broken ceramic','a broken ceramic cup or plate','reject'],
  ['Cigarette butt','a discarded cigarette butt','reject'],
  ['Battery','a discarded household AA battery','hazardous'],
  ['Expired medicine','expired pills and medicine blister packs','hazardous'],
  ['Paint container','an old paint can with liquid paint inside','hazardous'],
  ['Pesticide container','a discarded pesticide chemical bottle','hazardous'],
  ['Fluorescent lamp','a discarded fluorescent tube light','hazardous'],
  ['Medical syringe','a used medical syringe with needle','hazardous'],
  ['Mobile phone','an old discarded mobile phone','ewaste'],
  ['Laptop','a broken laptop computer','ewaste'],
  ['Phone charger','an old electrical mobile phone charger','ewaste'],
  ['Electrical cable','an old tangled electrical wire cable','ewaste'],
  ['Circuit board','a discarded green electronic circuit board','ewaste'],
  ['Earphones','broken wired earphones','ewaste'],
  ['Computer mouse','a discarded computer mouse','ewaste'],
  ['Disposable diaper','a used disposable baby diaper','sanitary'],
  ['Sanitary pad','a used sanitary menstrual pad','sanitary'],
  ['Used bandage','a used medical bandage','sanitary'],
  ['Disposable mask','a used disposable face mask','sanitary'],
];

const examples = {
  banana: {stream: 'organic', item: 'Banana peel', icon: '🍌'},
  bottle: {stream: 'recyclable', item: 'Plastic bottle', icon: '🧴'},
  battery: {stream: 'hazardous', item: 'Used battery', icon: '🔋'},
  phone: {stream: 'ewaste', item: 'Old mobile phone', icon: '📱'},
};

const $ = (id) => document.getElementById(id);
const fileInput = $('file-input');
const cameraInput = $('camera-input');
const dropZone = $('drop-zone');
const status = $('analysis-status');
const classifyBtn = $('classify-btn');
let selectedFile = null;
let previewUrl = null;
let classifierPromise = null;
let currentRequest = 0;
let busy = false;

function setStatus(message, kind='info') {
  status.textContent = message;
  status.dataset.kind = kind;
}
function resetPreview() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  $('preview-image').classList.add('hidden');
  $('upload-placeholder').classList.remove('hidden');
}
function chooseFile(file) {
  if (!file) return;
  const valid = ['image/jpeg', 'image/png', 'image/webp'];
  if (!valid.includes(file.type)) return setStatus('Please choose a JPG, PNG or WEBP image.', 'error');
  if (file.size > 10 * 1024 * 1024) return setStatus('The image is larger than 10 MB. Please choose a smaller photo.', 'error');
  currentRequest += 1;
  selectedFile = file;
  resetPreview();
  previewUrl = URL.createObjectURL(file);
  $('preview-image').src = previewUrl;
  $('preview-image').classList.remove('hidden');
  $('upload-placeholder').classList.add('hidden');
  classifyBtn.disabled = busy;
  setStatus(`Selected: ${file.name || 'camera photo'}. Press “Analyze image” to classify.`, 'info');
  clearResult();
}

function clearResult() {
  $('empty-result').classList.remove('hidden');
  $('result-body').classList.add('hidden');
  $('analysis-tag').textContent = 'AWAITING INPUT';
  $('analysis-tag').classList.remove('is-ready');
}

function presentResult(match, alternates=[], isExample=false) {
  const stream = streams[match.stream];
  $('empty-result').classList.add('hidden');
  $('result-body').classList.remove('hidden');
  $('analysis-tag').textContent = isExample ? 'ILLUSTRATIVE EXAMPLE' : 'AI SUGGESTION';
  $('analysis-tag').classList.add('is-ready');
  $('result-banner').style.setProperty('--accent',stream.color);
  $('result-banner').style.setProperty('--pale',stream.tint);
  $('result-icon').textContent = isExample ? (match.icon || stream.icon) : stream.icon;
  $('result-flag').textContent = isExample ? 'ILLUSTRATIVE EXAMPLE — NO AI USED' : 'AI-SUGGESTED WASTE STREAM';
  $('result-category').textContent = stream.name;
  $('result-item').textContent = `Identified item: ${match.item}`;
  $('result-advice').textContent = stream.advice;
  $('alternatives').replaceChildren();
  $('score-explainer').textContent = isExample ? 'example only' : 'relative image/text scores';
  if (!isExample && alternates.length) {
    for (const alt of alternates.slice(0,3)) {
      const el = document.createElement('div'); el.className='alternative';
      const name = document.createElement('span'); name.textContent=alt.item;
      const group = document.createElement('small'); group.textContent=streams[alt.stream].title;
      const score = document.createElement('b'); score.textContent=`${(alt.score*100).toFixed(1)}%`;
      el.append(name,group,score); $('alternatives').append(el);
    }
  } else {
    const el = document.createElement('div'); el.className='alternative empty-alt';
    el.textContent = isExample ? 'Choose another example or upload a photo for a real AI prediction.' : 'No additional matches available.';
    $('alternatives').append(el);
  }
  $('result-notice').textContent = isExample
    ? 'Demonstration only. This is a predefined example, not an image recognition result.'
    : 'Experimental output. Percentages are relative CLIP scores, NOT probabilities of correctness. Confirm disposal according to local rules.';
  if (window.innerWidth < 800) $('result-body').scrollIntoView({behavior:'smooth',block:'nearest'});
}

async function loadClassifier() {
  if (classifierPromise) return classifierPromise;
  classifierPromise = (async () => {
    setStatus('Loading the AI model for the first time. This downloads model data; an internet connection is required…');
    const {pipeline, env} = await import(/* @vite-ignore */ CDN);
    env.allowLocalModels = false;
    // q8 uses smaller ONNX weights, suitable for CPU/WASM browser execution.
    return pipeline('zero-shot-image-classification', MODEL_ID, {
      device: 'wasm', dtype: 'q8',
      progress_callback: (p) => {
        if (!p || !p.file) return;
        if (p.status === 'progress' && Number.isFinite(p.progress)) {
          setStatus(`Downloading AI model: ${Math.round(p.progress)}% (${p.file.split('/').pop()}). First use may take a little time.`);
        }
      },
    });
  })().catch((err)=>{ classifierPromise=null; throw err; });
  return classifierPromise;
}

async function classify() {
  if (!selectedFile || busy) return;
  busy = true; classifyBtn.disabled = true;
  classifyBtn.textContent = '⏳ Analyzing…';
  const request = ++currentRequest;
  try {
    const model = await loadClassifier();
    if (request !== currentRequest) return;
    setStatus('Comparing the photo with 42 waste-item descriptions…');
    const labels = items.map(x=>x[1]);
    const output = await model(selectedFile, labels);
    if (request !== currentRequest) return;
    const lookup = new Map(items.map(([item,prompt,stream])=>[prompt,{item,stream}]));
    const matches = (Array.isArray(output) ? output : [output]).map(r=>({ ...lookup.get(r.label), score:r.score })).filter(r=>r.item && Number.isFinite(r.score)).sort((a,b)=>b.score-a.score);
    if (!matches.length) throw new Error('The AI could not return an interpretable prediction.');
    presentResult(matches[0], matches.slice(1));
    setStatus('Done! AI prediction completed on your device.', 'ok');
  } catch (err) {
    console.error('WasteWise classification error:',err);
    setStatus('AI couldn’t load or analyze this image. Please check your connection and try again. The instant examples below still work.', 'error');
  } finally {
    busy=false;
    classifyBtn.textContent='✧ Analyze image →';
    classifyBtn.disabled=!selectedFile;
  }
}

$('choose-btn').addEventListener('click',()=>fileInput.click());
$('camera-btn').addEventListener('click',()=>cameraInput.click());
dropZone.addEventListener('click',()=>fileInput.click());
dropZone.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();fileInput.click();}});
fileInput.addEventListener('change',(event)=>{chooseFile(event.target.files?.[0]); event.target.value='';});
cameraInput.addEventListener('change',(event)=>{chooseFile(event.target.files?.[0]); event.target.value='';});
for(const name of ['dragenter','dragover']) dropZone.addEventListener(name,(event)=>{event.preventDefault();dropZone.classList.add('dragging');});
for(const name of ['dragleave','drop']) dropZone.addEventListener(name,(event)=>{event.preventDefault();dropZone.classList.remove('dragging');});
dropZone.addEventListener('drop',(event)=>{chooseFile(event.dataTransfer?.files?.[0]);});
classifyBtn.addEventListener('click',classify);

for (const button of document.querySelectorAll('[data-example]')) {
  button.addEventListener('click',()=>{
    currentRequest += 1;
    selectedFile=null;
    resetPreview();
    classifyBtn.disabled=true;
    const example=examples[button.dataset.example];
    presentResult({...example}, [], true);
    setStatus(`Showing the ${example.item} educational example (not an AI prediction).`, 'info');
    if (window.innerWidth >= 800) $('result-title').scrollIntoView({behavior:'smooth',block:'center'});
  });
}

const categoryGrid = $('category-grid');
for(const stream of Object.values(streams)) {
  const card = document.createElement('article'); card.className='category-card';
  card.style.setProperty('--accent',stream.color);card.style.setProperty('--pale',stream.tint);
  const icon=document.createElement('div');icon.className='category-icon';icon.textContent=stream.icon;
  const title=document.createElement('h3');title.textContent=stream.name;
  const desc=document.createElement('p');desc.textContent=stream.short;
  card.append(icon,title,desc);categoryGrid.append(card);
}
