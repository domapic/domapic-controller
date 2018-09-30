#!/usr/bin/env bash

npm run domapic-controller start controller -- --hostName=${controller_host_name} --path=${domapic_path} --db=${db_uri} --save --authDisabled
npm run domapic-controller logs controller -- --path=${domapic_path}
