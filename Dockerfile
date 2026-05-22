# Build only
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG API_URL
ARG APP_URL

ENV API_URL=$API_URL
ENV APP_URL=$APP_URL

RUN npm run build

# Final stage - just static files
FROM alpine:latest

COPY --from=builder /app/dist /www/html

CMD ["sh", "-c", "echo 'Static files ready' && tail -f /dev/null"]