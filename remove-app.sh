#!/bin/bash
echo "Odinštalovanie aplikácie..."
docker-compose down -v
docker rmi $(docker images -q)
echo "Aplikácia bola úplne vymazaná!"
