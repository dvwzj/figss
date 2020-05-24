const _ = require('lodash')

const ServiceManager = require('./service-manager')

class Client {
  serviceManager (services) {
    services = services === undefined ? '' : services
    services = _.isArray(services) ? services : services.split(',')
    return new ServiceManager(_.filter(services))
  }
}

module.exports = Client
