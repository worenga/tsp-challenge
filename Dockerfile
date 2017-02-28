FROM geneial/geneial:latest

ARG PORT=4000
ARG INSTALL_DIR=/usr/app/src/tsp-challenge/

MAINTAINER Benedikt Wolters <benedikt.wolters@rwth-aachen.de>

RUN apt-get update -y && apt-get install -y \
  git \
  curl \
  build-essential \
  libboost-all-dev \
  ca-certificates \
  redis-server \
  nginx \
  doxygen \
  cmake \
  --no-install-recommends && \
  curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
  apt-get install -y nodejs && \
  apt-get purge -y curl && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*  && \
  apt-get clean autoclean

RUN npm i -g pm2

RUN mkdir -p $INSTALL_DIR

#Build Backend
ADD backend ${INSTALL_DIR}/backend
RUN cd ${INSTALL_DIR}/backend && mkdir build/ && cd build/ && cmake -D CMAKE_BUILD_TYPE=Release ../ && make

ADD frontend /usr/app/src/tsp-challenge/frontend

#Build Frontend
WORKDIR ${INSTALL_DIR}/frontend/client
RUN npm install && npm run build

WORKDIR ${INSTALL_DIR}/frontend/server
RUN npm install

EXPOSE $PORT

CMD ["pm2", "start", "processes.json", "--no-daemon"]
