

import { listen, debug, setStyle, createElement, findByClass } from './util';

class Preview {
	mode = 0; // 1=moving 2=point

	// event position
	startX = 0;
	startY = 0;
	pageX = 0;
	pageY = 0;
	
	// image position
	_imageStartX = 0;
	_imageStartY = 0;
	imageX = 0;
	imageY = 0;

	// frame position
	_frameStartX = 0;
	_frameStartY = 0;
	_frameStartW = 0;
	_frameStartH = 0;
	frameX = 0;
	frameY = 0;
	frameWidth = 0;
	frameHeight = 0;

	// zoom
	zoom = 1;

	// image data
	imageUrl: string;
	image = null; // Image

	// elements
	el = null; // div.preview
	bg = null;            // div.bg
	frame = null;         // div.frame
	frameImage = null;    // div.frame div.image
	frameDragger = null;  // div.frame div.dragger
	framePoints = [];     // [ div.point ]

	// event callbacks
	__mousedown = null;
	__mousemove = null;
	__mouseup = null;

	__point_mousedown = null;
	__point_mousemove = null;
	__point_mouseup = null;

	// options
	options = null;

	// Sources
	//sources = null;
	data = null;

	constructor(image_data, options=null) {
		//this.sources = sources;
		this.data = image_data;
		this.imageUrl = image_data.b64 || image_data.path;
		this.options = options;
		this.reset();
	}
	reset() {
		this.mode = 0;
		this.startX = this.startY = 0;
		this.pageX = this.pageY = 0;
		this.imageX = this.imageY = 0;
		this._imageStartX = this._imageStartY = 0;

		this._frameStartX = this._frameStartY = 0;
		this._frameStartW = this._frameStartH = 0;
		this.frameX = this.frameY = 0;
		this.frameWidth = this.frameHeight = 0;

		this.zoom = 1;

		//this.image = null;
		//this.el = null;
	}

	free() {
		const self = this;

		// free events
		//if (this.__mousedown) this.el.removeEventListener("mousedown", this.__mousedown);
		//if (this.__mousemove) this.el.removeEventListener("mousemove", this.__mousemove);
		//if (this.__mouseup) this.el.removeEventListener("mouseup", this.__mouseup);
		
		//if (this.__mousedown) this.frame.removeEventListener("mousedown", this.__mousedown);
		//if (this.__mousemove) this.frame.removeEventListener("mousemove", this.__mousemove);
		//if (this.__mouseup) this.frame.removeEventListener("mouseup", this.__mouseup);

		this.framePoints.forEach(p=>{
			if (self.__point_mousedown) p.removeEventListener("mousedown", self.__point_mousedown);
			//if (self.__point_mousemove) p.removeEventListener("mousemove", self.__point_mousemove);
			//if (self.__point_mouseup) p.removeEventListener("mouseup", self.__point_mouseup);
			//if (self.__point_mouseup) p.removeEventListener("mouseleave", self.__point_mouseup);
		});
		if (self.__point_mousemove) this.frame.removeEventListener("mousemove", self.__point_mousemove);
		if (self.__point_mouseup) this.frame.removeEventListener("mouseup", self.__point_mouseup);
		if (self.__point_mouseup) this.frame.removeEventListener("mouseleave", self.__point_mouseup);

		// remove elements
		this.framePoints.forEach(p=>p.remove());
		this.framePoints = [];

		if (this.frameDragger) this.frameDragger.remove();
		if (this.frameImage) this.frameImage.remove();
		if (this.frame) this.frame.remove();
		if (this.bg) this.bg.remove();

		// alter elements and events to NULL
		this.__mousedown = null;
		this.__mousemove = null;
		this.__mouseup = null;

		this.__point_mousedown = null;
		this.__point_mousemove = null;
		this.__point_mouseup = null;

		this.el = null;
		this.image = null;
		this.bg = null;
		this.frame = null;
		this.frameImage = null;
		this.frameDragger = null;

		//this.sources = null;
		this.data = null;
	}

