# WasteWise AI — presentation notes

## What the application does
WasteWise accepts a photograph of one main item, runs a real vision model in the browser, presents possible identities, and asks the user to confirm the material and condition before showing disposal guidance.

## Explain the pipeline
1. **Image:** Upload, drag and drop, or capture a photo. No filename-based prediction is used.
2. **Preprocessing:** Resize locally; the model then applies its own image preprocessing.
3. **Computer vision:** Quantised CLIP ViT-B/32 compares visual features with a catalogue of text descriptions through ONNX WebAssembly.
4. **Suggestion:** Show the closest descriptions. Relative scores are not calibrated probabilities of correctness. Low or ambiguous matches require review, but even strong matches can be wrong.
5. **Human confirmation:** Correct the item and specify contamination. A separate rules layer supplies handling guidance.

## Six educational categories
Wet/biodegradable; dry/recyclable; dry/non-recyclable; hazardous; e-waste; sanitary. These are teaching categories, not a claim that every Indian municipality uses six bins or identical colours. Follow local acceptance and special-waste collection rules.

## Why segregation at source matters
Food and liquids can contaminate otherwise recyclable materials. Separating organic material enables suitable composting or biogas processing. Containing sanitary waste protects workers. Batteries, chemicals and electronics need specialised collection routes.

## An honest demonstration
Open the preview while signed into the owning Vercel account. Use a clear photo of one item, confirm the single-item checkbox and run Identify waste. Explain that the first scan downloads model files. Review alternatives, confirm or correct the item, then show the disposal card. Demonstrate a manual correction and the contamination override.

## What testing showed
The interface, production build and handling-rule tests passed. Real-photo tests included correct cardboard, glass, paper and battery suggestions, but a squeeze bottle and small packaging were misidentified. A banana image was labelled as a peel. The test report lists all ten diagnostic outcomes. This is not a held-out accuracy benchmark; no accuracy percentage should be quoted.

## Current status and next improvement
This is a working assisted-sorting preview, not a validated autonomous waste classifier. Production promotion is held. A release-quality next step is to evaluate a stronger supported vision model or fine-tuned waste model on a separate, labelled set covering all six categories and non-waste inputs, then validate the complete deployed workflow on mobile hardware.
