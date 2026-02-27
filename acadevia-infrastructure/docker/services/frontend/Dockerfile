FROM node:20-alpine
WORKDIR /app
COPY acadevia-frontend/package*.json ./
RUN npm ci
COPY acadevia-frontend/ .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
