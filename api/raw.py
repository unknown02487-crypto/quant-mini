from http.server import BaseHTTPRequestHandler
import json, urllib.request

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            url = "https://api.bybit.com/v5/market/orderbook?category=linear&symbol=BTCUSDT&limit=50"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as r:
                data = r.read().decode()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(data.encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
        return
