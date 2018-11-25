# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
### Fixed
### Removed

## [1.0.0-alpha.10] - 2018-11-25
### Added
- Add express-mongo-sanitize middleware

### Changed
- Type property in abilities becomes not mandatory when ability has not state

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
