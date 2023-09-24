FROM node:lts-alpine as build

RUN mkdir /app

WORKDIR /app

COPY package.json .
COPY next.config.js .
COPY api-server.js .
COPY .env.local .

RUN npm install
RUN npm run build

COPY .next ./.next
COPY public ./.public
COPY . .

# ---------------

FROM node:lts-alpine

ENV NODE_ENV production
ENV API_PORT 4001

WORKDIR /app

COPY --from=build /app/package.json .
COPY --from=build /app/next.config.js .
COPY --from=build /app/api-server.js .
COPY --from=build /app/.env.local .
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

RUN npm install

EXPOSE 4000
EXPOSE 4001

CMD npm start
