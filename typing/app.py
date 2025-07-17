from flask import Flask, render_template, jsonify, request
import random
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

PASSAGES_FILE = os.path.join(os.path.dirname(__file__), 'passages.txt')

def get_passages():
    with open(PASSAGES_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    # Split passages by blank lines
    passages = [p.replace('\n', ' ').strip() for p in content.split('\n\n') if p.strip()]
    return passages

def get_random_passage(word_limit):
    passages = get_passages()
    passage = random.choice(passages)
    words = passage.split()
    selected = ' '.join(words[:word_limit])
    return selected

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/passage')
def api_passage():
    try:
        length = int(request.args.get('length', 50))
        if length not in (50, 100):
            length = 50
    except Exception:
        length = 50
    passage = get_random_passage(length)
    return jsonify({'passage': passage})

if __name__ == '__main__':
    app.run(debug=True) 