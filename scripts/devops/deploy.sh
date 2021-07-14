#!/bin/sh

# source
DIR=${1:-dist}
DIRPATH=$(dirname $DIR)

# destination
HOST=${2:-openhabianpi}
APPPORT=${3:-3000}
TARGETPATH=/home/openhabian/elo_hub
DIRNAME=$(basename $DIR)

# don't want to be prompted by ssh for first time remote hosts.
alias ssh='ssh -o StrictHostKeyChecking=no'

# push app to host
# ssh root@$HOST 'cd node; rm -rf *' 
# cd $DIRPATH; tar czf - $DIRNAME | ssh openhabian@$HOST '(cd $TARGETPATH; rm -rf *; tar xzf - -C ~/elo_hub)' 
cd $DIRPATH; tar czf - $DIRNAME | ssh openhabian@$HOST '(cd /home/openhabian/elo_hub; rm -rf *; tar xzf - -C ~/elo_hub)' 

# start 
# ssh root@$HOST "cd $TARGETPATH/$DIRNAME; PORT=$APPPORT; npm start"ls
