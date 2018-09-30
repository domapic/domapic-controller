
const inquirer = require('inquirer')
const test = require('narval')

const mocks = require('../../mocks')

const user = require('../../../../cli/commands/user')

test.describe('cli user command', () => {
  const inquirerMock = question => {
    if (question.validate) {
      return question.validate(fooPromptValue)
        .then(result => {
          validationResults.push(result)
          return Promise.resolve({
            value: fooPromptValue
          })
        })
    } else if (question.source) {
      return question.source({}, fooPromptValue).then(result => {
        sourceResults.push(result)
        return Promise.resolve({
          value: fooPromptValue
        })
      })
    }
    return Promise.resolve({
      value: fooPromptValue
    })
  }
  let validationResults = []
  let sourceResults = []
  let fooPromptValue
  let sandbox
  let baseMocks
  let indexMocks
  let inquirerStub

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox()
    indexMocks = new mocks.Index()
    baseMocks = new mocks.Base()
    inquirerStub = sandbox.stub(inquirer, 'prompt').callsFake(inquirerMock)
  })

  test.afterEach(() => {
    fooPromptValue = null
    validationResults = []
    sourceResults = []
    sandbox.restore()
    indexMocks.restore()
    baseMocks.restore()
  })

  test.describe('when action is "add"', () => {
    test.it('should have created Database, Models, Client and Commands instances', () => {
      return user.command({
        action: 'add'
      }, baseMocks.stubs.service).then(() => {
        return Promise.all([
          test.expect(indexMocks.stubs.Database).to.have.been.calledWith(baseMocks.stubs.service),
          test.expect(indexMocks.stubs.Models).to.have.been.calledWith(baseMocks.stubs.service),
          test.expect(indexMocks.stubs.Client).to.have.been.calledWith(baseMocks.stubs.service),
          test.expect(indexMocks.stubs.Commands).to.have.been.calledWith(baseMocks.stubs.service, indexMocks.stubs.models, indexMocks.stubs.client)
        ])
      })
    })

    test.it('should have called to Database connect', () => {
      return user.command({
        action: 'add'
      }, baseMocks.stubs.service).then(() => {
        return test.expect(indexMocks.stubs.database.connect).to.have.been.called()
      })
    })

    test.it('should have called to user add command', () => {
      return user.command({
        action: 'add'
      }, baseMocks.stubs.service).then(() => {
        return test.expect(indexMocks.stubs.commands.user.add).to.have.been.called()
      })
    })

    test.it('should have called to Database disconnect', () => {
      return user.command({
        action: 'add'
      }, baseMocks.stubs.service).then(() => {
        return test.expect(indexMocks.stubs.database.disconnect).to.have.been.called()
      })
    })

    test.describe('when no user name is provided', () => {
      test.it('should call inquirer to ask for user name', () => {
        return user.command({
          action: 'add'
        }, baseMocks.stubs.service).then(() => {
          return test.expect(inquirerStub.getCall(0).args[0].message).to.equal('Please enter user name')
        })
      })

      test.it('should check if name is duplicated when name is valid', () => {
        const fooName = 'foo-name'
        fooPromptValue = fooName
        return user.command({
          action: 'add'
        }, baseMocks.stubs.service).then(() => {
          return test.expect(indexMocks.stubs.commands.user.get).to.have.been.calledWith({
            name: fooName
          })
        })
      })

      test.it('should not check if name is duplicated when name is not valid', () => {
        const fooName = 'FOO-name'
        fooPromptValue = fooName
        return user.command({
          action: 'add'
        }, baseMocks.stubs.service).then(() => {
          return test.expect(indexMocks.stubs.commands.user.get).to.not.have.been.called()
        })
      })

      test.it('should not pass inquirer validation if user name is duplicated', () => {
        return user.command({
          action: 'add'
        }, baseMocks.stubs.service).then(() => {
          return test.expect(validationResults[0]).to.equal('User name already exists')
        })
      })

      test.it('should pass inquirer validation if user name is not duplicated', () => {
        indexMocks.stubs.commands.user.get.rejects(new Error())
        return user.command({
          action: 'add'
        }, baseMocks.stubs.service).then(() => {
          return test.expect(validationResults[0]).to.equal(true)
        })
      })
    })

    test.describe('when user name is provided', () => {
      test.it('should not call inquirer to ask for user name', () => {
        return user.command({
          userName: 'foo',
          action: 'add'
        }, baseMocks.stubs.service).then(() => {
          return test.expect(inquirerStub.getCall(0).args[0].message).to.not.equal('Please enter user name')
        })
      })
    })

    test.describe('when no role is provided', () => {
      test.it('should call inquirer to ask for user role', () => {
        return user.command({
          userName: 'foo',
          action: 'add'
        }, baseMocks.stubs.service).then(() => {
          return test.expect(inquirerStub.getCall(0).args[0].message).to.equal('Please choose a role for the user')
        })
      })
    })

    test.describe('when role is provided', () => {
      test.it('should not call inquirer to ask for user role', () => {
        return user.command({
          userName: 'foo',
          role: 'admin',
          action: 'add'
        }, baseMocks.stubs.service).then(() => {
          return test.expect(inquirerStub).to.not.equal('Please choose a role for the user')
        })
      })

      test.describe('when role is one of "service", "service-registerer" or "plugin"', () => {
        test.it('should not call inquirer to ask for email if it is not provided', () => {
          return user.command({
            userName: 'foo',
            role: 'service',
            action: 'add'
          }, baseMocks.stubs.service).then(() => {
            return test.expect(inquirerStub).to.not.have.been.called()
          })
        })
      })

      test.describe('when role is not one of "service", "service-registerer" or "plugin"', () => {
        test.it('should call inquirer to ask for email if it is not provided', () => {
          return user.command({
            userName: 'foo',
            role: 'admin',
            action: 'add'
          }, baseMocks.stubs.service).then(() => {
            return test.expect(inquirerStub.getCall(0).args[0].message).to.equal('Please enter user email')
          })
        })

        test.it('should not call inquirer to ask for email if it is not provided', () => {
          return user.command({
            userName: 'foo',
            role: 'admin',
            email: 'foo@foo.com',
            action: 'add'
          }, baseMocks.stubs.service).then(() => {
            return test.expect(inquirerStub.getCall(0).args[0].message).to.not.equal('Please enter user email')
          })
        })

        test.it('should call inquirer to ask for password if it is not provided', () => {
          return user.command({
            userName: 'foo',
            role: 'admin',
            email: 'foo@foo.com',
            action: 'add'
          }, baseMocks.stubs.service).then(() => {
            return test.expect(inquirerStub.getCall(0).args[0].message).to.equal('Please enter user password')
          })
        })

        test.it('should not call inquirer to ask for password if it is provided', () => {
          return user.command({
            userName: 'foo',
            role: 'admin',
            email: 'foo@foo.com',
            password: 'foo',
            action: 'add'
          }, baseMocks.stubs.service).then(() => {
            return test.expect(inquirerStub).to.not.have.been.called()
          })
        })
      })
    })

    test.describe('when ask for email', () => {
      test.it('should check if email is duplicated when email is valid', () => {
        const fooEmail = 'foo@foo.com'
        fooPromptValue = fooEmail
        return user.command({
          userName: 'foo',
          action: 'add'
        }, baseMocks.stubs.service).then(() => {
          return test.expect(indexMocks.stubs.commands.user.get).to.have.been.calledWith({
            email: fooEmail
          })
        })
      })

      test.it('should not check if email is duplicated when email is not valid', () => {
        const fooEmail = 'foasdo.com'
        fooPromptValue = fooEmail
        return user.command({
          userName: 'foo',
          action: 'add'
        }, baseMocks.stubs.service).then(() => {
          return test.expect(indexMocks.stubs.commands.user.get).to.not.have.been.called()
        })
      })
    })
  })

  test.describe('when action is "remove"', () => {
    test.describe('when no user name is provided', () => {
      test.it('should call inquirer to ask for user name', () => {
        indexMocks.stubs.commands.user.getAll.resolves([{
          name: 'foo'
        }])
        return user.command({
          action: 'remove'
        }, baseMocks.stubs.service).then(() => {
          return test.expect(inquirerStub.getCall(0).args[0].message).to.equal('Please choose user')
        })
      })

      test.it('should display a list of users, filtering by user input', () => {
        fooPromptValue = 'fo'
        indexMocks.stubs.commands.user.getAll.resolves([{
          name: 'fooo'
        }, {
          name: 'manolo'
        }, {
          name: 'foo-2'
        }])
        return user.command({
          action: 'remove'
        }, baseMocks.stubs.service).then(() => {
          return test.expect(sourceResults[0]).to.deep.equal([
            'fooo',
            'foo-2'
          ])
        })
      })
    })
  })

  test.describe('when action is not "add" nor "remove"', () => {
    test.it('should reject the promise', () => {
      return user.command({
        action: 'adasdd'
      }, baseMocks.stubs.service).then(() => {
        return test.assert.fail()
      }, () => {
        return test.expect(baseMocks.stubs.service.errors.MethodNotAllowed).to.have.been.called()
      })
    })
  })
})
