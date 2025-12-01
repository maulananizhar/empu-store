FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

# ENV DATABASE_URL="mysql://root:bajuditoko@localhost:3306/empu-store"

RUN npx prisma generate

# RUN npx prisma migrate deploy

RUN npm run build

EXPOSE 3000

# CMD npm run start

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]