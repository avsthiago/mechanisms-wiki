#!/usr/bin/env python3
"""Serve the site locally the way Cloudflare Pages does: a path that is a file gets that file, any other path
(/brown/53, /about) gets index.html, and the page routes itself.
  python3 scripts/serve.py            # http://localhost:8000
  python3 scripts/serve.py 8080
The other scripts call serve() to start it in the background on a free port."""
import http.server, os, pathlib, sys, threading
root = pathlib.Path(__file__).resolve().parent.parent

class Handler(http.server.SimpleHTTPRequestHandler):
    quiet = True
    def __init__(self, *a, **k): super().__init__(*a, directory=str(root), **k)
    def send_head(self):
        if not os.path.isfile(self.translate_path(self.path)) and not os.path.isfile(os.path.join(self.translate_path(self.path), "index.html")):
            self.path = "/index.html"
        return super().send_head()
    def log_message(self, *a):
        if not self.quiet: super().log_message(*a)

def serve(port=0):
    """Start the server in a background thread and return its address, e.g. http://127.0.0.1:53124."""
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return "http://127.0.0.1:%d" % srv.server_address[1]

if __name__ == "__main__":
    Handler.quiet = False
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print("http://localhost:%d" % port)
    http.server.ThreadingHTTPServer(("", port), Handler).serve_forever()
