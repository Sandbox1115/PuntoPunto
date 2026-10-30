#!/usr/bin/env python3
"""Fail-closed, no-network QA audit for PuntoPunto source and packaged builds."""
from __future__ import annotations
import argparse, hashlib, json, re, subprocess, sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

SKIP={'.git','dist','__pycache__','.venv','node_modules','.pytest_cache'}
LOCK_PATHS=['data/dmc-floss.json','vendor/pdf.mjs','vendor/pdf.worker.mjs']
MANDATORY=['index.html','licenze.html','privacy.html','app.js','i18n.js','dmc-catalog.js','vendor/pp-pdfjs-bridge.js','data/dmc-floss.json']

class HTMLAudit(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True);self.ids=set();self.duplicates=[];self.urls=[];self.labels=[];self.external_executable=[];self.csp=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if attrs.get('id'):
            if attrs['id'] in self.ids:self.duplicates.append(attrs['id'])
            self.ids.add(attrs['id'])
        for key in ('src','href'):
            if attrs.get(key):
                val=attrs[key]
                if key=='src' and val.startswith(('https://','http://')) and tag in ('script','iframe','img'):
                    self.external_executable.append(val)
                self.urls.append((tag,key,val))
        if tag=='meta' and attrs.get('http-equiv','').lower()=='content-security-policy':self.csp.append(attrs.get('content',''))
        for key in ('aria-labelledby','aria-controls'):
            if attrs.get(key):self.labels.extend(attrs[key].split())

