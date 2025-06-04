# Hate Speech Detector

## 1. Application Overview

The **Hate Speech Detector** application analyzes a given text to determine whether it contains hate speech or neutral content. It uses a trained AI model for text classification. Users can input any text through the web interface, and the application immediately returns the classification result along with an option to view history.

All predictions are stored in a PostgreSQL database and also synchronized into a `history.json` file, which the frontend uses to display the history. In addition to predictions, the app provides a REST API for history management and deletion. Both the web interface and the API are secured via HTTPS.

The model was trained on a Slovak-language dataset using the LoRA (PEFT) technique, allowing efficient fine-tuning with a minimal number of trainable parameters.

---

## 2. Description of Cloud Usage and Objects

- **Cloud**: Google Cloud Platform (GCP)
- **GCP Services**:
  - **Google Cloud Run**: hosting the container with Flask backend and React frontend
  - **Artifact Registry**: storage for Docker image
  - **Cloud SQL (PostgreSQL)**: relational database for storing predictions

- **Docker Objects**:
  - Multistage `Dockerfile`:
    - `node:18` for building the React app
    - `python:3.10-slim` for the backend (Flask + transformers)
    - The frontend is copied to `/app/static/`

- **Persistent Storage**:
  - Cloud SQL PostgreSQL and `history.json`

### Structure of `history` table:
```sql
CREATE TABLE IF NOT EXISTS history (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    prediction TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL
);
```
Field descriptions:

- `id`: auto-incrementing primary key (numeric ID)
- `text`: user-submitted input text
- `prediction`: model output (e.g., "Neutral text")
- `timestamp`: date and time when the text was processed

---

## 3. Project Structure

```
skuska/
├── Dockerfile               # multistage Dockerfile (frontend + backend)
├── prepare-app-cloud.sh     # deployment script for GCP
├── remove-app-cloud.sh      # script to delete the service
├── history.json             # synchronized history file (read by frontend)
├── frontend/                # React frontend project (Vite)
│   └── ...                  # components, assets, App.jsx, etc.
├── backend/                 # Flask backend
│   ├── app.py               # main backend file (Flask API)
│   └── requirements.txt     # Python packages (model fetched dynamically from Hugging Face)
```

---

## 4. Description of Submitted Files and Configuration

### `backend/app.py`: Main backend file using Flask.
Includes:
- `/api/predict`: endpoint for AI predictions
- `/api/history`, `/api/history/db`, `/api/history/reset`: manage history.
  - `/api/history`: reads from `history.json` (auto-synced with the database)
  - `/api/history/db`: reads directly from PostgreSQL, ordered by timestamp
  - `/api/history/reset`: clears all records in the `history` table and resets `history.json` to an empty list

- PostgreSQL connection via `psycopg2` using `DATABASE_URL`
- Automatic model download from Hugging Face on startup

### `frontend/`: React project built with Vite
- Contains UI components, API calls, results and history display

### `backend/`: Contains `app.py` and `requirements.txt`

### Dockerfile: Combines frontend and backend into a single image

Example:
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
A bash script that:
- defines project variables
- builds the Docker image via `gcloud builds submit`
- deploys it to Google Cloud Run
- sets `DATABASE_URL`
- links the service with Cloud SQL using `--add-cloudsql-instances`
- requires gcloud CLI and active login

### `remove-app-cloud.sh`:
Bash script that:
- deletes the Cloud Run service via `gcloud run services delete`
- uses `--quiet` to suppress confirmation prompts

### `history.json`: 
- Auto-generated from the database
- Synced on each new entry using the `sync_history_file()` function

### Database Connection

Environment variable:
```
DATABASE_URL=postgresql://user:password@/mydb?host=/cloudsql/hatespeechsite:europe-central2:hate-db
```

---

## 5. Web Application Usage

1. Open the following URL in a browser:
```
https://hate-detektor-19732600168.europe-central2.run.app/
```
2. Enter a text string
3. Click "Check"
4. The classification result will be displayed
5. History section is shown below the form

Note: You can reset the history using the following command:
```
curl -X POST https://hate-detektor-19732600168.europe-central2.run.app/api/history/reset | jq
```

---

## 6. Requirements to Run the Scripts

### `prepare-app-cloud.sh` requires:

- GCP project with services enabled: Artifact Registry, Cloud Build, Cloud Run, Cloud SQL
- Active login with `gcloud` CLI and configured project

Performs:
- Docker image build
- Push to Artifact Registry
- Deploy to Cloud Run + Cloud SQL integration + setting env variable
- Uses environment variables for service/database names
- Script is repeatable and non-interactive

### `remove-app-cloud.sh`:

- Removes the Cloud Run service
- Runs immediately with `--quiet` (no confirmation needed)

---

## 7. External Resources

Trained Model:
- Model used: `slovak-t5-base`, fine-tuned manually
- Trained on a Slovak dataset of annotated sentences for hate speech detection
- Used PEFT (Parameter-Efficient Fine-Tuning) via LoRA (Low-Rank Adaptation)
- Achieved 74% accuracy on the test set

Model: `tetianamohorian/hate_speech_model` on Hugging Face (BERT-based)

Libraries & Frameworks:
- `transformers`, `torch` for AI modeling
- `Flask`, `psycopg2`, `pytz` for backend
- `React`, `Vite`, `fetch` for frontend

---

## 8. Summary of Completed Work

- ✅ Frontend created with React + Vite
- ✅ Backend built with Flask and REST API
- ✅ AI model deployed (Slovak-t5-base, LoRA, 74% accuracy)
- ✅ Connected to Cloud SQL (PostgreSQL)
- ✅ Database table `history` with fields: id, text, prediction, timestamp
- ✅ Synced database with `history.json`
- ✅ Deployment using Docker and Google Cloud Run
- ✅ Deployment and removal scripts created (`prepare-app-cloud.sh`, `remove-app-cloud.sh`)
- ✅ Secured HTTPS access
- ✅ Tested endpoints: `/api/predict`, `/api/history`, `/api/history/reset`, `/api/history/db`
