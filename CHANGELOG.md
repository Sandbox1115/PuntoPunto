## 0.9.8.8.18 — 28 ottobre 2026 (UX e accessibilità; distribuzione GitHub Pages)

- Navigazione da tastiera della griglia OXS: frecce, Shift+frecce (10 caselle), Home/End, Invio/Spazio per segnare. La scelta dei punti sovrapposti rimane esplicita; il cursore tastiera non modifica progressi o backup.
- Focus visibile per link, pulsanti, menu, campi e aree interattive. Casella attiva evidenziata sulla tela OXS; posizione comunicata anche in testo accessibile IT/EN.
- Stato `aria-expanded` coerente sulle barre laterali, selezione «Tutti i colori» esposta tramite `aria-pressed`; comunicazione degli errori più urgente per tecnologie assistive.
- Ripristino del focus e navigazione Tab contenuta nella finestra iniziale PDF e nella guida PDF, conservando il comportamento Escape.
- Preferenza sistema «riduci movimento», supporto ai colori forzati e dimensione minima dei controlli principali sui touchscreen.
- Nessuna modifica ai formati OXS/JSON, ai backup, alla semantica dei punti sovrapposti o a PDF.js 6.4.299.

## 0.9.8.8.17.1 — 28 ottobre 2026 (correzione spunte OXS sovrapposte; non pubblicata)

- Corretto il rendering dei punti sovrapposti nell'editor OXS: marcando la seconda voce (per esempio croce intera e mezzo punto) compare una spunta visibile anche se l'altro punto viene disegnato successivamente sopra la casella.
- A zoom sufficiente gli indicatori di completamento occupano posizioni distinte per i punti sovrapposti; il pannello di scelta mantiene l'indicazione esatta per ciascun punto. A zoom molto basso rimane un indicatore generale di completamento, per evitare badge illeggibili.
- Invariati identificatori dei punti, formato OXS/JSON, salvataggi, filtri, funzionalità mobile, PDF.js 6.4.299 e catalogo DMC. Nessuna modifica al repository GitHub.

## 0.9.8.8.17 — 28 ottobre 2026 (rifiniture OXS; non pubblicata)

- Barra rapida OXS: filtri attivi visibili, solo punti da ricamare, azzeramento filtri, annullamento ultimo gesto di marcatura e ritorno all'ultimo punto lavorato.
- Su smartphone pulsante «Schema» per tornare alla tela e pulsante di rientro dai pannelli Avanzamento e Filati.
- Vista OXS conservata per impronta del progetto (centro, zoom, ultimo punto) in una preferenza localStorage indipendente; nessuna alterazione ai progressi salvati e ai JSON/OXS.
- La funzione annulla agisce esclusivamente sulla marcatura dei progressi, non sulle modifiche allo schema; non è una cronologia persistente.
- Nessuna modifica al motore PDF.js 6.4.299, ai salvataggi della 0.9.8.8.15, al catalogo DMC o agli esempi; release non pubblicata.

## 0.9.8.8.16 — 28 ottobre 2026 (editor PDF ottimizzato per smartphone; non pubblicata)

- Su telefoni (max 700 px) l'editor PDF apre in vista ampia, con strumenti rapidi persistenti sopra lo schema e palette filati apribile da un pannello dedicato.
- Le azioni secondarie sono raccolte in un menu mobile; «Salva progetto» e zoom restano sempre visibili. Nessuna perdita di accesso a JSON, OXS, guida e uscita.
- Una pressione singola modifica soltanto al rilascio; il pinch con due dita ingrandisce e sposta lo schema senza contrassegnare involontariamente caselle.
- Selezionando «Punti» senza filato si apre la legenda; dopo la scelta del filato torna la visualizzazione dello schema. Etichette bilingui, touch target e flusso della schermata di impostazione griglia migliorati.
- Nessuna modifica ai dati, al formato OXS, ai salvataggi rinforzati v15, a PDF.js 6.4.299 o alla logica di import/export. Nessun deploy senza approvazione.

## 0.9.8.8.15 — 27 ottobre 2026 (affidabilità salvataggi e recupero; non pubblicata)

- I salvataggi locali OXS e PDF ora verificano struttura e riferimenti prima del ripristino, oltre ai checksum: in caso di copia principale danneggiata si tenta quella valida precedente senza cancellarla.
- Il lettore PDF seleziona la copia più recente fra IndexedDB e fallback locale, purché valida; il ripristino indica all'utente quando conviene esportare subito il progetto JSON.
- I salvataggi PDF non vengono indicati come completati fino alla conferma della scrittura; segnalazione di operazioni ancora in corso prima della chiusura della pagina. I PDF recenti possono recuperare il precedente archivio integro.
- Ripristino OXS reso esplicito in caso di errore di archivio, evitando che una richiesta di recupero iniziale prevalga sull'apertura manuale dell'utente.
- Nessuna modifica ai formati OXS e PDF/JSON esportati, alla digitalizzazione, al catalogo DMC e al motore PDF.js 6.4.299. Privacy e salvataggio solo sul dispositivo invariati.
- Le copie del browser non sono backup permanenti: test su HTTPS reale, file:// e interruzioni del processo ancora richiesti prima del deploy. Eventuali conflitti tra schede restano da verificare su browser fisici.

## 0.9.8.8.14.1 — 27 ottobre 2026 (correzione traduzioni; non pubblicata)

- Tradotti i due testi mancanti nell’editor PDF: «⤡ Vista normale» / «⤡ Normal view» e «Digitalizzazione manuale e avanzamento separati» / «Manual digitization and progress tracking are separate».
- Ripristinata la traducibilità del sottotitolo PDF dopo il passaggio da un progetto OXS (rimozione selettiva di `data-i18n-ignore`).
- Non modificati PDF.js 6.4.299, i file dei progetti, il catalogo DMC, il tracciamento, lo zoom o le funzionalità di salvataggio.
- Build da collaudare su browser reali prima di pubblicare.

## 0.9.8.8.14 — 27 ottobre 2026 (non pubblicata)

- PDF.js 3.11.174 sostituito da PDF.js 6.4.299, modulo ES + worker module verificati tramite SHA-256.
- Compatibilità GitHub Pages e standalone `file://` senza CDN e senza account.
- CMap, standard fonts e decoder WASM disponibili localmente; CSP aggiornata per moduli `blob:` verificati.
- Rimangono invariati formato OXS, coordinate griglia, salvataggi e logiche dell'editor.
- Build da convalidare con i test E2E della release originale prima di approvare la pubblicazione.

