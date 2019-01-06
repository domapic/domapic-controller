#!/usr/bin/env bash

npm run domapic-controller start -- --hostName=${controller_host_name} --path=${domapic_path} --db=${db_uri} --save --auth=false --logLevel=debug
npm run domapic-controller logs -- --path=${domapic_path}
