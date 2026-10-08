/* Rajasthan Jewels: static client-side prototype. No analytics, data collection or payment flow. */
(() => {
  'use strict';
  const pieces = typeof window !== 'undefined' && window.RJ_PIECES ? window.RJ_PIECES : [];
  const STORE_KEY = 'rj-saved';
  const validIds = new Set(pieces.map(p => p.id));
  const $ = (selector, scope=document) => scope.querySelector(selector);
  const $$ = (selector, scope=document) => Array.from(scope.querySelectorAll(selector));
  const esc = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function getSaved() {
    try { const ids = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      return Array.isArray(ids) ? ids.filter(id => validIds.has(id)).slice(0,100) : [];
    } catch { return []; }
  }
  function setSaved(ids) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify([...new Set(ids)].filter(id => validIds.has(id)))); } catch {}
    updateSavedUI();
  }
  function announce(text) { const target=$('#live-status'); if(target) target.textContent=text; }
  function updateSavedUI() {
    const saved=getSaved();
    $$('[data-saved-count]').forEach(el=>el.textContent=String(saved.length));
    $$('[data-heart]').forEach(button=>{
      const active=saved.includes(button.dataset.heart);
      button.setAttribute('aria-pressed',String(active));
      button.textContent=button.classList.contains('heart-btn')?(active?'♥':'♡'):(active?'♥ Saved to your collection':'♡ Save this concept');
      button.setAttribute('aria-label',active?'Remove from saved pieces':'Save this piece');
    });
  }
  function toggleSaved(id) {
    if(!validIds.has(id)) return;
    const old=getSaved(), active=old.includes(id);
    setSaved(active?old.filter(x=>x!==id):[...old,id]);
    const piece=pieces.find(p=>p.id===id);
    announce(`${piece ? piece.name : 'Piece'} ${active?'removed from':'added to'} saved pieces`);
    if(document.body.dataset.page==='discover' && $('.filter-btn[data-category="Saved"][aria-pressed="true"]')) renderCatalog();
  }
  function imageTag(piece,size=600) {
    return `<img src="${window.RJ_IMG(piece.image,size)}" loading="lazy" alt="Editorial jewellery reference for ${esc(piece.name)}; not the actual concept piece">`;
  }
  function card(piece) {
    const saved=getSaved().includes(piece.id);
    return `<article class="product-card"><a class="product-image" href="piece.html?id=${encodeURIComponent(piece.id)}">${imageTag(piece)}<span class="product-badge">${esc(piece.tag)}</span></a><button class="heart-btn" data-heart="${esc(piece.id)}" aria-pressed="${saved}" aria-label="${saved?'Remove from':'Save this'} piece">${saved?'♥':'♡'}</button><div class="product-meta"><span>${esc(piece.category)} / ${esc(piece.occasion)}</span><h3><a href="piece.html?id=${encodeURIComponent(piece.id)}">${esc(piece.name)}</a></h3><p>${esc(piece.details)}</p><a href="piece.html?id=${encodeURIComponent(piece.id)}" class="product-cta">Discover the inspiration ↗</a></div></article>`;
  }
  function cards(el,list) { if(el) {el.innerHTML=list.map(card).join(''); updateSavedUI();} }

  let currentCategory='All';
  function renderCatalog() {
    const grid=$('#catalog-grid'); if(!grid)return;
    const term=($('#catalog-search')?.value||'').trim().toLocaleLowerCase();
    const sort=$('#catalog-sort')?.value||'featured';
    let result=pieces.filter(p=>{
      const matchesCategory=currentCategory==='All'||(currentCategory==='Saved'?getSaved().includes(p.id):p.category===currentCategory);
      const matchesTerm=[p.name,p.category,p.occasion,p.tone,p.mood,p.description].some(x=>x.toLocaleLowerCase().includes(term));
      return matchesCategory&&matchesTerm;
    });
    if(sort==='az')result.sort((a,b)=>a.name.localeCompare(b.name));
    if(sort==='za')result.sort((a,b)=>b.name.localeCompare(a.name));
    if(result.length)cards(grid,result);
    else grid.innerHTML=`<div class="empty"><h3>Nothing in this view yet.</h3><p>Try a different filter or explore the entire concept archive.</p><button class="button outline" id="reset-catalog">Show all concepts ↗</button></div>`;
    const count=$('#catalog-count');if(count)count.textContent=`${result.length} concept${result.length===1?'':'s'}`;
  }
  function setCatalog(category,updateUrl=true) {
    const allowed=['All','Kundan','Polki','Meenakari','Silver','Saved'];
    currentCategory=allowed.includes(category)?category:'All';
    $$('.filter-btn').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===currentCategory)));
    if(updateUrl) {
      const url=new URL(location.href);url.searchParams.delete('category');url.searchParams.delete('saved');
      if(currentCategory==='Saved')url.searchParams.set('saved','1');
      else if(currentCategory!=='All')url.searchParams.set('category',currentCategory);
      if(location.protocol!=='file:' && location.protocol!=='about:') history.replaceState(null,'',url.pathname+url.search);
    }
    renderCatalog();
  }
  function initCatalog() {
    if(!$('#catalog-grid'))return;
    const params=new URLSearchParams(location.search);
    setCatalog(params.get('saved')==='1'?'Saved':params.get('category')||'All',false);
    $$('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>setCatalog(btn.dataset.category)));
    $('#catalog-search')?.addEventListener('input',renderCatalog);
    $('#catalog-sort')?.addEventListener('change',renderCatalog);
    $('#catalog-grid').addEventListener('click',e=>{
      if(e.target.id==='reset-catalog'){
        $('#catalog-search').value='';setCatalog('All');
      }
    });
  }

  function rankMatches(answers,source=pieces) {
    if(!answers || !answers.occasion || !answers.mood || !answers.tone) return [];
    return source.map((p,index)=>({
      piece:p,index,
      score:(p.occasion===answers.occasion?5:0)+(p.mood===answers.mood?4:0)+(answers.tone==='Any'||p.tone===answers.tone?3:0)
    })).sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.piece);
  }
  function initQuiz() {
    if(!$('#discover-match'))return;
    const selections={occasion:null,mood:null,tone:null};
    $$('.quiz-choice').forEach(button=>button.addEventListener('click',()=>{
      const group=button.dataset.group;
      selections[group]=button.dataset.value;
      $$(`.quiz-choice[data-group="${group}"]`).forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      const ready=Object.values(selections).every(Boolean);
      $('#discover-match').disabled=!ready;
      $('#quiz-hint').textContent=ready?'Your style portrait is ready':'Choose one answer for each question';
      const r=$('#studio-results');if(r)r.hidden=true;
    }));
    $('#discover-match').addEventListener('click',()=>{
      const result=rankMatches(selections).slice(0,4);
      const best=result[0];
      const explanation=`Your ${selections.mood.toLowerCase()} mood, ${selections.occasion.toLowerCase()} occasion and ${selections.tone==='Any'?'open finish preference':selections.tone.toLowerCase()+' finish preference'} led us to these concepts.`;
      const panel=$('#studio-results');
      panel.innerHTML=`<span class="eyebrow">YOUR STYLE PORTRAIT</span><h3>${esc(best.category)} feels like your story.</h3><p>${esc(explanation)} This is a deterministic suggestion, not an AI-generated recommendation.</p><div class="mini-grid">${result.map(card).join('')}</div><a class="button outline" href="discover.html?category=${encodeURIComponent(best.category)}">Explore ${esc(best.category)} concepts <span class="arrow">↗</span></a>`;
      panel.hidden=false;updateSavedUI();panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      announce(`Recommended ${best.category} concepts are ready.`);
    });
  }
  function initPiece() {
    const container=$('#piece-container');if(!container)return;
    const id=new URLSearchParams(location.search).get('id');
    const piece=pieces.find(p=>p.id===id);
    if(!piece){
      container.innerHTML=`<div class="empty" style="grid-column:1/-1"><h3>We couldn't find that concept.</h3><p>It may have moved from the archive.</p><a class="button" href="discover.html">Back to the collection ↗</a></div>`;
      return;
    }
    document.title=`${piece.name} | Rajasthan Jewels`;
    const crumb=$('#piece-breadcrumb');if(crumb)crumb.textContent=piece.name;
    container.innerHTML=`<div class="piece-image">${imageTag(piece,1250)}</div><div class="piece-info"><span class="eyebrow">${esc(piece.category.toUpperCase())} / CONCEPT STUDY</span><h1>${esc(piece.name)}</h1><p class="lead">${esc(piece.description)}</p><div class="note"><strong>Design inspiration, not merchandise.</strong><br>The image is editorial reference photography, not an actual photograph of this concept. Materials, dimensions, availability and pricing have not been established.</div><div class="traits"><div><span>Tradition</span><span>${esc(piece.category)}</span></div><div><span>Occasion</span><span>${esc(piece.occasion)}</span></div><div><span>Design mood</span><span>${esc(piece.mood)}</span></div><div><span>Finish palette</span><span>${esc(piece.tone)}</span></div></div><button class="button" data-heart="${esc(piece.id)}" aria-pressed="false">♡ Save this concept</button><a class="button outline" href="contact.html">Share feedback ↗</a><p style="margin-top:25px;font-size:12px">Looking for something more personal? <a href="studio.html" style="text-decoration:underline">Try the Style Finder.</a></p></div>`;
    const related=pieces.filter(p=>p.category===piece.category&&p.id!==piece.id).slice(0,4);
    cards($('#related-pieces'),related);
    updateSavedUI();
  }
  function initContact() {
    const form=$('#contact-form');if(!form)return;
    form.addEventListener('submit',e=>{
      e.preventDefault();if(!form.reportValidity())return;
      const name=$('#contact-name').value.trim();
      const email=$('#contact-email').value.trim();
      const subject=$('#contact-topic').value;
      const message=$('#contact-message').value.trim();
      const body=`Name: ${name}\nEmail: ${email}\nTopic: ${subject}\n\n${message}\n\nSent via Rajasthan Jewels website (email-client handoff).`;
      const url=`mailto:hello@rajasthanjewels.com?subject=${encodeURIComponent(`Rajasthan Jewels — ${subject}`)}&body=${encodeURIComponent(body)}`;
      $('#contact-message-status')?.classList.add('visible');
      location.href=url;
    });
  }
  function initMenu() {
    const toggle=$('#menu-toggle'),menu=$('#mobile-menu');
    if(!toggle||!menu)return;
    function close() {menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');document.body.classList.remove('menu-open');}
    toggle.addEventListener('click',()=>{
      const opening=toggle.getAttribute('aria-expanded')!=='true';
      if(!opening){close();return;}
      menu.classList.add('open');toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Close navigation');document.body.classList.add('menu-open');
    });
    menu.addEventListener('click',e=>{if(e.target.closest('a'))close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  }
  function init() {
    initMenu();initCatalog();initQuiz();initPiece();initContact();
    if($('#featured-pieces'))cards($('#featured-pieces'),pieces.slice(0,4));
    document.addEventListener('click',e=>{const heart=e.target.closest('[data-heart]');if(heart){e.preventDefault();toggleSaved(heart.dataset.heart);}});
    document.addEventListener('error',e=>{if(e.target.tagName==='IMG'&&e.target.closest('.product-image,.hero-photo,.collection-card,.intro-image,.editorial-photo,.story-image,.piece-image'))e.target.parentElement.classList.add('image-fallback');},true);
    const year=$('#current-year');if(year)year.textContent=new Date().getFullYear();
    $$('img').forEach(img=>{if(img.complete && img.naturalWidth===0 && img.parentElement)img.parentElement.classList.add('image-fallback');});
    updateSavedUI();
  }
  if(typeof document!=='undefined') {
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
    else init();
  }
  if(typeof module!=='undefined' && module.exports)module.exports={rankMatches,esc};
})();
