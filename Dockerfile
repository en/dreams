FROM node:10.11-alpine

RUN apk --no-cache --update upgrade && \
    apk --update add git build-base python && \
    rm /var/cache/apk/*

RUN mkdir /dreams
WORKDIR /dreams

COPY package.json .
RUN npm install --quiet
RUN npm install -g truffle
COPY . .
RUN truffle compile

CMD [ "node","index.js" ]
