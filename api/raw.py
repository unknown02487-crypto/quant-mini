from http.server import BaseHTTPRequestHandler
import json, requests, os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # BYBIT MAINNET - ekdum RAW, no filter
        url = "https://api.bybit.com/v5/market/orderbook"
        params = {
            "category": "linear",
            "symbol": "BTCUSDT",
            "limit": 50  # Pure 50 level raw depth
        }
        r = requests.get(url, params=params, timeout=5)
        data = r.json()

        # No compromise - jaisa aaya waisa bhej rahe hai
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
        return
