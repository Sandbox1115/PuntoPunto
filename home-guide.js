/* Home onboarding and safe navigation. Works with GitHub Pages and file:// builds. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const modal=$('homeGuide'),trigger=$('openHomeGuide'),exit=$('homeGuideClose'),done=$('homeGuideDone'),brand=$('homeBrand');
let previousFocus=null;
const opened=()=>!modal.classList.contains('hidden');
function show(){if(!$('welcome')||$('welcome').classList.contains('hidden')||opened())return;
  previousFocus=document.activeElement;modal.classList.remove('hidden');document.body.classList.add('pp-home-guide-open');exit.focus();}
function hide(){if(!opened())return;modal.classList.add('hidden');document.body.classList.remove('pp-home-guide-open');
  if(previousFocus?.isConnected&&previousFocus!==document.body)previousFocus.focus();else trigger.focus();}
trigger.addEventListener('click',show);exit.addEventListener('click',hide);done.addEventListener('click',hide);
modal.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();hide();return;}
  if(e.key!=='Tab')return;
  const items=[...modal.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(x=>x.getClientRects().length);
  if(!items.length)return;
  if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items[items.length-1].focus();}
  else if(!e.shiftKey&&document.activeElement===items[items.length-1]){e.preventDefault();items[0].focus();}
});
brand.addEventListener('click',e=>{
  // Never reload the page if it contains a project. In-page return preserves control of warnings.
  e.preventDefault();
  if(opened()){hide();return;}
  const tracker=$('pdfTracker');
  if(tracker&&!tracker.classList.contains('hidden')){window.PuntoPuntoPDFTracker?.close();return;}
  const setup=$('pdfOverlay');
  if(setup&&!setup.classList.contains('hidden')){
    if(!window.ppConfirm('Vuoi interrompere l’apertura del PDF e tornare alla home? La griglia non confermata andrà persa.'))return;
    $('pdfCancel').click();
    if(window.PuntoPuntoOXSNavigation?.hasProject())window.PuntoPuntoOXSNavigation.close();
    return;
  }
  if(window.PuntoPuntoOXSNavigation?.hasProject())window.PuntoPuntoOXSNavigation.close();
});
// The tutorial is always opt-in. The home provides a prominent button instead
// of automatically opening a long overlay on a visitor's first page load.
})();
