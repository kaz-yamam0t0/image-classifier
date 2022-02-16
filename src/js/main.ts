

import { listen, debug, setStyle, find, findByClass } from './util';
//import Layout from './layout';
import Preview from './preview';
import Sources from './sources';
import Connection from './connection';

// reset events
const __return_false = ()=>false;
listen("wheel", __return_false);
//listen("click", __return_false);
//listen("mousedown", __return_false);
//listen("mousemove", __return_false);
//listen("mouseup", __return_false);

//const layout = new Layout();
//layout.observe();

// connect
Connection.connect((conn)=>{
	if (! conn) return;

	let options = null;

	// config
	conn._get("/config", data=>{
		options = data.options;

		// list
		conn._get("/list",data=>{
			let preview = null;
			
			if (!data["sources"] || data["sources"].length <= 0) {
				alert("No images found in `data` directory.");
				data["sources"] = [];
			}

			const s = new Sources(data["sources"], options);
			s.onchange = function(item) {
				// remount preview
				if (preview) {
					preview.free();
					preview = null;
				}
				preview = new Preview(item, options);
				preview.mount();
			};
			s.onupdate = function(item) {
				// item.removed
				// item.done
			};
			s.mount();
			

			// reload
			let reloading = false;
			const reload = findByClass("reload");

			if (reload) {
				reload.addEventListener("click", ()=>{
					reload.classList.add("-loading");
					conn._get("/list",data=>{
						reload.classList.remove("-loading");
						
						if (!data["sources"] || data["sources"].length <= 0) {
							alert("No images found in `data` directory.");
							return;
						}	

						if (preview) {
							preview.free();
							preview = null;
						}
						s.replace(data["sources"]);
					});

					try {
						reload.blur();
					} catch(ignore_) {}
				});
			}
		});
	});
});