## v0.9.8.8.13 — Stability and security audit (pre-release, not published)
- Audited all shipped assets and documented the current PDF.js risk profile and a separate migration plan (see `SECURITY_NOTES.md`). PDF.js 3.11.174 is **not** upgraded in this release; known CVE-2024-4367 remains mitigated by `isEvalSupported:false`.
- Enforced same-origin PDF.js script integrity via SRI and strict library/worker version expectations; no CDN fallback.
- Added SHA-256 comparison for the 489-color bundled DMC JSON when WebCrypto is available; revalidate instead of force-cache to avoid stale catalogs. Cached structurally valid catalog remains a fallback when the network is unavailable.
- Improved IndexedDB transaction completion and handling of blocked/version-change connections; preserved existing project schemas and JSON backups.
- Capped supported PDF page counts to prevent huge page selectors consuming resources; input size limits unchanged.
- Updated release copy and regression checks without changing the OXS/PDF data format or the touch UI.
- Deliver both GitHub Pages and standalone `index.html` builds for approval; no GitHub publication without consent.

## v0.9.8.8.12 — Touch-friendly file import on the home screen (published 2026-10-27)
- On phones (up to 620 px), replaced the desktop drag-and-drop panel with two accessible, full-size **Open OXS / Open PDF** buttons and a short prompt. Buttons use the existing file pickers, and PDF/OXS validation is unchanged.
- On desktop, preserved the existing drop area and keyboard access. The welcome PDF quick link is hidden only on phones to avoid duplicate actions.
- Added bilingual IT/EN wording and preserved the previous OXS mobile progress/threads layout, pinch-to-zoom, and focus mode.
- Supplied separate GitHub Pages and double-clickable local packages. **Published on GitHub following explicit owner approval.**

## v0.9.8.8.11 — OXS mobile progress and thread panels (preview; not published)
- Replaced tiny phone-only header actions with two full-size buttons below the OXS canvas: Progress and Threads and filters.
- On phones, moved the existing live progress and legend panels beneath the editor, accessible by natural vertical page scrolling. No duplicated project state or loss of color/stitch filtering.
- Made progress concise (smaller donut, totals side by side), kept a scrollable color list and full filtering controls with readable touch targets.
- Kept desktop/tablet sidebars unchanged; panels restore their original position when leaving OXS, switching to PDF, or resizing to a wider screen.
- Focus mode still prioritizes the entire screen for the OXS canvas; pinch-to-zoom and JSON backups are unchanged.
- Bilingual IT/EN mobile navigation. No changes to user files, OXS/PDF codecs, or external services.
- **GitHub publication withheld pending explicit user approval.**

## v0.9.8.8.10 — Complete English Licenses & Attributions (unpublished preview)
- Fixed partially untranslated content in `licenze.html` by providing two complete, mutually exclusive IT/EN language versions. Every heading, paragraph, label, navigation link and the third-party pattern notice has an English equivalent.
- The IT/EN switch updates the visible document immediately; inactive-language content is not displayed or exposed by assistive technology. The browser title and meta description also follow the selected language.
- Kept source attributions, links, DMC/CC BY 4.0 and PDF.js/Apache 2.0 license information, legal qualifications, and the GitHub Issues disclosure aligned across languages.
- No change to OXS/PDF project formats, touch controls, DMC dataset, library binaries, or user data processing.
- This version is not published to GitHub without explicit approval.

## v0.9.8.8.9 — Mobile OXS gestures and focus view (preview, not published)
- Pinch-to-zoom with two fingers; midpoint anchored scaling and two-finger panning.
- Touch edits/markings are deferred until release; when a second touch arrives, pending edits are canceled.
- New Hide interface / Show controls buttons maximize canvas space on mobile and desktop.
- Focus closes all side overlays, preserves zoom and pattern center, and resets when leaving the OXS editor.
- Extended IT/EN labels, tutorials and guides. Server and local distributions remain separate.
- Not published to GitHub pending approval.

# v0.9.8.8.8 — Optional guide, complete home reset and mobile layout

- The home guide is opt-in, with an ordinary, prominent PuntoPunto-styled button; no automatic modal on first visit or reload.
- Closing an OXS clears the thread legend, stitch-type filter/list, search, selection, progress and pattern statistics back to the genuine empty-home state. This does not delete saved backups or progress.
- Home hero artwork and its labels use a non-overlapping vertical layout on narrow screens, including Xiaomi-size viewports.
- IT/EN tutorial CTA, docs and distribution manifests updated. GitHub has not been changed; deployment requires owner approval.

# v0.9.8.8.7 — Guided home and safe project exit

- Home-page onboarding in Italian and English for OXS tracking, PDF manual grid/digitization, saving, backups, copyright and help. Reopen from home.
- OXS editor: explicit Close project and return home, confirmation before leaving, in-memory state cleanup, auto-resume pointer removal; existing saved browser projects/progress are not deleted.
- PDF editor: brand/logo and Close show a save/export warning before returning home; Cancel preserves the editor.
- Navigation is handled in-app rather than reloading via the logo, reducing accidental state loss.
- Keep both GitHub Pages and direct-index offline distributions, without changing the published repository.

# 0.9.8.8.6 — GitHub Issues as the official beta support channel

- Added public GitHub Issues feedback/support links to the app footer, Privacy, Licenses, and English/Italian guides.
- Added IT/EN messaging explaining that issues require a GitHub account and are visible to everyone.
- Kept GitHub Discussions disabled; no private email or owner identity was added.
- Preserved the warning that a private privacy-contact method and formal controller details remain outstanding.
- No changes to OXS, PDF.js, IndexedDB, DMC catalog or sample content.

# CHANGELOG — PuntoPunto

## 0.9.8.8.5 — GitHub Pages publication review (26 October 2026)

- Prepared public deployment files and an English `README.md` with English user instructions.
- Audited Italian/English web copy; corrected out-of-date third-party license wording and links.
- Verified that both sample files and the DMC catalog are packaged; retained GitHub Pages relative asset paths.
- Screened the distribution for credentials, email addresses, personal paths and non-public work artifacts.
- No OXS/PDF project format changes. Deployment and privacy-contact sign-off remain pending.


## 0.9.8.8.4 — Apertura OXS/PDF esplicita e pulsanti uniformi (23 ottobre 2026)

- «Apri OXS» apre soltanto `.oxs` e `.xml` OXS: eliminata la possibilità di selezionare o instradare PDF tramite questo pulsante, anche se il file viene fornito forzatamente.
- «Apri PDF» rimane il solo pulsante per scegliere PDF. Il trascinamento nell’area iniziale mantiene il supporto a entrambi i formati ed evita il doppio avvio dovuto alla propagazione dell’evento.
- «Apri PDF» e «Apri OXS» adottano lo stesso stile verde e icone documento distinte; chiarita la scelta nella schermata iniziale.
- Nuove stringhe tradotte in inglese, senza modifiche ai formati OXS/JSON o ai motori PDF/IndexedDB.
- Test automatici sul routing dei file, i controlli e la resa responsive.

