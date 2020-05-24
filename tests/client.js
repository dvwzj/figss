const Client = require('../')

const client = new Client()

const services = [
  // 'storiesig.com',
  // 'insta-stories.ru',
  // 'saveig.org',
  // 'storieswatch.com',
  // 'storieswatcher.com'
]
const serviceManager = client.serviceManager(services)

serviceManager
  .get('noey.bnk48office')
  .then((data) => {
    console.log('data', data)
  })
  .catch(console.error)
