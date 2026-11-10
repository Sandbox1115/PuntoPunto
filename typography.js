/* Refresh canvas labels after local font loading, without changing project data. */
(()=>{'use strict';if(!document.fonts)return;
Promise.all([document.fonts.load('400 14px "Alegreya Sans"'),document.fonts.load('700 14px "Alegreya Sans"'),document.fonts.load('600 22px "Lora"')])
.then(()=>document.fonts.ready).then(()=>document.dispatchEvent(new Event('puntopunto:appearancechange'))).catch(()=>{});
})();
