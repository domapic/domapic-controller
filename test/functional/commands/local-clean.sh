#!/usr/bin/env bash

pm2 delete controller

./test/functional/commands/clean-db.sh

./test/functional/commands/clean.sh
