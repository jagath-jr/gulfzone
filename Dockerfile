FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies (npm ci is faster and strictly follows package-lock.json)
# If you don't have a package-lock.json yet, use 'npm install' instead.
RUN npm install --omit=dev

# Bundle app source
COPY . .

# SECURITY: Change ownership of the app directory to the 'node' user
# This is required because we are switching to a non-root user below
RUN chown -R node:node /usr/src/app

# SECURITY: Run the app as a non-root user
USER node

# Expose port
EXPOSE 3000

# Start command
CMD [ "npm", "start" ]