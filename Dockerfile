FROM node:22.15-alpine
RUN apk update && \
    apk add --no-cache git && \
    mkdir -p /opt/report
COPY . /opt/report/
WORKDIR /opt/report/
RUN git submodule init && \
    git submodule update
RUN npm install
CMD ["npm", "run", "start", "&"]
