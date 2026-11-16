
import {pipeline,env} from '@huggingface/transformers';
import {candidates} from './data.js';
env.allowLocalModels=false;
env.backends.onnx.wasm.numThreads=1;
let classifier;
self.onmessage=async ({data})=>{
try{
if(!classifier)classifier=await pipeline('zero-shot-image-classification','Xenova/clip-vit-base-patch32',{device:'wasm',dtype:'q8',progress_callback:p=>{if(p.status==='progress')self.postMessage({type:'progress',file:p.file,progress:p.progress});}});
self.postMessage({type:'analyzing'});
const results=await classifier(data.image,candidates,{hypothesis_template:'a photo of {}'});
self.postMessage({type:'result',results});
}catch(e){classifier=null;self.postMessage({type:'error',message:e.message||'Model could not run.'});}
};
