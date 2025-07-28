# Development Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install nodemon globally for development
RUN npm install -g nodemon

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Enable hot reload for development
VOLUME ["/app/src"]

# Start the application in development mode
CMD ["npm", "run", "dev"]
