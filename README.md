# Hate Speech Detector

## 1. Opis čo robí aplikácia

Aplikácia **Hate Speech Detector** slúži na analýzu zadaného textu s cieľom určiť, či ide o nenávistný alebo neutrálny obsah. Využíva trénovaný model umelej inteligencie na klasifikáciu textov. Používateľ môže cez webové rozhranie zadať ľubovoľný text a aplikácia okamžite vráti klasifikáciu spolu s možnosťou zobrazenia histórie.

Všetky predikcie sa ukladajú do databázy PostgreSQL a zároveň sa synchronizujú do súboru `history.json`, ktorý frontend využíva ako zdroj na zobrazenie histórie. Okrem predikcie aplikácia poskytuje aj REST API na správu histórie a jej vymazanie. Webové rozhranie aj API sú zabezpečené cez HTTPS.

Model bol trénovaný na slovenskom datasete s využitím metódy LoRA (PEFT), čo umožnilo efektívne doladenie modelu s minimálnym počtom trénovateľných parametrov.

---

## 2. Slovný opis použitého verejného klaudu a objektov

- **Cloud**: Google Cloud Platform (GCP)
- **Služby GCP**:
  - **Google Cloud Run**: hostovanie kontajnera s Flask backendom a React frontendom
  - **Artifact Registry**: uložisko pre Docker image
  - **Cloud SQL (PostgreSQL)**: relačná databáza na uchovanie predikcií

- **Docker objekty**:
  - Multistage `Dockerfile`:
    - `node:18` na build React aplikácie
    - `python:3.10-slim` pre backend (Flask + transformers)
    - Frontend sa kopíruje do `/app/static/`

- **Trvalý zväzok**:
  - Cloud SQL PostgreSQL a `history.json`

### Štruktúra tabuľky `history`:
```sql
CREATE TABLE IF NOT EXISTS history (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    prediction TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL
);
```
Popis polí:

- `id`: automatický primárny kľúč (číselný identifikátor)
- `text`: vstupný text, ktorý užívateľ zadal
- `prediction`: výstup modelu (napr. "Neutrálny text")
- `timestamp`: dátum a čas, kedy bol text spracovaný

---

## 3. Štruktúra projektu

Projekt má nasledovnú štruktúru:

```
skuska/
├── Dockerfile               # multistage Dockerfile (frontend + backend)
├── prepare-app-cloud.sh           # skript na nasadenie aplikácie do GCP
├── remove-app-cloud.sh            # skript na odstránenie služby
├── history.json             # synchronizovaný záznam histórie (čítaný frontend)
├── frontend/                # React frontend projekt (vite)
│   └── ...                  # komponenty, assets, App.jsx atď.
├── backend/                 # Flask backend
│   ├── app.py               # hlavný backend súbor (Flask API)
│   └── requirements.txt     # python balíčky (model sa sťahuje dynamicky z Hugging Face)
```

---

## 4. Opis odovzdaných súborov a konfigurácie:

### `backend/app.py`: hlavný backend aplikácie vo Flasku. 
Obsahuje:

- endpoint `/api/predict` na AI predikciu

- `/api/history`, `/api/history/db` a `/api/history/reset` - slúžia na prácu s históriou. /api/history číta zo súboru history.json, ktorý je automaticky synchronizovaný s databázou. /api/history/db číta priamo z PostgreSQL databázy a zobrazí zoznam záznamov zoradených podľa času. /api/history/reset vymaže všetky záznamy z tabuľky history v databáze a zároveň prepíše history.json na prázdny zoznam.

- prepojenie na PostgreSQL (cez psycopg2 a DATABASE_URL)

- uloženie a synchronizáciu histórie

- automatické stiahnutie modelu z Hugging Face pri štarte aplikácie

### `frontend/`: React projekt vytvorený cez Vite. 
- Obsahuje komponenty pre UI, API volania, zobrazovanie výsledkov a histórie.

### `backend/`: obsahuje `app.py`, `requirements.txt`

### Dockerfile: kombinácia frontend + backend do jedineho obrazu

Výrez Dockerfile:

