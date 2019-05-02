# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
### Fixed
### Removed

## [1.0.0-beta.4] - 2019-05-02
### Fixed
- Remove unnecessary folder published to npm.
- Convert email into lowercase when saving it to database.

### Changed
- Use files property in package.json instead of npmignore file.

## [1.0.0-beta.3] - 2019-05-01
### Added
- Add user adminPermissions property, intended for grant admin permissions to plugin users when login using apiKey
- Avoid any other user than admin updating adminPermissions property

## [1.0.0-beta.2] - 2019-03-02
### Added
- Add web ui
- Add socket.io server
- Emit events to socket authenticated users connected using sockets
- Add page and ability filters to logs api
- Add logs/stats api

### Fixed
- Add "anonymous" role to swagger. Now anomnymous user has anonymous role.
- Fix logs capped collection max size

### Changed
- Use validator library for emails and uri validations

## [1.0.0-beta.1] - 2019-01-08
### Added
- Add DELETE method to servicePluginConfigs api
- Add DELETE method to services api
- Add PATCH and DELETE methods to users api

### Changed
- Upgrade mongoose version

## [1.0.0-alpha.14] - 2019-01-06
### Added
- Add anonymous default user, which will be used as logged user for requests with authentication disabled. When this user is logged in, services and abilities will be added to user with same name as service, not to logged user. In this way, the services connection process will work when authentication is disabled, and services registered will still be connected if authentication is enabled again.

### Fixed
- Fix enum for abilities with numeric data type.

## [1.0.0-alpha.13] - 2018-12-17
### Fixed
- Return new documents in update commands.

## [1.0.0-alpha.12] - 2018-12-16
### Added
- Add api resources for managing service custom configurations for specific plugin packages.

### Changed
- Upgrade dependencies

## [1.0.0-alpha.11] - 2018-12-01
### Changed
- Upgrade domapic-base version, which fixes a problem in concurrent client requests.

## [1.0.0-alpha.10] - 2018-11-25
### Added
- Add express-mongo-sanitize middleware

### Changed
- Type property in abilities becomes not mandatory when ability has not state
- Data property is not allowed in ability handlers when ability type is not defined

## [1.0.0-alpha.9] - 2018-11-18
### Added
- Send entity operations events to all registered plugins
- Add type filter to get services api
### Changed
- Allow plugin users to create and get operator users
### Fixed
- Fix role-based permissions in get user api

## [1.0.0-alpha.8] - 2018-11-13
### Changed
- Revert "services" to "modules" change.
- Change "service" role into "module"
- Add type field to services, which can be "module" or  "plugin"
- Allow plugin users to create services with type "plugin"
- Allow service-registerer users to create users with role "plugin"

## [1.0.0-alpha.7] - 2018-11-09
### Changed
- Upgrade domapic-base
- Change "services" by "modules".
### Fixed
- Allow "integer" and "float" as data types for abilities in api.

## [1.0.0-alpha.6] - 2018-11-01
### Added
- Add ability events api
- Save abilities actions and events as logs into database
- Add logs api

## [1.0.0-alpha.5] - 2018-10-15
### Added
- Add ability state api

### Changed
- Upgrade dependencies
- Returns BadGateway error instead of ClientTimeOut error when service is not available

## [1.0.0-alpha.4] - 2018-10-14
### Added
- Add service action api

### Fixed
- Expose ability description fields to api

## [1.0.0-alpha.3] - 2018-10-09
### Fixed
- Exclude document being updated from unique fields validation

### Changed
- Pass user id as string to authentication handlers

## [1.0.0-alpha.2] - 2018-10-04
### Changed
- Change url validator

## [1.0.0-alpha.1] - 2018-09-30
### Added
- First prerelease
