import http.server
import socketserver

import os
import io
import json
import re
from http import HTTPStatus

BASEDIR = os.path.dirname(os.path.abspath(__file__))


# https://github.com/python/cpython/blob/3.10/Lib/http/server.py#L628
class AppServerHandler(http.server.SimpleHTTPRequestHandler):
	def do_GET(self):
		p = self.path
		p = p.split('?',1)[0]
		p = p.split('#',1)[0]
		if p == "/status":
			return self.do_status()

		return super().do_GET()

	def do_POST(self):
		p = self.path
		p = p.split('?',1)[0]
		p = p.split('#',1)[0]
		if p == "/update":
			return self.do_update()

		return super().do_POST()

	def do_status(self):
		self.response_json({
			"result" : "OK",
		})
	
	def do_update(self):
		"""
		POST /update
		{
			name: "filename.jpg",
			action: "ok", # ok, remove
		}
		"""
		postdata = self.parse_postdata()
		res = {
			"result" : "ERROR", 
			"postdata" : postdata, 
		}
		while True: # enable to break out from any places
			if not (name := postdata.get("name")): 
				res["error"] = '`name` is required'
				break
			if not (action := postdata.get("action")):
				res["error"] = '`action` is required'
				break
			if name[0] == "." and name.find("..") >= 0:
				res["error"] = '`name` is invalid'
				break

			# src
			if not (src := postdata.get("src")):
				src = "data/" + name

			src_full = os.path.join(BASEDIR, src)
			if not os.path.isfile(src_full):
				res["error"] = '`%s` not exists' % (src)
				break

			# dst
			dst_dir = None
			if action == "remove":
				dst_dir = "results/trash"
			elif action == "ok":
				dst_dir = "results/checked"
			else:
				res["error"] = '`%s` is invalid action' % (action) 
				break

			dst_dir_full = os.path.join(BASEDIR, dst_dir)
			if not os.path.isdir(dst_dir_full):
				os.makedirs(dst_dir_full)

			dst = os.path.join(dst_dir, name)
			dst_full = os.path.join(BASEDIR, dst)

			# rename
			os.rename(src_full, dst_full)

			# response
			res["src"] = src
			res["dst"] = dst
			res["result"] = "OK"
			break
		
		# res["result"] = "OK"
		self.response_json(res)

	def parse_postdata(self):
		if self.headers.get("content-type") != "application/json":
			return None

		length = 0
		try:
			length = int(self.headers.get("content-length"))
		except: pass # ignore

		data = self.rfile.read(length)
		data = json.loads(data)
		return data


	def response_json(self, data):
		json_data = json.dumps(data).encode()

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
