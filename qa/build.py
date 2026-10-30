#!/usr/bin/env python3
"""Reproducible PuntoPunto web/offline packages, stdlib only.
No dependency is downloaded or rebuilt. All embedded resources come from the
same SHA-256-locked source tree. File outputs are fixed and deterministic.
"""
from __future__ import annotations
import argparse, base64, hashlib, json, shutil, sys, zipfile
from pathlib import Path

SKIP={'MANIFEST_DISTRIBUZIONE_SHA256.txt','.DS_Store'}
EXCLUDE_DIRS={'.git','dist','__pycache__','.pytest_cache','.venv','node_modules'}


def files(root: Path):
    for path in sorted(root.rglob('*')):
        if not path.is_file() or path.name in SKIP:
            continue
        if any(x in EXCLUDE_DIRS for x in path.relative_to(root).parts):
            continue
        yield path


def manifest(root: Path):
    values=[]
    for p in files(root):
        values.append(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(root).as_posix()}')
    (root/'MANIFEST_DISTRIBUZIONE_SHA256.txt').write_text('\n'.join(values)+'\n',encoding='utf-8')


def locked(root: Path):
    lock=json.loads((root/'ASSET_LOCK.json').read_text(encoding='utf-8'))
    for rel,desc in lock['assets'].items():
        b=(root/rel).read_bytes()
        if hashlib.sha256(b).hexdigest()!=desc['sha256'] or len(b)!=desc['bytes']:
            raise ValueError('Locked asset mismatch: '+rel)
    return lock


def copy_source(src: Path, out: Path, *, offline: bool):
    if out.exists(): shutil.rmtree(out)
    out.mkdir(parents=True)
    for f in files(src):
        rel=f.relative_to(src)
        if offline:
            if rel.parts[0] in {'.github','qa'}: continue
            if rel.parts[0]=='vendor' and rel.as_posix() not in {'vendor/LICENSE-PDFJS.txt','vendor/pp-pdfjs-bridge.js'}: continue
        target=out/rel
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(f,target)


def offline_index(src: Path, dest: Path):
    html=(dest/'index.html').read_text(encoding='utf-8')
    if 'id="pp-pdfjs-core"' in html: raise ValueError('Already an offline build')
    b64=lambda p:base64.b64encode(p.read_bytes()).decode('ascii')
    # All CMaps, fonts, ICC and WASM files are embedded with their original names.
    resources={p.relative_to(src/'vendor').as_posix(): b64(p)
               for p in sorted((src/'vendor').rglob('*'))
               if p.is_file() and p.relative_to(src/'vendor').parts[0] in {'cmaps','standard_fonts','iccs','wasm'}}
    dmc=(src/'data/dmc-floss.json').read_text(encoding='utf-8')
    # Critical content has a hash before it is embedded and will be checked by verify.
    embed='''\n<!-- Self-contained, inert data for direct file:// operation. These are NOT executable inline scripts. -->\n'''
    embed+='<script id="pp-dmc-offline" type="application/json">'+dmc+'</script>\n'
    for name,path in [('core',src/'vendor/pdf.mjs'),('worker',src/'vendor/pdf.worker.mjs')]:
        embed+=f'<script id="pp-pdfjs-{name}" type="application/octet-stream">{b64(path)}</script>\n'
    embed+='<script id="pp-pdfjs-resources" type="application/json">'+json.dumps(resources,separators=(',',':'))+'</script>\n'
    (dest/'RISORSE_OFFLINE_SHA256.json').write_text(json.dumps({name:hashlib.sha256(base64.b64decode(data)).hexdigest() for name,data in resources.items()},sort_keys=True,indent=2)+'\n',encoding='utf-8')
    html=html.replace('href="./" aria-label="PuntoPunto, pagina iniziale"','href="index.html" aria-label="PuntoPunto, pagina iniziale"')
    html=html.replace('</body>',embed+'</body>')
    (dest/'index.html').write_text(html,encoding='utf-8')
    (dest/'ISTRUZIONI_OFFLINE.md').write_text('''# PuntoPunto 0.9.8.8.20.2 — versione locale senza server

Apri `index.html` con un doppio clic, direttamente da una cartella decompressa, preferibilmente in un browser desktop aggiornato (Chrome/Chromium, Firefox o Edge). Non occorre internet, Python, localhost o un server HTTP. Conserva la struttura dei file estratta dal pacchetto; non aprire il file dentro l'anteprima ZIP.\n\nIl motore PDF.js 6.4.299, il worker, i CMap, i font, i moduli WASM e il catalogo DMC da 489 filati sono **incorporati e verificabili** nel file `index.html` locale. Gli originali binari PDF.js non sono duplicati nella cartella `vendor/`, per ridurre lo spazio. Le pagine Privacy e Licenze restano file separati e sono navigabili offline.\n\n**Sicurezza dei progetti:** alcuni browser possono limitare IndexedDB/WebCrypto/persistenza in modalità `file://`. Esporta sempre backup JSON e conserva il PDF/OXS originale. La persistenza dopo la chiusura del browser non è garantita in tutti i browser e dispositivi. Le prove automatiche non certificano tutti i browser.\n\n**Privacy:** il sito non deve effettuare richieste online per il caricamento dei componenti. I collegamenti a GitHub o ad altre fonti esterne si aprono solo se selezionati.\n\n**Verifica integrità:** il manifesto `MANIFEST_DISTRIBUZIONE_SHA256.txt` elenca le impronte SHA-256 degli altri file.\n''',encoding='utf-8')


def zip_dist(root: Path, output: Path):
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for p in sorted(root.rglob('*')):
            if p.is_file():
                name=p.relative_to(root).as_posix()
                zi=zipfile.ZipInfo(name,date_time=(2026,10,28,0,0,0));zi.compress_type=zipfile.ZIP_DEFLATED
                zi.external_attr=0o644<<16
                z.writestr(zi,p.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--source',type=Path,default=Path('.'));ap.add_argument('--output',type=Path,default=Path('dist'))
    args=ap.parse_args();src=args.source.resolve();out=args.output.resolve()
    if out==src or src in out.parents and out.name==src.name: raise ValueError('Invalid destination')
    locked(src)
    from quality import check
    if not check(src,'web',check_manifest=False): raise SystemExit('Source QA preflight failed')
    online=out/'github-pages';offline=out/'offline'
    copy_source(src,online,offline=False)
    copy_source(src,offline,offline=True)
    offline_index(src,offline)
    manifest(online);manifest(offline)
    if not check(online,'web') or not check(offline,'offline'): raise SystemExit('QA rejected generated package')
    zip_dist(online,out/'PuntoPunto-v0.9.8.8.20.2-GitHub-Pages.zip')
    zip_dist(offline,out/'PuntoPunto-v0.9.8.8.20.2-Locale-Senza-Server.zip')
    print('Created 2 verified distributions:')
    for name in ['PuntoPunto-v0.9.8.8.20.2-GitHub-Pages.zip','PuntoPunto-v0.9.8.8.20.2-Locale-Senza-Server.zip']:
        p=out/name;print(f'  {p} ({p.stat().st_size:,} bytes)')

if __name__=='__main__':main()
