# Use an official Node runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app/frontend

# Copy the package.json and package-lock.json to the container
COPY ./frontend/package*.json ./

# Install the application dependencies
RUN npm install --force

# Copy the rest of the application code
COPY ./frontend .

# Build the application for production
RUN npm run build

# Install `serve` to serve the built app in production
RUN npm install 

 
# Expose the port on which the app will run
EXPOSE 4173
 
# Start the app using `serve` to serve the static files
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]