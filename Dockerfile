FROM bitnami/node:22.12.0

COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]