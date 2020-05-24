const axios = require('axios')
const userAgents = require('user-agents')
const HttpsProxyAgent = require('https-proxy-agent')
const SocksProxyAgent = require('socks-proxy-agent')
const _ = require('lodash')
const { JSDOM } = require('jsdom')
const jsdom = new JSDOM
const $ = require('jquery')(jsdom.window)

class Service {
  constructor () {
    this.name = 'saveig.org'
    this.piority = 3
    this.axios = axios.create()
  }

  setProxy (proxy) {
    let httpAgent
    if (proxy && proxy.host && proxy.port) {
      let { protocol } = proxy
      if (protocol === undefined) {
        protocol = 'http'
      }
      if (proxy.auth && proxy.auth.user && proxy.auth.pass) {
        if (protocol.startsWith('http')) {
          httpAgent = new HttpsProxyAgent(`${protocol}://${proxy.auth.user}:${proxy.auth.pass}@${proxy.host}:${proxy.port}`)
        } else if (protocol.startsWith('socks')) {
          httpAgent = new SocksProxyAgent(`${protocol}://${proxy.auth.user}:${proxy.auth.pass}@${proxy.host}:${proxy.port}`)
        }
      } else {
        if (protocol.startsWith('http')) {
          httpAgent = new HttpsProxyAgent(`${protocol}://${proxy.host}:${proxy.port}`)
        } else if (protocol.startsWith('socks')) {
          httpAgent = new SocksProxyAgent(`${protocol}://${proxy.host}:${proxy.port}`)
        }
      }
    } else if (proxy && proxy.match(/:\/\//)) {
      if (proxy.startsWith('http')) {
        httpAgent = new HttpsProxyAgent(proxy)
      } else if (proxy.startsWith('socks')) {
        httpAgent = new SocksProxyAgent(proxy)
      }
    }
    this.axios.defaults.httpAgent = this.axios.defaults.httpsAgent = httpAgent
    return this
  }

  get (username) {
    return new Promise((resolve, reject) => {
      try {
        const userAgent = (new userAgents()).toString()
        this
          .axios
          .get(
            `https://saveig.org/stories/${username}`,
            {
              headers: {
                'user-agent': userAgent
              }
            }
          )
          .then((res) => {
            const userinfo = $(res.data).find('.userinfo')
            const user = {
              friendship_status: {
                blocking: undefined,
                followed_by: undefined,
                following: undefined,
                incoming_request: undefined,
                is_bestie: undefined,
                is_private: undefined,
                is_restricted: undefined,
                muting: undefined,
                outgoing_request: undefined
              },
              full_name: _.trim(userinfo.find('.name').text()),
              is_private: undefined,
              is_verified: undefined,
              pk: userinfo.data('id'),
              profile_pic_id: undefined,
              profile_pic_url: userinfo.find('img').attr('src'),
              username: userinfo.data('name')
            }
            this
              .axios
              .get(
                `https://api.saveig.org/api/high/?id=${user.pk}&lang=en`,
                {
                  headers: {
                    'user-agent': userAgent
                  }
                }
              )
              .then((res2) => {
                const items = _.orderBy(
                  _.map(res2.data.items, (item) => {
                    const isVideo = item.src.match(/\.mp4/) ? true : false
                    return {
                      can_reply: undefined,
                      can_reshare: undefined,
                      can_see_insights_as_brand: undefined,
                      can_send_custom_emojis: undefined,
                      can_viewer_save: undefined,
                      caption: undefined,
                      caption_is_edited: undefined,
                      caption_position: undefined,
                      client_cache_key: undefined,
                      code: undefined,
                      device_timestamp: undefined,
                      expiring_at: undefined,
                      filter_type: undefined,
                      has_audio: undefined,
                      id: `${item.id}_${user.pk}`,
                      image_versions2: {
                        candidates: [
                          {
                            height: undefined,
                            scans_profile: undefined,
                            url: item.thumb,
                            width: undefined,
                          }
                        ],
                      },
                      is_reel_media: undefined,
                      media_type: undefined,
                      organic_tracking_token: undefined,
                      original_height: undefined,
                      original_width: undefined,
                      photo_of_you: undefined,
                      pk: undefined,
                      show_one_tap_fb_share_tooltip: undefined,
                      supports_reel_reactions: undefined,
                      taken_at: item.timestamp,
                      user: _.pick(
                        user,
                        [
                          'full_name',
                          'has_anonymous_profile_picture',
                          'is_favorite',
                          'is_private',
                          'is_unpublished',
                          'is_verified',
                          'pk',
                          'profile_pic_id',
                          'profile_pic_url',
                          'username'
                        ]
                      ),
                      video_duration: undefined,
                      video_versions: isVideo ? [
                        {
                          height: undefined,
                          id: undefined,
                          type: undefined,
                          url: item.src,
                          width: undefined
                        }
                      ] : undefined
                    }
                  }),
                  ['taken_at'],
                  ['desc']
                )
                resolve({
                  can_gif_quick_reply: undefined,
                  can_reply: undefined,
                  can_reshare: undefined,
                  expiring_at: undefined,
                  has_besties_media: undefined,
                  id: undefined,
                  latest_reel_media: undefined,
                  media_count: _.size(items),
                  prefetch_count: 0,
                  reel_type: 'user_reel',
                  seen: 0,
                  status: 'ok',
                  user,
                  items
                })
              })
              .catch(reject)
          })
          .catch(reject)
      } catch (e) {
        reject(e)
      }
    })
  }
}

module.exports = Service