## 0.9.8.8.3 — hardening e pacchetto essenziale (23 ottobre 2026)

- Audit di bug, dipendenze e superfici di iniezione su OXS/PDF/JSON, browser storage e siti statici.
- Content Security Policy contro script inline e remoti non autorizzati; eliminato l’handler HTML inline del tutorial.
- Eliminato il fallback CDN di PDF.js e del catalogo DMC: risorse distribuite e verificate localmente.
- PDF.js: `isEvalSupported:false`, `enableScripting:false`, `enableXfa:false` in lettura e diagnostica. Rimane da migrare la libreria 3.11.174.
- Corretto il builder Pages che ometteva dipendenze necessarie alla diagnostica; le diagnostiche vengono ora distribuite separatamente al sito pubblico.
- Distribuzione utenti selettiva: i due esempi, asset necessari, documentazione, versioning, tutorial e attribuzioni. Esclusi screenshot, script e test interni.
- Documentazione Privacy/Licenze allineata al funzionamento locale senza download automatici di script da terze parti.
- Documentata la prova funzionale in ambiente sintetico e i limiti della verifica HTTP/HTTPS reale.

# PuntoPunto — CHANGELOG

Cronologia consolidata delle versioni. Il contenuto storico dei precedenti `README_V*.md` è riportato nelle sezioni dettagliate sottostanti; non sono più distribuiti README distinti per release.

## v0.9.8.8.3 — Quattro quarti riconoscibili nell’editor PDF (23 ottobre 2026)

- Sostituiti i quattro simboli a freccia simili (`↖ ↗ ↙ ↘`) con indicazioni di **quadrante** (`◤ ◥ ◣ ◢`) e nomi espliciti in italiano/inglese.
- Disegno PDF a geometria reale: ogni quarto mostra il tratto **dal centro all’angolo interessato** e un marcato punto sull’angolo, anziché una freccia testuale. Invariati i codici `quarterNW/NE/SW/SE` e la serializzazione OXS/JSON.
- Aggiunto un selettore visivo compatto dei quattro angoli, disponibile quando si usa un quarto, con stato attivo, supporto tastiera e traduzione IT/EN.
- Verifica geometrica dei quattro orientamenti, integrità della distribuzione e regressione sulle funzionalità principali. Da confermare in browser reale prima dell’aggiornamento GitHub Pages.

## v0.9.8.8.1 — Interfaccia bilingue e simboli distinti (23 ottobre 2026)

- Selettore **IT / EN** con italiano predefinito e preferenza locale. Tradotti menu, pulsanti, messaggi dinamici, editor OXS/PDF, guida, disclaimer, Privacy, Licenze e pagine diagnostiche. Il marchio **PuntoPunto** e i dati importati non vengono tradotti.
- Nuovo modulo `i18n.js` con dizionario offline incorporato; nessun tracciamento né chiamata a servizi di traduzione. La lingua viene conservata in `localStorage` e non è inclusa nei file progetto.
- Mezza croce rappresentata con un singolo segmento diagonale; punto diagonale con due tratti paralleli. Segni distinti anche in legenda e menu (`╱`, `╲` contro `╱•`, `╲•`). Direzione e formato dati invariati.
- Introdotto layout mobile compatto del selettore, senza overflow a 320–1440 px nei test in-memory.
- Pubblicazione GitHub Pages aggiornata con `i18n.js` e manifest SHA-256; nessuna modifica ai motori di persistenza e al catalogo.
- Test in-browser simulati della UI bilingue e apertura OXS: 43/43 verifiche positive. **Resta necessaria la verifica reale del browser (diagnostica 6/6), in particolare per PDF.js e IndexedDB su HTTPS**.

## v0.9.8.8 — Migliorie richieste dai tester (23 ottobre 2026)

- **Editor PDF:** nuovo pannello filati comprimibile (inizialmente compatto); conserva visibili modalità e strumenti di digitalizzazione, liberando spazio alla griglia.
- **Editor PDF:** nuova modalità **Schermo ampio**, con ritorno alla vista normale dal pulsante o tramite `Esc`. Senza modifiche alla griglia o ai salvataggi.
- **Editor PDF:** croci parziali e diagonali presentano segni orientati differenti (`╱` / `╲`), mantenendo invariati i tipi salvati e l'esportazione OXS.
- **Editor OXS:** filtro per tipo di punto, attivabile dal menu o dalla legenda e combinabile con il filato; modalità monocromatica «Solo simboli» per leggere il tipo di punto indipendentemente dal colore.
- **Rispetto degli autori:** avviso discreto nell'editor PDF e chiarimento nella pagina Licenze per l'esportazione personale di schemi di terzi nei limiti di legge e il divieto di condivisione o rivendita non autorizzate.
- Aggiunto `stitch-visuals.js` per condividere i simboli, senza modificare il formato dati o i motori di persistenza; mantiene un solo `README.md` e un solo `CHANGELOG.md`.
- Nuove verifiche UI nella release su schermi desktop/mobile; conferma da completare sul browser reale e con PDF di ricamo veri.

## v0.9.8.7 — Preparazione GitHub Pages (22 ottobre 2026)

- Predisposta distribuzione statica per il repository `Sandbox1115/PuntoPunto`, raggiungibile dopo il deploy all'URL previsto `https://sandbox1115.github.io/PuntoPunto/`.
- Pacchetto separato GitHub Pages con soli HTML, CSS, JS, favicon, catalogo e licenze delle dipendenze; fuori dal sito pubblico test, rapporti, screenshot, progetti di esempio e script di sviluppo.
- Introdotto `.nojekyll` nella radice pubblicata; tutte le risorse interne mantengono URL relativi, funzionanti sotto `/PuntoPunto/`.
- Aggiunta meta `noindex,nofollow,noarchive` alle pagine HTML della beta. Indicazione ai crawler, **non protezione** del sito né garanzia di esclusione dai motori di ricerca.
- Uniformati font, peso, colore e sottolineatura dei collegamenti Privacy e Licenze in testata.
- Privacy aggiornata indicando GitHub Pages e la registrazione degli IP dei visitatori per sicurezza; link alle informative ufficiali. Da completare titolare e recapito di contatto prima della beta online.
- Aggiunti script riproducibili di creazione e verifica del pacchetto pubblico, con controllo di esclusione di materiali interni.
- Nessuna modifica ai motori OXS, PDF, IndexedDB, codec di progetto o catalogo DMC; la v0.9.8.6 ha riportato 6/6 verifiche browser nella sessione utente.

## v0.9.8.6 — Sezione Privacy e trasparenza (22 ottobre 2026)

