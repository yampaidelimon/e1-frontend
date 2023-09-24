#!/usr/bin/env bash
docker build -t auth0-nextjs-01-login .
docker run --init -p 4000:4000 -p 4001:4001 -it cts-app
