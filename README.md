# Meteor continuous deployment
> __A helping hand__ in utilizing Meteor UP and Travis with a few scripts.

## Why?
Because we sometimes really need __Multiple MUP environments__ and have __multiple developers__ working on a project at the same time. Right now MUP doesn't grant an easy way to deploy to a test server or a production server with an easy command. Neither does it have an easy approach to keep your server login safe and out of git, but still work on the same project with multiple developers.

Last but not least, there was still some work to be done to let __Travis__ _safely_ (test and) deploy our Meteor project to different environments depending on the branch.

## Setup
### 01. Multiple MUP management

To give you a heads up, and to make you understand why you are going to setup the things you are about to setup, first an explanation on how to use the manage.sh script.

`` $ ./manage.sh [ENVIRONMENT] [COMMAND]``

Environments are for example "test", "acceptance", "production" etc. The command is any command [MUP](https://github.com/arunoda/meteor-up) has to offer.

1. For each environment you would like to manage or deploy to, you will need to create a folder inside the __/.mup__ folder. An example folder called production is already inside here to illustrate what this should look like.
2. Inside each environment folder create a mup.settings.json with your MUP settings inside. __Don't store your environment variables, username, password or pem location in here though!__. Actually, just omit all personal or sensitive data in there. We will get to this in the next steps.
3. Inside each environment folder, also create a _mup.private.json_ file. This file will not be included with git and may contain all the sensitive data concerning your server. Usually this is where you store sensitive environment variables. __Create a full object!__ Because this file will be merged with the _mup.settings.json_ to create the final _mup.json_. For exaxmples, check below.
4. Copy the _mup.examlpe.json_ in the main _./.mup_ and rename it to _mup.private.json_. This is where you include your personal username and password or pem file location.
5. You can also create a different settings.json file in your main meteor folder for every environment. Just name it settings-[ENVIRONMENT].json and store it in your meteor base folder and it will be used when deploying that environment.

So now you have all your personal and sensitive data, safely on each developer's machine, and only the default deploy settings for each server are included with the git repository. Furthermore, once setup, all developers can keep gitting, tailing logs and deploying, without messing up eachother's configurations.

### 02. Travis

Next stop, let's make travis able to use the MUP manage.sh script as well. 
First of all, [enable travis for your repository](https://docs.travis-ci.com/user/getting-started/). You don't need to create your own .travis.yml though, as it's is included with this repo.

#### Super easy (semi) automatic setup

1. Start the _./generate-travis-files.sh_ script which will guide you through the process.

#### Do it manually

If for some reason you're uncomfertable with executing a bash script and would like to do it manually, then here are the steps;

1. Create a folder called .travis which will never be included in your git! It's just for now so we can create a .tar file. 
2. Inside this folder, generate your SSH keys both private and public. You can do this by typing; ``ssh-keygen -q -t rsa -N "" -C travis@meteor-cd -f ./id_rsa``. This will create the id_rsa and id_rsa.pub file for the user travis@meteor-cd. It will be created without a passphrase, because Travis is not very fond of passphrases.
3. Copy all the mup.private.json files including the folders to the newly created .travis folder and change the data inside the files to whatever applies to travis. E.G. you should end up with .travis/.mup/production/mup.private.json and very importantly the .travis/.mup/mup.private.json file which contains the server login data, username: _"travis"_ and pem: _"../../id_rsa"_. Examples can be found below!
4. Create a tar containing the .travis folder from and into your main project folder. You can use the following command for this: ``tar cvf .travis.tar .travis/``
5. Now encrypt the @&$*! out of this .travis.tar using travis's own encryption tool! You can find everything you need to know about this [here](https://docs.travis-ci.com/user/encrypting-files/) but here's the ballpark. Use the command: ``gem install travis`` to install the travis command line tools. Then log in using ``travis login`` and affix --pro if it concerns a private repository. And then use ``travis encrypt-file .travis.tar``.
6. Now you should have a file called _.travis.tar.enc_ and also travis should have given you a line to add to your build script. Something like ``openssl aes-256-cbc -K etc...`` Copy this line into the .travis.yml at the beginning of the after_success build script line.

#### Important last step: Tell travis which branch needs to trigger which environment!

Lastly, you will need to write a little bit of bash script. Edit the __.travis-deploy.sh__ file to contain all branches that you need automatically deployed. An example if for the master branch and an example commented out else if develop branch is included with the file that can be found in this repository, so you should have a flying start there.

### 03. Tests (optional)

The coolest part about letting travis do all your deployment is that now you can safeguard your project with all sorts of tests.

__More info on this will follow soon!!!__

### Examples for each mentioned file
> .mup/production/mup.settings.json

``
{
  "servers": [
    {
      "host": "SOME_IP_ADDRESS"
    }
  ],
  "setupMongo": true,
  "setupNode": true,
  "nodeVersion": "0.10.40",
  "setupPhantom": true,
  "enableUploadProgressBar": true,
  "appName": "SOME_APP_NAME",
  "app": "../../",
  "deployCheckWaitTime": 15
}
``
> .mup/production/mup.private.json

``
{
  "env": {
    "TZ" : "Europe/Amsterdam",
    "ROOT_URL": "https://the-root-of-your-meteor",
    "MAIL_URL": "smtp://some-smtp-server-somewhere",
    "MONGO_URL" : "MY_AWESOME_MONGO_DATABASE",
    "MONGO_OPLOG_URL" : "MY_AWESOME_MONGO_OPLOG",
    "PORT": 3000
  }
}
``

> .mup/mup.settings.json

``
{
  "servers": [
    {
      "username": "MyServerUser",
      "pem": "~/.ssh/id_rsa"
    }
  ]
}
``

> .travis/.mup/mup.settings.json

``
{
  "servers": [
    {
      "username": "travis",
      "pem": "../../id_rsa"
    }
  ]
}
``

## GL HF