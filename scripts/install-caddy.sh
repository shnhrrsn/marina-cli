#!/usr/bin/env bash

if [ -z "$1" ]; then
	echo 'Invalid invocation'
	exit 24
fi

DIR=/tmp/marina-caddy
mkdir -p $DIR
pushd $DIR

curl -L 'https://caddyserver.com/download/darwin/amd64' > caddy.zip
unzip caddy.zip
mv caddy "$1"

popd
rm -fr $DIR
