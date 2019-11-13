(function(window,undefined){'use strict';var AudioPlayer=(function(){var docTitle=document.title,player=document.getElementById('ap'),playBtn,playSvg,playSvgPath,prevBtn,nextBtn,plBtn,repeatBtn,volumeBtn,progressBar,preloadBar,curTime,durTime,trackTitle,audio,index=0,playList,volumeBar,wheelVolumeValue=0,volumeLength,repeating=!1,seeking=!1,rightClick=!1,apActive=!1,pl,plUl,plLi,tplList='<li class="pl-list" data-track="{count}">'+'<div class="pl-list__track">'+'<div class="pl-list__icon"></div>'+'<div class="pl-list__eq">'+'<div class="eq">'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'</div>'+'</div>'+'</div>'+'<div class="pl-list__title">{title}</div>'+'</li>',settings={volume:.7,changeDocTitle:!0,confirmClose:!0,autoPlay:!1,buffered:!0,notification:!0,playList:[]};function init(options){if(!('classList' in document.documentElement)){return!1}if(apActive||player===null){return'Player already init'}settings=extend(settings,options);playBtn=player.querySelector('.ap__controls--toggle');playSvg=playBtn.querySelector('.icon-play');playSvgPath=playSvg.querySelector('path');prevBtn=player.querySelector('.ap__controls--prev');nextBtn=player.querySelector('.ap__controls--next');repeatBtn=player.querySelector('.ap__controls--repeat');volumeBtn=player.querySelector('.volume-btn');plBtn=player.querySelector('.ap__controls--playlist');curTime=player.querySelector('.track__time--current');durTime=player.querySelector('.track__time--duration');trackTitle=player.querySelector('.track__title');progressBar=player.querySelector('.progress__bar');preloadBar=player.querySelector('.progress__preload');volumeBar=player.querySelector('.volume__bar');playList=settings.playList;playBtn.addEventListener('click',playToggle,!1);volumeBtn.addEventListener('click',volumeToggle,!1);repeatBtn.addEventListener('click',repeatToggle,!1);progressBar.closest('.progress-container').addEventListener('mousedown',handlerBar,!1);progressBar.closest('.progress-container').addEventListener('mousemove',seek,!1);document.documentElement.addEventListener('mouseup',seekingFalse,!1);volumeBar.closest('.volume').addEventListener('mousedown',handlerVol,!1);volumeBar.closest('.volume').addEventListener('mousemove',setVolume);volumeBar.closest('.volume').addEventListener(wheel(),setVolume,!1);document.documentElement.addEventListener('mouseup',seekingFalse,!1);prevBtn.addEventListener('click',prev,!1);nextBtn.addEventListener('click',next,!1);apActive=!0;renderPL();plBtn.addEventListener('click',plToggle,!1);audio=new Audio();audio.volume=settings.volume;audio.preload='none';audio.addEventListener('error',errorHandler,!1);audio.addEventListener('timeupdate',timeUpdate,!1);audio.addEventListener('ended',doEnd,!1);volumeBar.style.height=audio.volume*100+'%';volumeLength=volumeBar.css('height');if(settings.confirmClose)if(isEmptyList()){return!1}audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;if(settings.autoPlay){audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'));plLi[index].classList.add('pl-list--current');notify(playList[index].title,{icon:playList[index].icon,body:'Now playing'})}}function changeDocumentTitle(title){if(settings.changeDocTitle){if(title){document.title=title}else{document.title=docTitle}}}function beforeUnload(evt){if(!audio.paused){var message='Music still playing';evt.returnValue=message;return message}}function errorHandler(evt){if(isEmptyList()){return}var mediaError={'1':'MEDIA_ERR_ABORTED','2':'MEDIA_ERR_NETWORK','3':'MEDIA_ERR_DECODE','4':'MEDIA_ERR_SRC_NOT_SUPPORTED'};audio.pause();curTime.innerHTML='--';durTime.innerHTML='--';progressBar.style.width=0;preloadBar.style.width=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));plLi[index]&&plLi[index].classList.remove('pl-list--current');changeDocumentTitle();throw new Error('Houston we have a problem: '+mediaError[evt.target.error.code])}function updatePL(addList){if(!apActive){return'Player is not yet initialized'}if(!Array.isArray(addList)){return}if(addList.length===0){return}var count=playList.length;var html=[];playList.push.apply(playList,addList);addList.forEach(function(item){html.push(tplList.replace('{count}',count++).replace('{title}',item.title))});if(plUl.querySelector('.pl-list--empty')){plUl.removeChild(pl.querySelector('.pl-list--empty'));audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title}plUl.insertAdjacentHTML('beforeEnd',html.join(''));plLi=pl.querySelectorAll('li')}function renderPL(){var html=[];playList.forEach(function(item,i){html.push(tplList.replace('{count}',i).replace('{title}',item.title))});pl=create('div',{'className':'pl-container','id':'pl','innerHTML':'<ul class="pl-ul">'+(!isEmptyList()?html.join(''):'<li class="pl-list--empty">PlayList is empty</li>')+'</ul>'});player.parentNode.insertBefore(pl,player.nextSibling);plUl=pl.querySelector('.pl-ul');plLi=plUl.querySelectorAll('li');pl.addEventListener('click',listHandler,!1)}function listHandler(evt){evt.preventDefault();if(evt.target.matches('.pl-list__title')||evt.target.matches('.pl-list__track')||evt.target.matches('.pl-list__icon')||evt.target.matches('.pl-list__eq')||evt.target.matches('.eq')){var current=parseInt(evt.target.closest('.pl-list').getAttribute('data-track'),10);if(index!==current){index=current;play(current)}else{playToggle()}}else{if(!!evt.target.closest('.pl-list__remove')){var parentEl=evt.target.closest('.pl-list');var isDel=parseInt(parentEl.getAttribute('data-track'),10);playList.splice(isDel,1);parentEl.closest('.pl-ul').removeChild(parentEl);plLi=pl.querySelectorAll('li');[].forEach.call(plLi,function(el,i){el.setAttribute('data-track',i)});if(!audio.paused){if(isDel===index){play(index)}}else{if(isEmptyList()){clearAll()}else{if(isDel===index){if(isDel>playList.length-1){index-=1}audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;progressBar.style.width=0}}}if(isDel<index){index--}}}}function plActive(){if(audio.paused){plLi[index].classList.remove('pl-list--current');return}var current=index;for(var i=0,len=plLi.length;len>i;i++){plLi[i].classList.remove('pl-list--current')}plLi[current].classList.add('pl-list--current')}function play(currentIndex){if(isEmptyList()){return clearAll()}index=(currentIndex+playList.length)%playList.length;audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;changeDocumentTitle(playList[index].title);audio.play();notify(playList[index].title,{icon:playList[index].icon,body:'Now playing',tag:'music-player'});playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'));plActive()}function prev(){play(index-1)}function next(){play(index+1)}function isEmptyList(){return playList.length===0}function clearAll(){audio.pause();audio.src='';trackTitle.innerHTML='queue is empty';curTime.innerHTML='--';durTime.innerHTML='--';progressBar.style.width=0;preloadBar.style.width=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));if(!plUl.querySelector('.pl-list--empty')){plUl.innerHTML='<li class="pl-list--empty">PlayList is empty</li>'}changeDocumentTitle()}function playToggle(){if(isEmptyList()){return}if(audio.paused){if(audio.currentTime===0){notify(playList[index].title,{icon:playList[index].icon,body:'Now playing'})}changeDocumentTitle(playList[index].title);audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'))}else{changeDocumentTitle();audio.pause();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'))}plActive()}function volumeToggle(){if(audio.muted){if(parseInt(volumeLength,10)===0){volumeBar.style.height=settings.volume*100+'%';audio.volume=settings.volume}else{volumeBar.style.height=volumeLength}audio.muted=!1;volumeBtn.classList.remove('has-muted')}else{audio.muted=!0;volumeBar.style.height=0;volumeBtn.classList.add('has-muted')}}function repeatToggle(){if(repeatBtn.classList.contains('is-active')){repeating=!1;repeatBtn.classList.remove('is-active')}else{repeating=!0;repeatBtn.classList.add('is-active')}}function plToggle(){plBtn.classList.toggle('is-active');pl.classList.toggle('h-show')}function timeUpdate(){if(audio.readyState===0)return;var barlength=Math.round(audio.currentTime*(100/audio.duration));progressBar.style.width=barlength+'%';var curMins=Math.floor(audio.currentTime/60),curSecs=Math.floor(audio.currentTime-curMins*60),mins=Math.floor(audio.duration/60),secs=Math.floor(audio.duration-mins*60);(curSecs<10)&&(curSecs='0'+curSecs);(secs<10)&&(secs='0'+secs);curTime.innerHTML=curMins+':'+curSecs;durTime.innerHTML=mins+':'+secs;if(settings.buffered){var buffered=audio.buffered;if(buffered.length){var loaded=Math.round(100*buffered.end(0)/audio.duration);preloadBar.style.width=loaded+'%'}}}function shuffle(){if(shuffle){index=Math.round(Math.random()*playList.length)}}function doEnd(){if(index===playList.length-1){if(!repeating){audio.pause();plActive();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));return}else{play(0)}}else{play(index+1)}}function moveBar(evt,el,dir){var value;if(dir==='horizontal'){value=Math.round(((evt.clientX-el.offset().left)+window.pageXOffset)*100/el.parentNode.offsetWidth);el.style.width=value+'%';return value}else{if(evt.type===wheel()){value=parseInt(volumeLength,10);var delta=evt.deltaY||evt.detail||-evt.wheelDelta;value=(delta>0)?value-10:value+10}else{var offset=(el.offset().top+el.offsetHeight)-window.pageYOffset;value=Math.round((offset-evt.clientY))}if(value>100)value=wheelVolumeValue=100;if(value<0)value=wheelVolumeValue=0;volumeBar.style.height=value+'%';return value}}function handlerBar(evt){rightClick=(evt.which===3)?!0:!1;seeking=!0;seek(evt)}function handlerVol(evt){rightClick=(evt.which===3)?!0:!1;seeking=!0;setVolume(evt)}function seek(evt){if(seeking&&rightClick===!1&&audio.readyState!==0){var value=moveBar(evt,progressBar,'horizontal');audio.currentTime=audio.duration*(value/100)}}function seekingFalse(){seeking=!1}function setVolume(evt){evt.preventDefault();volumeLength=volumeBar.css('height');if(seeking&&rightClick===!1||evt.type===wheel()){var value=moveBar(evt,volumeBar.parentNode,'vertical')/100;if(value<=0){audio.volume=0;audio.muted=!0;volumeBtn.classList.add('has-muted')}else{if(audio.muted)audio.muted=!1;audio.volume=value;volumeBtn.classList.remove('has-muted')}}}function notify(title,attr){if(!settings.notification){return}if(window.Notification===undefined){return}attr.tag='AP music player';window.Notification.requestPermission(function(access){if(access==='granted'){var notice=new Notification(title.substr(0,110),attr);setTimeout(notice.close.bind(notice),5000)}})}function destroy(){if(!apActive)return;if(settings.confirmClose){window.removeEventListener('beforeunload',beforeUnload,!1)}playBtn.removeEventListener('click',playToggle,!1);volumeBtn.removeEventListener('click',volumeToggle,!1);repeatBtn.removeEventListener('click',repeatToggle,!1);plBtn.removeEventListener('click',plToggle,!1);progressBar.closest('.progress-container').removeEventListener('mousedown',handlerBar,!1);progressBar.closest('.progress-container').removeEventListener('mousemove',seek,!1);document.documentElement.removeEventListener('mouseup',seekingFalse,!1);volumeBar.closest('.volume').removeEventListener('mousedown',handlerVol,!1);volumeBar.closest('.volume').removeEventListener('mousemove',setVolume);volumeBar.closest('.volume').removeEventListener(wheel(),setVolume);document.documentElement.removeEventListener('mouseup',seekingFalse,!1);prevBtn.removeEventListener('click',prev,!1);nextBtn.removeEventListener('click',next,!1);audio.removeEventListener('error',errorHandler,!1);audio.removeEventListener('timeupdate',timeUpdate,!1);audio.removeEventListener('ended',doEnd,!1);pl.removeEventListener('click',listHandler,!1);pl.parentNode.removeChild(pl);audio.pause();apActive=!1;index=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));volumeBtn.classList.remove('has-muted');plBtn.classList.remove('is-active');repeatBtn.classList.remove('is-active')}function wheel(){var wheel;if('onwheel' in document){wheel='wheel'}else if('onmousewheel' in document){wheel='mousewheel'}else{wheel='MozMousePixelScroll'}return wheel}function extend(defaults,options){for(var name in options){if(defaults.hasOwnProperty(name)){defaults[name]=options[name]}}return defaults}function create(el,attr){var element=document.createElement(el);if(attr){for(var name in attr){if(element[name]!==undefined){element[name]=attr[name]}}}return element}function getTrack(index){return playList[index]}Element.prototype.offset=function(){var el=this.getBoundingClientRect(),scrollLeft=window.pageXOffset||document.documentElement.scrollLeft,scrollTop=window.pageYOffset||document.documentElement.scrollTop;return{top:el.top+scrollTop,left:el.left+scrollLeft}};Element.prototype.css=function(attr){if(typeof attr==='string'){return getComputedStyle(this,'')[attr]}else if(typeof attr==='object'){for(var name in attr){if(this.style[name]!==undefined){this.style[name]=attr[name]}}}};window.Element&&function(ElementPrototype){ElementPrototype.matches=ElementPrototype.matches||ElementPrototype.matchesSelector||ElementPrototype.webkitMatchesSelector||ElementPrototype.msMatchesSelector||function(selector){var node=this,nodes=(node.parentNode||node.document).querySelectorAll(selector),i=-1;while(nodes[++i]&&nodes[i]!=node);return!!nodes[i]}}(Element.prototype);window.Element&&function(ElementPrototype){ElementPrototype.closest=ElementPrototype.closest||function(selector){var el=this;while(el.matches&&!el.matches(selector))el=el.parentNode;return el.matches?el:null}}(Element.prototype);return{init:init,update:updatePL,destroy:destroy,getTrack:getTrack}})();window.AP=AudioPlayer})(window)
// TEST: image for web notifications
var iconImage = 'http://funkyimg.com/i/21pX5.png';

