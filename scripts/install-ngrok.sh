#!/usr/bin/env bash

if [ -z "$1" ]; then
	echo 'Invalid invocation'
	exit 24
fi

DIR=/tmp/marina-ngrok
mkdir -p $DIR
pushd $DIR

curl -L 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-darwin-amd64.zip' > ngrok.zip
unzip ngrok.zip
mv ngrok "$1"

popd
rm -fr $DIR
