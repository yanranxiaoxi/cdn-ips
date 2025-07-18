FROM docker.io/library/node:24-alpine
ENV ENV_PRODUCT=true
ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=3001
ENV LOG_LEVEL=info
ENV PROJECT_NAME=cdn-ips
COPY ./dist/index.js /home/node/app/
