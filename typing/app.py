from flask import Flask, render_template, jsonify, send_from_directory
import random
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

SENTENCES_FILE = os.path.join(os.path.dirname(__file__), 'sentences.txt')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/sentence')
def get_sentence():
    with open(SENTENCES_FILE, 'r', encoding='utf-8') as f:
        sentences = [line.strip() for line in f if line.strip()]
    return jsonify({'sentence': random.choice(sentences)})

if __name__ == '__main__':
    app.run(debug=True) 