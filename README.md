![Domapic][domapic-logo-image]

# Domapic Controller

> Controller for Domapic systems

[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url] [![js-standard-style][standard-image]][standard-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![Website][website-image]][website-url] [![License][license-image]][license-url]

---

## Table of Contents

* [Introduction](#introduction)
* [Prerequisites](#prerequisites)
* [Quick Start](#quick-start)
	* [Installation](#installation)
	* [Start the server](#start-the-server)
	* [Display logs](#display-logs)
	* [Get API Key to connect Domapic Services](#get-api-key-to-connect-domapic-services)
	* [Stop and restart](#stop-and-restart)
* [Options](#options)
* [Security](#security)

---

## Introduction

Controller server for Domapic domotic systems.

Connect all your Domapic Modules and control them with a single application. <!-- and program them to interact automatically using the provided web interface
Install Domapic plugins to connect Domapic with other domotic systems or online services. -->

![Domapic system example][domapic-example-image]

> Above, an example of two modules in a [Domapic System][website-url]. Now, the relay can be controlled using the web or mobile applications, or interacting with ["Alexa"][alexa-url] or ["HomeKit"][homekit-url]. Automatisms can be configured in the [Domapic Controller Web UI][domapic-controller-url] to make the [_Phillips Hue_][hue-url] bulb be switched off automatically when the relay bulb is switched on, for example.

## Prerequisites

Domapic controller is built with Node.js, and uses MongoDB as database, so, first of all, you need to have installed them in your system:
- [Installing Node.js and npm](https://nodejs.org/es/download/package-manager/)
- [Installing MongoDB](https://docs.mongodb.com/manual/installation/)

## Quick start

### Installation

Install Domapic-controller globally using npm:

```bash
npm i domapic-controller -g --production
```

### Start the server

```bash
domapic-controller start
```

The controller process will be started at background (using [PM2][pm2-url] as manager). Now you can browse to [http://localhost:3000](http://localhost:3000) to check that the server has started successfully. A __Swagger UI__ describing the server api will be available at that url.

![Swagger example][swagger-example-image]

> Note that, with basic options, server will be started over `http` protocol, and security will be disabled for localhost requests. Read about all [options](#options) and [security](#security) to start the controller with stricter security options.

### Display logs

```bash
domapic-controller logs
```

This command will display last logs of server, and will continue displaying logs until CTRL-C is pressed.

Server logs are saved too into a daily file. These files are rotated automatically and only last ten days files are kept. You´ll find these files in the `~/.domapic/domapic-controller/logs` folder.

Server logs are managed by [PM2][pm2-url] too, so, it is recommended to install [_PM2 log rotate_][pm2-log-rotate-url] to avoid pm2 logs file growing too much.

### Get API Key to connect Domapic Services

Checking the server log you´ll find something like:

```text
2018-09-29 19:35:55.042: [controller] [info] Connected to database "mongodb://localhost:27017/domapic"
2018-09-29 19:35:56.855: [controller] [info] 
-----------------------------------------------------------------
Use the next api key to register services: 6hka5b0jnT9HOMJjUNquqOLneFGxYYtfOygguKoACUIviRvTJLV4IzglcybePQLB
-----------------------------------------------------------------
2018-09-29 19:35:56.885: [controller] [info] Server started and listening at port 3000
```

Copy the provided api key and place it in a safe place, and use it later when starting your Domapic Services (plugins or modules), in order to allow them to automatically register themself into the controller and connect with it.

### Stop and restart

```bash
domapic-controller stop
```

This command will stop the server, and, if you used the `--save` option when you started it for first time, you´ll be able to start it again with same settings simply executing:

```bash
domapic-controller start
```

If you want your server to be started automatically on system reload, use the pm2 save command:

```bash
pm2 save
```

## Options

### Help

Use the next command to display help with detailed information about all available commands and options:

```shell
# Display all available commands:
domapic-controller --help

# Display all options for an specific command (domapic-controller [command] --help):
domapic-controller start --help

```

### Start command options:

option | description | default
--- | --- | ---
`--name` | Custom service instance name. Name can be defined too as first argument. Default is "domapic-controller" | -
`--db` | MongoDB connection uri | mongodb://localhost:27017/domapic
`--port` | Http port used | 3000
`--hostName` | Hostname for the server | -
`--sslCert` | Path to an ssl certificate | -
`--sslKey` | Path to an ssl key | - 
`--authDisabled` | Array of IPs or CIDR IP ranges with authentication disabled | ['127.0.0.1', '::1/128']
`--secret` | Secret to be used in authentication encoding | -
`--color` | Use ANSI colors in traces | true
`--logLevel` | Tracing level. Choices are 'log', 'trace', 'debug', 'info', 'warn' and 'error' | info
`--path` | Path to be used as home path, instead of user´s default (.domapic folder will be created inside) | ~
`--saveConfig` | Save current options for next execution (except `name` and `path`) | false

Example of setting options from command line:
```shell
domapic-controller start --name=fooName --authDisabled=192.168.1.128/25 --logLevel=debug --color=false
```

## Security

The Domapic Controller can be securized in order to expose it from local network to internet, and act as a remote controller for all your local network Domapic Services.

Follow the next steps to securize your Controller before exposing it to the internet:

* __Setup an administrator user:__
	
	> The Controller is distributed with a default administrator user, which name is "admin", and password is "admin". Delete it and setup your own administrator user:

	```
	domapic-controller user remove admin
	```

	```
	domapic-controller user add
	```

	You will be prompted for user name, role, email and password. Using your real email will allow you to use OAuth to login at Domapic Cloud and access to your controller through it.

* __Enable ssl:__
	
	Enable ssl for your Controller Server generating an SSL certificate. Use options `--sslCert` and `--sslKey` to define the paths to each file, and remember to use the `--save` option to store that settings for next server restarts. From now, your server will start using *https* instead of *http*.

* __Provide a custom secret for JWT authentication:__
	
	Domapic controller provides two methods of authentication, jwt and api keys. The first one will be used by allowed human users to access to the provided web user interface (still in development). Provide a custom secret using the `--secret` option to make this method securer. Remember to use the `--save` option to store the secret for next restarts.

* __Disable the authentication whitelist:__
	
	Authentication can be disabled for desired IPs or IP ranges using the `--authDisabled` option. By default, authentication is disabled only for the 172.0.0.1 IP, in order to make easier the first configuration, but you can disable it for all your local network, etc. Because of security reasons, this is not recommended. Use always the built-in api keys method to identify your Domapic Services.
	If you want to force the authentication requirement even for localhost, use the `--authDisabled` as a flag, without specifying any IP.

[domapic-logo-image]: http://domapic.com/assets/domapic-logo.png
[domapic-example-image]: http://domapic.com/assets/domapic-schema-example_01.png
[swagger-example-image]: http://domapic.com/assets/swagger-example.jpg

[coveralls-image]: https://coveralls.io/repos/github/domapic/domapic-controller/badge.svg
[coveralls-url]: https://coveralls.io/github/domapic/domapic-controller
[travisci-image]: https://travis-ci.com/domapic/domapic-controller.svg?branch=master
[travisci-url]: https://travis-ci.com/domapic/domapic-controller
[last-commit-image]: https://img.shields.io/github/last-commit/domapic/domapic-controller.svg
[last-commit-url]: https://github.com/domapic/domapic-controller/commits
[license-image]: https://img.shields.io/npm/l/domapic-controller.svg
[license-url]: https://github.com/domapic/domapic-controller/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/domapic-controller.svg
[npm-downloads-url]: https://www.npmjs.com/package/domapic-controller
[npm-dependencies-image]: https://img.shields.io/david/domapic/domapic-controller.svg
[npm-dependencies-url]: https://david-dm.org/domapic/domapic-controller
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=domapic-controller&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=domapic-controller
[release-image]: https://img.shields.io/github/release-date/domapic/domapic-controller.svg
[release-url]: https://github.com/domapic/domapic-controller/releases
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/

[website-image]: https://img.shields.io/website-up-down-green-red/http/domapic.com.svg?label=domapic.com
[website-url]: http://domapic.com/

[pm2-log-rotate-url]: https://github.com/keymetrics/pm2-logrotate
[pm2-url]: http://pm2.keymetrics.io/
