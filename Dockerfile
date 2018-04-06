FROM node:6.14.1

#RUN npm install -g web-ext
RUN curl https://s3.amazonaws.com/cdncliqz/update/ghostery/moab/moab_3 > /bin/moab && \
    chmod +x /bin/moab

ARG UID
ARG GID
RUN groupadd jenkins -g $GID \
 && useradd -ms /bin/bash jenkins -u $UID -g $GID

USER jenkins
COPY package.json /home/jenkins/
COPY package-lock.json /home/jenkins/
RUN cd /home/jenkins/ && npm install
