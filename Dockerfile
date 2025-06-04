# === Сборка фронтенда ===
FROM node:18 AS frontend
WORKDIR /frontend
COPY frontend/ .
RUN npm install && npm run build

# === Backend (Flask + модель) ===
FROM python:3.10-slim
WORKDIR /app

# Установим зависимости системы (для psycopg2 и модели)
RUN apt-get update && apt-get install -y gcc libpq-dev && apt-get clean

# Копируем backend
COPY backend/ .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем собранный фронтенд
COPY --from=frontend /frontend/dist /app/static

# Объявляем порт
ENV PORT=8080

# Стартуем Flask, а не Vite!
CMD ["python", "app.py"]
