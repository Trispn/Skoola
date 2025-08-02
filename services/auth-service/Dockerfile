# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies and build the project
RUN npm install
COPY . .
RUN npm run build

# Don't need all the node_modules in the final image, just the production ones
RUN npm prune --production


# Stage 2: Create the production image
FROM node:18-alpine

WORKDIR /app

# Copy the pruned dependencies and the compiled code from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD [ "node", "dist/index.js" ]
