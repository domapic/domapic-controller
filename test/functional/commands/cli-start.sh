#!/usr/bin/env bash

npm run domapic-controller start controller -- --hostName=${controller_host_name} --path=${domapic_path} --save
npm run domapic-controller logs controller -- --path=${domapic_path}
