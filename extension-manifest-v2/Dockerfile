FROM node:6.14.1

RUN npm install -g web-ext

ARG UID
ARG GID
RUN groupadd jenkins -g $GID \
 && useradd -ms /bin/bash jenkins -u $UID -g $GID

USER jenkins
COPY package.json /home/jenkins/
RUN cd /home/jenkins/ && npm install
