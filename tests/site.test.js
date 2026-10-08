const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname,'..');
const pages = ['index.html','discover.html','studio.html','story.html','technology.html','contact.html','privacy.html','piece.html','404.html'];
const pagesText = pages.map(name => [name,fs.readFileSync(path.join(root,name),'utf8')]);
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),context);
const {rankMatches,esc} = require('../app.js');
const pieces=context.window.RJ_PIECES;

test('all project pages exist, have page titles and structural landmarks',()=>{
  for(const [name,html] of pagesText){
    assert.match(html,/<title>.+<\/title>/);assert.match(html,/<main id="main">/);
    assert.match(html,/<header class="site-header">/);assert.match(html,/<footer class="footer">/);
    assert.match(html,/<meta name="description"/);assert.match(html,/<link rel="canonical"/);
    assert.match(html,/<html lang="en-IN">/);
    assert.match(html,/<\/html>/);
  }
});
test('internal links resolve to actual project files',()=>{
  const re=/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g;
  for(const [name,html] of pagesText){
    for(const found of html.matchAll(re)){
      const ref=found[1];
      if(/^(?:https?:|mailto:|javascript:|\/)/.test(ref))continue;
      assert.ok(fs.existsSync(path.join(root,ref)),`${name} references missing ${ref}`);
    }
  }
});
test('catalogue ids are unique and entries are complete',()=>{
  assert.equal(pieces.length,12);assert.equal(new Set(pieces.map(x=>x.id)).size,pieces.length);
  for(const p of pieces){for(const key of ['name','category','occasion','tone','mood','description','image'])assert.ok(p[key]);}
});
test('quiz ranks exact three-way preference first',()=>{
  const result=rankMatches({occasion:'Wedding',mood:'Regal',tone:'Gold'},pieces);
  assert.equal(result[0].id,'aabha-kundan');
});
test('quiz ranks silver everyday minimal piece for appropriate preference',()=>{
  const result=rankMatches({occasion:'Everyday',mood:'Minimal',tone:'Silver'},pieces);
  assert.equal(result[0].id,'tara-silver');
});
test('quiz returns empty with incomplete inputs',()=>assert.equal(rankMatches({occasion:'Wedding'},pieces).length,0));
test('HTML output uses safe escaping',()=>assert.equal(esc('<img src="x" onerror=\'1\'>&'), '&lt;img src=&quot;x&quot; onerror=&#39;1&#39;&gt;&amp;'));
test('published copy distinguishes mock catalogue from real inventory',()=>{
  for(const name of ['index.html','discover.html','technology.html','story.html']){
    const html=pagesText.find(x=>x[0]===name)[1];
    assert.match(html,/concept|prototype/i,`${name} should disclose stage`);
  }
});
