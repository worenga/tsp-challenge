## TSP Challenge

Autor: Benedikt Christoph Wolters <benedikt.wolters@rwth-aachen.de>

Einreichung zur Code Competition `Der Handlungsreisende` von it-talents.de

## Kurzbeschreibung / Uebersicht

Das System orientiert benutzt die Google Maps Geocoding API als Datenquelle um Addressen zu Orten (Places) zu kodieren.
Jeder Ort wird zunaechst ueber die Geocoding API gesucht und zur Latitude/Longitude Koordinaten umgerechnet.

Zusaechlich wird der Google Place Identifier zum dem jeweiligen Ort gespeichert.
Nachdem der Benutzer hinreichend viele Ziele in die App eingefuegt hat, wird ueber den Google Maps Distance Matrix Service die Distanz der Einzelnen Ziele zueinander berechnet.
Dabei wird auf Benutzerpraeferenzen wert gelegt (Distanz vs. Dauer, Fahrt mit dem Auto vs. Fussweg, etc.).
Zuletzt entsteht eine Distanzmatrix der einzelnen Orte zueinander unter Beruecksichtigung der einzelnen Metriken.

Nachdem die Distanzen zu den Zielen untereinander berechnet wurden, wird eine C++ Backend Applikation gestartet die mithilfe eines Genetischen Algorithmus
das TSP Problem optimiert und eine route berechnet.

Die C++ Applikation laeuft asynchron zum Frontend und die zwischenresultate bzw. der Fortschritt wird in einem Redis Speicher vorgehalten.

Sobald der Genetische Algorithmus terminiert und eine optimierte Route zurueckliefert, stellt das Frontend fuer jede Strecke der Route Anfragen an die Google Directions API und versucht Wegbeschreibungen darzustellen.

## Systemarchitektur

Das System besteht aus einem React-Frontend sowie einem Node.js-Express Webserver.
Der Node.js Webserver wird miuthilfe von pm2 und nginx geloadbalanced.
Die Instanzen des Webservers rufen die C++ Applikation auf fuer den genetischen Algorithmus zur Optimierung auf.
Die C++ Applikation nutzt die Geneial Library (der Autor ist ebenfalls Maintainer dieser Library und hat die GeneiAL Library fuer die Challenge um die erforderliche Funktionalitaet erweitert).

## Genetische Algorithmen

Genetische Algorithmen sind evolutionaere Algorithmen und orientieren sich am Selektionsprozess der Natur.
Loesungskandidaten (zunaechst zufaellig ausgewaehlt) werden in einer Population gespeichert.
Loesungen paaren sich zufaellig miteinander und es entstehen so neue Loesungen, die evaluiert werden koennen.
Loesungenskandidaten besitzen eine Fitness, nach gewisser Zeit werden Loesungskandidaten mit geringer Fitness aussterben, waehrend Loesungskandidaten mit hoher Fitness ueberleben.
Darueberhinaus gibt es Mutation: Loesungskandidaten koennen mit geringer Wahrscheinlichkeit mutieren.
Ueber diesen Stochastischen Prozess werden die Loesungen der Population sukzessive Besser. Nach einer Fixen Anzahl von Iterationen (auch Generationen) wird der Loesungskandidat mit der besten Fitness gewaehlt.

Das Verfahren garantiert keine optimale Loesung aber terminiert dafuer deterministisch und approximiert die optimale TSP Loesung.

## Installation

Die Installation ist am einfachsten ueber das Docker image:

Ein Entsprechend vorbereitetes Docker image findet sich unter https://hub.docker.com/r/worenga/tsp-challenge/

```
docker pull worenga/tsp-challenge:latest
```

Anschliessend kann die Applikation ueber
```
docker run -ti -p 4000:4000 worenga/tsp-challenge:latest
```

gestartet werden.

Man kann anschliessend ueber den Browser unter http://localhost:4000/ auf die Applikation zugreifen.

Mit CTRL-C kann die Application beendet werden.

# Lokale Manuelle Installation:

Gelingt die Docker Installation nicht, so kann der Code lokal installiert werden.

Dazu wird nodejs, nginx, redis-server und pm2 benoetigt.

```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nodejs nginx redis-server
npm install -g create-react-app pm2
```

Zum bauen der C++ Appliation wird ebenfalls cmake und compiler sowie boost benoetigt.
```
sudo apt-get install build-essential cmake libboost-all-dev
```
Anschliessend muss die GeneiAL library installiert werden.
Installationshinweise finden Sie unter https://github.com/geneial/geneial .


Anschliessend kann der Code von GitHub geladen werden:
```
git clone https://github.com/worenga/tsp-challenge.git
```
und entsprechend installiert werden. Zunaechst muss das C++ backend kompiliert werden:
```
cd tsp-challenge
cd backend
mkdir build
cd build
cmake -D CMAKE_BUILD_TYPE=Release ../
make -j4
cd ../..
```
Dann das Frontend
```
cd frontend/client
npm install
npm run build
cd ..
cd server
npm install
```
Anschliessend muss der Redis Server gestartet werden:
```
service redis-server start
```
Und nun kann die Appliation aus dem `frontend/server` Verzeichnis mithilfe von
```
npm start
```
gestartet werden.