```dockerfile
FROM node:18 AS frontend
WORKDIR /frontend
COPY frontend/ .
RUN npm install && npm run build

FROM python:3.10-slim
WORKDIR /app
COPY backend/ .
RUN apt-get update && apt-get install -y gcc libpq-dev && pip install -r requirements.txt
COPY --from=frontend /frontend/dist /app/static
CMD ["python", "app.py"]
```
### `prepare-app-cloud.sh`: 
Bash skript, ktorý:
- definuje všetky dôležité premenne (názov projektu, región, názov obrazu a databázy)
- zostaví Docker image pomocou gcloud builds submit
- nasadí image do Google Cloud Run cez gcloud run deploy
- nastaví environmentálnu premennú DATABASE_URL
- prepojí službu so zvolenou databázou cez --add-cloudsql-instances
- vyžaduje spustený gcloud CLI a prihláseného používateľa

### `remove-app-cloud.sh`: 
Bash skript, ktorý:
- pomocou gcloud run services delete zmaže existujúcu službu z Google Cloud Run
- využíva parameter --quiet na potlačenie výzvy na potvrdenie
- vyžaduje rovnaké prostredie ako skript `prepare-app-cloud.sh`

### `history.json`: 
- vygenerovaný automaticky zo stavu databázy (synchronizuje sa pri každom uložení nového záznamu pomocou funkcie `sync_history_file()`)

### Pripojenie k databáze:

Premenná:

```
DATABASE_URL=postgresql://user:password@/mydb?host=/cloudsql/hatespeechsite:europe-central2:hate-db
```

---
## 5. Návod na použitie aplikácie v prehliadači:

1. Otvorte v prehliadači URL:
```
https://hate-detektor-19732600168.europe-central2.run.app/
```
2. Zadajte text do formulára
3. Kliknite na "Skontrolovať"
4. Zobrazí sa výsledok klasifikácie
5. Pod formulárom sa nachádza sekcia histórie

Pozamka: môžete resetovat' historiu priamo cez terminál príkazom:
```
curl -X POST https://hate-detektor-19732600168.europe-central2.run.app/api/history/reset | jq
```

---
## 6. Podmienky pre spustenie skriptov:

### `prepare-app-cloud.sh`:

vyžaduje:

- GCP projekt s povolenými službami: Artifact Registry, Cloud Build, Cloud Run, Cloud SQL
- `gcloud` CLI s aktívnym prihlásením a nastaveným projektom

vykonáva:

- build Docker image
- push do Artifact Registry
- deploy do Cloud Run + pripojenie k Cloud SQL + nastavenie DATABASE_URL
- používa premenné prostredia pre názvy služby a databázy
- skript je opakovateľný a nevyžaduje manuálnu interakciu

### `remove-app-cloud.sh`:

- odstráni službu z Cloud Run
- spustenie je okamžité bez potreby interakcie
- tichý režim (bez potvrdenia) pomocou parametra --quiet


---

## 7. Externé zdroje:

Trénovaný model:

- Použitý model: `slovak-t5-base`, finetunovaný osobne 
- Model bol trénovaný na slovenskom datasete pozostávajúcom z anotovaných viet so zameraním na identifikáciu nenávistného prejavu
- Tréning prebehol s využitím metódy PEFT (Parameter-Efficient Fine-Tuning) konkrétne cez technológiu LoRA (Low-Rank Adaptation), čo umožnilo efektívne doladiť model s minimálnym počtom trénovateľných parametrov
- Model dosiahol presnosť 74 % pri testovaní na slovenskom dátovom korpuse

Model: `tetianamohorian/hate_speech_model` z HuggingFace (transformers model BERT)

Knižnice a frameworky:

  - `transformers`, `torch` pre modelovanie
  - `Flask`, `psycopg2`, `pytz` pre backend 
  - `React`, `Vite`, `fetch` pre frontend

---
## 8. Zhrnutie a vykonané kroky:

- ✅ Vytvorený frontend v Reacte s použitím Vite
- ✅ Vytvorený backend vo Flasku s REST API
- ✅ Nasadený AI model trénovaný na slovenskom datasete (slovak-t5-base, LoRA, 74 % presnosť)
- ✅ Prepojenie aplikácie s databázou Cloud SQL (PostgreSQL)
- ✅ Vytvorená databázová tabuľka history s políčkami: id, text, prediction, timestamp
- ✅ Implementovaná synchronizácia databázy s `history.json`
- ✅ Nasadenie aplikácie pomocou Dockeru a Google Cloud Run
- ✅ Vytvorené shellové skripty na deploy (prepare-app-cloud.sh) a odstránenie (remove-app-cloud.sh)
- ✅ Zabezpečený verejný prístup cez HTTPS
- ✅ Otestované API: `/api/predict`, `/api/history`, `/api/history/reset`, `/api/history/db`

