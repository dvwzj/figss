const axios = require('axios')
const userAgents = require('user-agents')
const _ = require('lodash')

class Service {
  constructor () {
    this.name = 'insta-stories.ru'
    this.piority = 2
    this.axios = axios.create()
  }

  get (username) {
    return new Promise((resolve, reject) => {
      try {
        const userAgent = (new userAgents()).toString()
        this
          .axios
          .get(
            `https://insta-stories.ru/${username}`,
            {
              headers: {
                'user-agent': userAgent
              }
            }
          )
          .then((res) => {
            const matches = res.data.match(/src="(main\.(.*?)\.js)"/)
            if (matches) {
              this
                .axios
                .get(
                  `https://insta-stories.ru/${matches[1]}`,
                  {
                    headers: {
                      'user-agent': userAgent
                    }
                  }
                )
                .then((res2) => {
                  const matches2 = res2.data.match(/this\.xTrip="(.*?)"/)
                  if (matches2) {
                    this
                      .axios
                      .post(
                        `https://api.insta-stories.ru/profile`,
                        {
                          string: username,
                          'x-trip': matches2[1]
                        },
                        {
                          headers: {
                            'user-agent': userAgent
                          }
                        }
                      )
                      .then((res3) => {
                        // console.log('res3.data', res3.data)
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
                          full_name: res3.data.user.fullName,
                          is_private: undefined,
                          is_verified: undefined,
                          pk: res3.data.user.pk,
                          profile_pic_id: undefined,
                          profile_pic_url: res3.data.user.picture,
                          username: res3.data.user.username
                        }
                        const items = _.orderBy(
                          _.map(res3.data.stories, (story) => {
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
                              id: `${story.id}_${user.pk}`,
                              image_versions2: {
                                candidates: [
                                  {
                                    height: undefined,
                                    scans_profile: undefined,
                                    url: story.img,
                                    width: undefined,
                                  }
                                ],
                              },
                              is_reel_media: undefined,
                              media_type: story.mediaType,
                              organic_tracking_token: undefined,
                              original_height: undefined,
                              original_width: undefined,
                              photo_of_you: undefined,
                              pk: undefined,
                              show_one_tap_fb_share_tooltip: undefined,
                              supports_reel_reactions: undefined,
                              taken_at: story.takenAt,
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
                              video_versions: story.video ? [
                                story.video
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
                  } else {
                    reject(`Service "${this.name}" not available (cannot get x-trip)`)
                  }
                })
                .catch(reject)
            } else {
              reject(`Service "${this.name}" not available`)
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
