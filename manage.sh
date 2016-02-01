#!/usr/bin/env bash

if [ type mup >/dev/null 2>&1 ]; then
    echo "You need to have mup installed and the command mup available for this to work."
    echo "Instructions can be found here: https://github.com/arunoda/meteor-up/"
    exit 1
fi

DEPENV=$1

if [ -z "$1" ]; then
  echo "Deployment environment not found. E.G. you should type ./manage.sh production"
  echo "to deploy with the mup settings in the .mup/production folder"
  exit 1
fi

if [ ! -f .mup/$DEPENV/mup.settings.json ]; then
    echo "There is no mup.settings.json file inside the .mup/$DEPENV folder"
    echo "The mup.settings.json file is merged with the mup.json file in the"
    echo "main folder to create a final mup.json file."
    exit 1
fi

if [ ! -f .mup/mup.private.json ]; then
    echo "There is no mup.private.json file inside the .mup folder"
    echo "You should copy and rename the mup.example.json file and put your"
    echo "personal preferences and SSH settings in there!"
    exit 1
fi

if [ -f settings-$DEPENV.json ]; then
    cp settings-$DEPENV.json  .mup/$DEPENV/
    mv .mup/$DEPENV/settings-$DEPENV.json .mup/$DEPENV/settings.json
else
    echo "Warning: No specific settings.json file found for this environment"
    cp settings.json  .mup/$DEPENV/
fi

rm -f .mup/$DEPENV/mup.json
cd .mup/ && node mupmerge $DEPENV
shift
cd $DEPENV && mup "$@"
