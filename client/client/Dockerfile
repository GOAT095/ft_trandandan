FROM node:latest

WORKDIR /usr/src/client

EXPOSE 4200

ENTRYPOINT [ "/bin/bash", "-c", "yarn --ignore-engines && yarn run start -- --host 0.0.0.0 --disable-host-check" ]
