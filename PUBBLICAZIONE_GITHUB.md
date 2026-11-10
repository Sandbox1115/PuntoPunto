# Pubblicazione PuntoPunto — 0.9.8.8.23.1

Repository: `Sandbox1115/PuntoPunto`, ramo `main`. Sito: https://sandbox1115.github.io/PuntoPunto/ . Pubblicazione di questa versione autorizzata dal titolare il 10 novembre 2026.

## Preparazione e controlli

1. Modificare i sorgenti web, non copiare direttamente una distribuzione offline nel repository.
2. Aggiornare prima `CHANGELOG.md` in inglese, poi `CHANGELOG_IT.md`, guide, Privacy/Licenze se necessario, versione del lock, QA e percorso ZIP nel workflow.
3. Mantenere gli originali PDF.js e DMC con gli hash bloccati. Per Lora/Alegreya Sans conservare file originali, licenze OFL e `vendor/FONT_SOURCES.json`.
4. Verificare dati personali, credenziali, metadati dei campioni e contenuto di `qa/runtime-files.json`. Non includere progetti privati, screenshot, pagine di collaudo o archivio offline nella lista.
5. Eseguire dalla radice:

```sh
python3 qa/quality.py manifest --root .
python3 qa/quality.py verify --root . --mode web
python3 -m unittest discover -s qa/tests -v
node --test qa/tests/*.test.cjs
python3 qa/build.py --source . --output dist
```

Ripetere la build in una cartella temporanea esterna al repository e confrontare gli SHA-256 dei due ZIP per controllare la riproducibilità. Verificare le tre pagine e i flussi OXS/PDF su larghezze smartphone, tablet e desktop. I controlli Chromium non equivalgono al collaudo su tutti i dispositivi reali.

## Deploy

Sorgente raccomandata per un unico deploy vincolato ai test: **GitHub Actions**. Alla preparazione della release era attiva anche la pubblicazione dal ramo. `_config.yml` esclude i documenti e `qa/` anche da quella procedura; `.nojekyll` viene generato soltanto nella build del workflow. Per eliminare il deploy parallelo occorre selezionare GitHub Actions nelle impostazioni Pages con accesso amministrativo. Il workflow `.github/workflows/quality-pages.yml` valida sorgenti e regressioni, genera entrambi i pacchetti e pubblica soltanto `dist/github-pages`. Il job `deploy` dipende dal successo di `quality`. Le guide, i changelog e i test rimangono nel repository, non vengono serviti nell'artefatto Pages.

Dopo il push verificare il workflow relativo al commit, l'URL HTTPS, la versione visibile, il caricamento dei font e del motore PDF.js e l'assenza dei file esclusi. Non considerare la sola riuscita del push come conferma della pubblicazione.

## Rollback

Ripristinare tramite un nuovo commit la precedente versione verificata e lasciare che la stessa pipeline la ridistribuisca. Non riscrivere la cronologia pubblica. Conservare i backup dei progetti: l'interfaccia non cambia i formati OXS/JSON, ma i dati del browser dipendono dall'origine e dal dispositivo.