- Nuova pagina autonoma `privacy.html` e foglio di stile dedicato `privacy.css`, coordinati all'identità grafica PuntoPunto.
- Spiegati funzionamento in-browser, salvataggi IndexedDB/localStorage, esportazioni locali, assenza di account, analytics, profilazione, pubblicità e scopi commerciali.
- Chiarita la distinzione tra dati dei progetti (non inviati ai server) e metadati tecnici delle richieste HTTP dell'hosting; dichiarati i fallback esterni di PDF.js, jsDelivr e GitHub se mancano gli asset locali.
- Link Privacy aggiunto alla testata desktop e al footer sempre accessibile anche su mobile; collegamento reciproco con Licenze.
- Aggiornati numeri di versione di diagnostica e collaudo, release-check, README e checklist. Nessuna modifica ai motori di OXS, PDF o salvataggio e nessun cambiamento del formato dei progetti.
- La versione 0.9.8.5 era una tappa di pianificazione per la beta, **non una release distribuita**.

**Passo prima della pubblicazione online:** completare nella pagina Privacy il titolare, il contatto e i dettagli tecnici dell'hosting effettivo (log, cookie tecnici, tempi e basi giuridiche). Non dichiarare anonimato assoluto a livello di rete.

## v0.9.8.4 — Identità PP e stabilizzazione (22 ottobre 2026)

- Nuovo monogramma **PP** a punto croce ispirato alla proposta B raffinata: SVG scalabile nella testata e risorse riutilizzabili; favicon SVG/PNG e icona touch.
- Intestazione del sito invariata quanto a spaziatura, testo e interazione: sostituita soltanto l’icona precedente.
- Preflight potenziato: verifica del manifesto SHA-256 dell’intero pacchetto, delle risorse grafiche e dell’archivio storico `CHANGELOG.md`.
- Test aggiuntivo per verificare struttura, resa del monogramma, favicon, header responsive e collegamenti delle pagine.
- Consolidati i dieci `README_V*.md` in questo file; istruzioni correnti mantenute in `README.md`.
- Non sono stati modificati formato dei progetti, motore OXS, PDF.js, IndexedDB o catalogo DMC.

### Verifiche di riferimento

- 0.9.8.2: diagnostica nativa **6/6 PASS** (Firefox 158; rapporti utente).
- 0.9.8.3: preparazione **3/3 PASS** e riapertura **6/6 PASS** (Safari 26.5; rapporti utente).
- Le verifiche automatiche v0.9.8.4 non sostituiscono un collaudo completo su browser/dispositivi reali.

## Versioni precedenti

### v0.9.8.3

Collaudo di persistenza in due sessioni browser, test di recupero backup e PDF con SHA-256; corretta precondizione del test E2E.

<details>
<summary>Documentazione storica integrale v0.9.8.3</summary>

#### PuntoPunto 0.9.8.3 — collaudo dei salvataggi tra sessioni

## Motivazione

La versione 0.9.8.2 ha superato tutti i sei controlli diagnostici in Firefox 158 sul localhost dell'utente. Tale prova ha verificato IndexedDB nativo *all'interno della stessa sessione*, non una chiusura completa e una successiva riapertura del browser.

È stata inoltre analizzata un'asserzione errata nel vecchio test `tests/test_e2e.py`. Il backup è **lo snapshot valido precedente**. Nel test vecchio la copia precedente poteva essere stata registrata prima dell'inserimento del primo punto; pretendere che contenesse un punto non era una precondizione verificata. Ora il test forza un ulteriore salvataggio completo dopo l'inserimento e controlla esplicitamente che la copia di sicurezza contenga un punto prima di danneggiare lo snapshot principale.

## Novità

- Nuova pagina `collaudo-persistenza.html` con due azioni, da eseguire in **due aperture separate** del browser.
- Fase 1: salva due progressi non banali con legenda, punti e caselle vuote; controlla snapshot corrente e copia precedente; archivia e verifica un PDF reale di 27.128 byte.
- Fase 2: riprende progressi, backup e PDF dalla memoria persistente; confronta il PDF originale mediante SHA-256; danneggia intenzionalmente uno snapshot e verifica il recupero della versione precedente; salva di nuovo senza cancellare il backup valido; altera i byte del PDF e verifica il rifiuto dell'integrità.
- Database **`PuntoPunto-Diagnostica-Persistenza-v0983`** distinto dal database applicativo `PuntoPunto`. I dati diagnostici vengono cancellati dopo il successo; un pulsante permette l'eliminazione manuale.
- Rapporti JSON separati delle due fasi; nuova versione visibile nell'interfaccia.
- Modifica del solo harness E2E per rendere corretta e riproducibile la precondizione del backup.

## Ambito e limiti

Non sono stati cambiati `pdf-project-store.js`, `pdf-tracker.js`, `pdf-manual.js`, `pdf-project-codec.js`, `app.js`, `pattern-edit.js`, risorse vendor, licenze, catalogo o formato dati. I test automatici con archiviazione simulata non possono dimostrare la persistenza fisica tra chiusura e riapertura: tale conferma deve provenire dalla fase 2 eseguita dall'utente in un browser reale. Il test non simula una perdita improvvisa di alimentazione durante una scrittura né garantisce conservazione dei dati se il browser elimina la cache di origine, viene usata la modalità privata o il dispositivo esaurisce lo spazio.

La verifica sul database diagnostico esercita il **medesimo `PuntoPuntoPDFStore`** del sito con un nome di database reindirizzato temporaneamente, senza toccare i dati utente. La ripresa effettiva tramite il pulsante «Riprendi ultimo PDF locale» del sito è un flusso applicativo aggiuntivo, non certificato automaticamente dal test indipendente.


</details>

### v0.9.8.2

Correzione trasferimento ArrayBuffer al worker PDF.js nel diagnostico; mitigato il falso errore IndexedDB.

<details>
<summary>Documentazione storica integrale v0.9.8.2</summary>

#### PuntoPunto 0.9.8.2 — correzione diagnostica IndexedDB

## Problema rilevato dall'utente

Il test browser di PuntoPunto 0.9.8.1 su localhost superava 5 controlli su 6. Il controllo «Salvataggi e recupero IndexedDB nativo» segnalava `attempting to access detached ArrayBuffer`.

## Diagnosi e correzione

`diagnostica.html` caricava il PDF d'esempio in `exampleBuffer`, poi passava `new Uint8Array(exampleBuffer)` a PDF.js. Quando PDF.js trasferisce quei byte al worker, l'`ArrayBuffer` originale può essere scollegato (detached). Il controllo successivo usava di nuovo `exampleBuffer` per salvarlo in IndexedDB e poteva fallire prima di interrogare il database.

Ora il rendering riceve `new Uint8Array(exampleBuffer.slice(0))`: la copia può essere trasferita al worker, mentre il buffer originale resta valido. Sono state aggiunte due verifiche preventive per intercettare regressioni simili.

