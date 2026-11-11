> **Mobile (v0.9.8.8.13):** nella home usa **Apri OXS** oppure **Apri PDF** per scegliere un file dal dispositivo; il trascinamento dei file resta disponibile su desktop.

# Guida d’uso — PuntoPunto

PuntoPunto è gratuito, senza account e pensato per il punto croce. Le modifiche e i progressi restano nel browser; conserva sempre una copia esportata dei progetti.

## Avvio

Apri `index.html` tramite un sito HTTPS o un server locale. Il selettore IT/EN nella testata cambia la lingua (italiano all’apertura iniziale). Per una prova rapida usa `esempio-fiore.oxs` o `esempio-schema-pdf.pdf`.

## Editor OXS

1. Premi **Apri OXS** e seleziona un file `.oxs` (o XML OXS), anche quello di esempio. Il pulsante non accetta PDF: usa **Apri PDF** per quelli.
2. Usa la legenda per scegliere un filato; filtra anche per tipo di punto o per la combinazione filato + tipo.
3. Tocca o clicca i punti realizzati per segnare l’avanzamento. Attiva la visualizzazione per simboli se i colori coprono i dettagli.
4. Per modificare un punto usa gli strumenti di modifica, poi scarica lo schema OXS aggiornato. Salva separatamente i progressi JSON.

## Editor PDF

1. Premi **Apri PDF** e scegli uno schema. È un editor **manuale**: non riconosce da solo griglia, simboli o colori.
2. Seleziona l’area corretta della griglia, imposta righe e colonne, verifica l’allineamento e conferma.
3. Cerca i filati DMC o aggiungi colori personalizzati; assegna tipo di punto e filato a ciascuna casella. Puoi segnare le caselle vuote.
4. Usa **Schermo ampio** e **Riduci pannello filati** su schermi piccoli. I quarti hanno orientamenti distinti, i punti diagonali due tratti e le mezze croci uno.
5. Esporta periodicamente **Salva progetto** per conservare PDF e digitalizzazione. L’OXS viene esportato solo dopo la definizione di tutte le caselle.

## Privacy, limiti e diritti

- L’elaborazione e il salvataggio dei progetti avvengono nel browser: non vengono caricati PDF e OXS a un server PuntoPunto. I dati di accesso tecnici sono gestiti dall’hosting (vedi Privacy).
- I dati IndexedDB possono essere eliminati dal browser: non affidarti soltanto al salvataggio automatico.
- La conversione di schemi altrui non trasferisce diritti d’autore: consulta la sezione Licenze e usa i materiali solo nei limiti consentiti.
- Il sito non esegue script da CDN, né carica cataloghi esterni automaticamente.

## Feedback e assistenza

