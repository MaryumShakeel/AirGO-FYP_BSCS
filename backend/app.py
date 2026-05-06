from flask import Flask, request, jsonify
from ai_stream import update_frame, get_latest_action

app = Flask(__name__)

@app.route('/frame', methods=['POST'])
def frame():
    file = request.files['image']
    update_frame(file.read())
    return jsonify({"ok": True})

@app.route('/action', methods=['GET'])
def action():
    return jsonify({"status": get_latest_action()})

if __name__ == '__main__':
    app.run(port=5001, threaded=True)