

import { listen, debug, setStyle } from './util';
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

// connect
Connection.connect((conn)=>{
	if (! conn) return;

	conn._request("/list").then((res)=>{
		res.json().then(data=>{
			let preview = null;

			const s = new Sources(data["sources"]);
			s.onchange = function(item) {
				// remount preview
				if (preview) {
					preview.free();
					preview = null;
				}
				preview = new Preview(item);
				preview.mount();
			};
			s.onupdate = function(item) {
				// item.removed
				// item.done
			}
			s.mount();
		});
	});
});

