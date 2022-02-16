
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
		let has_errored = false;

		const self = this;
		const done = ()=>{
			setTimeout(()=>{
				req();
			}, CONNECTION_INTERVAL_T);
		};
		const req = ()=>{
			self._connect((...args)=>{
				if (has_errored) { 
					// reload when reconnected
					location.reload();
					return;
				}

				if (has_called == false) {
					callback.apply(null, args);
					has_called = true;
				}
				self.connected = true;
				done();
			}, (err)=> {
				has_errored = true;

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

		return this._request("/status")
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
	_request(url:string, method:string="GET", data:any=null, complete=null) {
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
		
		if (complete) {
			p.then((res)=>{
				res.json().then(data=>{
					complete(data);
					return data;
				});
				return res;
			});
		}
		

		return p;
	}
	_get(url:string, complete=null) {
		return this._request(url, "GET", null, complete);
	}
	_post(url:string, data:any=null, complete=null) {
		return this._request(url, "POST", data, complete);
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

		this.el.innerHTML = 'Connection failed. Make sure app.py server is runnning. <code>$ python app.py</code>.';
		this.el.style.display = "block";		
	}
	hideError() {
		if (!this.el) return;
		
		this.el.style.display = "none";
	}

	static connect(callback, error=null) {
		if (! instance) {
			instance = new Connection();
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
	static isConnected() {
		if (! instance) {
			return false;
		}
		return instance.connected;
	}
}

export default Connection;
