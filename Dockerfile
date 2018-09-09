FROM node:8.11.4

RUN apt-get update -qq

RUN mkdir /home/siteweb4-api
WORKDIR /home/siteweb4-api

COPY . ./
RUN npm install
RUN node --harmony ace migration:run --force

EXPOSE 80

CMD ["adonis", "serve"]
