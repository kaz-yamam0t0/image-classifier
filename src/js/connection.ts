
import { listen, debug, setStyle, createElement, findByClass } from './util';
import { DATA_DIR, CONNECTION_URL, CONNECTION_INTERVAL_T } from './config';


let instance = null;

class Connection {
	connected:boolean = false;
	
	el: any; 


	constructor() {
		this.mount();
		// this.showError();
	}

	mount() {
		this.el = createElement("div", {"class": "global-error"}, document.body);
		this.el.style.display = "none";
	}
	_observe(callback, error) {
		let has_called = false;

		const self = this;
		const done = ()=>{
			setTimeout(()=>{
				req();
			}, CONNECTION_INTERVAL_T);
		};
		const req = ()=>{
			self._connect((...args)=>{
				if (has_called) {
					callback.apply(null, args);
					has_called = true;
				}
				self.connected = true;
				done();
			}, (err)=> {
				if (error) error(err);
				done();
			});
		};
		req();
	}
	_connect(callback=null, error=null) {
		if (this._isLocal()) {
			location.href = `${CONNECTION_URL}/`;
			return;
		}

		//if (this.connected) {
		//	if (callback()) callback(true);
		//	return;
		//}
		const self = this;

		return this._request()
			.then(response=>{
				if (callback) callback.call(null, this);
			})
			.catch((err)=>{
				// if (callback) callback.call(null, null, err);
				if (error) error.call(null, err);

				self.connected = false;
				self.showError();
			});
	}
	_request(url:string="/status", method:string="GET", data:any=null) {
		let o = { method }
		if (method == "POST") {
			o["headers"] = {
				"Content-Type": "application/json",
				// 'Content-Type': 'application/x-www-form-urlencoded',
			}
			o["body"] = JSON.stringify(data);
		} 
		console.log(url, o);
		const p = fetch(this._path(url), o);
		return p;
	}
	_path(url:string) {
		if (url.indexOf("://") >= 0 || url.indexOf("//") === 0) {
			return url;
		}
		if (url[0] != "/") url = `/${url}`;

		return CONNECTION_URL + url;
	}	
	_isLocal() {
		if (! location || !location.protocol || location.protocol == "file:") {
			return true;
		}
		if (location.protocol != "http:" && location.protocol != "https://") {
			return true;
		}
		if (!location.hostname || `${location.hostname}`.trim() == "") {
			return true;
		}
		return false;
	}

	showError() {
		if (!this.el) return;

		this.el.innerHTML = 'Connection failed. Please make sure your python server is runnning. You can start the server with <code>$ python app.py</code>.';
		this.el.style.display = "block";		
	}
	hideError() {
		if (!this.el) return;
		
		this.el.style.display = "none";
	}

	static connect(callback, error=null) {
		if (! instance) {
			instance = new Connection();
			instance.mount();
			instance._observe(callback, error);
		} else {
			if (instance.connected) {
				if (callback) callback.call(null, instance);
			} else {
				instance._observe(callback, error);
			}
		}
		return instance;
	}
}

export default Connection;
