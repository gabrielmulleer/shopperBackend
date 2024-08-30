FROM node:18

WORKDIR /usr/src/app

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Listar conteúdos para debug
RUN ls -R /usr/src/app

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]