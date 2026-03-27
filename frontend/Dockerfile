FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Expose port
EXPOSE 5173

# Development server
CMD ["npm", "run", "dev", "--", "--host"]
