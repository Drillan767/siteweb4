FROM node:8.11.4

RUN apt-get update -qq

RUN mkdir /home/siteweb4-api
WORKDIR /home/siteweb4-api

COPY . ./
RUN npm install
RUN npm i -g @adonisjs/cli

EXPOSE 3333

CMD ["adonis", "serve"]