**Ambito:** nessuna modifica a `pdf-project-store.js`, `pdf-manual.js`, `pdf-tracker.js`, `app.js`, OXS, editor e formato dei progetti. Le dipendenze PDF.js/DMC e i loro hash SHA-256 sono invariati.

## Istruzioni

Da questa cartella:

```bash
python3 check-release.py
python3 -m http.server 8000 --bind 127.0.0.1
```

Visita `http://localhost:8000/diagnostica.html` e scegli **Esegui i controlli**, quindi **Scarica rapporto JSON**.

**Validazione residua:** i test sul database IndexedDB nativo necessitano di un browser reale con accesso HTTPS/localhost. I test simulati non sostituiscono quella verifica. Un risultato 6/6 nel tuo browser confermerebbe l'esito di questi specifici controlli, non automaticamente la compatibilità generale di tutte le piattaforme.


</details>

### v0.9.8.1

Rafforzamento controlli diagnostici: PDF.js e worker reali, sicurezza eval disattivata, database IndexedDB.

<details>
<summary>Documentazione storica integrale v0.9.8.1</summary>

#### PuntoPunto v0.9.8.1 — collaudo post-installazione + sicurezza

Release correttiva derivata dal pacchetto **v0.9.8-PASS** fornito dall'utente, con le tre dipendenze locali installate e verificate.

## Modifiche

- Mitigazione **CVE-2024-4367**: PDF.js `getDocument()` riceve `isEvalSupported:false`, con `enableScripting:false` come misura aggiuntiva.
- `check-release.py` ora rifiuta il pacchetto se manca la mitigazione.
- Inclusa la pagina **diagnostica.html** per verificare PDF.js, DMC e salvataggi IndexedDB nel browser vero.
- Nessuna modifica al lettore OXS, editor e al formato dei progetti.

## Collaudo locale

```bash
python3 check-release.py
python3 -m http.server 8000 --bind 127.0.0.1
```

Nel browser apri `http://localhost:8000/diagnostica.html` e scegli **Esegui i controlli**. Da lì puoi scaricare il rapporto JSON. Il test IndexedDB utilizza un database separato, non altera i tuoi progetti.

**Importante:** il pacchetto non va dichiarato stabile prima del test browser finale e dell'aggiornamento a una versione PDF.js supportata. Per i risultati e i limiti di quanto già verificato vedi `RAPPORTO_COLLAUDO_V0981.md`.


</details>

### v0.9.8

Integrazione delle risorse PDF.js e DMC locali, file di lock SHA-256, preflight di rilascio e diagnostica.

<details>
<summary>Documentazione storica integrale v0.9.8</summary>

#### PuntoPunto v0.9.8 — protezione dati e dipendenze locali

## Novità implementate

- Nuovo `pdf-project-store.js`: database IndexedDB v2, con salvataggio asincrono dei progetti PDF, verifica SHA-256, copia precedente e recupero da corruzione; in caso di indisponibilità usa il vecchio salvataggio protetto in localStorage con avviso.
- **Migrazione senza conversione distruttiva**: legge ancora snapshot e salvataggi delle versioni precedenti. Il vecchio formato progetto JSON scaricabile è immutato.
- I **PDF originali** possono essere memorizzati separatamente in IndexedDB (fino al limite di caricamento del sito). Il pulsante *Riprendi ultimo PDF locale* compare nella schermata iniziale se è disponibile un PDF integro nel browser; la griglia e i progressi sono recuperati dal salvataggio esistente.
- Scritture raggruppate per ridurre l'utilizzo del disco, con tentativo di completamento quando la pagina diventa nascosta; avviso se la scrittura non riesce.
- Compatibilità del database OXS preesistente: database `PuntoPunto` aggiornato alla versione 2, conservando lo store `projects`.
- Preferenza al catalogo DMC locale, anziché a una vecchia copia nella cache. Le reti remote restano un fallback di compatibilità se non sono installati i file locali.
- Installazione controllata delle risorse di terzi: `setup-vendor.py` verifica PDF.js 3.11.174, il relativo worker e il dataset MakeBead da 489 voci, registrando gli hash in `ASSET_LOCK.json`. `check-release.py` blocca la distribuzione se non sono presenti copie integre.

## Passaggi obbligatori prima di distribuire

Da una macchina con connessione Internet:

```bash
python3 setup-vendor.py
python3 check-release.py
```

Servi la cartella con HTTPS (o localhost durante il collaudo), **non aprire direttamente `index.html` tramite `file://`**. WebCrypto SHA-256 e IndexedDB hanno requisiti di contesto/origine e di browser; con `file://` il ripristino avanzato può non funzionare.

**Stato del pacchetto creato in questo ambiente:** le risorse PDF.js e MakeBead non erano scaricabili a causa dell'accesso di rete bloccato. Non si afferma che lo ZIP sia già indipendente dalla rete, né che PDF.js autentico sia stato collaudato. Altri file presenti sono quelli della release precedente, eccetto le modifiche documentate.

## Salvataggi: limiti e privacy

I dati IndexedDB restano nel dispositivo e nell'origine web. Cancellazione dei dati del browser, modalità privata, cambio browser o spazio pieno possono eliminarli; pertanto l'esportazione manuale JSON rimane la copia portatile raccomandata.

L'archiviazione locale del PDF non comporta upload del contenuto. I filati DMC sono dati indicativi su licenza CC BY 4.0: consulta `licenze.html`, `data/ATTRIBUZIONE-DMC.txt` e `ASSET_LOCK.json` una volta installato il catalogo.

## Test e limiti

Vedi `REPORT_TEST_V098.md`. I test Chromium automatizzati in questo ambiente non potevano navigare verso un origin HTTPS, quindi non dimostrano il comportamento completo dell'IndexedDB nativo o il rendering PDF.js reale. Questi restano gate di pubblicazione.


</details>

### v0.9.7

Selettore dei punti sovrapposti, esperienza touchscreen, regressione su 1000 schemi OXS e ottimizzazioni dell’editor.

<details>
<summary>Documentazione storica integrale v0.9.7</summary>

#### PuntoPunto v0.9.7 — selezione dei punti sovrapposti

La v0.9.7 è un aggiornamento circoscritto al **tracciamento dell'editor OXS**. Prosegue direttamente dalla v0.9.6. Il lettore, il salvataggio delle modifiche, il PDF interattivo e il suo esportatore OXS sono mantenuti.

## Come si usa

1. Aprire uno schema OXS e scegliere **Segna punti**.
2. Toccare/cliccare sul punto da segnare. Se vi sono più elementi nella zona toccata, compare un piccolo selettore con **tipo di punto, codice/nome filato e stato individuale**.
3. Toccare l'elemento corretto: soltanto quello passa da *Da fare* a *Fatto* (o viceversa).
4. Chiudere la scelta con **×**, **Esc** o cliccando fuori senza modificare il progresso.
5. Per segnare una sequenza di crocette, **trascinare**: il comportamento preesistente viene mantenuto. **Ctrl + clic** resta una scorciatoia opzionale per un punto speciale vicino al cursore, ma non è più necessario.

