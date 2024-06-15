FROM node:20 AS build_web

WORKDIR /web
COPY ./web .

RUN npm ci

ARG VITE_API_HOST=http://localhost:5001
ARG VITE_API_TIMEOUT=10000
ARG VITE_DOCUMENT_TITLE_SUFFIX=Herda
ARG VITE_LOCAL_STORAGE_PREFIX=herda-

ENV VITE_API_HOST $VITE_API_HOST
ENV VITE_API_TIMEOUT $VITE_API_TIMEOUT
ENV VITE_DOCUMENT_TITLE_SUFFIX $VITE_DOCUMENT_TITLE_SUFFIX
ENV VITE_LOCAL_STORAGE_PREFIX $VITE_LOCAL_STORAGE_PREFIX

RUN npm run build

FROM node:20 AS build_server

WORKDIR /app
COPY ./src ./src
COPY package-lock.json package.json tsconfig.json ./

RUN npm ci
RUN npm run build

FROM node:20

ARG VITE_API_HOST=http://localhost:5001
ENV VITE_API_HOST $VITE_API_HOST

RUN apt update && apt install -y gettext

WORKDIR /app

COPY LICENSE.md package-lock.json package.json ./
COPY --from=build_server /app/out ./out
COPY --from=build_server /app/node_modules ./node_modules
COPY --from=build_web /web/dist ./out/public

COPY docker /docker
RUN chmod +x /docker/entrypoint.sh

ENTRYPOINT ["/docker/entrypoint.sh"]
CMD ["npm", "start"]
