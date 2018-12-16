#!/usr/bin/env bash

printf "post-clone.sh\n"

brew uninstall node@6
brew install node@8

# please specify required Node.js version
NODE_VERSION=8.12.0

# workaround to override the v8 alias
npm config delete prefix
. ~/.bashrc
nvm install "$NODE_VERSION"
nvm alias node8 "$NODE_VERSION"