Il selettore può contenere nodi francesi, perline, punti scritti e altri punti speciali gestiti dal motore OXS. Quando un elemento è isolato, un tocco continua a segnarlo direttamente, senza aprire il menu. Le scelte possono essere effettuate anche con tastiera: prima opzione focalizzata, Tab per le successive, Invio per applicare, Esc per annullare.

## Modifiche tecniche

- `index.html`: contenitore del selettore, testo guida e tooltip aggiornato.
- `styles.css`: pannello fluttuante adattivo, pulsanti a dimensioni touch e indicatori di focus.
- `app.js`: rilevamento dei candidati nella stessa area; selezione individuale; distinzione tap/trascinamento; protezione dal *ghost click* generato dal browser dopo un vero tocco touchscreen.
- **Nessuna modifica** a `pattern-edit.js`, `pdf-tracker.js`, `pdf-manual.js`, `pdf-project-codec.js`, `dmc-catalog.js`, `storage-safe.js`, `pdf-assist.css`.

I dati di avanzamento restano nel salvataggio locale/JSON; nessun punto viene cancellato o modificato nello schema originale quando viene segnato come completo.

## Come rieseguire i controlli

Requisiti: Python 3, Playwright e Chromium installati.

```bash
python tests/test_picker_v097.py
python tests/test_touchscreen_v097.py
python tests/test_speciali_v097.py
python tests/regressione_rapida_1000_v097.py /percorso/PuntoPunto-OXS-regressione-1000
```

Il test `regressione_rapida_1000_v097.py` usa i **due corpus immutati** dei seed 20261022 e 20261117 e sottopone tutti i file al caricamento con il motore produttivo, al controllo di canvas, dimensioni, palette, punti e integrità SHA-256. È un test più rapido, **non equivalente** al ciclo completo caricamento/modifica/download/riapertura.

Il ciclo completo è eseguibile anche con `tests/test_oxs_500_v097.py`, specificando l'estrazione di un corpus in `PP_CORPUS_DIR` e la directory del sito in `PP_APP_DIR`. La suite originale rimane disponibile nell'archivio di regressione della v0.9.6.

## Distribuzione e limiti

- Nessun servizio remoto aggiunto dalla v0.9.7.
- Non verificata una sessione su un dispositivo fisico iOS/Android o Safari: gli eventi touch sono stati provati in Chromium con emulazione touchscreen reale.
- PDF.js e catalogo locale DMC non sono ancora inclusi completamente nel pacchetto; controllare `CHECKLIST_PUBBLICAZIONE.md`.


</details>

### v0.9.6

Ottimizzazione gestione dei punti speciali e strumenti per la revisione della griglia OXS.

<details>
<summary>Documentazione storica integrale v0.9.6</summary>

#### PuntoPunto v0.9.6 — punti speciali e regressione

Questa versione modifica il **solo lettore OXS** in `app.js` (oltre al tooltip del pulsante di completamento); non cambia i progetti PDF, l'esportatore PDF→OXS o le librerie.

## Cosa è cambiato

- Nodi francesi, perline, punti scritti/backstitch, quarti, diagonali, half verticali/orizzontali e fullcross diventano selezionabili per il completamento.
- Indicizzazione spaziale dei punti speciali, distinta dalle crocette; clic normale sceglie la crocetta se c'è sovrapposizione, **Ctrl + clic** sceglie il punto speciale. I punti speciali isolati restano selezionabili con clic normale.
- Il completamento continua a essere registrato nei dati di avanzamento del singolo elemento; il file OXS non viene sovrascritto dal progresso.

## Test

Sono stati impiegati 1000 schemi sintetici suddivisi in due corpus da 500 con seed diversi, manifest ed esiti individuali. Nel corpus A, la prima corsa sul primo tentativo di correzione ha totalizzato 498/500: le prove n. 399 e 451 hanno identificato ambiguità di sovrapposizione. La **correzione definitiva** è stata applicata e entrambe le prove sono passate al riesame. Il corpus B ha totalizzato 500/500. Il test separato di 11 tipologie è 11/11.

Conservare la suite separata `PuntoPunto-OXS-regressione-1000.zip` e rieseguirla nelle versioni successive.

**Limitazioni:** benchmark automatizzato Chromium su OXS sintetici, non prova visiva pixel-per-pixel né certificazione con software terzi; reali browser mobili da testare. Per distribuzione completamente offline restano da installare i file vendor documentati nella v0.9.5.1.


</details>

### v0.9.5.1

Verifiche sugli snapshot atomici, backup, quota del browser, migrazioni e round-trip del progetto; risultati del collaudo tecnico.

<details>
<summary>Documentazione storica integrale v0.9.5.1</summary>

#### PuntoPunto 0.9.5.1 — verifica e correzioni di compatibilità

## Correzioni rispetto a v0.9.5

1. **Testata smartphone e tablet:** pulsante «Progetto PDF» con icona e nome accessibile. Testata responsiva senza overflow orizzontale fra 320 e 1024 px. Le azioni mantengono `aria-label` per essere riconoscibili anche quando il testo viene nascosto. Sotto i 381 px il collegamento «Licenze» della testata è nascosto per fare spazio, ma rimane raggiungibile dal footer e dall'editor PDF.
2. **Licenza PDF.js:** inclusa una copia standard di Apache License 2.0 in `vendor/LICENSE-PDFJS.txt`, uguale alla licenza applicabile a PDF.js. Durante l'installazione delle librerie `setup-vendor.py` può sostituirla con il LICENSE del progetto Mozilla.
3. **Test:** esecuzione integrale del precedente E2E, nuovi casi di errore/corruzione, sette breakpoint e caricamento di un corpus locale da venti schemi OXS.

## Comandi

```bash
python3 tests/test_e2e.py
python3 tests/test_edge_cases.py
python3 tests/test_viewports.py
# Corpus opzionale NON ridistribuito in questo ZIP:
python3 tests/test_oxs_corpus.py /percorso/corpus-oxs.zip
python3 check-release.py
```

Per i test Playwright servono Python con `playwright` e Chromium installato. Gli script funzionano in questo ambiente amministrato mediante inserimento della pagina nel browser e mock della libreria PDF.js; per testare un sito HTTPS reale serve un'altra infrastruttura.

## Non ancora verificato

