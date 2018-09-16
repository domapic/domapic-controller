
const test = require('narval')

const mocks = require('../../mocks')

const services = require('../../../../lib/api/services')
const definition = require('../../../../lib/api/services.json')

test.describe('services api', () => {
  test.describe('Operations instance', () => {
    let operations
    let commandsMocks
    let baseMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      commandsMocks = new mocks.Commands()
      operations = services.Operations(baseMocks.stubs.service, commandsMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      commandsMocks.restore()
    })

    test.describe('getServices auth', () => {
      test.it('should return true if provided user has "admin" role', () => {
        test.expect(operations.getServices.auth({
          role: 'admin',
          _id: ''
        }, {
          query: {}
        }, {})).to.be.true()
      })

      test.it('should return true if provided user has "service-registerer" role', () => {
        test.expect(operations.getServices.auth({
          role: 'service-registerer',
          _id: ''
        }, {
          query: {}
        }, {})).to.be.true()
      })

      const testRole = function (role) {
        test.it(`should return false if provided user has "${role}" role and no query is received`, () => {
          test.expect(operations.getServices.auth({
            role,
            _id: ''
          }, {
            query: {
            }
          }, {})).to.be.false()
        })
      }

      testRole('service')
      testRole('operator')
      testRole('plugin')

      test.it('should return true if provided user has same id than received user in query', () => {
        const fooId = 'foo-id'
        test.expect(operations.getServices.auth({
          _id: fooId
        }, {
          query: {
            user: fooId
          }
        }, {})).to.be.true()
      })
    })

    test.describe('getServices handler', () => {
      test.it('should return all services if no query is received', () => {
        const fooResult = 'foo result'
        commandsMocks.stubs.service.getFiltered.resolves(fooResult)

        return operations.getServices.handler({
          query: {}
        })
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.service.getFiltered).to.have.been.calledWith({})
            ])
          })
      })

      test.it('should pass user query as a filter if it is received', () => {
        const fooUser = 'foo type'
        return operations.getServices.handler({
          query: {
            user: fooUser
          }
        }).then(() => test.expect(commandsMocks.stubs.service.getFiltered).to.have.been.calledWith({
          _user: fooUser
        }))
      })
    })

    test.describe('addService auth', () => {
      const fooId = 'foo-id'
      test.it('should return true if provided user has "admin" role', () => {
        test.expect(operations.addService.auth({
          role: 'admin'
        }, {}, {})).to.be.true()
      })

      test.it('should return true if provided user has "service-registerer" role', () => {
        test.expect(operations.addService.auth({
          role: 'service-registerer'
        }, {}, {
        })).to.be.true()
      })

      test.it('should return true if logged user has same id than received user in body', () => {
        test.expect(operations.addService.auth({
          _id: fooId
        }, {
        }, {
          _user: fooId
        })).to.be.true()
      })

      const testRole = function (role) {
        test.it(`should return false if provided user has "${role}" role`, () => {
          test.expect(operations.addService.auth({
            _id: fooId
          }, {}, {})).to.be.false()
        })
      }
      testRole('service')
      testRole('operator')
      testRole('plugin')
    })

    test.describe('addService handler', () => {
      const fooService = {
        _id: 'foo-id',
        name: 'foo-name'
      }
      const fooBody = {
        name: 'foo'
      }
      let sandbox
      let response

      test.beforeEach(() => {
        sandbox = test.sinon.createSandbox()
        response = {
          status: sandbox.stub(),
          header: sandbox.stub()
        }
        commandsMocks.stubs.service.add.resolves(fooService)
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call to add service, passing the received body', () => {
        return operations.addService.handler({}, fooBody, response)
          .then((result) => {
            return test.expect(commandsMocks.stubs.service.add).to.have.been.calledWith(fooBody)
          })
      })

      test.it('should add a 201 header to response', () => {
        return operations.addService.handler({}, fooBody, response)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(201)
          })
      })

      test.it('should set the response header with the service name', () => {
        return operations.addService.handler({}, fooBody, response)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/services/foo-name')
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.addService.handler({}, fooBody, response)
          .then((result) => {
            return test.expect(result).to.be.undefined()
          })
      })
    })
  })

  test.describe('openapi', () => {
    test.it('should return an array containing the openapi definition', () => {
      test.expect(services.openapi()).to.deep.equal([definition])
    })
  })
})
