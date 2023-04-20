FROM node:lts

# Create app directory
RUN mkdir -p /usr/src/app

# Change working dir to /usr/src/app
WORKDIR /usr/src/app
VOLUME . /usr/src/app/h5p

RUN npm install

EXPOSE 8080

CMD [ "node", "src/server.js" ]
