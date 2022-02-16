
import os
import shutil
import io
import re
import glob
import json
import argparse
import urllib
import posixpath

import http.server
import socketserver
from http import HTTPStatus


BASEDIR = os.path.dirname(os.path.abspath(__file__))

# ============================================
# argparse
parser = argparse.ArgumentParser(description='Image classifier server')
# parser.add_argument('--port', type=int, default=8080)
parser.add_argument('--data-dir', type=str, default='data')
parser.add_argument('--result-dir', type=str, default='results')
parser.add_argument('--resize', type=str, default='512x512')
parser.add_argument('--no-enlarge', action='store_true')


args = parser.parse_args()

data_dir = os.path.abspath(args.data_dir)
if not os.path.isdir(data_dir):
	print("--data-dir `%s` is not dir" % args.data_dir)
	exit(-1)

result_dir = os.path.abspath(args.result_dir)
if not os.path.isdir(result_dir):
	print("--result-dir `%s` is not dir" % args.result_dir)
	exit(-1)


if not (m := re.match(r'^(\d+)x(\d+)$', args.resize)):
	print("--resize is invalid")
image_size = (int(m.group(1)), int(m.group(2)))

# https://github.com/python/cpython/blob/3.10/Lib/http/server.py#L628
class AppServerHandler(http.server.SimpleHTTPRequestHandler):
	def __init__(self, *args, **kwargs):
		global data_dir, result_dir
		self.data_dir = data_dir
		self.result_dir = result_dir
		super().__init__(*args, **kwargs)

	def do_GET(self):
		p = self.path
		p = p.split('?',1)[0]
		p = p.split('#',1)[0]
		if p == "/status":
			return self.do_status()

		if p == "/config":
			return self.do_config()

		if p == "/list":
			return self.do_list()

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
			# "options" : {
			# 	"data_dir" : args.data_dir, 
			# },
		})
	
	def do_config(self):
		global data_dir, result_dir, image_size, args
		self.response_json({
			"result" : "OK",
			"options" : {
				# "data_dir" : data_dir, 
				# "result_dir" : result_dir, 
				"image_size" : image_size, 
				"enlargable" : (args.no_enlarge == False), 
			},
		})
	
	def do_list(self):
		"""GET /list"""
		files = glob.glob(self.data_dir + "/*")

		files = list(map(lambda p: os.path.basename(p), files))
		files.sort()

		self.response_json({
			"result" : "OK",
			"sources" : files, 
		})

	def do_update(self):
		"""POST /update

		Request data:
		{
			name: "filename.jpg",
			path: "data/...",
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
			if name[0] == "." or name.find("..") >= 0:
				res["error"] = '`name` is invalid'
				break

			# src
			if not (src := postdata.get("src")):
				src = "data/" + name

			# src_full = self.translate_path(src)
			# if not os.path.isfile(src_full):
			# 	res["error"] = '`%s` not exists' % (src)
			# 	break

			# dst
			dst_dir = None
			if action == "remove":
				dst_dir = "results/trash"
			elif action == "ok":
				dst_dir = "results/checked"
			else:
				res["error"] = '`%s` is invalid action' % (action) 
				break

			# dst_dir_full = self.translate_path(dst_dir)
			# if not os.path.isdir(dst_dir_full):
			# 	os.makedirs(dst_dir_full)

			dst = os.path.join(dst_dir, name)
			
			# backup
			if re.match(r'/?data/', src):
				name_ = re.sub(r'/?data/', '', src)
				backup = os.path.join('results/backup', name_)
				try:
					self.copy(src, backup)
				except Exception as e:
					# res["error"] = e.message
					# break
					pass

			# rename
			try:
				dst, dst_full = self.rename(src, dst)
			except Exception as e:
				res["error"] = e.message
				break
			
			# response
			res["src"] = src
			res["dst"] = dst
			res["result"] = "OK"
			break
		
		# res["result"] = "OK"
		self.response_json(res)

	def rename(self, src, dst):
		return self.copy(src, dst, rename_flg=True)
	
	def copy(self, src, dst, rename_flg=False):
		src_full = self.translate_path(src)
		if not os.path.isfile(src_full):
			raise Exception("%s is not file" % src)

		dst_full = self.translate_path(dst)

		index = 0
		while os.path.isfile(dst_full):
			index += 1
			dst_, ext_ = os.path.splitext(dst)
			dst = "%s-%d%s" % (dst_, index, ext_)
			dst_full = self.translate_path(dst)

		d = os.path.dirname(dst_full)
		if not os.path.isdir(d):
			os.makedirs(d)

		if rename_flg:
			os.rename(src_full, dst_full)
		else:
			shutil.copy(src_full, dst_full)
		
		return dst, dst_full

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

	def translate_path(self, path):
		"""Almost same as http.server.SimpleHTTPRequestHandler.translate_path()"""
		# abandon query parameters
		path = path.split('?',1)[0]
		path = path.split('#',1)[0]
		# Don't forget explicit trailing slash when normalizing. Issue17324
		trailing_slash = path.rstrip().endswith('/')
		try:
			path = urllib.parse.unquote(path, errors='surrogatepass')
		except UnicodeDecodeError:
			path = urllib.parse.unquote(path)
		path = posixpath.normpath(path)

		# (*) different from original
		root_dir, path = self.get_root_dir(path)
		words = path.split('/')
		words = filter(None, words)
		path = root_dir

		for word in words:
			if os.path.dirname(word) or word in (os.curdir, os.pardir):
				# Ignore components that are not a simple file/directory name
				continue
			path = os.path.join(path, word)
		if trailing_slash:
			path += '/'
		return path

	def get_root_dir(self, path):
		if re.match(r'/?data/', path):
			path = re.sub(r'/?data/' ,'', path)
			return self.data_dir, path

		if re.match(r'/?results/', path):
			path = re.sub(r'/?results/' ,'', path)
			return self.result_dir, path

		return self.directory, path

	def log_request(self, code='-', size='-'):
		# surpress
		if self.path.startswith("/status"):
			return

		super().log_request(code, size)


socketserver.TCPServer.allow_reuse_address = True
# with socketserver.TCPServer(("", args.port), AppServerHandler) as httpd:
with socketserver.TCPServer(("", 8080), AppServerHandler) as httpd:
	print("serving at localhost:8080")
	httpd.serve_forever()
	