- **Dipendenze locali:** mancano `vendor/pdf.min.js`, `vendor/pdf.worker.min.js` e `data/dmc-floss.json` e non è stato possibile scaricarle da questo container per blocco DNS/rete.
- **PDF.js autentico:** non è stato provato il rendering di file PDF reali con la libreria 3.11.174 né l'effettivo caricamento in HTTP/HTTPS.
- **Browser multipli:** solo Chromium in modalità headless; non test fisici Firefox, Safari, Android/iOS.
- **Servizio online e conformità:** hosting HTTPS, privacy/strumenti legali richiesti dal gestore, performance e utenti pilota ancora da verificare.

Di conseguenza lo stato rimane **release candidate / beta privata sotto controllo**, non «pronta per il lancio».


</details>

### v0.9.5

Irrigidimento validazione input, verifiche dei progetti, test automatici e resilienza delle operazioni su PDF.

<details>
<summary>Documentazione storica integrale v0.9.5</summary>

#### PuntoPunto v0.9.5 — stabilizzazione

Versione di stabilizzazione basata su **v0.9.4**. Nessuna nuova funzione di riconoscimento PDF. Rimangono editor OXS, editor PDF manuale, legenda DMC/personalizzata e OXS esportabile a digitalizzazione completa.

## Cosa è cambiato

- **Salvataggi PDF:** una singola fotografia verificata dello stato, con checksum e una copia precedente recuperabile. La lettura dei tre salvataggi separati delle v0.9–v0.9.4 è preservata e i dati vengono migrati alla prima apertura.
- **Salvataggi OXS:** le modifiche e l'avanzamento sono scritti in uno snapshot verificato; sono ancora riconosciuti i precedenti salvataggi locali.
- **Gestione errori:** in caso di memoria piena o non disponibile compare un avviso leggibile. L'utente deve esportare il proprio progetto JSON. Il browser può avvisare in uscita dopo un errore di salvataggio. I PDF non validi vengono rifiutati prima di essere renderizzati.
- **Risorse locali prioritarie:** PDF.js 3.11.174 viene cercato in `vendor/`, il catalogo DMC MakeBead da 489 colori in `data/`. Il fallback online rimane per compatibilità e non trasferisce il PDF a un server. Le attribuzioni sono aggiornate in `licenze.html`.
- **Kit di rilascio:** `setup-vendor.py` scarica le risorse con licenze e `check-release.py` blocca un rilascio dichiarato autonomo se non sono presenti; `tests/test_e2e.py` contiene i test funzionali del browser.

## Importante: installazione delle dipendenze

Per ragioni di connettività del container che ha prodotto questo pacchetto, **i file di terzi NON sono inclusi nello ZIP**. È quindi una *release candidate*, non una distribuzione indipendente dalla rete completa.

Su una macchina con Internet, prima di pubblicare:

```bash
python3 setup-vendor.py
python3 check-release.py
```

Lo script scarica PDF.js e il suo worker **versione esatta 3.11.174**, il file di licenza e il dataset MakeBead CC BY 4.0. Sono riportate dimensioni e SHA256. Mantieni le attribuzioni. Se non esegui lo script, l'app tenta il download dalle fonti esterne e in assenza di rete segnala un errore esplicito (l'apertura OXS resta operativa).

**Pubblica come sito statico su HTTPS** (per esempio GitHub Pages o Cloudflare Pages); il doppio clic su `index.html` con URL `file://` può non permettere `fetch` e worker locali per restrizioni del browser. Per provare in locale usa `python3 -m http.server 8000` e vai a `http://localhost:8000`.

## Salvataggi e limiti

- Il browser conserva la griglia e le modifiche automatiche solo finché i dati locali non vengono cancellati. Esporta regolarmente **Salva progetto** (`.puntopunto.json`, include il PDF), specie dopo lavori lunghi.
- L'uso di modalità privata, pulizia dati del browser o spazio insufficiente può impedire il recupero; i backup manuali restano indispensabili.
- Il checksum verifica l'integrità della copia locale, non la conformità del progetto al disegno originale. In caso di corruzione della copia principale viene utilizzato il backup precedente; alcune ultimissime modifiche potrebbero mancare.
- L'esportazione OXS da PDF è disponibile solo se tutte le celle sono **definite oppure confermate vuote**. Essa è verificata rispetto al modello digitale, non all'originale PDF.
- I progetti `.puntopunto.json` della v0.9.1–v0.9.4 mantengono lo stesso formato. Le modifiche di salvataggio locale non cambiano il JSON esportato.

## Test eseguiti

- 100 confronti *write → verify* OXS, **1.433 punti totali**.
- Chromium: apertura ed esportazione OXS; scelta manuale griglia PDF; filato DMC simulato; marcatura punti, vuoti e progressi; esportazione JSON completo; riapertura; ripristino ordinario dello snapshot. La ripetizione della suite si è bloccata durante il controllo di recupero da corruzione; il test di quota e quello mobile vanno ripetuti.
- Limitazione: nel container di test è stato impiegato un **adattatore PDF.js** e un catalogo simulato per i test funzionali. **Non** è stato completato il collaudo con PDF.js reale e il catalogo scaricato, né un test multi-browser reale su Internet.

Vedi `REPORT_TEST_V095.md` per la tabella dei controlli e le attività ancora da chiudere prima del lancio.


</details>

### v0.9.2

Ricerca di 489 filati DMC MakeBead, filati personalizzati, attribuzioni/licenze e metadati di origine nei progetti.

<details>
<summary>Documentazione storica integrale v0.9.2</summary>

#### PuntoPunto v0.9.2 — catalogo DMC e attribuzioni

## Cosa cambia

- Nell’editor **Apri PDF** la legenda è divisa tra **Catalogo DMC** e **Colore personalizzato**.
- Cerca un filato scrivendo il **codice** (ad es. `310`, `666`, `Blanc`, `B5200`) oppure parte del **nome**. Scegli il risultato e premi «Aggiungi DMC».
- Il codice DMC e la descrizione vengono conservati insieme all'approssimazione HEX; **non** devi indovinare il colore dalla tavolozza.
- Per un produttore non catalogato o una tinta speciale, scegli **Colore personalizzato**, inserisci codice (univoco), eventuale nome e HEX.
- **Salva progetto** e **Progressi JSON** conservano i metadati dei filati, compresa l'origine DMC o personalizzata; **Esporta OXS** genera e verifica i filati, i nomi, le coordinate e i tipi di punto. La digitalizzazione resta manuale come nella v0.9.1.
- Nuova pagina **[`licenze.html`](licenze.html)**, accessibile dall'intestazione del sito e dall'editor.

## Catalogo, disponibilità e licenza

