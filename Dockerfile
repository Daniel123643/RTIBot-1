FROM node:12.14.1-stretch
ENV NODE_ENV production
ENV RTIBOT_CONFIG Release
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "tsconfig.json", "./"]
RUN npm install --silent
RUN npm install --silent --global pm2 typescript
RUN tsc -p tsconfig.json
RUN mkdir /data
COPY . .

CMD [ "pm2-runtime", "dist/App.js" ]