	mount() {
		if (!(this.el = findByClass("preview"))) {
			throw 'preview not found.';			
		}
		this.image = new Image();
		this.image.src = this.imageUrl;

		if (this.image.complete) {
			this.onload();
		} else {
			const self = this;
			this.image.onload = ()=>{
				self.onload();
			};
			this.image.onerror = (err)=>{
				// @TODO
			};
		}
	}
	cacheBase64data() {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		canvas.width = this.image.width;
		canvas.height = this.image.height;
		
		context.drawImage(this.image, 0,0);

		this.data.b64 = canvas.toDataURL("image/png");
	}
	onload() {
		const self = this;

		if (this.data && !this.data.b64) {
			this.cacheBase64data();
		}

		//this.bg = createElement("img", {
		//	"src" : this.imageUrl,
		//	"class" : "bg",
		//}, this.el);
		this.bg = createElement("div", {"class" : "bg"}, this.el);
		createElement("img", { "src" : this.imageUrl }, this.bg);

		this.frame = createElement("div", {"class": "frame"}, this.el);
		
		this.frameDragger = createElement("div", {"class": "dragger"} , this.frame);
		//this.frameImage = createElement("img", {
		//	"src" : this.imageUrl,
		//}, this.frame);
		this.frameImage = createElement("div", {"class":"image"}, this.frame);
		createElement("img", { "src": this.imageUrl } , this.frameImage);

		["ne","nw","sw","se"].forEach((dir)=>{
			const el = createElement("div", {"class" : ['point',`-${dir}`] }, self.frame);
			self.framePoints.push(el);
		});

		// calculate ratio
		let w0 = this.el.clientWidth, 
			h0 = this.el.clientHeight, 
			w = this.image.width, 
			h = this.image.height;
		
		let r = 1;
		// zoom == 1
		/*
		if (w > w0) {
			r = Math.min(r, w0 / w);
			w *= r; h *= r;
		}
		if (h > h0) {
			r = Math.min(r, h0 / h);
			w *= r; h *= r;
		}
		*/

		// initialize image size and position
		this.zoom = r;
		this.imageX = (w0 - this.image.width * r) / 2;
		this.imageY = (h0 - this.image.height * r) / 2;
		
		// calculate frame position
		this.frameWidth = this.image.width; // * r;
		this.frameHeight = this.image.height; // * r;
		this.frameX = this.imageX;
		this.frameY = this.imageY;
		
		if (this.data && this.data.frame) {
			// maintain frame size/position
			this.frameWidth = this.data.frame.width;
			this.frameHeight = this.data.frame.height;
			this.frameX = this.imageX + this.data.frame.x;
			this.frameY = this.imageY + this.data.frame.y;
		} else {
			// adjust 
			// adjust ratio
			if (this.options && this.options.image_size) {
				let [_w_, _h_] = this.options.image_size;
				if (_w_ > 0 && _h_ > 0) {
					const r_ = _w_ / _h_;
					let [w, h] = [this.frameWidth, this.frameHeight];
					_w_ = h * r_;
					_h_ = w / r_;
					if (w > _w_) {
						w = _w_;
					} else if (h > _h_) {
						h = _h_;
					}
					this.frameWidth = w;
					this.frameHeight = h;
					this.frameX = this.imageX + (this.image.width - w) / 2;
					this.frameY = this.imageY + (this.image.width - h) / 2;
				}
			}
		}

		// save data
		if (this.data) {
			this.data.frame = {
				x: this.frameX - this.imageX, 
				y: this.frameY - this.imageY,
				width: this.frameWidth, 
				height: this.frameHeight,
			};
		}

		// update 
		this.update();

		// init events
		this.initEvents();
	}
	update() {
		if (this.bg) {
			setStyle(this.bg, {
				"left" : `${this.imageX}px`,
				"top" : `${this.imageY}px`,
				//"width" : `${this.image.width * this.zoom}px`,
				//"height" : `${this.image.height * this.zoom}px`,
				"width" : `${this.image.width}px`,
				"height" : `${this.image.height}px`,
				"transform" : `scale(${this.zoom})`,
				"transform-origin" : "center center",
			});
		}
		if (this.frame) {
			setStyle(this.frame, {
				"left" : `${this.frameX}px`,
				"top" : `${this.frameY}px`,
			//	"width" : `${this.frameWidth * this.zoom}px`,
			//	"height" : `${this.frameHeight * this.zoom}px`,
				"width" : `${this.frameWidth}px`,
				"height" : `${this.frameHeight}px`,
				"transform" : `scale(${this.zoom})`,
				"transform-origin" : "center center",
			});
		}
		if (this.bg && this.frame && this.frameImage) {
			const x = this.imageX - this.frameX;
			const y = this.imageY - this.frameY;

			setStyle(this.frameImage, {
				"left" : `${x}px`,
				"top" : `${y}px`,
			//	"width" : `${this.image.width * this.zoom}px`,
			//	"height" : `${this.image.height * this.zoom}px`,
				"width" : `${this.image.width}px`,
				"height" : `${this.image.height}px`,
				"transform" : `scale(${this.zoom})`,
				"transform-origin" : "center center",
			});
		}
	}