I 489 filati DMC (codici, descrizioni, colori sRGB indicativi) vengono richiesti tramite HTTPS dal dataset `dmc-floss.json` del progetto **craft-color-codes di MakeBead**, che dichiara la licenza **CC BY 4.0**. L'app verifica la struttura e l'esatta numerosità (489), poi conserva i dati nel browser tramite localStorage per gli utilizzi successivi. Se la connessione manca o il provider esterno non è raggiungibile, la **palette personalizzata continua a funzionare**. Il catalogo non è incluso fisicamente nello ZIP: **è necessaria una prima connessione alla rete** per caricarlo. PDF.js richiede già una connessione per il suo script CDN.

- Fonte: https://github.com/makebead/craft-color-codes
- Dati: https://raw.githubusercontent.com/makebead/craft-color-codes/main/data/json/dmc-floss.json
- Licenza dati: https://github.com/makebead/craft-color-codes/blob/main/LICENSE-DATA.md
- Licenza CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Fonte software PDF.js 3.11.174: https://mozilla.github.io/pdf.js/
- Licenza PDF.js: Apache License 2.0

Le rappresentazioni HEX sono approssimazioni digitali del filato fisico. DMC è un marchio del relativo proprietario. PuntoPunto e MakeBead sono prodotti indipendenti, non ufficialmente affiliati a DMC. L'attribuzione è riportata anche nella pagina pubblica di licenza.

## Compatibilità

- I progetti salvati con la v0.9.1 restano leggibili: i vecchi filati privi di dati di provenienza sono classificati **personalizzati**, senza attribuirli retroattivamente a DMC.
- I codici già inseriti restano invariati. Se un codice esiste già ma è associato a un altro filato o colore, l'editor impedisce di sovrascriverlo silenziosamente.
- Il codice DMC è l'identificativo del filato. L'OXS porta tale codice nel campo `number` e una descrizione con origine nel campo `name`.
- Il catalogo DMC non modifica né limita l'apertura di OXS da altri software.

## Avvio

Apri `index.html` su un sito statico HTTPS, oppure localmente dove il browser consente di caricare gli script CDN. Non occorrono account o database; i PDF e i progetti vengono elaborati nel browser e non caricati su un server applicativo. La connessione esterna al CDN delle librerie e dei dati può generare normali log di connessione del provider.

## Verifica prima del rilascio pubblico

Nell'ambiente di prova il download remoto non era disponibile: i test automatizzati del selettore hanno usato una risposta di rete simulata conforme alla struttura della banca dati da 489 filati. Prima di pubblicare il sito, prova il caricamento reale della palette e PDF.js nel browser definitivo e verifica licenze, eventuali avvisi dei pacchetti e obblighi legali/privacy dell'hosting.


</details>

### v0.9.1

Digitalizzazione manuale PDF: geometria griglia, legenda, tipi di punto, progressi e progetto completo JSON; export OXS verificato con parser indipendente. Nessuna conversione OCR o automatica.

<details>
<summary>Documentazione storica integrale v0.9.1</summary>

#### PuntoPunto v0.9.1 · digitalizzazione manuale PDF

La v0.9.1 è basata sulla v0.9. **Non reintroduce conversione automatica (A) o assistita (B)**. Non usa OCR, OpenCV o riconoscimento automatico dei simboli. Il PDF è visualizzato dal browser tramite PDF.js 3.11.174 caricato da CDN, quindi al primo avvio occorre una connessione per la libreria; il PDF non viene inviato a un server PuntoPunto.

## Guida rapida

1. **Apri PDF** e scegli manualmente pagina, area, colonne e righe. Correggi il rettangolo della griglia prima di confermare.
2. Nell'editor PDF premi **ⓘ Come funziona** per un tutorial in sei passaggi.
3. Aggiungi i filati della legenda inserendo codice e colore. Scegli **Assegna punto e filato**, seleziona un filato e il **tipo di punto**; quindi tocca le relative celle sul PDF.
4. Usa **Vuota confermata** per segnalare una casella priva di ricamo; **Da definire** per riportarla allo stato incerto. **Segna completamento** è uno strumento diverso e conserva soltanto i progressi di lavoro.
5. In **Salva progetto** scarichi un JSON portatile che contiene anche il PDF originale in Base64, pagina, rettangolo, griglia, legenda, punti, vuoti e avanzamento. Per riaprirlo usa **Progetto PDF** nella barra superiore oppure **Apri progetto** nell'editor PDF. Non serve un account.
6. Quando **tutte** le caselle della griglia sono state definite, si abilita **Esporta OXS**. PuntoPunto genera un OXS, lo rilegge con un parser XML indipendente e confronta coordinate, codici, colori e tipi di punto. Se differiscono, l'esportazione è bloccata.

## Informazioni utili

- Sono previsti tre stati delle caselle: punto assegnato, vuota confermata, da definire. Non basta segnare come ricamate le crocette per digitalizzarle.
- Con **Conferma tutte le altre come vuote** si dichiara esplicitamente che **ogni casella non ancora definita è vuota**. Controlla il PDF prima di usarlo.
- Tipi di punto digitalizzabili, uno per casella: croce intera, mezze croci in due direzioni, quarti di punto in quattro posizioni, punti diagonali in due direzioni, nodi francesi e perline.
- I tratti di **backstitch**, i punti sovrapposti nella stessa casella, le tavole multipagina da ricomporre e altre tecniche non sono digitalizzati dalla v0.9.1. Il programma **non** può certificare che l'utente abbia copiato fedelmente il PDF originale, ma soltanto che l'OXS riproduca i dati inseriti.
- L'export `.oxs` **non** incorpora il PDF né i progressi del ricamo: per conservarli usa **Salva progetto** o **Progressi JSON**.
- Il JSON dei progressi PDF ora è v3; sono ancora accettati gli export precedenti v1 e v2. Le vecchie assegnazioni manuali sono interpretate come crocette intere e devono essere ricontrollate.
- I salvataggi locali possono andare persi cancellando i dati del browser. Conserva sul tuo dispositivo il file del progetto completo.
- Dimensioni massime del PDF: 30 MB. Griglia massima: 600 righe/colonne e 100.000 caselle. Palette fino a 100 filati.

## Installazione e pubblicazione

Estrai lo ZIP preservando tutti i file della cartella e apri `index.html`; per l'uso pubblico è consigliabile un hosting statico HTTPS (ad esempio GitHub Pages o Cloudflare Pages). PDF.js è utilizzato tramite CDN e necessita di connessione; il sito non richiede login o un proprio backend.

## Distinzione tra due verifiche

**Round-trip OXS:** controllo automatizzato e deterministico che il documento esportato coincida con la matrice manualmente costruita.

**Fedeltà al PDF:** verifica visiva e semantica del contenuto originale; nella v0.9.1 resta a carico della persona che digitalizza.


</details>

**Nota sulla sequenza:** non sono presenti README storici separati per v0.9.0, v0.9.3 e v0.9.4 nel pacchetto di partenza; non si attribuiscono loro modifiche non documentate.
