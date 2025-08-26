from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("OPENROUTER_API_KEY")

@app.route('/genera', methods=['POST'])
def genera():
    dati = request.json

    prompt = crea_prompt(dati)
    
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "deepseek/deepseek-chat-v3-0324:free",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.8
        }
    )

    if response.status_code == 200:
        completamento = response.json()['choices'][0]['message']['content']
        return jsonify({"risposta_ai": completamento})
    else:
        return jsonify({"errore": "Errore chiamata OpenRouter", "dettagli": response.text}), 500

def crea_prompt(dati):
    nome = dati['nome_proprietario']
    cane = dati['nome_cane']
    razza = dati['razza_cane']
    eta = dati['eta_cane']

    risposte_p = dati['risposte']['proprietario']
    risposte_c = dati['risposte']['cane']

    prompt = f"""Sei un educatore cinofilo esperto.
Analizza il profilo cane+proprietario e genera un feedback personalizzato e informale.

Nome proprietario: {nome}
Nome cane: {cane}
Razza: {razza}
Età: {eta}

Risposte proprietario:
{risposte_p}

Risposte cane:
{risposte_c}

Scrivi un testo in tono amichevole e utile, come se fosse un consiglio diretto al proprietario per capire meglio il comportamento del cane e la relazione tra loro.
"""
    return prompt

if __name__ == "__main__":
    app.run(debug=True)
