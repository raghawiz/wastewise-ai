# WasteWise AI — Vercel-ready waste sorting classroom website

A responsive, static website for solid waste management presentations. No backend, Python runtime, API key or paid service is required.

## Deployment to Vercel

**Option A — Import from GitHub (recommended)**

1. Extract this ZIP and add its three website files (`index.html`, `style.css`, `main.js`) to a new GitHub repository (at the root).
2. Open https://vercel.com/new and import the GitHub repository.
3. Framework preset: **Other**. Build command: **none**. Output directory: **.** (project root). Deploy.
4. Vercel supplies a `.vercel.app` link to open on your phone or projector.

**Option B — Vercel CLI**

From this extracted folder, run `npx vercel --prod` and follow login/setup prompts. For output directory select the project root. The site has no build step.

## Demo modes

- **Classroom examples** are hardcoded, instant examples, clearly marked `SCRIPTED DEMO · NOT AI`. Work immediately on site load.
- **Upload photo → Identify waste** uses the real zero-shot CLIP model (`Xenova/clip-vit-base-patch32`) with Hugging Face Transformers.js in the browser. The browser downloads model components on the first prediction; good internet is required for the initial load and CDN access.
- The model chooses the closest matching waste item from 39 descriptions, then maps that item to one of 6 waste streams. Similarity scores are not calibrated probabilities.

## Limitations

Educational proof of concept, not a validated sorter. It recognizes one main object and does **not** separate items in a pile, segment objects, move bins, or guarantee local disposal correctness. Recyclability varies by collection services and cleanliness. Special, sharps and sanitary waste require appropriate local handling; always follow current municipal advice.

## How to explain in class

1. Input is the photo.
2. A pretrained CLIP vision–language model compares image and text descriptions.
3. The top description identifies an example item.
4. A rules table converts that item into the corresponding waste stream.
5. The app displays waste category and disposal instructions.

## Sources

- https://huggingface.co/docs/transformers.js/api/pipelines
- https://huggingface.co/Xenova/clip-vit-base-patch32