Durante la beta usa le [GitHub Issues di PuntoPunto](https://github.com/Sandbox1115/PuntoPunto/issues) per segnalare problemi o proporre miglioramenti. Le segnalazioni sono pubbliche e richiedono un account GitHub: non condividere dati personali, schemi riservati o progetti privati. Le Issues non sono adatte a richieste privacy confidenziali.

## Guida iniziale e ritorno alla home (0.9.8.8.9)

Il tutorial non si apre automaticamente: premi il pulsante «Scopri come funziona PuntoPunto» dalla home per leggere la guida. Il pulsante resta sempre disponibile quando torni alla home. Nell’editor OXS il pulsante **Chiudi progetto e torna alla home** richiede conferma e non cancella i progressi già salvati nel browser. Nell’editor PDF il logo PuntoPunto e **Chiudi** chiedono conferma e raccomandano di esportare prima **Salva progetto** (JSON con PDF e digitalizzazione).

### v0.9.8.8.9 — Migliorie home

Tutorial facoltativo tramite pulsante ben visibile, nessuna apertura automatica. Alla chiusura di un progetto OXS tornano vuote legenda filati, filtri e statistiche. Illustrazione della home mobile sistemata per evitare sovrapposizioni. Nessuna pubblicazione su GitHub senza autorizzazione.

### Navigazione OXS su smartphone (v0.9.8.8.9)
- Due dita sullo schema: ingrandisci, riduci e sposta senza segnare crocette.
- Un dito: tocca o trascina per segnare i punti come prima.
- Pulsante **Nascondi interfaccia** nell’editor: visualizza il progetto a schermo pieno; **Mostra strumenti** ripristina i comandi.
- I bottoni +, − e Adatta restano disponibili nella vista normale.

**Mobile OXS (v0.9.8.8.13):** sotto lo schema scorri per vedere Avanzamento e Legenda filati. I due pulsanti grandi permettono di raggiungere subito questi pannelli; i filtri agiscono sullo schema in tempo reale. La modalità concentrata nasconde temporaneamente anche i pannelli inferiori.

### Salvataggio e recupero (v0.9.8.8.15)

- Dopo le modifiche attendi la conferma di salvataggio. Se compare un avviso, esporta il JSON prima di chiudere.
- Se viene recuperata una copia di sicurezza, controlla punti e filati e scarica subito una nuova copia JSON.
- Per OXS conserva sempre il file originale insieme al JSON dei progressi; per PDF usa «Salva progetto» per includere PDF, filati e digitalizzazione.
- I salvataggi del browser possono scomparire cancellando i dati del sito o cambiando browser/origine. Evita due schede che modificano contemporaneamente lo stesso progetto.

### Editor PDF su smartphone — v0.9.8.8.17

Su smartphone, dopo avere confermato la griglia, si apre automaticamente la vista ampia. La barra con **Avanzamento**, **Punti**, **Vuota** e **Non definita** resta sempre visibile. Per aggiungere un filato DMC o personalizzato tocca **Filati**, scegli il filato e torna allo schema. Con **Azioni** trovi Guida, apertura progetto, JSON progressi, esportazione OXS e chiusura; **Salva progetto** rimane in evidenza. Un tocco singolo assegna l'azione selezionata, mentre due dita ingrandiscono e spostano la griglia senza modificare le caselle. La vista mobile non sostituisce i backup JSON.

### Tastiera nell’editor OXS (v0.9.8.8.18)

Premi Tab fino alla griglia. Usa le frecce per scegliere una casella, Shift+frecce per spostarti di 10 caselle, Home/End per raggiungere il primo/ultimo punto della riga. Premi Invio o Spazio per segnare o, in caso di sovrapposizione, scegliere il punto nel pannello. Esc chiude il pannello. Non è necessario usare il mouse.

## Anteprima 0.9.8.8.20.2 — Punti sovrapposti

Il selettore delle caselle con più punti mostra l’intero contenuto della casella (croce intera, metà superiore/inferiore o sinistra/destra dei punti parziali), con anteprime cromatiche e conteggio dei punti completati rispetto al totale. Le spunte sullo schema mantengono lo stile originale. La versione è destinata al collaudo e non è pubblicata.

## 0.9.8.8.21 — Cambio lingua (versione di prova)

Il cambio IT/EN è disponibile anche durante il lavoro nell'editor OXS o PDF. I messaggi che includono quantità, coordinate ed errori vengono composti direttamente nella lingua selezionata. I nomi e i dati dei progetti restano invariati e non vengono tradotti. La nuova versione non è ancora pubblicata.

## Dimensioni fisiche del disegno PDF — 0.9.8.8.21.1

Nell’impostazione della griglia PDF puoi scegliere tra **colonne × righe**, **centimetri** o **pollici**. Se scegli una misura fisica, inserisci anche la **densità del tessuto**: punti per centimetro o punti per pollice («ct»). Esempio Aida 5,5 punti/cm, disegno 24,5 × 16 cm: la griglia risultante è circa **135 × 88 punti**. Analogamente Aida 14 ct, disegno 9,64 × 6,29 in: circa **135 × 88 punti**. I risultati sono arrotondati: controlla la prima e l’ultima linea sulla griglia stampata e correggi i bordi dell’area se necessario. Le sole dimensioni in cm/in non consentono di sapere quante crocette sono presenti senza la densità.

Nell’editor OXS, con EN selezionato, i filati DMC riconosciuti mostrano il nome inglese del catalogo. I nomi dei filati personalizzati e le descrizioni originali nel file OXS non sono modificati.

## Filati DMC nell'editor PDF — 0.9.8.8.21.2

Nella ricerca e nella legenda dei filati DMC, **IT** mostra le descrizioni italiane non ufficiali e **EN** i nomi inglesi del catalogo MakeBead. Puoi cercare anche per nome italiano (ad esempio «salmone»), in inglese o per codice. Il cambio lingua aggiorna le voci già aggiunte, senza cambiare codici, colori o descrizioni conservate nel progetto. I filati personalizzati mantengono sempre il loro nome.

### Strumenti rapidi PDF (v0.9.8.8.21.3 — pubblicata)

- **Conferma tutte le altre come vuote** crea caselle senza punto, non croci bianche.
- **Riempi celle non colorate di bianco** assegna invece una croce intera DMC B5200 a tutte le caselle non colorate (incluse quelle già indicate come vuote). I punti già colorati non cambiano. Conferma solo dopo aver verificato che lo schema richieda veramente punti bianchi.
- Usa **Gestisci** accanto a un filato per sostituirlo in tutto lo schema con un altro filato già presente nella legenda. Se serve un nuovo filato, aggiungilo prima. La sostituzione conserva tipi di punto e avanzamento.
- **Elimina filato** riporta le caselle assegnate a «da definire» e cancella i completamenti relativi; viene richiesta una conferma. **Annulla ultima operazione globale** ripristina i dati precedenti finché non vengono eseguite altre modifiche.
- Su telefono apri il menu **File** in alto a destra per i comandi Apri OXS, Apri PDF e Progetto PDF. I grandi pulsanti della home restano disponibili.

Ricorda di salvare un progetto JSON completo ed esaminare il file OXS contro il PDF originale prima di considerare concluso il lavoro.


## Interfaccia e aspetto — 0.9.8.8.23.1

Il layout si adatta a smartphone, tablet e desktop. Apri Aspetto per attivare tela, fili incrociati, griglia e linee principali. Queste preferenze sono salvate localmente e cambiano soltanto la visualizzazione. Nei PDF la resa tessile riguarda i punti assegnati manualmente; la scansione originale resta invariata. Lora per i titoli e Alegreya Sans per i testi mantengono le dimensioni stabilite. Esporta regolarmente backup dei progetti; le preferenze di aspetto sono separate dai dati del progetto.


## 0.9.8.8.23.2.1 — Comandi OXS e navigazione touch sicura

Seleziona **Modifica** per vedere i comandi **Filato / Tipo di punto**. Nelle altre modalità tali controlli rimangono nascosti per liberare spazio. Il comando **Vista** apre l'unico dialogo con le impostazioni di tessuto e visualizzazione.

Su smartphone premi **Schema** nella barra inferiore per entrare nella **vista ampia** e **Esci schermo ampio** per tornare all'editor normale. In **Segna punti** un tap/clic completa un solo punto; trascinare sposta lo schema senza segnare punti, mentre il pinch con due dita modifica lo zoom. Restano attivi il selettore dei punti sovrapposti, i controlli da tastiera e i gesti di disegno delle modalità Modifica/Cancella.
