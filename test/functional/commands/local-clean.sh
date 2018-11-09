#!/usr/bin/env bash

pm2 delete domapic-controller

./test/functional/commands/clean-db.sh

./test/functional/commands/clean.sh
