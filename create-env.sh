#!/bin/bash

# Verifica se o arquivo .env já existe, caso contrário, cria
if [ ! -f .env ]; then
    echo "GEMINI_API_KEY=<YOUR_API_KEY>" >> .env
else
    echo ".env file already exists. Skipping creation."
fi
