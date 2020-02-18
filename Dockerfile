FROM node:12.14.1-stretch AS builder
WORKDIR /build
COPY ["package.json", "package-lock.json*", "tsconfig.json", "./"]
RUN npm install --silent
RUN npm install --silent --global typescript
COPY . .
RUN tsc -p tsconfig.json

FROM node:12.14.1-stretch
ENV NODE_ENV production
ENV RTIBOT_CONFIG Release
WORKDIR /usr/src/app
COPY --from=builder /build .
RUN npm install --silent --production
RUN npm install --silent --global pm2
RUN mkdir /data

CMD [ "pm2-runtime", "dist/App.js" ]