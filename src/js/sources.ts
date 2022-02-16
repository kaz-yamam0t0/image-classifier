import { listen, debug, setStyle, createElement, findByClass } from './util';
import { DATA_DIR } from './config';

import Connection from './connection';

class Sources {
	options = null;

	items: {
		name: string, 
		path_org: string,
		path: string, 
		tag: string,

		done: boolean,
		removed: boolean,
		changed: boolean,

		b64: string, // cache base64 image data for reference after renaming images

		$li: any, // <li>
		$image: any, // <img>
		frame: null, // {x,y,width,height}
	}[];

	el = null; // div.sources
	ul = null; // <ul>

	current:number = 0; // item of this.items 
	mounted:boolean = false;
	onchange = null;
	onupdate = null;

	constructor(items: any[], options=null) {
		const self = this;
		this.options = options;

		this.items = [];
		this.add(items);
	}
	replace(items: any[]) {
		this.items = [];
		this.ul.innerHTML = "";
		this.current = 0;

		this.add(items);
	}
	add(items: any[]) {
		const self = this;

		items.forEach((item)=>{
			if (typeof item === "string") {
				item = { 
					name: item,  
					path_org: `${DATA_DIR}/${item}`,
					path: `${DATA_DIR}/${item}`,
					tag: null,

					done: false,
					removed: false,
					changed: false, 
				};
				item.$image = new Image();
				item.$image.src = item.path;
			}
			self.items.push(item);
		});

		if (this.mounted) {
			this.update();
			this.change();
		}
	}

