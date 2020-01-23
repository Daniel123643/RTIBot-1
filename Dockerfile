FROM node:12.14.1-stretch
ENV NODE_ENV production
ENV RTIBOT_CONFIG Release
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
RUN npm install --global pm2
COPY . .

CMD [ "pm2-runtime", "dist/App.js" ]