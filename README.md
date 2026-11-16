# WasteWise AI
A React/Vite application for assisted household-waste segregation. Real browser-side CLIP inference; no backend, secrets, filename classifiers or fake fallback predictions.

## Run
Node 22+:
```sh
npm ci
npm run dev
npm test
npm run build
npm run preview -- --port 5173
```
Vercel: import this repository, use Vite, `npm run build`, output `dist`. No environment variables are required. Deploy a preview and test it before promoting to production.

## Architecture / presentation
1. A JPG, PNG or WebP image (maximum 12 MB) is decoded and resized locally to a maximum of 1024 pixels.
2. A Web Worker loads quantised `Xenova/clip-vit-base-patch32` through Transformers.js 3.8.1 and ONNX WebAssembly.
3. CLIP embeds the image and candidate descriptions, then ranks relative matches. The catalogue contains 27 household item descriptions plus out-of-scope descriptions.
4. Scores are candidate-relative softmax scores, not calibrated confidence. A top score below 0.5, a top-two gap below 0.08, or an out-of-scope winner triggers review. These are uncalibrated heuristics, not guarantees.
5. The user confirms or corrects the identity and condition. A separate rules layer supplies disposal guidance. Chemical contamination overrides ordinary recycling.
6. Model/network errors produce an error, never a fabricated classification.

Photos are not sent to a model API. Model downloads contact Hugging Face; typography loads from Google Fonts. There are no per-scan API fees, but browser download, memory and hosting costs still exist. Initial downloads can be substantial (the WASM runtime alone is ~21.6 MB uncompressed plus model weights). Runtime and weights can be cached by the browser; offline operation is not guaranteed.

## Files
- `src/main.jsx`: upload, drop, camera, confirmation/correction and education UI.
- `src/worker.js`: real inference in a background worker, cancellation via termination.
- `src/data.js`: item descriptions, explicit handling policies and review heuristics.
- `src/style.css`: responsive layouts, bin illustrations and reduced-motion support.
- `tests/policy.test.js`: mapping, contamination and unknown-output tests.
- `tests/browser-workflow.mjs`, `tests/inference.mjs`: browser verification scripts. Install Chromium with `npx playwright install --with-deps chromium`. Inference fixtures are downloaded separately; they are not bundled into the app.

## Limitations
This is an assisted identification tool, not a certified waste classifier. CLIP was not trained specifically for these six disposal categories. It can confidently misidentify objects, cannot establish chemical contents, contamination, food safety or local recycling acceptance, and does not perform multi-object detection. Users must confirm one main item per image and verify identity. Six educational categories do not imply six mandated municipal bin colours. Use specialised routes for batteries, electronics and special-care waste.

The 2026 Indian SWM framework uses wet, dry, sanitary and special-care collection streams; batteries/e-waste have separate applicable rules. Guidance is deliberately conditional on local collection and acceptance.

## Model selection
CLIP has documented Transformers.js ONNX support and successfully ran real browser inference in this project. An experimental MobileCLIP-S2 pipeline failed to load in the tested configuration and was not selected. Hosted vision APIs were not used: no suitable configured API credential was established, and an API would introduce image transfer and per-request costs. No model accuracy claim is made; see TEST_REPORT.md.

## Sources
- https://huggingface.co/Xenova/clip-vit-base-patch32
- https://huggingface.co/docs/transformers.js/api/pipelines
- https://www.swm.cpcb.gov.in/
- https://www.pib.gov.in/PressReleasePage.aspx?PRID=2219676
- Test photos: TrashNet (Gary Thung / Mindy Yang), mirror https://github.com/Ebuka24Stephen/trashnet-dataset
- Additional diagnostic photos: https://huggingface.co/datasets/UdaraChamidu/Garbage-Classification-with-12-classes

## Presentation explanation
“The vision model compares image features with text descriptions. A separate policy layer translates a user-confirmed item into a disposal route. The model does not know our local collection rules. We deliberately separate recognition, human confirmation and handling advice, and show uncertainty rather than treating a similarity score as accuracy.”

### Reproduce browser checks
Run `python3 tests/download_fixtures.py` (downloads a ~251 MB archive), start `npm run preview -- --port 5173` after building, then run `node tests/inference.mjs` and `node tests/browser-workflow.mjs`. Test screenshots remain local.
