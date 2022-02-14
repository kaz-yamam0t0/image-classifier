
const listen = function(name:string, callback) {
	(this || window).addEventListener(name, callback);
};

// debugger
let _debug = null;
const debug = (s:string)=>{
	if (_debug == null) {
		_debug = createElement("div", {"class":"debugger"}, document.body);
	}
	_debug.innerHTML = s;
};



const setAttrs = (el:any, attrs:any)=>{
	if (!attrs) {
		return;
	}
	if (typeof attrs === "string") {
		attrs = { "text" : attrs };
	}
	if (attrs) {
		Object.keys(attrs).forEach((k)=>{
			const v = attrs[k];
			if (typeof v === "undefined" || v === null) {
				return;
			}
			// style
			if (k == "style" && (typeof v === "object")) {
				Object.keys(v).forEach(k_=>{
					el.style[k_] = v[k_];
				});
			} 
			// class
			else if (k == "class") {
				if (Array.isArray(v)) {
					v.forEach(v_=>el.classList.add(v_));
				} else if (typeof v === "object") {
					Object.keys(v).forEach(k_=>{
						if (v[k_] == true) {
							el.classList.add(k_);
						} else {
							el.classList.remove(k_);
						}
					});
				} else {
					v.split(/\s+/).forEach(v_=>{
						if (v_ = v_.trim()) el.classList.add(v_);
					});
				}
			} 
			// text
			else if (k === "text") {
				el.textContent = v;
			}
			// default
			else {
				el[k] = v
			}
		});	
	}
};
const setStyle = (el:any, styles:Object)=>{
	setAttrs(el, { "style": styles });
};
const createElement = (tagName:string, attrs:any, parentNode:any=null, callback:any=null)=>{
	const el = document.createElement(tagName);
	if (attrs) setAttrs(el, attrs);

	if (parentNode) {
		parentNode.appendChild(el)
	}
	if (callback) {
		callback(el);
	}
	return el;
};

const find = (q:string, el:any=null)=>{
	return (el || document).querySelector(q);
};
const findByClass = (q:string, el:any=null)=>{
	const elements = (el || document).getElementsByClassName(q);
	if (elements.length > 0) return elements[0];
	return null;
};


export {
	listen,
	debug,
	createElement, 
	setAttrs,
	setStyle, 

	find,
	findByClass,
}