def check(root:Path,mode:str,*,check_manifest=True)->bool:
    failures=[];ok=0
    def valid(condition,description):
        nonlocal ok
        if condition:ok+=1
        else:failures.append(description)
    root=root.resolve()
    for name in MANDATORY:valid((root/name).is_file(),'Missing '+name)
    if failures:
        print('\n'.join('FAIL '+v for v in failures),file=sys.stderr);return False
    lock=json.loads((root/'ASSET_LOCK.json').read_text(encoding='utf-8'))
    valid(lock.get('version')=='0.9.8.8.20.2','Wrong version in lock')
    for name in LOCK_PATHS:
        p=root/name
        if mode=='offline' and name.startswith('vendor/'):
            valid(not p.exists(),'Offline must not duplicate heavy binary '+name);continue
        valid(p.is_file(),'Locked resource missing '+name)
        if p.is_file():
            b=p.read_bytes();asset=lock['assets'][name]
            valid(len(b)==asset['bytes'] and hashlib.sha256(b).hexdigest()==asset['sha256'],'Locked checksum mismatch: '+name)
    for name in ['index.html','privacy.html','licenze.html']:
        doc=(root/name).read_text(encoding='utf-8');audit=HTMLAudit();audit.feed(doc)
        valid(not audit.duplicates,'Duplicate DOM IDs in '+name+': '+str(audit.duplicates))
        valid(not audit.external_executable,'Remote executable resources in '+name)
        valid(bool(audit.csp),'CSP missing '+name)
        for tag,attr,value in audit.urls:
            parts=urlsplit(value)
            if parts.scheme or value.startswith(('#','//','mailto:','data:','blob:')):continue
            loc=unquote(parts.path)
            if loc in ('.','./',''):continue
            referenced=(root/name).parent/loc
            valid(referenced.exists(),f'Broken local {attr} in {name}: {value}')
        if name in ('privacy.html','licenze.html'):
            valid('data-pp-locale="it"' in doc and 'data-pp-locale="en"' in doc,'Missing bilingual legal content '+name)
    index=(root/'index.html').read_text(encoding='utf-8');valid('VERSIONE 0.9.8.8.20.2' in index,'Wrong visible version in index')
    valid('data-pp-description-en=' in index,'Missing EN description')
    for name in ['privacy.html','licenze.html']:
        valid('0.9.8.8.20.2' in (root/name).read_text(encoding='utf-8'),'Wrong version '+name)
    valid('489' in (root/'dmc-catalog.js').read_text(encoding='utf-8'),'Wrong catalog size')
    for p in sorted(list(root.glob('*.js'))+list(root.glob('vendor/*.js'))+list(root.glob('vendor/*.mjs'))):
        result=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
        valid(result.returncode==0,'Syntax error '+str(p.relative_to(root))+': '+result.stderr[:180])
    sample=root/'esempio-fiore.oxs'
    if sample.exists():
        import xml.etree.ElementTree as ET
        try:valid(ET.parse(sample).getroot().tag=='chart','Invalid OXS example')
        except Exception as e:valid(False,'Sample OXS malformed '+str(e))
    pdf=root/'esempio-schema-pdf.pdf'
    if pdf.exists():valid(pdf.read_bytes().startswith(b'%PDF-'),'Invalid PDF example')
    if mode=='offline':
        import base64
        for kind,asset in [('core','vendor/pdf.mjs'),('worker','vendor/pdf.worker.mjs')]:
            m=re.search(r'<script id="pp-pdfjs-'+kind+r'" type="application/octet-stream">([A-Za-z0-9+/=\n]+)</script>',index)
            valid(bool(m),'Offline '+kind+' payload missing')
            if m:valid(hashlib.sha256(base64.b64decode(m.group(1))).hexdigest()==lock['assets'][asset]['sha256'],'Offline '+kind+' checksum mismatch')
        m=re.search(r'<script id="pp-dmc-offline" type="application/json">(.*?)</script>',index,re.S)
        valid(bool(m),'Offline catalog missing')
        if m:valid(hashlib.sha256(m.group(1).encode('utf-8')).hexdigest()==lock['assets']['data/dmc-floss.json']['sha256'],'Offline DMC checksum mismatch')
        m=re.search(r'<script id="pp-pdfjs-resources" type="application/json">(.*?)</script>',index,re.S)
        valid(bool(m),'Offline PDF.js resource library missing')
        if m:
            resources=json.loads(m.group(1));valid(len(resources)>190,'Offline embedded CMaps/fonts/WASM incomplete')
            valid(all('/' in k and len(v)>0 for k,v in resources.items()),'Invalid embedded resources')
            resource_hashes=json.loads((root/'RISORSE_OFFLINE_SHA256.json').read_text(encoding='utf-8'))
            valid(set(resources)==set(resource_hashes),'Offline resources/hash inventory mismatch')
            for name,encoded in resources.items():
                valid(hashlib.sha256(base64.b64decode(encoded)).hexdigest()==resource_hashes[name],'Offline resource integrity mismatch: '+name)
        valid('href="index.html" aria-label="PuntoPunto, pagina iniziale"' in index,'Offline home link not file-safe')
    else:
        valid('id="pp-pdfjs-core"' not in index,'Web build must not embed heavy offline payload')
        valid('id="pp-dmc-offline"' not in index,'Web build must fetch same-origin verified catalog')
    if check_manifest:
        path=root/'MANIFEST_DISTRIBUZIONE_SHA256.txt';valid(path.is_file(),'Missing manifest')
        if path.is_file():
            actual={}
            for line in path.read_text(encoding='utf-8').splitlines():
                match=re.fullmatch(r'([a-f0-9]{64})  ([^\r\n]+)',line)
                if match:actual[match.group(2)]=match.group(1)
                else:valid(False,'Malformed manifest row')
            present={p.relative_to(root).as_posix() for p in root.rglob('*') if p.is_file() and p.name!=path.name and not any(d in SKIP for d in p.relative_to(root).parts)}
            valid(set(actual)==present,f'Manifest files mismatch: unlisted={sorted(present-set(actual))[:9]}, deleted={sorted(set(actual)-present)[:9]}')
            for name,hash_expected in actual.items():
                p=root/name
                if p.is_file():valid(hashlib.sha256(p.read_bytes()).hexdigest()==hash_expected,'Manifest checksum mismatch: '+name)
    print(f'Quality {mode}: {ok} PASS / {len(failures)} FAIL in {root}')
    for failure in failures:print('FAIL:',failure,file=sys.stderr)
    return not failures

def main():
    ap=argparse.ArgumentParser();ap.add_argument('command',choices=['verify','manifest']);ap.add_argument('--root',type=Path,default=Path('.'));ap.add_argument('--mode',choices=['web','offline'],default='web');ap.add_argument('--skip-manifest',action='store_true');a=ap.parse_args()
    if a.command=='manifest':
        from build import manifest
        manifest(a.root.resolve());print('Manifest generated:',a.root);return
    if not check(a.root,a.mode,check_manifest=not a.skip_manifest):sys.exit(1)
if __name__=='__main__':main()
