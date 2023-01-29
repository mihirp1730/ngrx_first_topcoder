FROM node:14-alpine

# Create the code directory.
WORKDIR /app

# Bring our package.json file into our working directory.
COPY package.json ./
COPY package-lock.json ./

# Install app dependencies.
COPY npmrc-dockerbuild .npmrc
RUN npm ci --only=production
RUN rm -f .npmrc

# Bring our compiled typescript to our working directory.
COPY dist ./dist

# Start the service.
CMD [ "node", "dist/apps/content-server/main.js" ]
