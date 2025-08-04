# 1. Use a Node base image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the application code
COPY . .

# 6. Generate Prisma client
RUN npx prisma generate

# 7. Build the TypeScript code
RUN npm run build

# 8. Expose the port
EXPOSE 3000

# 9. Start the app
CMD ["npm", "run", "start"]
