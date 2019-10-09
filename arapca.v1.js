(function(window,undefined){'use strict';var AudioPlayer=(function(){var docTitle=document.title,player=document.getElementById('ap'),playBtn,playSvg,playSvgPath,prevBtn,nextBtn,plBtn,repeatBtn,volumeBtn,progressBar,preloadBar,curTime,durTime,trackTitle,audio,index=0,playList,volumeBar,wheelVolumeValue=0,volumeLength,repeating=!1,seeking=!1,rightClick=!1,apActive=!1,pl,plUl,plLi,tplList='<li class="pl-list" data-track="{count}">'+'<div class="pl-list__track">'+'<div class="pl-list__icon"></div>'+'<div class="pl-list__eq">'+'<div class="eq">'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'</div>'+'</div>'+'</div>'+'<div class="pl-list__title">{title}</div>'+'</li>',settings={volume:.7,changeDocTitle:!0,confirmClose:!0,autoPlay:!1,buffered:!0,notification:!0,playList:[]};function init(options){if(!('classList' in document.documentElement)){return!1}if(apActive||player===null){return'Player already init'}settings=extend(settings,options);playBtn=player.querySelector('.ap__controls--toggle');playSvg=playBtn.querySelector('.icon-play');playSvgPath=playSvg.querySelector('path');prevBtn=player.querySelector('.ap__controls--prev');nextBtn=player.querySelector('.ap__controls--next');repeatBtn=player.querySelector('.ap__controls--repeat');volumeBtn=player.querySelector('.volume-btn');plBtn=player.querySelector('.ap__controls--playlist');curTime=player.querySelector('.track__time--current');durTime=player.querySelector('.track__time--duration');trackTitle=player.querySelector('.track__title');progressBar=player.querySelector('.progress__bar');preloadBar=player.querySelector('.progress__preload');volumeBar=player.querySelector('.volume__bar');playList=settings.playList;playBtn.addEventListener('click',playToggle,!1);volumeBtn.addEventListener('click',volumeToggle,!1);repeatBtn.addEventListener('click',repeatToggle,!1);progressBar.closest('.progress-container').addEventListener('mousedown',handlerBar,!1);progressBar.closest('.progress-container').addEventListener('mousemove',seek,!1);document.documentElement.addEventListener('mouseup',seekingFalse,!1);volumeBar.closest('.volume').addEventListener('mousedown',handlerVol,!1);volumeBar.closest('.volume').addEventListener('mousemove',setVolume);volumeBar.closest('.volume').addEventListener(wheel(),setVolume,!1);document.documentElement.addEventListener('mouseup',seekingFalse,!1);prevBtn.addEventListener('click',prev,!1);nextBtn.addEventListener('click',next,!1);apActive=!0;renderPL();plBtn.addEventListener('click',plToggle,!1);audio=new Audio();audio.volume=settings.volume;audio.preload='none';audio.addEventListener('error',errorHandler,!1);audio.addEventListener('timeupdate',timeUpdate,!1);audio.addEventListener('ended',doEnd,!1);volumeBar.style.height=audio.volume*100+'%';volumeLength=volumeBar.css('height');if(settings.confirmClose)if(isEmptyList()){return!1}audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;if(settings.autoPlay){audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'));plLi[index].classList.add('pl-list--current');notify(playList[index].title,{icon:playList[index].icon,body:'Now playing'})}}function changeDocumentTitle(title){if(settings.changeDocTitle){if(title){document.title=title}else{document.title=docTitle}}}function beforeUnload(evt){if(!audio.paused){var message='Music still playing';evt.returnValue=message;return message}}function errorHandler(evt){if(isEmptyList()){return}var mediaError={'1':'MEDIA_ERR_ABORTED','2':'MEDIA_ERR_NETWORK','3':'MEDIA_ERR_DECODE','4':'MEDIA_ERR_SRC_NOT_SUPPORTED'};audio.pause();curTime.innerHTML='--';durTime.innerHTML='--';progressBar.style.width=0;preloadBar.style.width=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));plLi[index]&&plLi[index].classList.remove('pl-list--current');changeDocumentTitle();throw new Error('Houston we have a problem: '+mediaError[evt.target.error.code])}function updatePL(addList){if(!apActive){return'Player is not yet initialized'}if(!Array.isArray(addList)){return}if(addList.length===0){return}var count=playList.length;var html=[];playList.push.apply(playList,addList);addList.forEach(function(item){html.push(tplList.replace('{count}',count++).replace('{title}',item.title))});if(plUl.querySelector('.pl-list--empty')){plUl.removeChild(pl.querySelector('.pl-list--empty'));audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title}plUl.insertAdjacentHTML('beforeEnd',html.join(''));plLi=pl.querySelectorAll('li')}function renderPL(){var html=[];playList.forEach(function(item,i){html.push(tplList.replace('{count}',i).replace('{title}',item.title))});pl=create('div',{'className':'pl-container','id':'pl','innerHTML':'<ul class="pl-ul">'+(!isEmptyList()?html.join(''):'<li class="pl-list--empty">PlayList is empty</li>')+'</ul>'});player.parentNode.insertBefore(pl,player.nextSibling);plUl=pl.querySelector('.pl-ul');plLi=plUl.querySelectorAll('li');pl.addEventListener('click',listHandler,!1)}function listHandler(evt){evt.preventDefault();if(evt.target.matches('.pl-list__title')||evt.target.matches('.pl-list__track')||evt.target.matches('.pl-list__icon')||evt.target.matches('.pl-list__eq')||evt.target.matches('.eq')){var current=parseInt(evt.target.closest('.pl-list').getAttribute('data-track'),10);if(index!==current){index=current;play(current)}else{playToggle()}}else{if(!!evt.target.closest('.pl-list__remove')){var parentEl=evt.target.closest('.pl-list');var isDel=parseInt(parentEl.getAttribute('data-track'),10);playList.splice(isDel,1);parentEl.closest('.pl-ul').removeChild(parentEl);plLi=pl.querySelectorAll('li');[].forEach.call(plLi,function(el,i){el.setAttribute('data-track',i)});if(!audio.paused){if(isDel===index){play(index)}}else{if(isEmptyList()){clearAll()}else{if(isDel===index){if(isDel>playList.length-1){index-=1}audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;progressBar.style.width=0}}}if(isDel<index){index--}}}}function plActive(){if(audio.paused){plLi[index].classList.remove('pl-list--current');return}var current=index;for(var i=0,len=plLi.length;len>i;i++){plLi[i].classList.remove('pl-list--current')}plLi[current].classList.add('pl-list--current')}function play(currentIndex){if(isEmptyList()){return clearAll()}index=(currentIndex+playList.length)%playList.length;audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;changeDocumentTitle(playList[index].title);audio.play();notify(playList[index].title,{icon:playList[index].icon,body:'Now playing',tag:'music-player'});playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'));plActive()}function prev(){play(index-1)}function next(){play(index+1)}function isEmptyList(){return playList.length===0}function clearAll(){audio.pause();audio.src='';trackTitle.innerHTML='queue is empty';curTime.innerHTML='--';durTime.innerHTML='--';progressBar.style.width=0;preloadBar.style.width=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));if(!plUl.querySelector('.pl-list--empty')){plUl.innerHTML='<li class="pl-list--empty">PlayList is empty</li>'}changeDocumentTitle()}function playToggle(){if(isEmptyList()){return}if(audio.paused){if(audio.currentTime===0){notify(playList[index].title,{icon:playList[index].icon,body:'Now playing'})}changeDocumentTitle(playList[index].title);audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'))}else{changeDocumentTitle();audio.pause();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'))}plActive()}function volumeToggle(){if(audio.muted){if(parseInt(volumeLength,10)===0){volumeBar.style.height=settings.volume*100+'%';audio.volume=settings.volume}else{volumeBar.style.height=volumeLength}audio.muted=!1;volumeBtn.classList.remove('has-muted')}else{audio.muted=!0;volumeBar.style.height=0;volumeBtn.classList.add('has-muted')}}function repeatToggle(){if(repeatBtn.classList.contains('is-active')){repeating=!1;repeatBtn.classList.remove('is-active')}else{repeating=!0;repeatBtn.classList.add('is-active')}}function plToggle(){plBtn.classList.toggle('is-active');pl.classList.toggle('h-show')}function timeUpdate(){if(audio.readyState===0)return;var barlength=Math.round(audio.currentTime*(100/audio.duration));progressBar.style.width=barlength+'%';var curMins=Math.floor(audio.currentTime/60),curSecs=Math.floor(audio.currentTime-curMins*60),mins=Math.floor(audio.duration/60),secs=Math.floor(audio.duration-mins*60);(curSecs<10)&&(curSecs='0'+curSecs);(secs<10)&&(secs='0'+secs);curTime.innerHTML=curMins+':'+curSecs;durTime.innerHTML=mins+':'+secs;if(settings.buffered){var buffered=audio.buffered;if(buffered.length){var loaded=Math.round(100*buffered.end(0)/audio.duration);preloadBar.style.width=loaded+'%'}}}function shuffle(){if(shuffle){index=Math.round(Math.random()*playList.length)}}function doEnd(){if(index===playList.length-1){if(!repeating){audio.pause();plActive();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));return}else{play(0)}}else{play(index+1)}}function moveBar(evt,el,dir){var value;if(dir==='horizontal'){value=Math.round(((evt.clientX-el.offset().left)+window.pageXOffset)*100/el.parentNode.offsetWidth);el.style.width=value+'%';return value}else{if(evt.type===wheel()){value=parseInt(volumeLength,10);var delta=evt.deltaY||evt.detail||-evt.wheelDelta;value=(delta>0)?value-10:value+10}else{var offset=(el.offset().top+el.offsetHeight)-window.pageYOffset;value=Math.round((offset-evt.clientY))}if(value>100)value=wheelVolumeValue=100;if(value<0)value=wheelVolumeValue=0;volumeBar.style.height=value+'%';return value}}function handlerBar(evt){rightClick=(evt.which===3)?!0:!1;seeking=!0;seek(evt)}function handlerVol(evt){rightClick=(evt.which===3)?!0:!1;seeking=!0;setVolume(evt)}function seek(evt){if(seeking&&rightClick===!1&&audio.readyState!==0){var value=moveBar(evt,progressBar,'horizontal');audio.currentTime=audio.duration*(value/100)}}function seekingFalse(){seeking=!1}function setVolume(evt){evt.preventDefault();volumeLength=volumeBar.css('height');if(seeking&&rightClick===!1||evt.type===wheel()){var value=moveBar(evt,volumeBar.parentNode,'vertical')/100;if(value<=0){audio.volume=0;audio.muted=!0;volumeBtn.classList.add('has-muted')}else{if(audio.muted)audio.muted=!1;audio.volume=value;volumeBtn.classList.remove('has-muted')}}}function notify(title,attr){if(!settings.notification){return}if(window.Notification===undefined){return}attr.tag='AP music player';window.Notification.requestPermission(function(access){if(access==='granted'){var notice=new Notification(title.substr(0,110),attr);setTimeout(notice.close.bind(notice),5000)}})}function destroy(){if(!apActive)return;if(settings.confirmClose){window.removeEventListener('beforeunload',beforeUnload,!1)}playBtn.removeEventListener('click',playToggle,!1);volumeBtn.removeEventListener('click',volumeToggle,!1);repeatBtn.removeEventListener('click',repeatToggle,!1);plBtn.removeEventListener('click',plToggle,!1);progressBar.closest('.progress-container').removeEventListener('mousedown',handlerBar,!1);progressBar.closest('.progress-container').removeEventListener('mousemove',seek,!1);document.documentElement.removeEventListener('mouseup',seekingFalse,!1);volumeBar.closest('.volume').removeEventListener('mousedown',handlerVol,!1);volumeBar.closest('.volume').removeEventListener('mousemove',setVolume);volumeBar.closest('.volume').removeEventListener(wheel(),setVolume);document.documentElement.removeEventListener('mouseup',seekingFalse,!1);prevBtn.removeEventListener('click',prev,!1);nextBtn.removeEventListener('click',next,!1);audio.removeEventListener('error',errorHandler,!1);audio.removeEventListener('timeupdate',timeUpdate,!1);audio.removeEventListener('ended',doEnd,!1);pl.removeEventListener('click',listHandler,!1);pl.parentNode.removeChild(pl);audio.pause();apActive=!1;index=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));volumeBtn.classList.remove('has-muted');plBtn.classList.remove('is-active');repeatBtn.classList.remove('is-active')}function wheel(){var wheel;if('onwheel' in document){wheel='wheel'}else if('onmousewheel' in document){wheel='mousewheel'}else{wheel='MozMousePixelScroll'}return wheel}function extend(defaults,options){for(var name in options){if(defaults.hasOwnProperty(name)){defaults[name]=options[name]}}return defaults}function create(el,attr){var element=document.createElement(el);if(attr){for(var name in attr){if(element[name]!==undefined){element[name]=attr[name]}}}return element}function getTrack(index){return playList[index]}Element.prototype.offset=function(){var el=this.getBoundingClientRect(),scrollLeft=window.pageXOffset||document.documentElement.scrollLeft,scrollTop=window.pageYOffset||document.documentElement.scrollTop;return{top:el.top+scrollTop,left:el.left+scrollLeft}};Element.prototype.css=function(attr){if(typeof attr==='string'){return getComputedStyle(this,'')[attr]}else if(typeof attr==='object'){for(var name in attr){if(this.style[name]!==undefined){this.style[name]=attr[name]}}}};window.Element&&function(ElementPrototype){ElementPrototype.matches=ElementPrototype.matches||ElementPrototype.matchesSelector||ElementPrototype.webkitMatchesSelector||ElementPrototype.msMatchesSelector||function(selector){var node=this,nodes=(node.parentNode||node.document).querySelectorAll(selector),i=-1;while(nodes[++i]&&nodes[i]!=node);return!!nodes[i]}}(Element.prototype);window.Element&&function(ElementPrototype){ElementPrototype.closest=ElementPrototype.closest||function(selector){var el=this;while(el.matches&&!el.matches(selector))el=el.parentNode;return el.matches?el:null}}(Element.prototype);return{init:init,update:updatePL,destroy:destroy,getTrack:getTrack}})();window.AP=AudioPlayer})(window)
// TEST: image for web notifications
var iconImage = '';
AP.init({
  playList: [
    {'icon': iconImage, 'title': 'Neha Kakkar - O Saki Saki', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LndBxbNu9eCSkrSZhL_%2F-LndCImgaILx4jAUcAJ0%2Fosakisaki.mp3?alt=media&token=10500082-a15a-4e04-a74f-e61b9325a83b'},
    {'icon': iconImage, 'title': 'Melek - Sana Söz (Bew3adak)', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-Ll3MrcMSOdPGL6vYECF%2F-Ll3PHBTpnfMgqld3SR0%2Fsanasoz.mp3?alt=media&token=174e5ebd-aa67-4e3d-bd01-bc4b7ab87350'},
    {'icon': iconImage, 'title': 'Tony Kakkar - Dheeme Dheeme', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LivyRVD7VvlpxbGzHBs%2F-Livye5bJ7B8OVmyLpUg%2Fdheeme.mp3?alt=media&token=1800e685-6fc3-40ec-9ff2-a246fb23af69'},
    {'icon': iconImage, 'title': 'Ali Saber - Alahh Esahilak', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Lq5SnK0hP5UZBG8AKq6%2F-Lq5U7V4QZIQDNL63zAP%2Fesahilak.mp3?alt=media&token=d3e5aa94-23dd-44a3-b8be-0182695b4a66'},
    {'icon': iconImage, 'title': 'Neha Kakkar - Remix Qawwali', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqMrsZB_z7ELQ0l9PYp%2F-LqMs30-A80hVkAHl0e7%2Fremixqawwali.mp3?alt=media&token=c3dade2c-dbc4-463c-95f5-781175c27223'},
    {'icon': iconImage, 'title': 'Mohamed Ramadan & Saad Lamjarred - Ensay', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Lq5SnK0hP5UZBG8AKq6%2F-Lq5TWk9MkzTEsuSAeoz%2Fensay.mp3?alt=media&token=d7d77231-2672-453a-b8de-908716b0afe3'},
    {'icon': iconImage, 'title': 'Mohamed Chahine - Jannteny', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Lq5SnK0hP5UZBG8AKq6%2F-Lq5SuZQT5E1fsNeGzg4%2Fjannteny.mp3?alt=media&token=5709ea48-6e9d-4351-983e-7a6989b38ee2'},
    {'icon': iconImage, 'title': 'Mahmoud El Esseily - Tallaa El Helw We Bas', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqbGkzLIQHsZxZgqH-p%2F-LqbH-mGBj2td-jQO2x3%2Felhelwwebas.mp3?alt=media&token=9d95f88a-2a66-47b4-99c8-3f0404bcff8e'},
    {'icon': iconImage, 'title': 'Amr Diab - Mitghayar', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqbGkzLIQHsZxZgqH-p%2F-LqbHS00MssF7-OMHAW9%2Fmitghayar.mp3?alt=media&token=7137cea2-9bac-4709-9bb0-7517fc14ef82'},
    {'icon': iconImage, 'title': 'Ahmed Shawkat - Wala 100 Tare2a', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqbGkzLIQHsZxZgqH-p%2F-LqbHs1Q3_--67ipy0nw%2Fwala100.mp3?alt=media&token=d7ebb8e3-f9f9-4ac7-8164-4fdc1286e193'},
    {'icon': iconImage, 'title': 'Arash ft. Helena - One Night in Dubai ', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LbPEQ9rJcyDHt2Vp2z8%2F-LbPEZDuJaxc45NvOeUi%2Fdubai.mp3?alt=media&token=b73bfee3-dfb3-4a43-b513-6286fd576617'},
    {'icon': iconImage, 'title': 'Ahmed Hassan - Gara Eh', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LbPFHZeHpurM2ICsGaX%2F-LbPFO0MWdOZUlNU2Ohy%2Fgaraeh.mp3?alt=media&token=6d090903-8220-43d9-af04-140ffcd68e15'},
    {'icon': iconImage, 'title': 'Ramy Sabry - Mabrouk Alina', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-La-uTNsXdM_T6mpJrz3%2F-La-uffrhZF8C0Fg1LUn%2Falina.mp3?alt=media&token=562edc9a-fc1c-4aaa-9482-640ebda6ce1b'},
    {'icon': iconImage, 'title': 'Mohamed Ramadan - Mafia', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-La-uTNsXdM_T6mpJrz3%2F-La-uarGgfa2xUCs4dlM%2Fmafia.mp3?alt=media&token=8462fb17-a327-4b46-8409-2000cdd6e359'},
    {'icon': iconImage, 'title': 'Mohamed Hamaki - Ya Sattar', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-La-uTNsXdM_T6mpJrz3%2F-La-uX2Eg80QDfqtPCVG%2Fyasattar.mp3?alt=media&token=42846b46-08d3-4f94-986a-a02b546f64a7'},
    {'icon': iconImage, 'title': 'Ramy Ayach - Qesset Hob', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-La-uTNsXdM_T6mpJrz3%2F-La-u_Lxg2xLudSH_F6P%2Foessethob.mp3?alt=media&token=a0a362fc-dbe3-42f8-972a-e94ec03d23e3'},
    {'icon': iconImage, 'title': 'Nathalie Saba - Fe Nas', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-La-uTNsXdM_T6mpJrz3%2F-La-ucJABhWBR2LAVylA%2Ffenas.mp3?alt=media&token=5b3b6c50-e05f-43c5-af42-4174f546c7da'},
    {'icon': iconImage, 'title': 'Rouba Khoury - Ishtaktilak Wallah', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-La-uTNsXdM_T6mpJrz3%2F-La-uYrjxqQIu3hxqyEW%2Fwallah.mp3?alt=media&token=b7c107ce-b072-4b58-a875-24caf86de287'},
    {'icon': iconImage, 'title': 'AMINUX - Ana Dialek', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-La-uTNsXdM_T6mpJrz3%2F-La-ue2bjjsfNSb52bOV%2Fanadialek.mp3?alt=media&token=94cbeb33-a7f4-47d6-9914-e4f64a21fc00'},
    {'icon': iconImage, 'title': 'Sammy Flash Feat. Spitakci Hayko - Alla Yar', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LOrerf_VVPlzOz6soGp%2F-LOrfA_1qI_ahIsGd8XP%2Fallayar.mp3?alt=media&token=2fd0fd8e-4d9e-431e-87f2-52c1656dc1cf'},
    {'icon': iconImage, 'title': 'Ziad Bourji - A ed Aala Albak', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LVEr-e6EKlYxPbZu_xK%2F-LVEr4e_UW0fkx61Zr0-%2Fedaala.mp3?alt=media&token=d0828992-29e0-45c1-a05e-a18b8551ddad'},
    {'icon': iconImage, 'title': 'Adham Nabulsi - Howeh El Hob', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LTiAeRNfOxf3zGL-btP%2F-LTiAkCwXPGcwTh1RoMy%2Fhowehelhob.mp3?alt=media&token=cd879560-7f38-4a0b-aa91-d5f402b564a1'},
    {'icon': iconImage, 'title': 'Mohamed El Majzoub - Tole El Nahar', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LSB9qkyGvIE2gc97LlG%2F-LSB9z35opBAPgxqPdoR%2Ftoleelnahar.mp3?alt=media&token=46c13896-5335-4250-b6a6-e9ea1dd2cc7e'},
    {'icon': iconImage, 'title': 'Balti Feat. Hamouda - Ya Lili', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LOrerf_VVPlzOz6soGp%2F-LOrfHFylV3AMvYMMwa3%2Fhodoa.mp3?alt=media&token=ab174892-bd20-4b95-ac57-c45c95ff1488'},
    {'icon': iconImage, 'title': 'Fatih Bogalar & Harem - Te Ma Etmaje', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LOrerf_VVPlzOz6soGp%2F-LOrfSmKPWTR5XfHaso6%2Ftemaetmaje.mp3?alt=media&token=3a6d7d6a-0245-427a-9607-1974966fcb02'},
    {'icon': iconImage, 'title': 'Haifa Wehbe - Touta', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LPf_ocg21Jx-9ZOjBNa%2F-LPf_tOk51YV4Vk392Q0%2Ftouta.mp3?alt=media&token=959a43c5-9967-49a9-bb7d-e6c7b1e02813'},
    {'icon': iconImage, 'title': 'Maritta Hallani - Metlakhbata', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LPf_ocg21Jx-9ZOjBNa%2F-LPf_uXrba6uwL0AZkx7%2Fmetlakhbata.mp3?alt=media&token=7ff72428-384e-4091-ae39-66927e659526'},
    {'icon': iconImage, 'title': 'Mohamed Ramadan - El Sokar', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LPf_ocg21Jx-9ZOjBNa%2F-LPf_xG-LtEtOu668vqp%2Felsokar.mp3?alt=media&token=6c386826-1106-422c-abdd-5d31fb1a096f'},
    {'icon': iconImage, 'title': 'Nancy Ajram - Badna Nwalee El Jaw', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LPf_ocg21Jx-9ZOjBNa%2F-LPf_ydba6lvkrmsBIR7%2Feljaw.mp3?alt=media&token=1851bcc4-3f40-43f4-a2cb-5451deea7e50'},
    {'icon': iconImage, 'title': 'Tamer Hosny - Eish Besho ak', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LPf_ocg21Jx-9ZOjBNa%2F-LPfa0RIjoNyVDqpYsJh%2Feishbosha.mp3?alt=media&token=94db79be-1f9a-4743-bddf-ef1a1af6c614'},
    {'icon': iconImage, 'title': 'Waad Al Bahari - We Enta Maaya', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LPf_ocg21Jx-9ZOjBNa%2F-LPf_r5-fn6wcRpamEDa%2Fweenta.mp3?alt=media&token=370b75cb-91b8-45a9-b3ec-0989278b45ab'},
    {'icon': iconImage, 'title': 'Mahmoud El Esseily & Amir Eid - Tallaa El Helw We Bas', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LPf_ocg21Jx-9ZOjBNa%2F-LPf_sJ7lg7KE4eGw8gN%2Fwebas.mp3?alt=media&token=d43ba036-14fb-497c-b798-25714563f98c'},
    {'icon': iconImage, 'title': 'Shaimaa Elshayeb - Mesa Elnour W Elhana', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LPf_ocg21Jx-9ZOjBNa%2F-LPfa-I_QJ0DS_R7H8cv%2Felhana.mp3?alt=media&token=f3f4be9a-76a7-4f3c-bff6-389a96223414'},
    {'icon': iconImage, 'title': 'Ziad Bourji - Mech Taye', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LPf_ocg21Jx-9ZOjBNa%2F-LPf_voEV87WDp7a2yHb%2Fmechtaye.mp3?alt=media&token=e70c7112-fd42-4a2d-b604-1b6a0c25ad3e'},
    {'icon': iconImage, 'title': 'Ramy Sabry - Ahd El Donia', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LPf_ocg21Jx-9ZOjBNa%2F-LPfa2O2C4x2Diq7cvUT%2Fahdel.mp3?alt=media&token=309f0adf-83ab-49c2-9b22-9316fa92693d'},
    {'icon': iconImage, 'title': 'Tamer Hosny - Eish besho ak ', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LOrerf_VVPlzOz6soGp%2F-LOrfC32-ZGTLala6my7%2Feish.mp3?alt=media&token=573ec0e9-011e-40b3-bc80-a6c438960252'},
    {'icon': iconImage, 'title': 'Najwa Farouk - Lemen Nechki FG Arabic Remix', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LOrerf_VVPlzOz6soGp%2F-LOrfLOQ4Fciq-VaGF-2%2Fnechkihali.mp3?alt=media&token=df753d1a-98f2-41d0-8897-d9d9ef901110'},
    {'icon': iconImage, 'title': 'Ali Deek & Layal Abboud - Lmjanin', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LOrerf_VVPlzOz6soGp%2F-LOrfIfrhpohv_ikOzSe%2Flmjanin.mp3?alt=media&token=6993de96-4f40-4dbe-b478-9219727d5a06'},
    {'icon': iconImage, 'title': 'Arabic Remix - Mawjou Galbi', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LOrerf_VVPlzOz6soGp%2F-LOrfK40pWE8ke1ChYzX%2Fmawjougalbi.mp3?alt=media&token=b06e6139-8d94-4355-81dd-a356b5c0435f'},
    {'icon': iconImage, 'title': 'Amr Diab - Da Law Etsab', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LOrerf_VVPlzOz6soGp%2F-LOrfFhMKRRRA29_1eed%2Fetsab.mp3?alt=media&token=e40a58d1-95c9-4e93-b0f9-da2f0a51bb17'},
    {'icon': iconImage, 'title': 'Hala - Mamnoo Ellames', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LOrerf_VVPlzOz6soGp%2F-LOrfDMdj4ZTfScc5pgM%2Fellamas.mp3?alt=media&token=9404ff98-6d81-4714-9cd4-0e7521afacaa'},
    {'icon': iconImage, 'title': 'Shelat - Hodoa Hodoa Erjaa Wara Talaet Kara', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LOrerf_VVPlzOz6soGp%2F-LOrgB_pEGC27wlFpYPG%2Ftalaetkara.mp3?alt=media&token=8a9f4cac-2c3a-4116-adee-c7a7e5fee1b8'},
    {'icon': iconImage, 'title': 'Silva Gunbardhi ft. Mandi ft. Dafi - Te ka lali shpirt', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LOrerf_VVPlzOz6soGp%2F-LOrfOwChKkYMuqyHYBp%2Fshpirt.mp3?alt=media&token=9a2cadf7-9475-474c-91e1-ad33337b87fe'},
    {'icon': iconImage, 'title': 'Najwa Karam - Nezelt L Ba7r', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LOrerf_VVPlzOz6soGp%2F-LOrfN8IEnI1h7XEHBkf%2Fnezelt.mp3?alt=media&token=3fd17d0f-c9f2-4c11-957d-64b12d8152c6'},
    {'icon': iconImage, 'title': 'Amr Diab & Marshmello - Bayen Habeit', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LQEKURi_aFyFvaR5s2x%2F-LQELE44Cw4NBCHQV8fx%2Fbayen.mp3?alt=media&token=85546225-ed6c-4e62-b2a4-f5c5d180ef9d'},
    {'icon': iconImage, 'title': 'Yara & Douzi & DJ Youcef - Mallet', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LSLX2c78BlUr1ISrmlo%2F-LSLXFpt71ejloPY8wX_%2Fmallet.mp3?alt=media&token=d05bb27b-0a6e-4752-91ed-6161af1a6064'},
  ]
});

$(document).ready(function(){
  $(".pl-list__download").on("click", function(){
    var trackPlaying = $(this).closest(".pl-list");
    console.log(AP.getTrack(trackPlaying.attr("data-track")));
  });
});