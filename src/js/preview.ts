

import { listen, debug, setStyle, createElement, findByClass } from './util';

class Preview {
	mode = 0; // 1=mousedown

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
	bg = null; // <img>
	frame = null; // <div>
	frameImage = null; // <img>

	// event callbacks
	__mousedown = null;
	__mousemove = null;
	__mouseup = null;

	constructor(image_data) {
		this.imageUrl = image_data.path;
		this.reset();
	}
	reset() {
		this.mode = 0;
		this.startX = this.startY = 0;
		this.pageX = this.pageY = 0;
		this.imageX = this.imageY = 0;
		this._imageStartX = this._imageStartY = 0;

		this.zoom = 1;

		this.image = null;
		this.el = null;
	}
	free() {
		if (this.frameImage) this.frameImage.remove();
		if (this.frame) this.frame.remove();
		if (this.bg) this.bg.remove();

		if (this.__mousedown) this.el.removeEventListener("mousedown", this.__mousedown);
		if (this.__mousemove) this.el.removeEventListener("mousemove", this.__mousemove);
		if (this.__mouseup) this.el.removeEventListener("mouseup", this.__mouseup);

		this.__mousedown = null;
		this.__mousemove = null;
		this.__mouseup = null;

		this.el = null;
		this.image = null;
		this.bg = null;
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

			};
		}
	}
	onload() {
		this.bg = createElement("img", {
			"src" : this.imageUrl,
			"class" : "bg",
		}, this.el);

		this.frame = createElement("div", {"class": "frame"}, this.el);

		this.frameImage = createElement("img", {
			"src" : this.imageUrl,
		}, this.frame);

		// calculate ratio
		let w0 = this.el.clientWidth, 
			h0 = this.el.clientHeight, 
			w = this.image.width, 
			h = this.image.height;
		
		let r = 1;
		if (w > w0) {
			r = Math.min(r, w0 / w);
			w *= r; h *= r;
		}
		if (h > h0) {
			r = Math.min(r, h0 / h);
			w *= r; h *= r;
		}

		// initialize image size and position
		this.zoom = r;
		this.imageX = (w0 - this.image.width * r) / 2;
		this.imageY = (h0 - this.image.height * r) / 2;
		
		// calculate frame position
		this.frameWidth = this.image.width; // * r;
		this.frameHeight = this.image.height; // * r;
		this.frameX = this.imageX;
		this.frameY = this.imageY;

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
				"width" : `${this.image.width * this.zoom}px`,
				"height" : `${this.image.height * this.zoom}px`,
			});
		}
		if (this.frame) {
			setStyle(this.frame, {
				"left" : `${this.frameX}px`,
				"top" : `${this.frameY}px`,
				"width" : `${this.image.width * this.zoom}px`,
				"height" : `${this.image.height * this.zoom}px`,
			});
		}
		if (this.bg && this.frame && this.frameImage) {
			const x = this.imageX - this.frameX;
			const y = this.imageY - this.frameY;

			setStyle(this.frameImage, {
				"left" : `${x}px`,
				"top" : `${y}px`,
				"width" : `${this.image.width * this.zoom}px`,
				"height" : `${this.image.height * this.zoom}px`,
			});
		}
	}

	// event
	initEvents() {
		const self = this;
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

		listen.call(this.el, "mousedown", this.__mousedown);
		listen.call(this.el, "mousemove", this.__mousemove);
		listen.call(this.el, "mouseup", this.__mouseup);	
	}
	mousedown(e) {
		this.mode = 1;
		this.pageX = this.startX = e.pageX;
		this.pageY = this.startY = e.pageY;
		[this._imageStartX, this._imageStartY] = [this.imageX, this.imageY];
		this.update();
		this._debug();
	}
	mousemove(e) {
		if (this.mode != 1) return;

		[this.pageX, this.pageY] = [e.pageX, e.pageY];
		this.imageX = this._imageStartX + (this.pageX - this.startX);
		this.imageY = this._imageStartY + (this.pageY - this.startY);
		this.update();
		this._debug();
	}
	mouseup(e) {
		this.mode = 0;
		this.pageX = this.startX = 0;
		this.pageY = this.startY = 0;
		this._imageStartX = this._imageStartY = 0;
	}

	_debug() {
		debug(`
			mode: ${this.mode}<br />
			start: (${this.startX}, ${this.startY})<br />
			pageX/Y: (${this.pageX}, ${this.pageY})<br />
			image: (${this.imageX}, ${this.imageX})<br />
			zoom: ${this.zoom}
		`);
	}
}
export default Preview;
