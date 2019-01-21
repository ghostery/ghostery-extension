FROM node:10

RUN apt-get update --no-install-recommends \
  && apt-get install -y time jq \
  && rm -rf /var/lib/apt/lists/*

RUN curl https://s3.amazonaws.com/cdncliqz/update/ghostery/moab/moab_b99dc4d > /bin/moab && \
    chmod +x /bin/moab

RUN npm install -g yarn

ARG UID
ARG GID
RUN groupadd jenkins -g $GID \
 && useradd -ms /bin/bash jenkins -u $UID -g $GID

USER jenkins
COPY package.json /home/jenkins/
COPY yarn.lock /home/jenkins/
RUN mkdir -p /home/jenkins/benchmarks && wget -O - https://s3.amazonaws.com/cdncliqz/extension-profiles/session_2018-10-15.jl.gz | gunzip > /home/jenkins/benchmarks/session.jl
RUN cd /home/jenkins/ && yarn install --frozen-lockfile

