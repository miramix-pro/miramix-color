'use strict';
// Device effects are optional: learning continues when a browser blocks them.
(()=>{
 const defaults={sound:true,haptics:true,motion:true};let settings={...defaults},ctx=null,voices=[],generation=0,reactionTimer,lastPulse=0;
 try{const saved=JSON.parse(localStorage.getItem('geo508-effects-v1'));for(const key of Object.keys(defaults))if(typeof saved?.[key]==='boolean')settings[key]=saved[key]}catch{}
 const host=document.createElement('section');host.className='kitten-strip';host.setAttribute('aria-label','Котёнок и настройки эффектов');
 host.innerHTML=`<div class="top-kitten" aria-hidden="true">${cat()}<span class="music-note note-one">♪</span><span class="music-note note-two">♫</span></div><div class="kitten-caption"><strong>Твой напарник по геометрии</strong><span id="kitten-mood" role="status">Ловим ритм. Находим углы.</span></div><div class="effect-controls"><button id="toggle-sound" type="button"></button><button id="toggle-haptics" type="button"></button><button id="toggle-motion" type="button"></button></div>`;
 document.querySelector('header').after(host);
 const supportedVibration=typeof navigator.vibrate==='function', supportedAudio=!!(window.AudioContext||window.webkitAudioContext);
 function persist(){try{localStorage.setItem('geo508-effects-v1',JSON.stringify(settings))}catch{}}
 function refresh(){for(const [key,title,icon]of [['sound','Звук','♫'],['haptics','Вибро','⌁'],['motion','Анимация','✦']]){const b=document.getElementById('toggle-'+key);let supported=key==='haptics'?supportedVibration:key==='sound'?supportedAudio:true;b.disabled=!supported;b.textContent=`${icon} ${title}: ${supported?(settings[key]?'вкл':'выкл'):'недоступно'}`;b.setAttribute('aria-pressed',String(supported&&settings[key]));b.title=!supported?'Этот браузер не поддерживает эффект':key==='haptics'?'Лёгкая вибрация при вводе ответа':key==='sound'?'Мелодии при проверке ответа':'Движение котёнка и конфетти'}document.body.classList.toggle('effects-still',!settings.motion)}
 function stopSound(){generation++;for(const v of voices){try{v.stop()}catch{}}voices=[]}
 function pulse(){if(!settings.haptics||!supportedVibration||document.hidden)return;const now=performance.now();if(now-lastPulse<45)return;lastPulse=now;try{navigator.vibrate(12)}catch{}}
 async function sound(good){if(!settings.sound||!supportedAudio||document.hidden)return;stopSound();const current=generation;try{if(!ctx||ctx.state==='closed')ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state!=='running')await ctx.resume();if(current!==generation||!settings.sound||document.hidden||ctx.state!=='running')return;const start=ctx.currentTime+.015;const notes=good?[[523.25,0,.13],[659.25,.10,.14],[783.99,.20,.16],[1046.5,.32,.26]]:[[392,0,.17],[329.63,.15,.17],[261.63,.30,.28]];for(const[f,offset,duration]of notes){const o=ctx.createOscillator(),g=ctx.createGain(),t=start+offset;o.type=good?'sine':'triangle';o.frequency.setValueAtTime(f,t);if(!good)o.frequency.exponentialRampToValueAtTime(f*.96,t+duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(good?.11:.065,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+duration+.02);voices.push(o);o.onended=()=>{o.disconnect();g.disconnect();voices=voices.filter(v=>v!==o)}}}catch{/* Audio is not required for an answer to be checked. */}}
 window.playAnswerFeedback=good=>{clearTimeout(reactionTimer);host.classList.remove('is-happy','is-sad');void host.offsetWidth;host.classList.add(good?'is-happy':'is-sad');document.getElementById('kitten-mood').textContent=good?'Ура! Лапки вверх — получилось!':'Ой… Ничего, попробуем ещё раз!';sound(good);reactionTimer=setTimeout(()=>{host.classList.remove('is-happy','is-sad');document.getElementById('kitten-mood').textContent='Ловим ритм. Находим углы.'},2400)};
 document.getElementById('toggle-sound').onclick=()=>{settings.sound=!settings.sound;persist();refresh();if(settings.sound)sound(true);else stopSound()};
 document.getElementById('toggle-haptics').onclick=()=>{settings.haptics=!settings.haptics;persist();refresh();if(settings.haptics)pulse();else try{navigator.vibrate(0)}catch{}};
 document.getElementById('toggle-motion').onclick=()=>{settings.motion=!settings.motion;persist();refresh()};
 document.addEventListener('input',e=>{if(e.target.id==='value'&&!e.isComposing)pulse()});
 document.addEventListener('compositionend',e=>{if(e.target.id==='value')pulse()});
 document.addEventListener('click',e=>{if(e.target.closest('[data-option]'))pulse()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stopSound();try{navigator.vibrate?.(0)}catch{}}});
 refresh();
})();
