# PuntoPunto security and dependency status — v0.9.8.8.18

## PDF.js upgraded

- Mozilla PDF.js **6.4.299** has replaced 3.11.174 in both distributions. The original core and worker files are SHA-256 checked **before** they are executed as trusted blob-based ESM modules. No external CDN.
- The migration preserves `isEvalSupported:false`, `enableScripting:false`, and `enableXfa:false` and the existing 30 MB PDF / 2,000-page limits.
- The offline version embeds the PDF.js engine, worker, CMaps, standard fonts and WASM resources; the GitHub Pages edition serves them locally in `vendor/`.
- Both formats have updated CSP definitions permitting only their own verified local module/blob resources. CSP configured through HTML `meta` is not equivalent to the stronger HTTP CSP header, and cannot enforce `frame-ancestors`.
- A successful controlled Chromium HTML-injection test is **not** equivalent to a real GitHub Pages HTTPS or direct file:// test. End-to-end checks on actual origins and mobile browsers remain mandatory before release approval.

## Other considerations

- OXS processing, data storage, privacy model, project file formats, and catalog DMC are preserved from v0.9.8.8.13.
- Continue to export and verify JSON backups; storage availability depends on browser/origin and can fail under file://.
- Before inviting external testers, finish the privacy contact/controller information from the prior security report.

## Attribution

Mozilla PDF.js is used under Apache License 2.0; see `vendor/LICENSE-PDFJS.txt`. DMC palette attribution remains unchanged.

## Affidabilità dati — v0.9.8.8.18

Letture checksum e struttura, recupero copia valida precedente e segnalazione degli errori sono stati rafforzati. Il backup JSON esterno continua a essere necessario: un browser può cancellare l'intera origine (inclusi principale e backup) o negare permessi/quotas. Nessun contenuto OXS/PDF è trasmesso a un servizio esterno. I test automatici con storage simulato non garantiscono la persistenza reale su file://, HTTPS o iOS/Android.
