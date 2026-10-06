import http.server
import socketserver
import json
import os
import sys
import datetime

# Configure safe UTF-8 output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PORT = 5173
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
MESSAGES_FILE = os.path.join(DIRECTORY, 'messages.json')

class CosmicHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        if self.path == '/api/contact':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                data['received_at'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                data['id'] = int(datetime.datetime.now().timestamp() * 1000)

                # Read existing messages
                messages = []
                if os.path.exists(MESSAGES_FILE):
                    try:
                        with open(MESSAGES_FILE, 'r', encoding='utf-8') as f:
                            messages = json.load(f)
                    except Exception:
                        messages = []
                
                messages.insert(0, data)

                # Save back to file
                with open(MESSAGES_FILE, 'w', encoding='utf-8') as f:
                    json.dump(messages, f, ensure_ascii=False, indent=2)

                print(f"\n[🚀 TÍN HIỆU MỚI ĐÃ ĐẾN!] Từ: {data.get('name')} <{data.get('email')}> | Lời nhắn: {data.get('message')}\n")

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {
                    'status': 'success',
                    'message': 'Đã nhận tín hiệu thành công và lưu vào Nhật Ký Vũ Trụ!',
                    'data': data
                }
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'error': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/api/messages':
            messages = []
            if os.path.exists(MESSAGES_FILE):
                try:
                    with open(MESSAGES_FILE, 'r', encoding='utf-8') as f:
                        messages = json.load(f)
                except Exception:
                    messages = []
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(messages, ensure_ascii=False).encode('utf-8'))
        else:
            super().do_GET()

print(f"🚀 Cosmic Universe Server đang chạy tại http://localhost:{PORT}")
with socketserver.TCPServer(("", PORT), CosmicHandler) as httpd:
    httpd.serve_forever()
