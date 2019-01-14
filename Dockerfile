#start from base
FROM ubuntu:16.04

#install system-wide deps for node
RUN apt-get -yqq update
RUN apt-get -yqq install curl
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash
RUN apt-get install -yq nodejs

#copy application code
ADD . /opt/gseabra-pois
WORKDIR /opt/gseabra-pois

#fetch app specific deps
RUN npm install

#expose port
EXPOSE 1904

#start app
CMD ["node", "server.js"]
