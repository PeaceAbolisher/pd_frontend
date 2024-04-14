# Use an official Node.js runtime as a parent image
FROM node:alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the static content of your application
COPY ./frontend /usr/src/app

# Install serve to run the application
RUN npm install -g serve

EXPOSE 8082
CMD ["serve", "-s", ".", "-l", "8082"]
