# server/tsconfig.json has noEmit: true — there is no dist/.
# Runtime matches package.json "start:api": node --import tsx server/index.ts
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
# Alpine npm 10 treats optional yaml@2.9 (postcss-load-config peer) as required; local npm 11 does not.
RUN npm ci --legacy-peer-deps

COPY server ./server
COPY src ./src

EXPOSE 4000
CMD ["node", "--import", "tsx", "server/index.ts"]
