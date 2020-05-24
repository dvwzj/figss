const axios = require('axios')
const userAgents = require('user-agents')
const HttpsProxyAgent = require('https-proxy-agent')
const SocksProxyAgent = require('socks-proxy-agent')
const _ = require('lodash')
const moment = require('moment-timezone')
const { JSDOM } = require('jsdom')
const jsdom = new JSDOM
const $ = require('jquery')(jsdom.window)

class Service {
  constructor () {
    this.name = 'storieswatcher.com'
    this.piority = 5
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
            `https://www.storieswatcher.com/${username}`,
            {
              headers: {
                'user-agent': userAgent
              }
            }
          )
          .then((res) => {
            let profilePicUrl
            const matches = res.data.match(/background: transparent url\('(.*?)'\)/)
            if (matches) {
              profilePicUrl = matches[1]
            }
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
              full_name: $(res.data).find('h1.profile-name').text(),
              is_private: undefined,
              is_verified: undefined,
              pk: undefined,
              profile_pic_id: undefined,
              profile_pic_url: profilePicUrl,
              username: $(res.data).find('.user_insta').text().split('@')[1]
            }
            if (!user.username) {
              reject(`Cannot parse data`)
            } else {
              const items = _.orderBy(
                _.map($(res.data).find('.stories-video, .stories-img'), (item) => {
                  const isVideo = _.size($(item).find('video')) ? true : false
                  let img_url, img_width, img_height, vdo_url, vdo_width, vdo_height
                  if (isVideo) {
                    const vdo = $(item).find('video')
                    img_url = undefined
                    img_width = vdo_width = undefined
                    img_height = vdo_height = undefined
                    vdo_url = vdo.find('source').attr('src')
                  } else {
                    img_url = $(item).find('img').attr('src')
                  }
                  const takenAt = moment($(item).find('.timeago').attr('datetime')).unix()
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
                    id: undefined,
                    image_versions2: {
                      candidates: [
                        {
                          height: img_height,
                          scans_profile: undefined,
                          url: img_url,
                          width: img_width,
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
                    taken_at: takenAt,
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
                        height: vdo_height,
                        id: undefined,
                        type: undefined,
                        url: vdo_url,
                        width: vdo_width
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
            }
          })
          .catch(reject)
      } catch (e) {
        reject(e)
      }
    })
  }
}

module.exports = Service
