# 1. A Imagem Base (Node.js)
FROM node:18-alpine

# 2. Define a pasta de trabalho dentro do container
WORKDIR /app

# 3. Copia o package.json e package-lock.json
COPY package*.json ./

# 4. Instala as dependências (NÃO as de dev, como o Jest)
RUN npm install --omit=dev

# 5. Copia o resto do nosso código (index.js, middleware, etc.)
COPY . .

# --- ESTA É A CORREÇÃO ---
# 6. "Recebe" o argumento do docker-compose.yml
ARG DATABASE_URL
# 7. "Define" o argumento como uma variável de ambiente
ENV DATABASE_URL=${DATABASE_URL}
# --- FIM DA CORREÇÃO ---

# 8. Roda o Prisma Generate (agora ele vai conseguir ler o ENV)
RUN npx prisma generate

# 9. Expõe a porta que o nosso index.js usa
EXPOSE 3000

# 10. O comando para ligar o servidor
CMD [ "node", "index.js" ]