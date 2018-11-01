#!/usr/bin/env bash

if ! [ -d .shared/db ]; then
  mkdir .shared/db
fi
mongod --version
mongod --dbpath=.shared/db --bind_ip_all
