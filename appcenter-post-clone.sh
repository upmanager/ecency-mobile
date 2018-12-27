#!/usr/bin/env bash

printf "post-clone.sh\n"

node -v

# please specify required Node.js version
NODE_VERSION=8.12.0

# workaround to override the v8 alias
npm config delete prefix
. ~/.bashrc
nvm install "$NODE_VERSION"
nvm alias node8 "$NODE_VERSION"

node -v

printf "end of post-clone.sh\n"