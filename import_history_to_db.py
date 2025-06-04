
import psycopg2
import json
import os
from datetime import datetime
import pytz

HISTORY_FILE = "history.json"
DATABASE_URL = os.environ.get("DATABASE_URL")

def parse_timestamp(ts_str):
    try:
        return datetime.strptime(ts_str, "%d.%m.%Y %H:%M:%S").astimezone(pytz.timezone("Europe/Bratislava"))
    except Exception as e:
        print(f"Chyba pri parsovaní času: {e}")
        return datetime.now(pytz.timezone("Europe/Bratislava"))

def main():
    if not os.path.exists(HISTORY_FILE):
        print("history.json neexistuje, nič na importovanie.")
        return

    with open(HISTORY_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    count = 0
    for entry in data:
        text = entry.get("text")
        prediction = entry.get("prediction")
        timestamp_str = entry.get("timestamp")

        if not (text and prediction and timestamp_str):
            continue

        timestamp = parse_timestamp(timestamp_str)

        try:
            cursor.execute(
                "INSERT INTO history (text, prediction, timestamp) VALUES (%s, %s, %s)",
                (text, prediction, timestamp)
            )
            count += 1
        except Exception as e:
            print(f"Chyba pri vkladaní: {e}")

    conn.commit()
    cursor.close()
    conn.close()
    print(f"Úspešne importovaných záznamov: {count}")

if __name__ == "__main__":
    main()