AP.init({
  playList: [
  { 'icon': iconImage, 'title': 'Bora Duran - Başgan', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Lt_BhuoQdhOyQ_0ByKV%2F-Lt_BmDsnCL1zc56v7tk%2Fbasgan.mp3?alt=media&token=192e675b-4754-4081-b537-4721696dcb42' },
  { 'icon': iconImage, 'title': 'Mustafa Sandal & Zeynep Bastık - Mod', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtVr6xLyD97QrICAHU8%2F-LtVrIHqQw5CvoM4DSXv%2Fmod.mp3?alt=media&token=c6d0ad4b-0f64-41c0-bdb5-2992e9b99cf8' },
  { 'icon': iconImage, 'title': 'Feride Hilal Akın - Kim', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtGaIHHXRSPStcUybRP%2F-LtGbVgnRwiB-JetQL94%2Fkim.mp3?alt=media&token=3e5fd084-043b-414e-9fd6-b8054b03dc35' },
  { 'icon': iconImage, 'title': 'Fatma Turgut & Can Baydar - Yangın Yeri', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtB8onx2UJk28iktayB%2F-LtB9uNi3uZTlmgIR7x7%2Fyanginyeri.mp3?alt=media&token=a5c377f4-c371-4a0e-9d9d-c9c366c49d48' },
  { 'icon': iconImage, 'title': 'Eflatun - En Güzel Ben Sevdim', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtGaIHHXRSPStcUybRP%2F-LtGakMfLMFCho54Zfdm%2Fenguzelbensevdim.mp3?alt=media&token=8d44d8a6-a881-4703-8c86-4ad7e912d06d' },
  { 'icon': iconImage, 'title': 'Oğuz Berkay Fidan - Kül', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtBBBAg_ntsIPYbwoR6%2F-LtBC8rvTfi7-L-Yr_Bu%2Fkul.mp3?alt=media&token=463ea90b-feb5-42b2-91a8-cf4cd158adac' },
  { 'icon': iconImage, 'title': 'Ümit Besen & Gülden - Değiştim', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtBCqZDUEDAvPdgAzK0%2F-LtBDV0rj-p0FN4nPFgo%2Fdegistim.mp3?alt=media&token=0de30d30-b020-498c-a967-5b8d4b22dd06' },
  { 'icon': iconImage, 'title': 'Berdan Mardini - Aşktan Geberiyorum', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtB8onx2UJk28iktayB%2F-LtB8sNA2ESC5Kje4BRZ%2Fasktangeberiyorum.mp3?alt=media&token=51703d37-2091-4c43-a015-ebfa9231f1ce' },
  { 'icon': iconImage, 'title': 'Deniz Seki - Nereden Bileceksiniz', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Lt0xYHgcSo4LBs_r-F-%2F-Lt0xabCKATvuoMUpv-Z%2Fneredenbileceksiniz.mp3?alt=media&token=294eaa5a-b267-49f6-a1b7-afa87d5e4e0d' },
  { 'icon': iconImage, 'title': 'İskender Paydaş - Kağızman', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsvGq5pbViCVw-I4rym%2F-LsvGtMlL6mjrMldOkSK%2Fkagizman.mp3?alt=media&token=f968c0e6-7ceb-4695-840a-9c0b515c558b' },
  { 'icon': iconImage, 'title': 'İkiye On Kala - Bütün Istanbul Biliyo', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsmzxSKbvBeUI_aUo96%2F-Lsn-5IEezLjkMZXJS5W%2Fbutunistanbul.mp3?alt=media&token=80529419-4097-4711-a61a-57c78d2455d7' },
  { 'icon': iconImage, 'title': 'Manuş Baba - Onun Bir Sevdiği Var', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LshmbjHYV97e43vEUma%2F-LshmfR5-cGJgBbi09Qf%2Fonunbirsevdigivar.mp3?alt=media&token=8f870f44-fa47-4253-9e1c-7d4e7ef33c1e' },
  { 'icon': iconImage, 'title': 'Tuğba Yurt - Taş Yürek', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LscfQiKKmA_5S2xG5hi%2F-LscgaZchvPh5Xti_n7P%2Ftasyurek.mp3?alt=media&token=89a7f0a5-9f99-425c-bc81-7835e310dbab' },
  { 'icon': iconImage, 'title': 'Tuğba Yurt - Vurkaç', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LscfQiKKmA_5S2xG5hi%2F-LscfWG_rkZyyVBSXdMC%2Fvurkac.mp3?alt=media&token=8d56e04f-f26f-4c4e-8839-94ec88aa5ad7' },
  { 'icon': iconImage, 'title': 'Aydın Kurtoğlu - Tek', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsSvGpmVXOqzTnWVKBF%2F-LsSvIjVxOmBfUKfoj6n%2Ftek.mp3?alt=media&token=80dba39f-4772-46f1-923c-0e951d98c8b0' },
  { 'icon': iconImage, 'title': 'Gökçe - Bu Kalp', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsSykSvKQP6MbVqyBYs%2F-LsSymu4ozhapqFg36AP%2Fbukalp.mp3?alt=media&token=ff2ae573-f990-442b-bb0b-a3d74908f7ec' },
  { 'icon': iconImage, 'title': 'Bilal SONSES - Neyim Olacaktın?', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsIujdJHlIIyVSckGrb%2F-LsIun1MCp9gzkhiwwn9%2Fneyimolacaktin.mp3?alt=media&token=d686b482-609d-47b9-9e27-0a983a389004' },
  { 'icon': iconImage, 'title': 'Cem Adrian & Hande Mehan - Kum Gibi', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsNvzsHmm53ECGGl6DR%2F-LsNw5L8tIkbYqve16jj%2Fkumgibi.mp3?alt=media&token=ab27e330-3bc1-4920-8fb7-67ae92a5eb79' },
  { 'icon': iconImage, 'title': 'Ceren Cennet - Kördüğüm', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsNvEoNqAD7fNIKO56S%2F-LsNvHiAFPJX1HRwO_LO%2Fkordugum.mp3?alt=media&token=bb3baacf-62a1-4d03-b404-6076ab9f9c0b' },
  { 'icon': iconImage, 'title': 'Ebru Yaşar - Alev Alev', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LrzRQOhj53jXurJv001%2F-LrzS0LrsMM_c-bHzBWO%2Falevalev.mp3?alt=media&token=57d6c9d2-37bf-4a0b-a6da-3183f8161b6c' },
  { 'icon': iconImage, 'title': 'Fettah Can - Bırak Ağlayayım', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LrzPjObqLRCicx8Cjec%2F-LrzQEFZ7pbilsRaQwwT%2Fbirakaglayayim.mp3?alt=media&token=1cc0202a-59ba-41c2-b2e0-d972a03f64f4' },
  { 'icon': iconImage, 'title': 'Mabel Matiz - Gözlerine', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsItprVLnqLy5x9dVU7%2F-LsItsutewrF7EkyBP2d%2Fgozlerine.mp3?alt=media&token=ad5153df-c337-4477-8088-5764d0cc87dd' },
  { 'icon': iconImage, 'title': 'Jehan Barbur - Kusura Bakmasınlar', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsIujdJHlIIyVSckGrb%2F-LsIv7waA08YN36xSgov%2Fkusurabakmasinlar.mp3?alt=media&token=dd7da2c3-f1dc-4a25-a114-aa91af9f6d5c' },
  { 'icon': iconImage, 'title': 'Ayşe Hatun Önal - Efsane', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LrePI7Rx4CN-na5E_3f%2F-LrePLSj2UlVh2LseJjd%2Fefsane.mp3?alt=media&token=b5531b1a-f587-462e-90b8-d0475fbda853' },
  { 'icon': iconImage, 'title': 'Simge - Yalnız Başına', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LrzOnzz28wGj_eIRp6X%2F-LrzP8DxvCePJA7mdPyu%2Fyalnizbasina.mp3?alt=media&token=8875b4a9-18e2-4164-bc9a-eda0fee6727c' },
  { 'icon': iconImage, 'title': 'Tuğçe Kandemir - Yelkovan', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqzKmeYBD7-EhOhsjnD%2F-LqzLokW3DjZd_t8IWZQ%2Fyelkovan.mp3?alt=media&token=d38311f8-4fbb-42da-bd5a-cb7f177abbcf' },
  { 'icon': iconImage, 'title': 'Mustafa Ceceli - Bedel', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LreNfb1ol7aPPTYJQBC%2F-LreOdcAOnMIWB71U9zv%2Fbedel.mp3?alt=media&token=153214cb-2416-49b8-938d-d19b219a4349' },
  { 'icon': iconImage, 'title': 'Cem Belevi - Farkında mısın', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LreNfb1ol7aPPTYJQBC%2F-LreOGWz-lXdmR1el3ny%2Ffarkindamisin.mp3?alt=media&token=165c6249-ee36-4ef1-a94a-3b9d6cc92179' },
  { 'icon': iconImage, 'title': 'Irmak Arıcı - Mevzum Derin', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqzKmeYBD7-EhOhsjnD%2F-LqzLClVmTE91yJVAgIb%2Fmevzumderin.mp3?alt=media&token=6f2ff932-d5dd-44b8-bf5f-86af76f3f694' },
  { 'icon': iconImage, 'title': 'Can Bonomo - Ruhum Bela', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsM4xpKNIGV7fViA4Cr%2F-LsM50t0cfo778YNtY4n%2Fruhumbela.mp3?alt=media&token=eba6512f-ca55-44f8-80c8-38930d9b573b' },
  { 'icon': iconImage, 'title': 'İlyas Yalçıntaş - Farzet', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqzKmeYBD7-EhOhsjnD%2F-LqzKp75B6RZz7A8GBTV%2Ffarzet.mp3?alt=media&token=732dbe32-a214-45dc-9f09-c71cfd6515f2' },
  { 'icon': iconImage, 'title': 'Mehmet Erdem - Sen De Vur Gülüm', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LrAt4uFPiShOFKZzKzU%2F-LrAtO4xaOox9NYMcgPi%2Fsendevurgulum.mp3?alt=media&token=5dd5f6c0-cf35-421a-8c44-9a9b30486d8d' }] });