	mount() {
		if (!(this.el = findByClass("sources"))) {
			throw '`.sources` not found.';			
		}
		if (!(this.ul = this.el.querySelector("ul"))) {
			// throw '`.sources > ul` not found.';	
			this.ul = createElement("ul", null, this.el);
		}

		this.mounted = true;

		this.update();
		this.initEvents();

		this.change();
	}
	update() {
		const self = this;
		this.items.forEach((item, index)=>{
			// $li
			let $li = item.$li = item.$li || createElement("li",null, self.ul);
			//$li.setAttribute("title", item.path);

			// $item
			let $item = findByClass("item", $li) || createElement("div", { "class":"item" }, $li);
			let $image = findByClass("image", $item) || createElement("div", {"class":"image"}, $item, (el)=>{
				el.appendChild(item.$image);
			});
			let $name = findByClass("name", $item) || createElement("div", {"class":"name"}, $item);
			
			$name.textContent = item.name;

			if (self.current == index) {
				$item.classList.add("-active");
			} else {
				$item.classList.remove("-active");
			}

			// click events
		//	listen.call($li, "click", function(e) {
		//		self.click(e);
		//	});

			// status
			if (item.done) {
				$li.classList.add("-ok");
				$li.classList.remove("-removed");
			} else if (item.removed) {
				$li.classList.remove("-ok");
				$li.classList.add("-removed");
			} else {
				$li.classList.remove("-ok");
				$li.classList.remove("-removed");
			}
		});
	}
	// event
	initEvents() {
		const self = this;

		listen.call(document.body, "keydown", (e)=>{
			const keycode = e.keyCode;
			const keyname = `${e.key}`.toLowerCase();
	
			if ( (keycode == 40 || keyname == 'arrowdown') || 
				(keycode == 38 || keyname == 'arrowup')) 
			{
				e.preventDefault();
				e.stopPropagation();
			}
			
			self.keypress(e);
			return false;
		});
		listen.call(this.ul, "click", function(e){
			self.click(e);
		});
	}
	keypress(e) {
		const keycode = e.keyCode;
		const keyname = `${e.key}`.toLowerCase();
		//console.log(keycode, keyname);
		
		// down
		if (keycode == 40 || keyname == 'arrowdown') {
			this.moveToDown();
		}
		// up
		if (keycode == 38 || keyname == 'arrowup') {
			this.moveToUp();
		}
		// delete
		if (keycode == 8 || keyname == "backspace") {
			this.remove();
		}
		// enter
		if (keycode == 13 || keyname == 'enter') {
			this.approve();
		}
	}
	click(e) {
		console.log(e);

		/*
		if (! e.path) {
			return;
		}
		const li = e.path.find(el_=>{
			if (el_.nodeType != Node.ELEMENT_NODE) {
				return false;
			}
			return (`${el_.nodeName}`.toLowerCase() == "li");
		});
		*/
		let el = e.target;
		let li = null;
		let tmp = 0;
		while (el && el.nodeType == Node.ELEMENT_NODE) {
			if (tmp++ > 10) break;  // something is wrong.
			
			if (`${el.nodeName}`.toLowerCase() == "li") {
				li = el;
				break;
			}

			if (!el.parentNode) break;
			el = el.parentNode;
		}
		if (! li) {
			return;
		}

		if (li.classList.contains("-active")) {
			return;
		}
		
		const index = this.items.findIndex((item)=>{
			return (item.$li == li);
		});
		if (index >= 0) {
			this.current = index;
		}

		this.update();
		this.change();
		//this.scroll();
	}
	remove() {
		if (! Connection.isConnected()) {
			this.moveToDown();
			return;
		}
		if (typeof this.items[this.current] !== "undefined") {
			const current = this.items[this.current];

			// already
			if (current.removed) {
				this.update();
				this.moveToDown();
				return;
			}
			current.done = false;
			current.changed = false;
			current.removed = true;

			if (this.onupdate) {
				this.onupdate(current);
			}
			Connection.connect((conn)=>{
				conn._request("/update", "POST", {
					"name": current.name,
					"src" : current.path, 
					"action" : "remove",
					"frame" : current.frame || null,
				}).then(res=>{
					res.json().then(data=>{
						if (data.backup) {
							current.path = data.backup;
						}
					});
				});
			});
		}
		this.update();
		this.moveToDown();
	}
	approve() {
		if (! Connection.isConnected()) {
			this.moveToDown();
			return;
		}
		if (typeof this.items[this.current] !== "undefined") {
			const current = this.items[this.current];
			
			// already
			if (current.done && !current.changed) {
				this.update();
				this.moveToDown();
				return;
			}

			current.done = true;
			current.changed = false;
			current.removed = false;

			if (this.onupdate) {
				this.onupdate(current);
			}
			((current) => {
				Connection.connect((conn)=>{
					console.log(current.frame);
					conn._request("/update", "POST", {
						"name": current.name,
						"src" : current.path, 
						"action" : "ok",
						"frame" : current.frame || null,
					}).then(res=>{
						res.json().then(data=>{
							if (data.backup) {
								current.path = data.backup;
							}
						});
					});
				});
			})(current);
		}

		this.update();
		this.moveToDown();
	}
	moveToUp() {
		if (this.items.length <= 0) {
			this.current = 0;
		} else {
			//this.current = (this.current + this.items.length - 1) % this.items.length;
			if (this.current > 0) this.current--;
		}
		this.update();
		this.change();
		this.scroll();
	}
	moveToDown() {
		if (this.items.length <= 0) {
			this.current = 0;
		} else {
			// this.current = (this.current + 1) % this.items.length;
			if (this.current < this.items.length - 1) this.current++;
		}
		this.update();
		this.change();
		this.scroll();
	}
	scroll() {
		//this.el;
		if (typeof this.items[this.current] !== "undefined") {
			let scrollTop = this.el.scrollTop;
			const height0 = this.el.clientHeight;
			const innerHeight = this.el.querySelector("ul").clientHeight;
			if (height0 - 24 > innerHeight) {
				//return;
			}

			const current = this.items[this.current];
			const rect = current.$li.getBoundingClientRect();
			const top = rect.top;
			const height = rect.height;

			const top_ = (scrollTop + top) - (height0 - height)/2; // top should be

			//if (Math.abs(top - top_) > 24) {
				this.el.scrollTo(0, top_);
			//}
		}
	}

	change() {
		if (typeof this.items[this.current] !== "undefined") {
			if (this.onchange) {
				this.onchange.call(this, this.items[this.current]);
			}
		}
	}

}
export default Sources;
