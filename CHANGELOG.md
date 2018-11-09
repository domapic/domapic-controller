# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
### Fixed
### Removed

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
