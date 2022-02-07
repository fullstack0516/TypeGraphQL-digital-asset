FROM launcher.gcr.io/google/nodejs

RUN install_node v16.13.0

# Create app directory
RUN mkdir -p /app
WORKDIR /app

COPY . /app

RUN npm install --force 
RUN npm run build

# Start the app.
EXPOSE 8080
CMD ["npm", "run", "start"]
