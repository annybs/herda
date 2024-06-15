#!/usr/bin/env bash

envsubst < /docker/config.json > /app/out/public/config.json

exec "$@"
