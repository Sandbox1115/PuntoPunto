'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const app = fs.readFileSync(path.join(root, 'app.js'),'utf8');
const atelier = fs.readFileSync(path.join(root, 'atelier-ui.js'),'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'),'utf8');

test('OXS edit-only thread and stitch controls stay hidden by default', () => {
  assert.match(index, /class="[^"]*editor-edit-controls[^"]*hidden[^"]*" id="editControls"/);
  assert.ok(app.includes("$('editControls').classList.toggle('hidden', mode!=='paint')"));
});
test('Mark mode uses pointerup taps, not pointermove strokes', () => {
  assert.ok(app.includes('const MARK_TAP_TOLERANCE=9'));
  assert.ok(app.includes('if(drag.moved)'));
  assert.ok(app.includes("if(e.type!=='pointerup'||drag.pan){finishMarkStroke();return;}"));
  assert.doesNotMatch(app, /else for\(const point of trace\)markAt\(/);
});
test('Mobile Schema opens existing full-screen OXS controller', () => {
  assert.ok(atelier.includes('function showPatternFromDock()'));
  assert.ok(atelier.includes("$('toggleOXSFocus')?.click()"));
  assert.ok(atelier.includes("$('trackerScroller').scrollIntoView"));
});
test('One fabric/appearance form and reachable controls', () => {
  assert.equal((atelier.match(/function appearance\(parent\)/g)||[]).length,1);
  assert.ok(atelier.includes("else appearance(dc)"));
  assert.ok(!atelier.includes("appearance($('rightPanel'))"));
  assert.ok(!atelier.includes("appearance(document.querySelector('.studio-workspace'))"));
});
