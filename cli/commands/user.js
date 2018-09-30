'use strict'

const _ = require('lodash')
const inquirer = require('inquirer')
const autocomplete = require('inquirer-autocomplete-prompt')

const lib = require('../../lib')
const templates = require('../../lib/templates')
const { roles } = require('../../lib/security/utils')
const { isValidEmail } = require('../../lib/models/user')
const { isValidName } = require('../../lib/utils')

inquirer.registerPrompt('autocomplete', autocomplete)

const ACTIONS = ['add', 'remove']

const questions = {
  role: {
    type: 'list',
    name: 'value',
    message: 'Please choose a role for the user',
    default: roles.ADMIN,
    choices: _.map(roles, role => role)
  },
  chooseUser: {
    type: 'autocomplete',
    name: 'value',
    message: 'Please choose user'
  },
  name: {
    type: 'input',
    name: 'value',
    message: 'Please enter user name'
  },
  email: {
    type: 'input',
    name: 'value',
    message: 'Please enter user email'
  },
  password: {
    type: 'password',
    name: 'value',
    message: 'Please enter user password',
    mask: '*'
  }
}

const Check = (validator, errorTemplate) => value => {
  if (validator(value)) {
    return Promise.resolve(true)
  }
  return Promise.resolve(errorTemplate({
    value
  }))
}

const checkEmail = Check(isValidEmail, templates.notValidEmail)
const checkName = Check(isValidName, templates.notValidName)

const inquire = async (question, extraOptions) => inquirer.prompt({ ...question, ...extraOptions })
  .then(answers => answers.value)

const Options = (config, cli, commands) => {
  const AvoidDuplicatedUser = (field, message) => value => {
    const filter = {}
    filter[field] = value
    return commands.user.get(filter).then(() => {
      return Promise.resolve(message)
    }).catch(() => {
      return Promise.resolve(true)
    })
  }

  const ValidateField = (fieldValidator, avoidDuplicated) => value => fieldValidator(value).then(validation => {
    if (validation === true) {
      return avoidDuplicated(value)
    }
    return Promise.resolve(validation)
  })

  const FilterUser = async () => commands.user.getAll()
    .then(users => Promise.resolve(users.map(user => user.name)))
    .then(users => Promise.resolve((answers, input) => Promise.resolve(users.filter(user => user.includes(input)))))

  const getUserToAdd = async () => {
    const user = {}
    user.name = config.userName || await inquire(questions.name, {
      validate: ValidateField(checkName, AvoidDuplicatedUser('name', templates.userNameAlreadyExists()))
    })
    user.role = config.role || await inquire(questions.role)
    if (![roles.SERVICE, roles.SERVICE_REGISTERER, roles.PLUGIN].includes(user.role)) {
      user.email = config.email || await inquire(questions.email, {
        validate: ValidateField(checkEmail, AvoidDuplicatedUser('email', templates.emailAlreadyExists()))
      })
      user.password = config.password || await inquire(questions.password)
    }
    return user
  }

  const getUserToRemove = async () => {
    const user = {}
    user.name = config.userName || await inquire(questions.chooseUser, {
      source: await FilterUser()
    })
    return user
  }

  const get = async () => {
    if (!ACTIONS.includes(config.action)) {
      return Promise.reject(new cli.errors.MethodNotAllowed(templates.notValidUserAction({
        actions: ACTIONS.join(', ')
      })))
    }

    return {
      action: config.action,
      user: config.action === 'add' ? await getUserToAdd() : await getUserToRemove()
    }
  }

  return {
    get
  }
}

const user = async (config, cli) => {
  const database = lib.Database(cli)
  const models = lib.Models(cli)
  const client = lib.Client(cli)
  const commands = lib.Commands(cli, models, client)
  const options = Options(config, cli, commands)

  return database.connect()
    .then(options.get)
    .then(options => commands.user[options.action](options.user))
    .finally(() => database.disconnect())
}

module.exports = {
  processName: 'service',
  describe: 'Add or remove an user',
  cli: 'user <action> [userName]',
  options: {
    role: {
      type: 'string',
      describe: 'User role'
    },
    email: {
      type: 'string',
      describe: 'User email'
    },
    password: {
      type: 'string',
      describe: 'User password'
    }
  },
  command: user
}
