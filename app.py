import http.server
import socketserver

import io
import json
from http import HTTPStatus


# https://github.com/python/cpython/blob/3.10/Lib/http/server.py#L628
class AppServerHandler(http.server.SimpleHTTPRequestHandler):
	def do_GET(self):
		p = self.path
		p = p.split('?',1)[0]
		p = p.split('#',1)[0]
		if p == "/status":
			return self.do_status()

		return super().do_GET()

	def do_status(self):
		status_data = {
			"result" : "OK",
		}
		json_data = json.dumps(status_data).encode()

		self.send_response(HTTPStatus.OK)
		self.send_header("Content-Type" , "text/plain; Charset=UTF-8")
		self.send_header("Content-Length" , str(len(json_data)))
		self.end_headers()
		
		f = io.BytesIO()
		f.write(json_data)
		f.seek(0)

		self.copyfile(f, self.wfile)

PORT = 8080

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), AppServerHandler) as httpd:
	print("serving at port", PORT)
	httpd.serve_forever()
