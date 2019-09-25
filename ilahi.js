﻿(function(window,undefined){'use strict';var AudioPlayer=(function(){var docTitle=document.title,player=document.getElementById('ap'),playBtn,playSvg,playSvgPath,prevBtn,nextBtn,plBtn,repeatBtn,volumeBtn,progressBar,preloadBar,curTime,durTime,trackTitle,audio,index=0,playList,volumeBar,wheelVolumeValue=0,volumeLength,repeating=!1,seeking=!1,rightClick=!1,apActive=!1,pl,plUl,plLi,tplList='<li class="pl-list" data-track="{count}">'+'<div class="pl-list__track">'+'<div class="pl-list__icon"></div>'+'<div class="pl-list__eq">'+'<div class="eq">'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'</div>'+'</div>'+'</div>'+'<div class="pl-list__title">{title}</div>'+'</li>',settings={volume:.7,changeDocTitle:!0,confirmClose:!0,autoPlay:!1,buffered:!0,notification:!0,playList:[]};function init(options){if(!('classList' in document.documentElement)){return!1}if(apActive||player===null){return'Player already init'}settings=extend(settings,options);playBtn=player.querySelector('.ap__controls--toggle');playSvg=playBtn.querySelector('.icon-play');playSvgPath=playSvg.querySelector('path');prevBtn=player.querySelector('.ap__controls--prev');nextBtn=player.querySelector('.ap__controls--next');repeatBtn=player.querySelector('.ap__controls--repeat');volumeBtn=player.querySelector('.volume-btn');plBtn=player.querySelector('.ap__controls--playlist');curTime=player.querySelector('.track__time--current');durTime=player.querySelector('.track__time--duration');trackTitle=player.querySelector('.track__title');progressBar=player.querySelector('.progress__bar');preloadBar=player.querySelector('.progress__preload');volumeBar=player.querySelector('.volume__bar');playList=settings.playList;playBtn.addEventListener('click',playToggle,!1);volumeBtn.addEventListener('click',volumeToggle,!1);repeatBtn.addEventListener('click',repeatToggle,!1);progressBar.closest('.progress-container').addEventListener('mousedown',handlerBar,!1);progressBar.closest('.progress-container').addEventListener('mousemove',seek,!1);document.documentElement.addEventListener('mouseup',seekingFalse,!1);volumeBar.closest('.volume').addEventListener('mousedown',handlerVol,!1);volumeBar.closest('.volume').addEventListener('mousemove',setVolume);volumeBar.closest('.volume').addEventListener(wheel(),setVolume,!1);document.documentElement.addEventListener('mouseup',seekingFalse,!1);prevBtn.addEventListener('click',prev,!1);nextBtn.addEventListener('click',next,!1);apActive=!0;renderPL();plBtn.addEventListener('click',plToggle,!1);audio=new Audio();audio.volume=settings.volume;audio.preload='none';audio.addEventListener('error',errorHandler,!1);audio.addEventListener('timeupdate',timeUpdate,!1);audio.addEventListener('ended',doEnd,!1);volumeBar.style.height=audio.volume*100+'%';volumeLength=volumeBar.css('height');if(settings.confirmClose)if(isEmptyList()){return!1}audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;if(settings.autoPlay){audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'));plLi[index].classList.add('pl-list--current');notify(playList[index].title,{icon:playList[index].icon,body:'Now playing'})}}function changeDocumentTitle(title){if(settings.changeDocTitle){if(title){document.title=title}else{document.title=docTitle}}}function beforeUnload(evt){if(!audio.paused){var message='Music still playing';evt.returnValue=message;return message}}function errorHandler(evt){if(isEmptyList()){return}var mediaError={'1':'MEDIA_ERR_ABORTED','2':'MEDIA_ERR_NETWORK','3':'MEDIA_ERR_DECODE','4':'MEDIA_ERR_SRC_NOT_SUPPORTED'};audio.pause();curTime.innerHTML='--';durTime.innerHTML='--';progressBar.style.width=0;preloadBar.style.width=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));plLi[index]&&plLi[index].classList.remove('pl-list--current');changeDocumentTitle();throw new Error('Houston we have a problem: '+mediaError[evt.target.error.code])}function updatePL(addList){if(!apActive){return'Player is not yet initialized'}if(!Array.isArray(addList)){return}if(addList.length===0){return}var count=playList.length;var html=[];playList.push.apply(playList,addList);addList.forEach(function(item){html.push(tplList.replace('{count}',count++).replace('{title}',item.title))});if(plUl.querySelector('.pl-list--empty')){plUl.removeChild(pl.querySelector('.pl-list--empty'));audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title}plUl.insertAdjacentHTML('beforeEnd',html.join(''));plLi=pl.querySelectorAll('li')}function renderPL(){var html=[];playList.forEach(function(item,i){html.push(tplList.replace('{count}',i).replace('{title}',item.title))});pl=create('div',{'className':'pl-container','id':'pl','innerHTML':'<ul class="pl-ul">'+(!isEmptyList()?html.join(''):'<li class="pl-list--empty">PlayList is empty</li>')+'</ul>'});player.parentNode.insertBefore(pl,player.nextSibling);plUl=pl.querySelector('.pl-ul');plLi=plUl.querySelectorAll('li');pl.addEventListener('click',listHandler,!1)}function listHandler(evt){evt.preventDefault();if(evt.target.matches('.pl-list__title')||evt.target.matches('.pl-list__track')||evt.target.matches('.pl-list__icon')||evt.target.matches('.pl-list__eq')||evt.target.matches('.eq')){var current=parseInt(evt.target.closest('.pl-list').getAttribute('data-track'),10);if(index!==current){index=current;play(current)}else{playToggle()}}else{if(!!evt.target.closest('.pl-list__remove')){var parentEl=evt.target.closest('.pl-list');var isDel=parseInt(parentEl.getAttribute('data-track'),10);playList.splice(isDel,1);parentEl.closest('.pl-ul').removeChild(parentEl);plLi=pl.querySelectorAll('li');[].forEach.call(plLi,function(el,i){el.setAttribute('data-track',i)});if(!audio.paused){if(isDel===index){play(index)}}else{if(isEmptyList()){clearAll()}else{if(isDel===index){if(isDel>playList.length-1){index-=1}audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;progressBar.style.width=0}}}if(isDel<index){index--}}}}function plActive(){if(audio.paused){plLi[index].classList.remove('pl-list--current');return}var current=index;for(var i=0,len=plLi.length;len>i;i++){plLi[i].classList.remove('pl-list--current')}plLi[current].classList.add('pl-list--current')}function play(currentIndex){if(isEmptyList()){return clearAll()}index=(currentIndex+playList.length)%playList.length;audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;changeDocumentTitle(playList[index].title);audio.play();notify(playList[index].title,{icon:playList[index].icon,body:'Now playing',tag:'music-player'});playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'));plActive()}function prev(){play(index-1)}function next(){play(index+1)}function isEmptyList(){return playList.length===0}function clearAll(){audio.pause();audio.src='';trackTitle.innerHTML='queue is empty';curTime.innerHTML='--';durTime.innerHTML='--';progressBar.style.width=0;preloadBar.style.width=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));if(!plUl.querySelector('.pl-list--empty')){plUl.innerHTML='<li class="pl-list--empty">PlayList is empty</li>'}changeDocumentTitle()}function playToggle(){if(isEmptyList()){return}if(audio.paused){if(audio.currentTime===0){notify(playList[index].title,{icon:playList[index].icon,body:'Now playing'})}changeDocumentTitle(playList[index].title);audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'))}else{changeDocumentTitle();audio.pause();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'))}plActive()}function volumeToggle(){if(audio.muted){if(parseInt(volumeLength,10)===0){volumeBar.style.height=settings.volume*100+'%';audio.volume=settings.volume}else{volumeBar.style.height=volumeLength}audio.muted=!1;volumeBtn.classList.remove('has-muted')}else{audio.muted=!0;volumeBar.style.height=0;volumeBtn.classList.add('has-muted')}}function repeatToggle(){if(repeatBtn.classList.contains('is-active')){repeating=!1;repeatBtn.classList.remove('is-active')}else{repeating=!0;repeatBtn.classList.add('is-active')}}function plToggle(){plBtn.classList.toggle('is-active');pl.classList.toggle('h-show')}function timeUpdate(){if(audio.readyState===0)return;var barlength=Math.round(audio.currentTime*(100/audio.duration));progressBar.style.width=barlength+'%';var curMins=Math.floor(audio.currentTime/60),curSecs=Math.floor(audio.currentTime-curMins*60),mins=Math.floor(audio.duration/60),secs=Math.floor(audio.duration-mins*60);(curSecs<10)&&(curSecs='0'+curSecs);(secs<10)&&(secs='0'+secs);curTime.innerHTML=curMins+':'+curSecs;durTime.innerHTML=mins+':'+secs;if(settings.buffered){var buffered=audio.buffered;if(buffered.length){var loaded=Math.round(100*buffered.end(0)/audio.duration);preloadBar.style.width=loaded+'%'}}}function shuffle(){if(shuffle){index=Math.round(Math.random()*playList.length)}}function doEnd(){if(index===playList.length-1){if(!repeating){audio.pause();plActive();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));return}else{play(0)}}else{play(index+1)}}function moveBar(evt,el,dir){var value;if(dir==='horizontal'){value=Math.round(((evt.clientX-el.offset().left)+window.pageXOffset)*100/el.parentNode.offsetWidth);el.style.width=value+'%';return value}else{if(evt.type===wheel()){value=parseInt(volumeLength,10);var delta=evt.deltaY||evt.detail||-evt.wheelDelta;value=(delta>0)?value-10:value+10}else{var offset=(el.offset().top+el.offsetHeight)-window.pageYOffset;value=Math.round((offset-evt.clientY))}if(value>100)value=wheelVolumeValue=100;if(value<0)value=wheelVolumeValue=0;volumeBar.style.height=value+'%';return value}}function handlerBar(evt){rightClick=(evt.which===3)?!0:!1;seeking=!0;seek(evt)}function handlerVol(evt){rightClick=(evt.which===3)?!0:!1;seeking=!0;setVolume(evt)}function seek(evt){if(seeking&&rightClick===!1&&audio.readyState!==0){var value=moveBar(evt,progressBar,'horizontal');audio.currentTime=audio.duration*(value/100)}}function seekingFalse(){seeking=!1}function setVolume(evt){evt.preventDefault();volumeLength=volumeBar.css('height');if(seeking&&rightClick===!1||evt.type===wheel()){var value=moveBar(evt,volumeBar.parentNode,'vertical')/100;if(value<=0){audio.volume=0;audio.muted=!0;volumeBtn.classList.add('has-muted')}else{if(audio.muted)audio.muted=!1;audio.volume=value;volumeBtn.classList.remove('has-muted')}}}function notify(title,attr){if(!settings.notification){return}if(window.Notification===undefined){return}attr.tag='AP music player';window.Notification.requestPermission(function(access){if(access==='granted'){var notice=new Notification(title.substr(0,110),attr);setTimeout(notice.close.bind(notice),5000)}})}function destroy(){if(!apActive)return;if(settings.confirmClose){window.removeEventListener('beforeunload',beforeUnload,!1)}playBtn.removeEventListener('click',playToggle,!1);volumeBtn.removeEventListener('click',volumeToggle,!1);repeatBtn.removeEventListener('click',repeatToggle,!1);plBtn.removeEventListener('click',plToggle,!1);progressBar.closest('.progress-container').removeEventListener('mousedown',handlerBar,!1);progressBar.closest('.progress-container').removeEventListener('mousemove',seek,!1);document.documentElement.removeEventListener('mouseup',seekingFalse,!1);volumeBar.closest('.volume').removeEventListener('mousedown',handlerVol,!1);volumeBar.closest('.volume').removeEventListener('mousemove',setVolume);volumeBar.closest('.volume').removeEventListener(wheel(),setVolume);document.documentElement.removeEventListener('mouseup',seekingFalse,!1);prevBtn.removeEventListener('click',prev,!1);nextBtn.removeEventListener('click',next,!1);audio.removeEventListener('error',errorHandler,!1);audio.removeEventListener('timeupdate',timeUpdate,!1);audio.removeEventListener('ended',doEnd,!1);pl.removeEventListener('click',listHandler,!1);pl.parentNode.removeChild(pl);audio.pause();apActive=!1;index=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));volumeBtn.classList.remove('has-muted');plBtn.classList.remove('is-active');repeatBtn.classList.remove('is-active')}function wheel(){var wheel;if('onwheel' in document){wheel='wheel'}else if('onmousewheel' in document){wheel='mousewheel'}else{wheel='MozMousePixelScroll'}return wheel}function extend(defaults,options){for(var name in options){if(defaults.hasOwnProperty(name)){defaults[name]=options[name]}}return defaults}function create(el,attr){var element=document.createElement(el);if(attr){for(var name in attr){if(element[name]!==undefined){element[name]=attr[name]}}}return element}function getTrack(index){return playList[index]}Element.prototype.offset=function(){var el=this.getBoundingClientRect(),scrollLeft=window.pageXOffset||document.documentElement.scrollLeft,scrollTop=window.pageYOffset||document.documentElement.scrollTop;return{top:el.top+scrollTop,left:el.left+scrollLeft}};Element.prototype.css=function(attr){if(typeof attr==='string'){return getComputedStyle(this,'')[attr]}else if(typeof attr==='object'){for(var name in attr){if(this.style[name]!==undefined){this.style[name]=attr[name]}}}};window.Element&&function(ElementPrototype){ElementPrototype.matches=ElementPrototype.matches||ElementPrototype.matchesSelector||ElementPrototype.webkitMatchesSelector||ElementPrototype.msMatchesSelector||function(selector){var node=this,nodes=(node.parentNode||node.document).querySelectorAll(selector),i=-1;while(nodes[++i]&&nodes[i]!=node);return!!nodes[i]}}(Element.prototype);window.Element&&function(ElementPrototype){ElementPrototype.closest=ElementPrototype.closest||function(selector){var el=this;while(el.matches&&!el.matches(selector))el=el.parentNode;return el.matches?el:null}}(Element.prototype);return{init:init,update:updatePL,destroy:destroy,getTrack:getTrack}})();window.AP=AudioPlayer})(window)
// TEST: image for web notifications
var iconImage = '';
AP.init({
  playList: [
    {'icon': iconImage, 'title': 'Mustafa Ceceli - Aşk İçin Gelmişiz', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7Htuh5mhvj6h0Fp1a%2Faskicingelmisiz.mp3?alt=media&token=a1990efa-bd9d-40e4-9e76-ff46d60fe552'},
    {'icon': iconImage, 'title': 'Sami Yusuf - Hasbi Rabbi', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7HxBLD4KmFjC9jRWF%2Fallahu.mp3?alt=media&token=20b9bce2-4769-48ed-a542-d5c87e07af53'},
    {'icon': iconImage, 'title': 'Sedat Uçan - Medineye Varamadım', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7Hd_0encGz08Z1EQ6%2Fmedineyevaramadim.mp3?alt=media&token=5b86bdc8-85ab-4402-8d5b-e2d50715d6c9'},
    {'icon': iconImage, 'title': 'Mehmet Karakuş - Tevhid Tabibi', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7HURwc1d6_2RjDhEf%2Ftevhidtabibi.mp3?alt=media&token=f2b4c3db-bf66-4fff-b5f1-0ec246c38752'},
    {'icon': iconImage, 'title': 'Mustafa Ceceli - Sevdim Seni Mabuduma', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7HfXU5ODz6a89UlUs%2Fmabuduma.mp3?alt=media&token=82c22b9d-b2dc-449e-88f6-c1d4e8116f58'},
    {'icon': iconImage, 'title': 'Dursun Ali Erzincanlı & Sedat Uçan - Nerdesin Ya Nebi', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7HaKeDtpYVPP75_09%2Fnerdesinyanebi.mp3?alt=media&token=a2a2079b-f516-48bf-8c1b-8dbc31d7d19e'},
    {'icon': iconImage, 'title': 'İsmail Uslu & Grup 571 - 571 de Bir Güneş Doğdu', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7I0tl9PhZo6Uu2XFd%2F571de.MP3?alt=media&token=d5d58620-9233-4dee-89d2-06b0c05849c8'},
    {'icon': iconImage, 'title': 'İbrahim Adem Say - Gel Gör Beni Aşk Neyledi', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7HmsJEuacyySapLD_%2Fgelgorbeni.mp3?alt=media&token=42f4cd3a-43ed-49ae-9ae4-aaffa00c4c28'},
    {'icon': iconImage, 'title': 'Mehmet Emin Ay - Taleal Bedru Aleyna', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7HWSSd5IBS483Lqt-%2Ftalealbedru.mp3?alt=media&token=b167a8a7-13ec-4251-b472-e5cb29de96a3'},
    {'icon': iconImage, 'title': 'Mustafa Özcan Güneşdoğdu - Cürmüm İle Geldim Sana', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7HrHZBNezTK7lU-6G%2Fcurmumile.mp3?alt=media&token=a3544fec-6842-49c7-9d2a-510b99e51c0d'},
    {'icon': iconImage, 'title': 'Cemal Kuru - Kabrimin İlk Gecesi', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7QgoJx2VVQR-FaFfN%2F-LN7SYhEAVi_zXc8mfFH%2Filkgecesi.mp3?alt=media&token=53d82b65-a3a6-4e06-b30e-f1b63b9567a0'},
    {'icon': iconImage, 'title': 'Dursun Ali Erzincanlı - Ensar', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN70jEXtqQ1uP1SOus9%2F-LN71At8e7fJNKqa8Ah3%2Fensar.MP3?alt=media&token=a3e61c66-be07-4d57-813b-852a13d8acae'},
    {'icon': iconImage, 'title': 'Abdurrahman Önül - Annem', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN70jEXtqQ1uP1SOus9%2F-LN70mozgvSkxSRTHl80%2Fabdurrahmanannem.mp3?alt=media&token=d2087766-33be-4aad-ba33-13f83398b5e1'},
    {'icon': iconImage, 'title': 'Sedat Uçan - Gururlanma İnsanoğlu', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7QgoJx2VVQR-FaFfN%2F-LN7SWemXnQjTTFIYBtz%2Fgururlanma.mp3?alt=media&token=297599c1-e674-427d-a652-88c7c5133800'},
    {'icon': iconImage, 'title': 'Abdurrahman Önül - Yaralıyım', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7HOsjlQMSnN6Gbuf0%2Fyaraliyim.mp3?alt=media&token=954be598-e12e-4ac0-8329-08a4293c19d6'},
    {'icon': iconImage, 'title': 'Dursun Ali Erzincanlı - Sen Yoktun', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7QgoJx2VVQR-FaFfN%2F-LN7SbU-0j33F_pyMne7%2Fsenyoktun.mp3?alt=media&token=6e674760-e667-4d87-9425-a6786097705b'},
    {'icon': iconImage, 'title': 'Sedat Uçan - Annem', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7HvfCYOR5Ca5YSqZH%2Fannem.mp3?alt=media&token=e3f2f79a-3a1b-467c-a011-ffb1a77b48d8'},
    {'icon': iconImage, 'title': 'Abdurrahman Önül - Kerbela', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7Hh2w0KZasdknEMYC%2Fkerbela.mp3?alt=media&token=a8dc8727-fb2e-4dc5-b1f1-8ebf574a1670'},
    {'icon': iconImage, 'title': 'Dursun Ali Erzincanlı - Gelseydin', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7Hl10pXV7qN27ceou%2Fgelseydin.MP3?alt=media&token=9e1bb4a5-0e4f-4589-9920-f2310578655a'},
    {'icon': iconImage, 'title': 'Hasan Dursun - Özledim Rasulü', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7HZV1fXvzeU4hxLxM%2Fozledimresulu.mp3?alt=media&token=528d72ff-b6c4-4551-91f6-cc859d976912'},
    {'icon': iconImage, 'title': 'Dursun Ali Erzincanlı - Mekkenin Fethi', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7QgoJx2VVQR-FaFfN%2F-LN7S_hdCTLhqa5Ci06i%2Fmekkeninfethi.mp3?alt=media&token=f7f4c6b4-0dce-4c09-826f-acee0970c2d2'},
    {'icon': iconImage, 'title': 'Minik Dualar Grubu - yetim kız', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7HNCZA3tyRPa7QY3V%2Fyetimkiz.MP3?alt=media&token=7175b40e-7669-4027-b797-491a981bfa48'},
    {'icon': iconImage, 'title': 'Güçlü Soydemir - bir çift turna', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LN7H0LpqjLNT2zsEhk7%2F-LN7HR4d04oD7w6SA062%2Fturna.mp3?alt=media&token=32051811-3bc8-4b01-93bc-3aceacfe088e'},
  ]
});

$(document).ready(function(){
  $(".pl-list__download").on("click", function(){
    var trackPlaying = $(this).closest(".pl-list");
    console.log(AP.getTrack(trackPlaying.attr("data-track")));
  });
});