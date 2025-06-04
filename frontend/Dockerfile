FROM node:18
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN chmod +x node_modules/.bin/vite 
CMD ["npm", "run", "dev"]
