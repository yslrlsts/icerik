﻿(function(window,undefined){'use strict';var AudioPlayer=(function(){var docTitle=document.title,player=document.getElementById('ap'),playBtn,playSvg,playSvgPath,prevBtn,nextBtn,plBtn,repeatBtn,volumeBtn,progressBar,preloadBar,curTime,durTime,trackTitle,audio,index=0,playList,volumeBar,wheelVolumeValue=0,volumeLength,repeating=!1,seeking=!1,rightClick=!1,apActive=!1,pl,plUl,plLi,tplList='<li class="pl-list" data-track="{count}">'+'<div class="pl-list__track">'+'<div class="pl-list__icon"></div>'+'<div class="pl-list__eq">'+'<div class="eq">'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'</div>'+'</div>'+'</div>'+'<div class="pl-list__title">{title}</div>'+'</li>',settings={volume:.7,changeDocTitle:!0,confirmClose:!0,autoPlay:!1,buffered:!0,notification:!0,playList:[]};function init(options){if(!('classList' in document.documentElement)){return!1}if(apActive||player===null){return'Player already init'}settings=extend(settings,options);playBtn=player.querySelector('.ap__controls--toggle');playSvg=playBtn.querySelector('.icon-play');playSvgPath=playSvg.querySelector('path');prevBtn=player.querySelector('.ap__controls--prev');nextBtn=player.querySelector('.ap__controls--next');repeatBtn=player.querySelector('.ap__controls--repeat');volumeBtn=player.querySelector('.volume-btn');plBtn=player.querySelector('.ap__controls--playlist');curTime=player.querySelector('.track__time--current');durTime=player.querySelector('.track__time--duration');trackTitle=player.querySelector('.track__title');progressBar=player.querySelector('.progress__bar');preloadBar=player.querySelector('.progress__preload');volumeBar=player.querySelector('.volume__bar');playList=settings.playList;playBtn.addEventListener('click',playToggle,!1);volumeBtn.addEventListener('click',volumeToggle,!1);repeatBtn.addEventListener('click',repeatToggle,!1);progressBar.closest('.progress-container').addEventListener('mousedown',handlerBar,!1);progressBar.closest('.progress-container').addEventListener('mousemove',seek,!1);document.documentElement.addEventListener('mouseup',seekingFalse,!1);volumeBar.closest('.volume').addEventListener('mousedown',handlerVol,!1);volumeBar.closest('.volume').addEventListener('mousemove',setVolume);volumeBar.closest('.volume').addEventListener(wheel(),setVolume,!1);document.documentElement.addEventListener('mouseup',seekingFalse,!1);prevBtn.addEventListener('click',prev,!1);nextBtn.addEventListener('click',next,!1);apActive=!0;renderPL();plBtn.addEventListener('click',plToggle,!1);audio=new Audio();audio.volume=settings.volume;audio.preload='none';audio.addEventListener('error',errorHandler,!1);audio.addEventListener('timeupdate',timeUpdate,!1);audio.addEventListener('ended',doEnd,!1);volumeBar.style.height=audio.volume*100+'%';volumeLength=volumeBar.css('height');if(settings.confirmClose)if(isEmptyList()){return!1}audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;if(settings.autoPlay){audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'));plLi[index].classList.add('pl-list--current');notify(playList[index].title,{icon:playList[index].icon,body:'Now playing'})}}function changeDocumentTitle(title){if(settings.changeDocTitle){if(title){document.title=title}else{document.title=docTitle}}}function beforeUnload(evt){if(!audio.paused){var message='Music still playing';evt.returnValue=message;return message}}function errorHandler(evt){if(isEmptyList()){return}var mediaError={'1':'MEDIA_ERR_ABORTED','2':'MEDIA_ERR_NETWORK','3':'MEDIA_ERR_DECODE','4':'MEDIA_ERR_SRC_NOT_SUPPORTED'};audio.pause();curTime.innerHTML='--';durTime.innerHTML='--';progressBar.style.width=0;preloadBar.style.width=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));plLi[index]&&plLi[index].classList.remove('pl-list--current');changeDocumentTitle();throw new Error('Houston we have a problem: '+mediaError[evt.target.error.code])}function updatePL(addList){if(!apActive){return'Player is not yet initialized'}if(!Array.isArray(addList)){return}if(addList.length===0){return}var count=playList.length;var html=[];playList.push.apply(playList,addList);addList.forEach(function(item){html.push(tplList.replace('{count}',count++).replace('{title}',item.title))});if(plUl.querySelector('.pl-list--empty')){plUl.removeChild(pl.querySelector('.pl-list--empty'));audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title}plUl.insertAdjacentHTML('beforeEnd',html.join(''));plLi=pl.querySelectorAll('li')}function renderPL(){var html=[];playList.forEach(function(item,i){html.push(tplList.replace('{count}',i).replace('{title}',item.title))});pl=create('div',{'className':'pl-container','id':'pl','innerHTML':'<ul class="pl-ul">'+(!isEmptyList()?html.join(''):'<li class="pl-list--empty">PlayList is empty</li>')+'</ul>'});player.parentNode.insertBefore(pl,player.nextSibling);plUl=pl.querySelector('.pl-ul');plLi=plUl.querySelectorAll('li');pl.addEventListener('click',listHandler,!1)}function listHandler(evt){evt.preventDefault();if(evt.target.matches('.pl-list__title')||evt.target.matches('.pl-list__track')||evt.target.matches('.pl-list__icon')||evt.target.matches('.pl-list__eq')||evt.target.matches('.eq')){var current=parseInt(evt.target.closest('.pl-list').getAttribute('data-track'),10);if(index!==current){index=current;play(current)}else{playToggle()}}else{if(!!evt.target.closest('.pl-list__remove')){var parentEl=evt.target.closest('.pl-list');var isDel=parseInt(parentEl.getAttribute('data-track'),10);playList.splice(isDel,1);parentEl.closest('.pl-ul').removeChild(parentEl);plLi=pl.querySelectorAll('li');[].forEach.call(plLi,function(el,i){el.setAttribute('data-track',i)});if(!audio.paused){if(isDel===index){play(index)}}else{if(isEmptyList()){clearAll()}else{if(isDel===index){if(isDel>playList.length-1){index-=1}audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;progressBar.style.width=0}}}if(isDel<index){index--}}}}function plActive(){if(audio.paused){plLi[index].classList.remove('pl-list--current');return}var current=index;for(var i=0,len=plLi.length;len>i;i++){plLi[i].classList.remove('pl-list--current')}plLi[current].classList.add('pl-list--current')}function play(currentIndex){if(isEmptyList()){return clearAll()}index=(currentIndex+playList.length)%playList.length;audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;changeDocumentTitle(playList[index].title);audio.play();notify(playList[index].title,{icon:playList[index].icon,body:'Now playing',tag:'music-player'});playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'));plActive()}function prev(){play(index-1)}function next(){play(index+1)}function isEmptyList(){return playList.length===0}function clearAll(){audio.pause();audio.src='';trackTitle.innerHTML='queue is empty';curTime.innerHTML='--';durTime.innerHTML='--';progressBar.style.width=0;preloadBar.style.width=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));if(!plUl.querySelector('.pl-list--empty')){plUl.innerHTML='<li class="pl-list--empty">PlayList is empty</li>'}changeDocumentTitle()}function playToggle(){if(isEmptyList()){return}if(audio.paused){if(audio.currentTime===0){notify(playList[index].title,{icon:playList[index].icon,body:'Now playing'})}changeDocumentTitle(playList[index].title);audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'))}else{changeDocumentTitle();audio.pause();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'))}plActive()}function volumeToggle(){if(audio.muted){if(parseInt(volumeLength,10)===0){volumeBar.style.height=settings.volume*100+'%';audio.volume=settings.volume}else{volumeBar.style.height=volumeLength}audio.muted=!1;volumeBtn.classList.remove('has-muted')}else{audio.muted=!0;volumeBar.style.height=0;volumeBtn.classList.add('has-muted')}}function repeatToggle(){if(repeatBtn.classList.contains('is-active')){repeating=!1;repeatBtn.classList.remove('is-active')}else{repeating=!0;repeatBtn.classList.add('is-active')}}function plToggle(){plBtn.classList.toggle('is-active');pl.classList.toggle('h-show')}function timeUpdate(){if(audio.readyState===0)return;var barlength=Math.round(audio.currentTime*(100/audio.duration));progressBar.style.width=barlength+'%';var curMins=Math.floor(audio.currentTime/60),curSecs=Math.floor(audio.currentTime-curMins*60),mins=Math.floor(audio.duration/60),secs=Math.floor(audio.duration-mins*60);(curSecs<10)&&(curSecs='0'+curSecs);(secs<10)&&(secs='0'+secs);curTime.innerHTML=curMins+':'+curSecs;durTime.innerHTML=mins+':'+secs;if(settings.buffered){var buffered=audio.buffered;if(buffered.length){var loaded=Math.round(100*buffered.end(0)/audio.duration);preloadBar.style.width=loaded+'%'}}}function shuffle(){if(shuffle){index=Math.round(Math.random()*playList.length)}}function doEnd(){if(index===playList.length-1){if(!repeating){audio.pause();plActive();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));return}else{play(0)}}else{play(index+1)}}function moveBar(evt,el,dir){var value;if(dir==='horizontal'){value=Math.round(((evt.clientX-el.offset().left)+window.pageXOffset)*100/el.parentNode.offsetWidth);el.style.width=value+'%';return value}else{if(evt.type===wheel()){value=parseInt(volumeLength,10);var delta=evt.deltaY||evt.detail||-evt.wheelDelta;value=(delta>0)?value-10:value+10}else{var offset=(el.offset().top+el.offsetHeight)-window.pageYOffset;value=Math.round((offset-evt.clientY))}if(value>100)value=wheelVolumeValue=100;if(value<0)value=wheelVolumeValue=0;volumeBar.style.height=value+'%';return value}}function handlerBar(evt){rightClick=(evt.which===3)?!0:!1;seeking=!0;seek(evt)}function handlerVol(evt){rightClick=(evt.which===3)?!0:!1;seeking=!0;setVolume(evt)}function seek(evt){if(seeking&&rightClick===!1&&audio.readyState!==0){var value=moveBar(evt,progressBar,'horizontal');audio.currentTime=audio.duration*(value/100)}}function seekingFalse(){seeking=!1}function setVolume(evt){evt.preventDefault();volumeLength=volumeBar.css('height');if(seeking&&rightClick===!1||evt.type===wheel()){var value=moveBar(evt,volumeBar.parentNode,'vertical')/100;if(value<=0){audio.volume=0;audio.muted=!0;volumeBtn.classList.add('has-muted')}else{if(audio.muted)audio.muted=!1;audio.volume=value;volumeBtn.classList.remove('has-muted')}}}function notify(title,attr){if(!settings.notification){return}if(window.Notification===undefined){return}attr.tag='AP music player';window.Notification.requestPermission(function(access){if(access==='granted'){var notice=new Notification(title.substr(0,110),attr);setTimeout(notice.close.bind(notice),5000)}})}function destroy(){if(!apActive)return;if(settings.confirmClose){window.removeEventListener('beforeunload',beforeUnload,!1)}playBtn.removeEventListener('click',playToggle,!1);volumeBtn.removeEventListener('click',volumeToggle,!1);repeatBtn.removeEventListener('click',repeatToggle,!1);plBtn.removeEventListener('click',plToggle,!1);progressBar.closest('.progress-container').removeEventListener('mousedown',handlerBar,!1);progressBar.closest('.progress-container').removeEventListener('mousemove',seek,!1);document.documentElement.removeEventListener('mouseup',seekingFalse,!1);volumeBar.closest('.volume').removeEventListener('mousedown',handlerVol,!1);volumeBar.closest('.volume').removeEventListener('mousemove',setVolume);volumeBar.closest('.volume').removeEventListener(wheel(),setVolume);document.documentElement.removeEventListener('mouseup',seekingFalse,!1);prevBtn.removeEventListener('click',prev,!1);nextBtn.removeEventListener('click',next,!1);audio.removeEventListener('error',errorHandler,!1);audio.removeEventListener('timeupdate',timeUpdate,!1);audio.removeEventListener('ended',doEnd,!1);pl.removeEventListener('click',listHandler,!1);pl.parentNode.removeChild(pl);audio.pause();apActive=!1;index=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));volumeBtn.classList.remove('has-muted');plBtn.classList.remove('is-active');repeatBtn.classList.remove('is-active')}function wheel(){var wheel;if('onwheel' in document){wheel='wheel'}else if('onmousewheel' in document){wheel='mousewheel'}else{wheel='MozMousePixelScroll'}return wheel}function extend(defaults,options){for(var name in options){if(defaults.hasOwnProperty(name)){defaults[name]=options[name]}}return defaults}function create(el,attr){var element=document.createElement(el);if(attr){for(var name in attr){if(element[name]!==undefined){element[name]=attr[name]}}}return element}function getTrack(index){return playList[index]}Element.prototype.offset=function(){var el=this.getBoundingClientRect(),scrollLeft=window.pageXOffset||document.documentElement.scrollLeft,scrollTop=window.pageYOffset||document.documentElement.scrollTop;return{top:el.top+scrollTop,left:el.left+scrollLeft}};Element.prototype.css=function(attr){if(typeof attr==='string'){return getComputedStyle(this,'')[attr]}else if(typeof attr==='object'){for(var name in attr){if(this.style[name]!==undefined){this.style[name]=attr[name]}}}};window.Element&&function(ElementPrototype){ElementPrototype.matches=ElementPrototype.matches||ElementPrototype.matchesSelector||ElementPrototype.webkitMatchesSelector||ElementPrototype.msMatchesSelector||function(selector){var node=this,nodes=(node.parentNode||node.document).querySelectorAll(selector),i=-1;while(nodes[++i]&&nodes[i]!=node);return!!nodes[i]}}(Element.prototype);window.Element&&function(ElementPrototype){ElementPrototype.closest=ElementPrototype.closest||function(selector){var el=this;while(el.matches&&!el.matches(selector))el=el.parentNode;return el.matches?el:null}}(Element.prototype);return{init:init,update:updatePL,destroy:destroy,getTrack:getTrack}})();window.AP=AudioPlayer})(window)
// TEST: image for web notifications
var iconImage = '';
AP.init({
  playList: [
    {'icon': iconImage, 'title': 'Hande Ünsal - Nerdesin?', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LfLr35_113QVoYYafJr%2F-LfLr8MAgNQgzRtMrvR6%2Fnerdesin.mp3?alt=media&token=4e71cf0f-7a9e-40db-b29a-b2326c54c587'},
    {'icon': iconImage, 'title': 'Merve Özbey - Tebrikler', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Lh-j_lVG3wNMD6mhKc3%2F-Lh-jo6eKVUu3iuaN0Bm%2Ftebrikler.mp3?alt=media&token=f8e9efab-fb5b-4a9a-9949-6b74c50298b0'},
    {'icon': iconImage, 'title': 'Berkay - Ayrılmam', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LfM02NUi6y2QUTjbXPr%2F-LfM082EdJAN8zJnVqf8%2Fayrilmam.mp3?alt=media&token=c16fbf34-68f6-4038-bd32-b6d7865f3d42'},
    {'icon': iconImage, 'title': 'Göksel - Hiç Yok', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LhLFUVTnovIsfIcLLEc%2F-LhLFvDOxBLQ_rHHCkkP%2Fhicyok.mp3?alt=media&token=b43e65f3-d9fa-4e4d-9055-68eddcc4d0d4'},
    {'icon': iconImage, 'title': 'İrem Derici - Acemi Balık', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Lh-j_lVG3wNMD6mhKc3%2F-Lh-ltpAk0yu7xga643k%2Facemibalik.mp3?alt=media&token=b1c90296-b6ab-4b69-aab3-834bcc332580'},
    {'icon': iconImage, 'title': 'Feride Hilal Akın - Yok Yok', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LfLtjTxhnU5Ilh0tdnU%2F-LfLuHbBzx8MbOxepyW0%2Fyokyok.mp3?alt=media&token=31d8b3ac-3c9d-4a47-ac13-68cb14e4ddaa'},
    {'icon': iconImage, 'title': 'Edis - Bana Ne', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-La04QvWy9rxNTZlJdD4%2F-La04sSND3lkYKUeUA3Z%2Fbanane.mp3?alt=media&token=a0087bf0-5201-42dd-aa5d-a5a3b3dfbf22'},
    {'icon': iconImage, 'title': 'Demet Akalın - Esiyor', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Lh-j_lVG3wNMD6mhKc3%2F-Lh-jrTPPxOsSHXPkF2F%2Fesiyor.mp3?alt=media&token=9de1162f-ec0f-41d3-a096-a9b5d5a72db0'},
    {'icon': iconImage, 'title': 'Murat Dalkılıç - Son Liman', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Lc2DWahYI0Oe4uoRSXJ%2F-Lc2Diq1kbEROn5sArXY%2Fsonliman.mp3?alt=media&token=caba30e8-0aa1-40e7-bd66-cf8548df4502'},
    {'icon': iconImage, 'title': 'Buray - Kabahat Bende', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LfLr35_113QVoYYafJr%2F-LfLrHzFArwUikCGYekc%2Fkabahatbende.mp3?alt=media&token=3e2025c6-c05e-4cd8-85a5-c213d474071d'},
    {'icon': iconImage, 'title': 'Özgün - Aşık', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LVPQFWhQv4fjvMP2zKW%2F-LVPQUueyC91VxazYPVN%2Fozasik.mp3?alt=media&token=9e0d2882-3355-4337-a62c-de08e8da3add'},
    {'icon': iconImage, 'title': 'Bilal Sonses - İçimden Gelmiyor', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LcLeI2ICP_JDR3xkh2O%2F-LcLeP3C0LDbEToS-jdz%2Ficimdengelmiyor.mp3?alt=media&token=9bd635e6-b64e-4f18-848b-014edcaff9ab'},
    {'icon': iconImage, 'title': 'Fatma Turgut - Bir Varmış Bir Yokmuş', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Lc2DWahYI0Oe4uoRSXJ%2F-Lc2DqjZdyi24DhENy1J%2Fbirvarmisbir.mp3?alt=media&token=a6e6eb5c-ccef-416e-9b2d-03d980c61c51'},
    {'icon': iconImage, 'title': 'Soner Sarıkabadayı - Tarifi Zor', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LVIMy28ex1U0IMjfIC_%2F-LVIN1lekZARrBRGPpTl%2Ftarifizor.mp3?alt=media&token=323dd260-3b78-45ad-afa3-8ebf2fcfbdfc'},
    {'icon': iconImage, 'title': 'Emre Kaya - Nasıl Diye Sorma', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-La04QvWy9rxNTZlJdD4%2F-La04b4x4iEyvEjwuhfX%2Fnasildiye.mp3?alt=media&token=49528232-bd36-4e0e-8b01-5a376f4afaa7'},
    {'icon': iconImage, 'title': 'İlyas Yalçıntaş - Kirli Kadeh', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Ll0x73Z-XsHX17aXzCt%2F-Ll0xQ7LlgMP2EJSM4Zk%2Fkirlikadeh.mp3?alt=media&token=2e4cb0dd-51c7-423e-8b3c-abb02813af4c'},
    {'icon': iconImage, 'title': 'Ersay Uner - Nokta', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Lh-j_lVG3wNMD6mhKc3%2F-Lh-jpq6wAIavQ-xLUKX%2Fnokta.mp3?alt=media&token=f2b997c0-d1b2-434b-bcd6-0e40ce0c8d98'},
    {'icon': iconImage, 'title': 'Derya Uluğ - Ah Zaman', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Ljgr5DJDgXpvoY-oBnp%2F-Ljgr8fkpfHnJ4Konyfl%2Fahzaman.mp3?alt=media&token=b1440ecd-0741-433d-a6d8-0bc64c82811a'},
    {'icon': iconImage, 'title': 'Ece Seçkin - Geçmiş Zaman', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Li7xM7Z2gIrID5yK_Xg%2F-Li7xVR_nuSeYXUzY3Er%2Fgecmiszaman.mp3?alt=media&token=762aa94c-d3f5-4f1b-9d85-145b574a8a9c'},
    {'icon': iconImage, 'title': 'Berksan ft. Turaç - Yeni Biri', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LndP9ZafPsXCEFGKprv%2F-LndPMoA5iuZVdLHo356%2Fberksanyenibiri.mp3?alt=media&token=f0e014c5-2e67-4f49-b2e5-cd74da31bfdd'},
    {'icon': iconImage, 'title': 'Sıla - Karanfil', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Ll0x73Z-XsHX17aXzCt%2F-Ll0xMb_PDqVDrhDWabH%2Fkaranfil.mp3?alt=media&token=f37dbf5d-32d8-47db-a647-9c8b2d112029'},
    {'icon': iconImage, 'title': 'Yalın - Deme Bana Yokum', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LndSEa5tac3JrvOq0Qr%2F-LndSIfpZniyyASMXF_c%2Fdemebanayokum.mp3?alt=media&token=21fb9d21-863d-4e88-a933-f5f8a06e4ca4'},
    {'icon': iconImage, 'title': 'Simge ft Ozan Doğulu - Ne Zamandır', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Lh-j_lVG3wNMD6mhKc3%2F-Lh-lxSetWPZggCF1X4O%2Fnezamandir.mp3?alt=media&token=3980f148-bde4-4220-9ef4-a5304809b795'},
    {'icon': iconImage, 'title': 'Oğuzhan Koç - Sükut u Hayal', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-La-ld-cLxf2SL-jGXJ9%2F-La-ltnr3HUjHgubxNSC%2Fsukut.mp3?alt=media&token=94564d2b-563f-4a12-b69c-0c6d736c3460'},
    {'icon': iconImage, 'title': 'Aydın Kurtoğlu - Gururdan Gömlek', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LfLr35_113QVoYYafJr%2F-LfLrLDh_UA0pKYhPTIk%2Fgururdangomlek.mp3?alt=media&token=8cd98612-d257-4584-b432-0a8d906e428f'},
    {'icon': iconImage, 'title': 'Hande Ünsal - Seni Sever Miydim?', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LRIj0owruLyIV497Y7n%2F-LRIj4-EAKv0SpirWRi3%2Fsenisever.mp3?alt=media&token=3c2afa40-435c-424d-9649-c4195e5a0955'},
    {'icon': iconImage, 'title': 'Ayla Çelik - Daha Bi Aşık', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LlgVHGFmUynrW9Yf1qM%2F-LlgVWxCW8pxesna7Klz%2Fdahabiasik.mp3?alt=media&token=882dad13-09e4-405f-9999-23a76babc233'},
    {'icon': iconImage, 'title': 'Özgün - Kalbimin Her Yeri', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LndP9ZafPsXCEFGKprv%2F-LndPVpE7656419_5-zz%2Fkalbiminheryeri.mp3?alt=media&token=078b7687-46fb-4c1b-8686-821ea66e9030'},
    {'icon': iconImage, 'title': 'Berkay - Deliler', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-La04QvWy9rxNTZlJdD4%2F-La04ifngpuD8AL9Utyu%2Fdeliler.mp3?alt=media&token=2d0a4645-4704-4782-89bb-727daa7846bb'},
    {'icon': iconImage, 'title': 'Hadise - Geliyorum Yanına', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LlpYeBO1NCmccwNZxzq%2F-LlpYkcOc28nwz6zYx_o%2Fgeliyorumyanina.mp3?alt=media&token=698a9bb3-1389-44b5-ae27-ce85d7613168'},
    {'icon': iconImage, 'title': 'Simge - As Bayrakları', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Ln89yEA2H4j7npfSgZe%2F-Ln8A2WWOjZTV9dSTrF7%2Fasbayraklari.mp3?alt=media&token=654ec9c3-f69f-49b2-b26c-3e3b9fc98323'},
    {'icon': iconImage, 'title': 'Emir - Aynen Devam', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Ll0x73Z-XsHX17aXzCt%2F-Ll0xC6TTJHsHH3bwFlA%2Faynendevam.mp3?alt=media&token=a2f60cf6-5e73-404b-96aa-38650d371f76'},
    {'icon': iconImage, 'title': 'Bora Duran - Sana Doğru', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LNACZnjxZmil7LC6wgV%2F-LNADO5M8hUe6K6NLZ6F%2Fsanadogru.mp3?alt=media&token=8569fb22-bcf7-4254-a076-63c9702d838b'},

  ]
});

$(document).ready(function(){
  $(".pl-list__download").on("click", function(){
    var trackPlaying = $(this).closest(".pl-list");
    console.log(AP.getTrack(trackPlaying.attr("data-track")));
  });
});