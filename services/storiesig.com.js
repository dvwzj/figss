const axios = require('axios')
const userAgents = require('user-agents')

class Service {
  constructor () {
    this.name = 'storiesig.com'
    this.piority = 1
    this.axios = axios.create()
  }

  get (username) {
    return new Promise((resolve, reject) => {
      try {
        const userAgent = (new userAgents()).toString()
        this
          .axios
          .get(
            `https://api.storiesig.com/stories/${username}`,
            {
              headers: {
                'user-agent': userAgent
              }
            }
          )
          .then((res) => {
            resolve(res.data)
          })
          .catch(reject)
      } catch (e) {
        reject(e)
      }
    })
  }
}

module.exports = Service
