
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
	_observe(callback) {
		let has_called = false;

		const self = this;
		const done = ()=>{
			setTimeout(()=>{
				req();
			}, CONNECTION_INTERVAL_T);
		};
		const req = ()=>{
			self._connect((res, data)=>{
				if (has_called) {
					callback.call(null, res, data);
					has_called = true;
				}
				if (res) {
					self.connected = true;
					done();
				} else {
					self.connected = false;
					done();
				}
			});
		};
		req();
	}
	_connect(callback) {
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
				if (callback) callback(true, response.json());
			})
			.catch((err)=>{
				console.error(err);

				if (callback) callback(false, err);
				self.showError();
			});
	}
	_request(url:string="/status", method:string="GET") {
		return fetch(this._path(url), {
			method, 
		});
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

	static connect(callback) {
		if (! instance) {
			instance = new Connection();
			instance.mount();
			instance._observe(callback);
		}
		return instance;
	}
}

export default Connection;