	// event
	initEvents() {
		const self = this;
		/*
		this.__mousedown = (e)=>{
			self.mousedown(e);
			return false;
		};
		this.__mousemove = (e)=>{
			self.mousemove(e);
			return false;
		};
		this.__mouseup = (e)=>{
			self.mouseup(e);
			return false;
		};

		//listen.call(this.frame, "mousedown", this.__mousedown);
		//listen.call(this.frame, "mousemove", this.__mousemove);
		//listen.call(this.frame, "mouseup", this.__mouseup);
		
		//listen.call(this.el, "mousedown", this.__mousedown);
		//listen.call(this.el, "mousemove", this.__mousemove);
		//listen.call(this.el, "mouseup", this.__mouseup);
		*/
		this.__mousedown = (e)=>{
			self.dragMousedown(e);
			//return false;
		};
		this.__mousemove = (e)=>{
			if (self.mode != 1) return;
			self.dragMousemove(e);
			//return false;
		};
		this.__mouseup = (e)=>{
			if (self.mode != 1) return;
			self.dragMouseup(e);
			//return false;
		};
		listen.call(this.frameDragger, "mousedown", this.__mousedown);
		listen.call(this.frameDragger, "mousemove", this.__mousemove);
		listen.call(this.frameDragger, "mouseup", this.__mouseup);


		let p = null;
		
		this.__point_mousedown = function(e) {
			p = this;

			//e.preventDefault();
			//e.stopPropagation();
			self.pointMousedown(e, this);
			//return false;
		};
		this.__point_mousemove = function(e) {
			if (self.mode != 2) return;
			if (!p) return;

			//e.preventDefault();
			//e.stopPropagation();
			//self.pointMousemove(e, this);
			self.pointMousemove(e, p);
			//return false;
		};
		this.__point_mouseup = function(e) {
			if (self.mode != 2) return;
			if (!p) return;

			//e.preventDefault();
			//e.stopPropagation();
			//self.pointMouseup(e, this);
			self.pointMouseup(e, p);
			p = null;
			//return false;
		};
		this.framePoints.forEach(p=>{
			listen.call(p, "mousedown", self.__point_mousedown);
			//listen.call(p, "mousemove", self.__point_mousemove);
			//listen.call(p, "mouseup", self.__point_mouseup);
			//listen.call(p, "mouseleave", self.__point_mouseup);
		});
		listen.call(this.el, "mousemove", this.__point_mousemove);
		listen.call(this.el, "mouseup", this.__point_mouseup);
		listen.call(this.el, "mouseleave", this.__point_mouseup);
	}
	/*
	mousedown(e) {
		this.mode = 1;
		this.pageX = this.startX = e.pageX;
		this.pageY = this.startY = e.pageY;
		//[this._imageStartX, this._imageStartY] = [this.imageX, this.imageY];
		[this._frameStartX, this._frameStartY] = [this.frameX, this.frameY];
		this.update();
		this._debug();
	}
	mousemove(e) {
		if (this.mode != 1) return;

		[this.pageX, this.pageY] = [e.pageX, e.pageY];
		//this.imageX = this._imageStartX + (this.pageX - this.startX);
		//this.imageY = this._imageStartY + (this.pageY - this.startY);
		//this.frameX = this._frameStartX + (this.pageX - this.startX);
		//this.frameY = this._frameStartY + (this.pageY - this.startY);
		this.move(
			this._frameStartX + (this.pageX - this.startX),
			this._frameStartY + (this.pageY - this.startY),
		);
		this.update();
		this._debug();
	}
	mouseup(e) {
		this.mode = 0;
		this.pageX = this.startX = 0;
		this.pageY = this.startY = 0;
		this._frameStartX = this._frameStartY = 0;
	}
	*/
	move(x:number, y:number, x2:number=null, y2:number=null) {
		if (x2 === null) x2 = x + this.frameWidth;
		if (y2 === null) y2 = y + this.frameHeight;
		if (x > x2) {
			const tmp = x;
			x = x2;
			x2 = tmp;
		}
		if (y > y2) {
			const tmp = y;
			y = y2;
			y2 = tmp;
		}
		x = Math.max(x, this.imageX);
		y = Math.max(y, this.imageY);
		x2 = Math.min(x2, this.imageX + this.image.width);
		y2 = Math.min(y2, this.imageY + this.image.height);

		this.frameX = x;
		this.frameY = y;

		this.frameWidth = Math.max(24, x2 - x);
		this.frameHeight = Math.max(24, y2 - y);

		if (this.data) {
			this.data.frame = {
				x: x - this.imageX, 
				y: y - this.imageY,
				width: this.frameWidth, 
				height: this.frameHeight,
			};
			this.data.changed = true;
		}
	}
	dragMousedown(e) {
		console.log("dragMousedown");
		this.mode = 1;
		this.pageX = this.startX = e.pageX;
		this.pageY = this.startY = e.pageY;
		//[this._imageStartX, this._imageStartY] = [this.imageX, this.imageY];
		[this._frameStartX, this._frameStartY] = [this.frameX, this.frameY];
		[this._frameStartW, this._frameStartH] = [this.frameWidth, this.frameHeight];
		this.update();
		this._debug();
	}
	dragMousemove(e) {
		if (this.mode != 1) return;

		let [x,y,w,h] = [this._frameStartX, this._frameStartY, this._frameStartW, this._frameStartH];
		let [x2,y2] = [x+w, y+h];

		[this.pageX, this.pageY] = [e.pageX, e.pageY];
		const dx = (this.pageX - this.startX);// / this.zoom;
		const dy = (this.pageY - this.startY);// / this.zoom;
		x += dx; y += dy;
		x2 += dx; y2 += dy;
		if (x < this.imageX) { [x,x2] = [this.imageX,this.imageX+w]; }
		if (y < this.imageY) { [y,y2] = [this.imageY,this.imageY+h]; }

		if (this.imageX + this.image.width < x2) { 
			x2 = this.imageX + this.image.width;
			x = x2 - w;
		}
		if (this.imageY + this.image.height < y2) {
			y2 = this.imageY + this.image.height;
			y = y2 - h;
		}

		this.move(x,y,x2,y2);
		this.update();
		this._debug();
	}
	dragMouseup(e) {
		if (this.mode != 1) return;

		this.mode = 0;
		this.pageX = this.startX = 0;
		this.pageY = this.startY = 0;
		this._frameStartX = this._frameStartY = 0;
		this._frameStartW = this._frameStartH = 0;
	}

