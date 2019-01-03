#!/usr/bin/env bash
# Creates an .env from ENV variables for use with react-native-config

GOOGLE_JSON_FILE=$APPCENTER_SOURCE_DIRECTORY/<path>/google-services.json

if [ -e "$GOOGLE_JSON_FILE" ]  
then  
    echo "Updating Google Json"
    echo "$GOOGLE_JSON" > $GOOGLE_JSON_FILE
    sed -i -e 's/\\"/'\"'/g' $GOOGLE_JSON_FILE

    echo "File content:"
    cat $GOOGLE_JSON_FILE
fi  

printf "Old .env file:\n"
cat .env
printf "Started script:\n"
ENV_WHITELIST=${ENV_WHITELIST:-"/ACTIVITY|WEBSOCKET|BACKEND|API|TOKEN|PIN|URL/"}
printf "Creating an .env file with the following whitelist:\n"
printf "%s\n\n" $ENV_WHITELIST
set | egrep -e $ENV_WHITELIST | egrep -v "^_" | egrep -v "WHITELIST" | egrep -v "USER-DEFINED" > .env
printf "\n.env created with contents:\n"
cat .env
printf "\nEND OF .env\n"

