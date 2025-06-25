# Use an official Node runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN npm run build

# Expose the port on which the app will run
EXPOSE 4173

# Start the app using `npm run preview`
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]