	pointMousedown(e, p) {
		p.classList.add("-active");

		this.mode = 2;
		this.pageX = this.startX = e.pageX;
		this.pageY = this.startY = e.pageY;
		//[this._imageStartX, this._imageStartY] = [this.imageX, this.imageY];
		[this._frameStartX, this._frameStartY] = [this.frameX, this.frameY];
		[this._frameStartW, this._frameStartH] = [this.frameWidth, this.frameHeight];
		this.update();
		this._debug();
	}

	pointMousemove(e, p) {
		if (this.mode != 2) return;

		let [x,y,w,h] = [this._frameStartX, this._frameStartY, this._frameStartW, this._frameStartH];
		let [x2,y2] = [x+w, y+h];

		[this.pageX, this.pageY] = [e.pageX, e.pageY];
		const dx = (this.pageX - this.startX);// / this.zoom;
		const dy = (this.pageY - this.startY);// / this.zoom;
		let inversion_x = false;
		let inversion_y = false;

		let n_ = false, s_ = false, e_ = false, w_ = false;
		if (p.classList.contains("-ne")) {
			n_ = e_ = true;
		} else if (p.classList.contains("-nw")) {
			n_ = w_ = true;
		} else if (p.classList.contains("-se")) {
			s_ = e_ = true;
		} else if (p.classList.contains("-sw")) {
			s_ = w_ = true;
		}
		if (n_) y += dy;
		else if (s_) y2 += dy;

		if (e_) x += dx;
		else if (w_) x2 += dx;

		if (x > x2) {
			inversion_x = true;
			[x,x2] = [x2,x];
		}
		if (y > y2) {
			inversion_y = true;
			[y,y2] = [y2,y];
		}

		if (x2 - x < 24) x2 = x + 24;
		if (y2 - y < 24) y2 = y + 24;

		x = Math.min(Math.max(x, this.imageX), this.imageX + this.image.width);
		y = Math.min(Math.max(y, this.imageY), this.imageY + this.image.height);
		x2 = Math.min(Math.max(x2, this.imageX), this.imageX + this.image.width);
		y2 = Math.min(Math.max(y2, this.imageY), this.imageY + this.image.height);

		// adjust ratio
		if (this.options && this.options.image_size) {
			let [_w_, _h_] = this.options.image_size;
			if (_w_ > 0 && _h_ > 0) {
				const r_ = _w_ / _h_;
				w = x2 - x;
				h = y2 - y;
				_w_ = h * r_;
				_h_ = w / r_;
				if (w > _w_) {
					w = _w_;
				} else if (h > _h_) {
					h = _h_;
				}
				if (e_ || (w_ && inversion_x)) x = x2 - w;
				else if (w_ || (e_ && inversion_x)) x2 = x + w;

				if (n_ || (s_ && inversion_y)) y = y2 - h;
				else if (s_ || (n_ && inversion_y)) y2 = y + h;

				y2 = y + h;
			}
		}

		this.move(x,y,x2,y2);
		this.update();
		this._debug();
	}
	pointMouseup(e, p) {
		if (this.mode != 2) return;
		this.mode = 0;
		this.pageX = this.startX = 0;
		this.pageY = this.startY = 0;
		this._frameStartX = this._frameStartY = 0;
		this._frameStartW = this._frameStartH = 0;

		p.classList.remove("-active");
		this.framePoints.forEach(p=>p.classList.remove("-active"))
	}

	_debug() {
		debug(`
			mode: ${this.mode}<br />
			start: (${this.startX}, ${this.startY})<br />
			pageX/Y: (${this.pageX}, ${this.pageY})<br />
			image: pos=(${this.imageX}, ${this.imageY}) size=(${this.image.width}, ${this.image.height})<br />
			frame: pos=(${this.frameX}, ${this.frameY}) size=(${this.frameWidth}, ${this.frameHeight})<br />
			zoom: ${this.zoom}
		`);
	}
}
export default Preview;
