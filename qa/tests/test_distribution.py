import json
import tempfile
import unittest
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from build import copy_source

ROOT = Path(__file__).resolve().parents[2]

class TestDistributionBoundary(unittest.TestCase):
    def test_only_reviewed_runtime_files_are_copied(self):
        allowed=set(json.loads((ROOT/'qa/runtime-files.json').read_text()))
        self.assertTrue({'index.html','privacy.html','licenze.html','fonts.css'} <= allowed)
        self.assertFalse(any(x.startswith(('qa/', '.github/', '.git/', 'qa-')) or x.endswith(('.zip','.py')) for x in allowed))
        self.assertFalse(any(x in allowed for x in ('README.md','CHANGELOG.md','CHANGELOG_IT.md','RELEASE_CHECKS.md')))
        with tempfile.TemporaryDirectory() as temp:
            dest=Path(temp)/'web'
            copy_source(ROOT,dest,offline=False)
            actual={x.relative_to(dest).as_posix() for x in dest.rglob('*') if x.is_file()}
            self.assertEqual(actual,allowed)
            self.assertNotIn('pp-pdfjs-core',(dest/'index.html').read_text())

    def test_unlisted_private_file_cannot_leak(self):
        with tempfile.TemporaryDirectory() as temp:
            src=Path(temp)/'source'; src.mkdir(); (src/'qa').mkdir()
            (src/'qa/runtime-files.json').write_text('["index.html"]')
            (src/'index.html').write_text('public')
            (src/'private-project.json').write_text('private')
            (src/'.env').write_text('private')
            dest=Path(temp)/'web'
            copy_source(src,dest,offline=False)
            self.assertEqual([x.name for x in dest.iterdir()],['index.html'])

    def test_legacy_pages_excludes_repository_documents_and_qa(self):
        config=(ROOT/'_config.yml').read_text()
        excluded={line.strip()[2:] for line in config.splitlines() if line.strip().startswith('- ')}
        self.assertIn('qa',excluded)
        self.assertFalse((ROOT/'.nojekyll').exists())
        allowed=set(json.loads((ROOT/'qa/runtime-files.json').read_text()))
        for path in ROOT.iterdir():
            if path.is_file() and not path.name.startswith('.') and path.name not in allowed:
                self.assertIn(path.name,excluded,path.name)
