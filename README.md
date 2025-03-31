#Dokumentácia k nasadeniu webovej aplikácie

##Podmienky na nasadenie a spustenie

Na správne nasadenie a spustenie aplikácie je potrebné mať nainštalovaný nasledujúci softvér:

- Operačný systém: Linux (testované na Ubuntu, ale môže fungovať aj na iných distribúciách)

- Docker: Nástroj na kontajnerizáciu aplikácií (stiahnuť Docker)

- Docker Compose: Nástroj na orchestráciu viacerých kontajnerov (stiahnuť Docker Compose)

Odporúčame overiť správnu inštaláciu spustením príkazov:

docker --version
docker-compose --version

Opis aplikácie

Táto aplikácia je jednoduchý webový systém, ktorý obsahuje frontendovú a backendovú časť:

Frontend: React aplikácia, ktorá poskytuje webové rozhranie pre používateľov.

Backend: API server napísaný v Pythone (FastAPI alebo Flask), ktorý spracováva požiadavky od frontendu.

Aplikácia umožňuje používateľom interakciu cez webový prehliadač, pričom backend spracováva požiadavky a odosiela odpovede. Systém je navrhnutý tak, aby bol jednoduchý na nasadenie pomocou Dockeru.

Používané virtuálne siete a zväzky

Aplikácia využíva Docker Compose na vytvorenie izolovanej siete a spravovanie dát.

Virtuálna sieť: Docker Compose automaticky vytvorí vlastnú sieť, ktorá zabezpečuje komunikáciu medzi frontendom a backendom.

Pomenované zväzky: Použité na ukladanie perzistentných dát v prípade potreby, napríklad ak by aplikácia mala databázu alebo logy.

Konfigurácia kontajnerov

Aplikácia sa skladá z dvoch kontajnerov:

Frontend:

Port: 5174:5174

Závislosť: backend (musí byť dostupný pre správne fungovanie frontendu)

Automatické reštartovanie: always (zabezpečí opätovné spustenie v prípade výpadku)

Vytvára sa zo súborov v priečinku frontend/

Backend:

Port: 5000:5000

Automatické reštartovanie: always

Obsahuje hlavné API aplikácie a spracováva požiadavky od frontendu

Vytvára sa zo súborov v priečinku backend/

Používané kontajnery

V aplikácii sú použité tieto kontajnery:

Frontend:

Technológia: React

Poskytuje webové rozhranie aplikácie

Beží na porte 5174

Backend:

Technológia: Python (FastAPI/Flask)

Spracováva požiadavky z frontendu

Beží na porte 5000

Príručka pre nasadenie

Na nasadenie aplikácie postupujte podľa nasledujúcich krokov:

Príprava aplikácie:

./prepare-app.sh

Tento krok vytvorí potrebné Docker obrazy a pripraví aplikáciu na spustenie.

Spustenie aplikácie:

./start-app.sh

Po spustení bude aplikácia dostupná na http://localhost:5174

Pozastavenie aplikácie:

./stop-app.sh

Tento príkaz zastaví všetky bežiace kontajnery bez ich odstránenia.

Odstránenie aplikácie:

./remove-app.sh

Tento príkaz odstráni všetky vytvorené kontajnery a ich dáta.

Príklad použitia

Po spustení aplikácie otvorte webový prehliadač a prejdite na http://localhost:5174. Na stránke by sa mala zobraziť webová aplikácia, ktorá komunikuje s backendom.

Ak backend správne funguje, môžete skúsiť odoslať požiadavku cez terminál:

curl -X POST http://localhost:5000/api/predict -H "Content-Type: application/json" -d '{"input": "some_data"}'

Tento príkaz by mal vrátiť odpoveď z backendu, čo znamená, že komunikácia medzi frontendom a backendom je funkčná.