

from flask import Flask, request, jsonify
from flask_cors import CORS
import json

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from flask_caching import Cache
import hashlib

import time



app = Flask(__name__)
CORS(app)

app.config['CACHE_TYPE'] = 'SimpleCache' 
cache = Cache(app)

model_path = "./hate_speech_model/final_model"


tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
model.eval()


def generate_text_hash(text):
    return hashlib.md5(text.encode('utf-8')).hexdigest()

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        text = data.get("text", "")

        text_hash = generate_text_hash(text)
        cached_result = cache.get(text_hash)
        if cached_result:
            return jsonify({"prediction": cached_result}), 200


        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)


        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.argmax(outputs.logits, dim=1).item()
        
        prediction_label = "Pravdepodobne toxický" if predictions == 1 else "Neutrálny text"
        
        cache.set(text_hash, prediction_label)
        
        response = app.response_class(
            response=json.dumps({"prediction": prediction_label}, ensure_ascii=False),
            status=200,
            mimetype="application/json"
        )
        
        


        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, threaded=True)
