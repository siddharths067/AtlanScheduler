FROM debian:buster
RUN apt-get update
RUN apt install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x |  bash -
    RUN apt-get install -y nodejs
COPY . ./app
WORKDIR ./app

ENV PORT 8000
EXPOSE $PORT

RUN ls

RUN node -v
RUN npm -v
RUN npm install

CMD ["npm", "start"]