FROM node:8

RUN curl https://s3.amazonaws.com/cdncliqz/update/ghostery/moab/moab_6a9b26e > /bin/moab && \
    chmod +x /bin/moab

RUN npm install -g yarn

ARG UID
ARG GID
RUN groupadd jenkins -g $GID \
 && useradd -ms /bin/bash jenkins -u $UID -g $GID

USER jenkins
COPY package.json /home/jenkins/
COPY yarn.lock /home/jenkins/
RUN cd /home/jenkins/ && yarn install --frozen-lockfile
