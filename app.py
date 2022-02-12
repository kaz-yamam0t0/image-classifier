import http.server
import socketserver


# https://github.com/python/cpython/blob/3.10/Lib/http/server.py
class AppServerHandler(http.server.SimpleHTTPRequestHandler):
	pass


PORT = 8080

with socketserver.TCPServer(("", PORT), AppServerHandler) as httpd:
	print("serving at port", PORT)
	httpd.serve_forever()
