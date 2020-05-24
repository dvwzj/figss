const _ = require('lodash')
const async = require('async')
// const changeCase = require('change-case')

const Services = require('../services')

class ServiceManager {
  constructor (services) {
    this.allServices = _.orderBy(_.map(Services, (service) => new service), ['piority'], ['asc'])
    this.usingServices = []
    if (_.isEmpty(services)) {
      this.usingServices = this.allServices
    } else {
      this.usingServices = _.filter(this.allServices, (service) => {
        return _.includes(services, service.name)
      })
    }
    this.proxy = false
  }

  setProxy(proxy) {
    this.proxy = proxy
    return this
  }

  get (username) {
    return new Promise(async (resolve, reject) => {
      try {
        const services = _.times(_.size(this.usingServices), (i) => {
          return this.usingServices[i]
        })
        let stop = false
        do {
          const service = services.shift()
          await service
            .setProxy(this.proxy)
            .get(username)
            .then((data) => {
              stop = true
              resolve(data)
            })
            .catch((err) => {
              console.error(err)
            })
        } while (_.size(services) && !stop)
        reject(`No any services available`)
      } catch (e) {
        reject(e)
      }
    })
  }
}

module.exports = ServiceManager
