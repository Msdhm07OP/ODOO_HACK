FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci && npm cache clean --force

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20

WORKDIR /app

# Copy built code and prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Install only production dependencies in final image
RUN npm ci --only=production && npm cache clean --force

EXPOSE 5000

CMD ["npm", "run", "start:migrate"]
