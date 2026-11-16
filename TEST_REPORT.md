# Verification report — 17 November 2026
Environment: Vercel remote sandbox, Node 22, 2 vCPUs / 4 GB; headless Chromium 159 through Playwright 1.65.1. Desktop 1440×1000 and mobile 390×844. These results are diagnostic, not a representative accuracy benchmark.

## Executed
- Production Vite build passed.
- All five Node policy tests passed again after the final catalogue changes.
- Upload/preview, unsupported MIME and corrupt image rejection exercised through the real UI.
- Desktop/mobile screenshots captured and their hero/upload areas visually reviewed. Both had no horizontal overflow.
- Ten real photographs processed by the actual WebAssembly worker; no inference mocking.
- Manual correction produced “MANUALLY CORRECTED”; chemical contamination produced hazardous guidance.
- No uncaught browser page errors in the ten-photo run.

Additional browser checks passed: simulated camera capture, drag-and-drop preview, cancellation, blocked-model-download error with no prediction, oversized-file rejection, guide filtering, pipeline interaction, and no overflow at 320/390/768/1440 pixels.

## Final CLIP diagnostic results
| Photo | Actual visual content | Top suggestion | Review flag |
|---|---|---|---|
| TrashNet cardboard1 | Cardboard | Cardboard box | Standard confirmation |
| TrashNet glass1 | Glass bottle | Glass bottle | Standard confirmation |
| TrashNet plastic1 | Sports/squeeze bottle | Fluorescent lamp — incorrect | Needs review |
| TrashNet metal1 | Metal food can | Metal drink can — subtype incorrect | Standard confirmation |
| TrashNet paper1 | Newspaper | Paper / newspaper | Standard confirmation |
| TrashNet trash1 | Small carton/packaging | Plastic bottle — incorrect | Needs review |
| battery1 | AA cells | Battery | Standard confirmation |
| battery10 | Laptop battery | Battery | Needs review |
| biological1 | Whole bananas | Banana peel — subtype incorrect | Standard confirmation |
| biological10 | Insect | No reliable waste match | Needs review |

Final run: first inference including model preparation 11.2 s; later inferences 1.59–1.87 s in this environment. These are not mobile-device performance promises. A high relative score is not a correctness guarantee. All disposal recommendations require user confirmation.

## Failures and limits
- Initial browser package 1.56.1 did not support the remote Ubuntu release. Updated to 1.65.1 and installed browser system dependencies.
- A catalogue edit briefly caused a syntax/build failure; corrected before the final successful build.
- MobileCLIP-S2 failed through the selected pipeline. The UI showed a real error and no fallback prediction; it was excluded.
- A further SigLIP2-base comparison also failed through the browser pipeline. It was not selected or deployed. The underlying runtime failure has not been diagnosed.
- The initial CLIP catalogue mislabelled the squeeze bottle as a battery and the insect as a chemical container. The revised catalogue/review gate improved rejection but did not solve all recognition errors.
- The diagnostic images influenced descriptions/review policy; they are not an untouched holdout set.
- Physical phone cameras, Safari/iOS, low-memory devices, and real sanitary/electronic photographs have not been validated. Category-rule tests do not substitute for image tests.
- Browser camera simulation verifies UI plumbing only, not hardware compatibility.
- Do not present this as a proven accurate autonomous classifier.

## Release status
The source commit 7a603972220555c4f2d418924aeb61235f49e9df built successfully on Vercel as deployment dpl_8gi7woYeQU5d17iisr7vd263Y5Wp. An authenticated HTTP fetch returned the expected HTML and matching production JavaScript/CSS asset hashes. The preview is protected by Vercel sign-in. A later cloud-browser attempt using a share link was blocked by automatic approval review; it did not verify that deployed page interactively.

Production has not been replaced. The release is held because the real-photo diagnostics still contain identity and category errors, and sanitary/electronic photos have not yet been tested. The UI and rules layer are implemented; the requested identification reliability has not been established.
