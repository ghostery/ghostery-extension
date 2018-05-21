FROM node:8

RUN curl https://s3.amazonaws.com/cdncliqz/update/ghostery/moab/moab_8319dab > /bin/moab && \
    chmod +x /bin/moab

RUN curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 1.6.0 \
    export PATH=$HOME/.yarn/bin:$PATH

ARG UID
ARG GID
RUN groupadd jenkins -g $GID \
 && useradd -ms /bin/bash jenkins -u $UID -g $GID

USER jenkins
COPY package.json /home/jenkins/
COPY yarn.lock /home/jenkins/
RUN cd /home/jenkins/ && yarn install
