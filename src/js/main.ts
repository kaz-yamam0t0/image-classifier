

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
Connection.connect((res, data)=>{
	if (res == false) return;
});

let preview = null;

const s = new Sources([
	"seed0000.jpg",
	"seed0001.jpg",
	"seed0002.jpg",
	"seed0003.jpg",
	"seed0004.jpg",
	"seed0005.jpg",
	"seed0006.jpg",
	"seed0007.jpg",
	"seed0009.jpg",
	"seed0012.jpg",
	"seed0014.jpg",
]);
s.add([
	"seed0000.jpg",
	"seed0001.jpg",
	"seed0002.jpg",
	"seed0003.jpg",
	"seed0004.jpg",
	"seed0005.jpg",
	"seed0006.jpg",
	"seed0007.jpg",
	"seed0009.jpg",
	"seed0012.jpg",
	"seed0014.jpg",
]);
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

