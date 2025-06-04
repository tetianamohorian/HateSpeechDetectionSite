
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_caching import Cache
from flask import send_from_directory
import json
import os
import hashlib
import re
import psycopg2
from datetime import datetime
import pytz
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

app = Flask(__name__)
CORS(app)
app.config['CACHE_TYPE'] = 'SimpleCache'
cache = Cache(app)

# Database connection
DATABASE_URL = os.environ.get('DATABASE_URL')
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

# Initialize DB
cursor.execute('''
    CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        prediction TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL
    )
''')
conn.commit()

model_path = "tetianamohorian/hate_speech_model"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
model.eval()

HISTORY_FILE = "history.json"

def generate_text_hash(text):
    return hashlib.md5(text.encode('utf-8')).hexdigest()

def get_current_time():
    tz = pytz.timezone('Europe/Bratislava')
    now = datetime.now(tz)
    return now

def save_to_history(text, prediction_label):
    timestamp = get_current_time()

    # Save to PostgreSQL
    try:
        cursor.execute(
            "INSERT INTO history (text, prediction, timestamp) VALUES (%s, %s, %s)",
            (text, prediction_label, timestamp)
        )
        conn.commit()
    except Exception as e:
        print("Nepodarilo sa uložiť do databázy:", e)

@app.route("/")
def serve_frontend():
    return send_from_directory("static", "index.html")

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        text = data.get("text", "")

        if not text:
            return jsonify({"error": "Text nesmie byť prázdny."}), 400
        if len(text) > 512:
            return jsonify({"error": "Text je príliš dlhý. Maximálne 512 znakov."}), 400
        if re.search(r"[а-яА-ЯёЁ]", text):
            return jsonify({"error": "Text nesmie obsahovať azbuku (cyriliku)."}), 400

        text_hash = generate_text_hash(text)
        cached_result = cache.get(text_hash)
        if cached_result:
            save_to_history(text, cached_result)
            return jsonify({"prediction": cached_result}), 200

        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)

        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.argmax(outputs.logits, dim=1).item()

        prediction_label = "Pravdepodobne toxický" if predictions == 1 else "Neutrálny text"
        cache.set(text_hash, prediction_label)

        save_to_history(text, prediction_label)

        return jsonify({"prediction": prediction_label}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/history", methods=["GET"])
def get_history():
    try:
        # Читаем из базы
        cursor.execute("SELECT text, prediction, timestamp FROM history ORDER BY timestamp DESC")
        rows = cursor.fetchall()
        history = [
            {
                "text": r[0],
                "prediction": r[1],
                "timestamp": r[2].strftime("%d.%m.%Y %H:%M:%S")
            } for r in rows
        ]

        # Обновляем JSON-файл
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False, indent=2)

        return Response(
            json.dumps(history, ensure_ascii=False, indent=2),
            mimetype="application/json"
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/history/raw", methods=["GET"])
def get_raw_history():
    try:
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                content = f.read()
            return Response(content, mimetype="application/json")
        else:
            return jsonify({"error": "history.json not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/history/reset", methods=["POST"])
def reset_history():
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=2)

        cursor.execute("DELETE FROM history")
        conn.commit()

        return jsonify({"message": "History reset successful."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/history/db", methods=["GET"])
def get_history_from_db():
    try:
        cursor.execute("SELECT text, prediction, timestamp FROM history ORDER BY timestamp DESC")
        rows = cursor.fetchall()
        history = [
            {
                "text": r[0],
                "prediction": r[1],
                "timestamp": r[2].strftime("%d.%m.%Y %H:%M:%S")
            } for r in rows
        ]

        return Response(
            json.dumps(history, ensure_ascii=False, indent=2),
            mimetype="application/json"
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


print("✅ Flask is starting...")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
