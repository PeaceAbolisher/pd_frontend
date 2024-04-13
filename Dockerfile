# Use an official Node.js runtime as a parent image
FROM node:alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install all dependencies
RUN npm install

# Bundle app source
COPY . .

# Build the app using the production configuration
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Serve the static files on port 8080
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
