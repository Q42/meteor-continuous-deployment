#!/usr/bin/env bash
if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then

  echo "On branch '$TRAVIS_BRANCH'."

  if [ "$TRAVIS_BRANCH" = "master" ]; then
    echo "Triggering Mup for production server..."
    sh manage.sh production deploy

# For every other environment that needs auto deployment,
# create an elif, just like the one blow

#  elif [ "$TRAVIS_BRANCH" = "develop" ]; then
#    echo "Triggering Mup for test server..."
#    sh manage.sh test deploy

  else
    echo "This is not a deployable branch, so i'm not deploying."
  fi

else
  echo "This is just a pull request, so i'm not even thinking about deploying"
fi
