FROM alpine:3.7
RUN apk update
RUN apk add nodejs
WORKDIR /app
COPY ./ /app/.
RUN npm i
CMD [ "npm", "start" ]