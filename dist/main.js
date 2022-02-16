!function(){"use strict";var t=function(t,i){(this||window).addEventListener(t,i)},i=null,e=function(t,i){i&&("string"==typeof i&&(i={text:i}),i&&Object.keys(i).forEach((function(e){var s=i[e];null!=s&&("style"==e&&"object"==typeof s?Object.keys(s).forEach((function(i){t.style[i]=s[i]})):"class"==e?Array.isArray(s)?s.forEach((function(i){return t.classList.add(i)})):"object"==typeof s?Object.keys(s).forEach((function(i){1==s[i]?t.classList.add(i):t.classList.remove(i)})):s.split(/\s+/).forEach((function(i){(i=i.trim())&&t.classList.add(i)})):"text"===e?t.textContent=s:t[e]=s)})))},s=function(t,i){e(t,{style:i})},a=function(t,i,s,a){void 0===s&&(s=null),void 0===a&&(a=null);var o=document.createElement(t);return i&&e(o,i),s&&s.appendChild(o),a&&a(o),o},o=function(t,i){void 0===i&&(i=null);var e=(i||document).getElementsByClassName(t);return e.length>0?e[0]:null},n=function(){function e(t,i){void 0===i&&(i=null),this.mode=0,this.startX=0,this.startY=0,this.pageX=0,this.pageY=0,this._imageStartX=0,this._imageStartY=0,this.imageX=0,this.imageY=0,this._frameStartX=0,this._frameStartY=0,this._frameStartW=0,this._frameStartH=0,this.frameX=0,this.frameY=0,this.frameWidth=0,this.frameHeight=0,this.zoom=1,this.image=null,this.el=null,this.bg=null,this.frame=null,this.frameImage=null,this.frameDragger=null,this.framePoints=[],this.__mousedown=null,this.__mousemove=null,this.__mouseup=null,this.__point_mousedown=null,this.__point_mousemove=null,this.__point_mouseup=null,this.options=null,this.data=null,this.data=t,this.imageUrl=t.b64||t.path,this.options=i,this.reset()}return e.prototype.reset=function(){this.mode=0,this.startX=this.startY=0,this.pageX=this.pageY=0,this.imageX=this.imageY=0,this._imageStartX=this._imageStartY=0,this._frameStartX=this._frameStartY=0,this._frameStartW=this._frameStartH=0,this.frameX=this.frameY=0,this.frameWidth=this.frameHeight=0,this.zoom=1},e.prototype.free=function(){var t=this;this.framePoints.forEach((function(i){t.__point_mousedown&&i.removeEventListener("mousedown",t.__point_mousedown)})),t.__point_mousemove&&this.frame.removeEventListener("mousemove",t.__point_mousemove),t.__point_mouseup&&this.frame.removeEventListener("mouseup",t.__point_mouseup),t.__point_mouseup&&this.frame.removeEventListener("mouseleave",t.__point_mouseup),this.framePoints.forEach((function(t){return t.remove()})),this.framePoints=[],this.frameDragger&&this.frameDragger.remove(),this.frameImage&&this.frameImage.remove(),this.frame&&this.frame.remove(),this.bg&&this.bg.remove(),this.__mousedown=null,this.__mousemove=null,this.__mouseup=null,this.__point_mousedown=null,this.__point_mousemove=null,this.__point_mouseup=null,this.el=null,this.image=null,this.bg=null,this.frame=null,this.frameImage=null,this.frameDragger=null,this.data=null},e.prototype.mount=function(){if(!(this.el=o("preview")))throw"preview not found.";if(this.image=new Image,this.image.src=this.imageUrl,this.image.complete)this.onload();else{var t=this;this.image.onload=function(){t.onload()},this.image.onerror=function(t){}}},e.prototype.cacheBase64data=function(){var t=document.createElement("canvas"),i=t.getContext("2d");t.width=this.image.width,t.height=this.image.height,i.drawImage(this.image,0,0),this.data.b64=t.toDataURL("image/png")},e.prototype.onload=function(){var t=this;this.data&&!this.data.b64&&this.cacheBase64data(),this.bg=a("div",{class:"bg"},this.el),a("img",{src:this.imageUrl},this.bg),this.frame=a("div",{class:"frame"},this.el),this.frameDragger=a("div",{class:"dragger"},this.frame),this.frameImage=a("div",{class:"image"},this.frame),a("img",{src:this.imageUrl},this.frameImage),["ne","nw","sw","se"].forEach((function(i){var e=a("div",{class:["point","-".concat(i)]},t.frame);t.framePoints.push(e)}));var i=this.el.clientWidth,e=this.el.clientHeight;this.image.width,this.image.height;if(this.zoom=1,this.imageX=(i-1*this.image.width)/2,this.imageY=(e-1*this.image.height)/2,this.frameWidth=this.image.width,this.frameHeight=this.image.height,this.frameX=this.imageX,this.frameY=this.imageY,this.data&&this.data.frame)this.frameWidth=this.data.frame.width,this.frameHeight=this.data.frame.height,this.frameX=this.imageX+this.data.frame.x,this.frameY=this.imageY+this.data.frame.y;else if(this.options&&this.options.image_size){var s=this.options.image_size,o=s[0],n=s[1];if(o>0&&n>0){var h=o/n,r=[this.frameWidth,this.frameHeight],m=r[0],c=r[1];n=m/h,m>(o=c*h)?m=o:c>n&&(c=n),this.frameWidth=m,this.frameHeight=c,this.frameX=this.imageX+(this.image.width-m)/2,this.frameY=this.imageY+(this.image.width-c)/2}}this.data&&(this.data.frame={x:this.frameX-this.imageX,y:this.frameY-this.imageY,width:this.frameWidth,height:this.frameHeight}),this.update(),this.initEvents()},e.prototype.update=function(){if(this.bg&&s(this.bg,{left:"".concat(this.imageX,"px"),top:"".concat(this.imageY,"px"),width:"".concat(this.image.width,"px"),height:"".concat(this.image.height,"px"),transform:"scale(".concat(this.zoom,")"),"transform-origin":"center center"}),this.frame&&s(this.frame,{left:"".concat(this.frameX,"px"),top:"".concat(this.frameY,"px"),width:"".concat(this.frameWidth,"px"),height:"".concat(this.frameHeight,"px"),transform:"scale(".concat(this.zoom,")"),"transform-origin":"center center"}),this.bg&&this.frame&&this.frameImage){var t=this.imageX-this.frameX,i=this.imageY-this.frameY;s(this.frameImage,{left:"".concat(t,"px"),top:"".concat(i,"px"),width:"".concat(this.image.width,"px"),height:"".concat(this.image.height,"px"),transform:"scale(".concat(this.zoom,")"),"transform-origin":"center center"})}},e.prototype.initEvents=function(){var i=this;this.__mousedown=function(t){i.dragMousedown(t)},this.__mousemove=function(t){1==i.mode&&i.dragMousemove(t)},this.__mouseup=function(t){1==i.mode&&i.dragMouseup(t)},t.call(this.frameDragger,"mousedown",this.__mousedown),t.call(this.frameDragger,"mousemove",this.__mousemove),t.call(this.frameDragger,"mouseup",this.__mouseup);var e=null;this.__point_mousedown=function(t){e=this,i.pointMousedown(t,this)},this.__point_mousemove=function(t){2==i.mode&&e&&i.pointMousemove(t,e)},this.__point_mouseup=function(t){2==i.mode&&e&&(i.pointMouseup(t,e),e=null)},this.framePoints.forEach((function(e){t.call(e,"mousedown",i.__point_mousedown)})),t.call(this.el,"mousemove",this.__point_mousemove),t.call(this.el,"mouseup",this.__point_mouseup),t.call(this.el,"mouseleave",this.__point_mouseup)},e.prototype.move=function(t,i,e,s){if(void 0===e&&(e=null),void 0===s&&(s=null),null===e&&(e=t+this.frameWidth),null===s&&(s=i+this.frameHeight),t>e){var a=t;t=e,e=a}if(i>s){a=i;i=s,s=a}t=Math.max(t,this.imageX),i=Math.max(i,this.imageY),e=Math.min(e,this.imageX+this.image.width),s=Math.min(s,this.imageY+this.image.height),this.frameX=t,this.frameY=i,this.frameWidth=Math.max(24,e-t),this.frameHeight=Math.max(24,s-i),this.data&&(this.data.frame={x:t-this.imageX,y:i-this.imageY,width:this.frameWidth,height:this.frameHeight},this.data.changed=!0)},e.prototype.dragMousedown=function(t){var i,e;console.log("dragMousedown"),this.mode=1,this.pageX=this.startX=t.pageX,this.pageY=this.startY=t.pageY,i=[this.frameX,this.frameY],this._frameStartX=i[0],this._frameStartY=i[1],e=[this.frameWidth,this.frameHeight],this._frameStartW=e[0],this._frameStartH=e[1],this.update(),this._debug()},e.prototype.dragMousemove=function(t){var i,e,s;if(1==this.mode){var a=[this._frameStartX,this._frameStartY,this._frameStartW,this._frameStartH],o=a[0],n=a[1],h=a[2],r=a[3],m=[o+h,n+r],c=m[0],u=m[1];i=[t.pageX,t.pageY],this.pageX=i[0],this.pageY=i[1];var l=this.pageX-this.startX,f=this.pageY-this.startY;n+=f,c+=l,u+=f,(o+=l)<this.imageX&&(o=(e=[this.imageX,this.imageX+h])[0],c=e[1]),n<this.imageY&&(n=(s=[this.imageY,this.imageY+r])[0],u=s[1]),this.imageX+this.image.width<c&&(o=(c=this.imageX+this.image.width)-h),this.imageY+this.image.height<u&&(n=(u=this.imageY+this.image.height)-r),this.move(o,n,c,u),this.update(),this._debug()}},e.prototype.dragMouseup=function(t){1==this.mode&&(this.mode=0,this.pageX=this.startX=0,this.pageY=this.startY=0,this._frameStartX=this._frameStartY=0,this._frameStartW=this._frameStartH=0)},e.prototype.pointMousedown=function(t,i){var e,s;i.classList.add("-active"),this.mode=2,this.pageX=this.startX=t.pageX,this.pageY=this.startY=t.pageY,e=[this.frameX,this.frameY],this._frameStartX=e[0],this._frameStartY=e[1],s=[this.frameWidth,this.frameHeight],this._frameStartW=s[0],this._frameStartH=s[1],this.update(),this._debug()},e.prototype.pointMousemove=function(t,i){var e,s,a;if(2==this.mode){var o=[this._frameStartX,this._frameStartY,this._frameStartW,this._frameStartH],n=o[0],h=o[1],r=o[2],m=o[3],c=[n+r,h+m],u=c[0],l=c[1];e=[t.pageX,t.pageY],this.pageX=e[0],this.pageY=e[1];var f=this.pageX-this.startX,p=this.pageY-this.startY,g=!1,d=!1,v=!1,_=!1,y=!1,w=!1;if(i.classList.contains("-ne")?v=y=!0:i.classList.contains("-nw")?v=w=!0:i.classList.contains("-se")?_=y=!0:i.classList.contains("-sw")&&(_=w=!0),v?h+=p:_&&(l+=p),y?n+=f:w&&(u+=f),n>u&&(g=!0,n=(s=[u,n])[0],u=s[1]),h>l&&(d=!0,h=(a=[l,h])[0],l=a[1]),u-n<24&&(u=n+24),l-h<24&&(l=h+24),n=Math.min(Math.max(n,this.imageX),this.imageX+this.image.width),h=Math.min(Math.max(h,this.imageY),this.imageY+this.image.height),u=Math.min(Math.max(u,this.imageX),this.imageX+this.image.width),l=Math.min(Math.max(l,this.imageY),this.imageY+this.image.height),this.options&&this.options.image_size){var X=this.options.image_size,Y=X[0],b=X[1];if(Y>0&&b>0){var S=Y/b;b=(r=u-n)/S,r>(Y=(m=l-h)*S)?r=Y:m>b&&(m=b),y||w&&g?n=u-r:(w||y&&g)&&(u=n+r),v||_&&d?h=l-m:(_||v&&d)&&(l=h+m),l=h+m}}this.move(n,h,u,l),this.update(),this._debug()}},e.prototype.pointMouseup=function(t,i){2==this.mode&&(this.mode=0,this.pageX=this.startX=0,this.pageY=this.startY=0,this._frameStartX=this._frameStartY=0,this._frameStartW=this._frameStartH=0,i.classList.remove("-active"),this.framePoints.forEach((function(t){return t.classList.remove("-active")})))},e.prototype._debug=function(){var t;t="\n\t\t\tmode: ".concat(this.mode,"<br />\n\t\t\tstart: (").concat(this.startX,", ").concat(this.startY,")<br />\n\t\t\tpageX/Y: (").concat(this.pageX,", ").concat(this.pageY,")<br />\n\t\t\timage: pos=(").concat(this.imageX,", ").concat(this.imageY,") size=(").concat(this.image.width,", ").concat(this.image.height,")<br />\n\t\t\tframe: pos=(").concat(this.frameX,", ").concat(this.frameY,") size=(").concat(this.frameWidth,", ").concat(this.frameHeight,")<br />\n\t\t\tzoom: ").concat(this.zoom,"\n\t\t"),null==i&&(i=a("div",{class:"debugger"},document.body)),i.innerHTML=t},e}(),h="data",r="http://localhost:8080",m=null,c=function(){function t(){this.connected=!1,this.mount()}return t.prototype.mount=function(){this.el=a("div",{class:"global-error"},document.body),this.el.style.display="none"},t.prototype._observe=function(t,i){var e=!1,s=!1,a=this,o=function(){setTimeout((function(){n()}),2e6)},n=function(){a._connect((function(){for(var i=[],n=0;n<arguments.length;n++)i[n]=arguments[n];s?location.reload():(0==e&&(t.apply(null,i),e=!0),a.connected=!0,o())}),(function(t){s=!0,i&&i(t),o()}))};n()},t.prototype._connect=function(t,i){var e=this;if(void 0===t&&(t=null),void 0===i&&(i=null),!this._isLocal()){var s=this;return this._request("/status").then((function(i){t&&t.call(null,e)})).catch((function(t){i&&i.call(null,t),s.connected=!1,s.showError()}))}location.href="".concat(r,"/")},t.prototype._request=function(t,i,e,s){void 0===i&&(i="GET"),void 0===e&&(e=null),void 0===s&&(s=null);var a={method:i};"POST"==i&&(a.headers={"Content-Type":"application/json"},a.body=JSON.stringify(e)),console.log(t,a);var o=fetch(this._path(t),a);return s&&o.then((function(t){return t.json().then((function(t){return s(t),t})),t})),o},t.prototype._get=function(t,i){return void 0===i&&(i=null),this._request(t,"GET",null,i)},t.prototype._post=function(t,i,e){return void 0===i&&(i=null),void 0===e&&(e=null),this._request(t,"POST",i,e)},t.prototype._path=function(t){return t.indexOf("://")>=0||0===t.indexOf("//")?t:("/"!=t[0]&&(t="/".concat(t)),r+t+"?"+(new Date).getTime())},t.prototype._isLocal=function(){return!location||!location.protocol||"file:"==location.protocol||("http:"!=location.protocol&&"https://"!=location.protocol||(!location.hostname||""=="".concat(location.hostname).trim()))},t.prototype.showError=function(){this.el&&(this.el.innerHTML="Connection failed. Make sure app.py server is runnning. <code>$ python app.py</code>.",this.el.style.display="block")},t.prototype.hideError=function(){this.el&&(this.el.style.display="none")},t.connect=function(i,e){return void 0===e&&(e=null),m?m.connected?i&&i.call(null,m):m._observe(i,e):(m=new t)._observe(i,e),m},t.isConnected=function(){return!!m&&m.connected},t}(),u=function(){function i(t,i){void 0===i&&(i=null),this.options=null,this.el=null,this.ul=null,this.current=0,this.mounted=!1,this.onchange=null,this.onupdate=null,this.options=i,this.items=[],this.add(t)}return i.prototype.add=function(t){var i=this;t.forEach((function(t){"string"==typeof t&&((t={name:t,path_org:"".concat(h,"/").concat(t),path:"".concat(h,"/").concat(t),tag:null,done:!1,removed:!1,changed:!1}).$image=new Image,t.$image.src=t.path),i.items.push(t)})),this.mounted&&this.update()},i.prototype.mount=function(){if(!(this.el=o("sources")))throw"`.sources` not found.";(this.ul=this.el.querySelector("ul"))||(this.ul=a("ul",null,this.el)),this.mounted=!0,this.update(),this.initEvents(),this.change()},i.prototype.update=function(){var t=this;this.items.forEach((function(i,e){var s=i.$li=i.$li||a("li",null,t.ul),n=o("item",s)||a("div",{class:"item"},s);o("image",n)||a("div",{class:"image"},n,(function(t){t.appendChild(i.$image)})),(o("name",n)||a("div",{class:"name"},n)).textContent=i.name,t.current==e?n.classList.add("-active"):n.classList.remove("-active"),i.done?(s.classList.add("-ok"),s.classList.remove("-removed")):i.removed?(s.classList.remove("-ok"),s.classList.add("-removed")):(s.classList.remove("-ok"),s.classList.remove("-removed"))}))},i.prototype.initEvents=function(){var i=this;t.call(document.body,"keydown",(function(t){var e=t.keyCode,s="".concat(t.key).toLowerCase();return 40!=e&&"arrowdown"!=s&&38!=e&&"arrowup"!=s||(t.preventDefault(),t.stopPropagation()),i.keypress(t),!1})),t.call(this.ul,"click",(function(t){i.click(t)}))},i.prototype.keypress=function(t){var i=t.keyCode,e="".concat(t.key).toLowerCase();40!=i&&"arrowdown"!=e||this.moveToDown(),38!=i&&"arrowup"!=e||this.moveToUp(),8!=i&&"backspace"!=e||this.remove(),13!=i&&"enter"!=e||this.approve()},i.prototype.click=function(t){if(t.path){var i=t.path.find((function(t){return t.nodeType==Node.ELEMENT_NODE&&"li"=="".concat(t.nodeName).toLowerCase()}));if(!i.classList.contains("-active")){var e=this.items.findIndex((function(t){return t.$li==i}));e>=0&&(this.current=e),this.update(),this.change()}}},i.prototype.remove=function(){if(c.isConnected()){if(void 0!==this.items[this.current]){var t=this.items[this.current];if(t.removed)return this.update(),void this.moveToDown();t.done=!1,t.changed=!1,t.removed=!0,this.onupdate&&this.onupdate(t),c.connect((function(i){i._request("/update","POST",{name:t.name,src:t.path,action:"remove",frame:t.frame||null}).then((function(i){i.json().then((function(i){i.backup&&(t.path=i.backup)}))}))}))}this.update(),this.moveToDown()}else this.moveToDown()},i.prototype.approve=function(){if(c.isConnected()){if(console.log(this.items,this.current),void 0!==this.items[this.current]){var t=this.items[this.current];if(t.done&&!t.changed)return this.update(),void this.moveToDown();t.done=!0,t.changed=!1,t.removed=!1,this.onupdate&&this.onupdate(t),c.connect((function(i){i._request("/update","POST",{name:t.name,src:t.path,action:"ok",frame:t.frame||null}).then((function(i){i.json().then((function(i){i.backup&&(t.path=i.backup)}))}))}))}this.update(),this.moveToDown()}else this.moveToDown()},i.prototype.moveToUp=function(){this.items.length<=0?this.current=0:this.current>0&&this.current--,this.update(),this.change(),this.scroll()},i.prototype.moveToDown=function(){this.items.length<=0?this.current=0:this.current<this.items.length-1&&this.current++,this.update(),this.change(),this.scroll()},i.prototype.scroll=function(){if(void 0!==this.items[this.current]){var t=this.el.scrollTop,i=this.el.clientHeight;this.el.querySelector("ul").clientHeight;var e=this.items[this.current].$li.getBoundingClientRect(),s=t+e.top-(i-e.height)/2;this.el.scrollTo(0,s)}},i.prototype.change=function(){void 0!==this.items[this.current]&&this.onchange&&this.onchange.call(this,this.items[this.current])},i}();t("wheel",(function(){return!1})),c.connect((function(t){if(t){var i=null;t._get("/config",(function(e){i=e.options,t._get("/list",(function(t){var e=null,s=new u(t.sources,i);s.onchange=function(t){e&&(e.free(),e=null),(e=new n(t,i)).mount()},s.onupdate=function(t){},s.mount()}))}))}}))}();
//# sourceMappingURL=main.js.map
