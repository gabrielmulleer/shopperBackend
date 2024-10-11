# Usar uma imagem oficial do Node.js como a base
FROM node:18

# Definir o diretório de trabalho no container
WORKDIR /usr/src/app

# Copiar os arquivos de configuração do npm para o diretório de trabalho
COPY package*.json ./

# Instalar as dependências de desenvolvimento e produção
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

# Compilar o código TypeScript para JavaScript
RUN npm run build

# Remover dependências de desenvolvimento para reduzir o tamanho da imagem
RUN npm prune --production

# Definir a variável de ambiente NODE_ENV como produção
ENV NODE_ENV=production

# Expor a porta que a aplicação usará
EXPOSE 8080

# Comando para iniciar a aplicação no ambiente de produção
CMD ["node", "dist/server.js"]
