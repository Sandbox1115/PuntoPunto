import hashlib
import json
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from quality import HTMLAudit
from build import locked

ROOT=Path(__file__).resolve().parents[2]

class TestSourceIntegrity(unittest.TestCase):
 def test_locked_assets(self):
  metadata=locked(ROOT)
  self.assertEqual(metadata['version'],'0.9.8.8.20')
  self.assertEqual(set(metadata['assets']),{'vendor/pdf.mjs','vendor/pdf.worker.mjs','data/dmc-floss.json'})
 def test_csp_no_remote_script(self):
  for name in ['index.html','privacy.html','licenze.html']:
   with self.subTest(name=name):
    audit=HTMLAudit();audit.feed((ROOT/name).read_text(encoding='utf8'))
    self.assertFalse(audit.external_executable)
    self.assertTrue(audit.csp)
    self.assertNotIn("'unsafe-eval'",audit.csp[0])
 def test_unique_dom_ids(self):
  for name in ['index.html','privacy.html','licenze.html']:
   with self.subTest(name=name):
    audit=HTMLAudit();audit.feed((ROOT/name).read_text(encoding='utf8'))
    self.assertFalse(audit.duplicates)
 def test_pdf_version_worker_pair(self):
  s=(ROOT/'vendor/pp-pdfjs-bridge.js').read_text()
  self.assertIn("const VERSION = '6.4.299'",s)
  h=json.loads((ROOT/'ASSET_LOCK.json').read_text())['assets']
  self.assertIn(h['vendor/pdf.mjs']['sha256'],s)
  self.assertIn(h['vendor/pdf.worker.mjs']['sha256'],s)
 def test_localization_legal_pages(self):
  for name in ['privacy.html','licenze.html']:
   s=(ROOT/name).read_text();self.assertIn('data-pp-locale="it"',s);self.assertIn('data-pp-locale="en"',s)
 def test_versions_on_site(self):
  for name in ['index.html','privacy.html','licenze.html']:
   self.assertIn('0.9.8.8.20',(ROOT/name).read_text())

if __name__=='__main__': unittest.main()
