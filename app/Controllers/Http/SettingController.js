'use strict'
/* eslint-disable camelcase */
const Helpers = use('Helpers')
const Env = use('Env')
const Setting = use('App/Models/Setting')

class SettingController {
  async get ({response}) {
    // ...
  }

  async edit ({request, response}) {
    const setting = await Setting.last()
    const imgRules = {
      types: ['image'],
      allowedExtensions: ['jpg', 'png', 'jpeg'],
      size: '10mb'
    }
    const {facebook, twitter, linkedin, medium} = request.all()
    const landing_bg = request.file('landing_bg', imgRules)
    const article_bg = request.file('article_bg', imgRules)
    const portfolio_bg = request.file('portfolio_bg', imgRules)
    const about_bg = request.file('about_bg', imgRules)
    const contact_bg = request.file('contact_bg', imgRules)
    const bg = []
    const errors = []
    const bgFields = [landing_bg, article_bg, portfolio_bg, about_bg, contact_bg]

    for (const field of bgFields) {
      if (field) {
        await field.move(Helpers.publicPath('settings'), (file) => {
          return {
            name: `${field}.${file.subtype}`
          }
        })
        if (!field.moved()) {
          errors.push(field.errors())
        } else {
          bg[field] = `${Env.get('APP_URL')}/settings/${field.subtype}`
        }
      }
    }

    if (errors.length > 0) {
      return response.status(401).json(errors)
    }

    if (!setting) {
      const setting = await Setting.create({
        facebook: facebook,
        twitter: twitter,
        linkedin: linkedin,
        medium: medium,
        landing_bg: bg['landing_bg'],
        article_bg: bg['article_bg'],
        portfolio_bg: bg['portfolio_bg'],
        about_bg: bg['about_bg'],
        contact_bg: bg['contact_bg']
      })

      return response.status(201).json(setting)
    } else {
      setting.facebook = facebook || setting.facebook
      setting.twitter = twitter || setting.twitter
      setting.linkedin = linkedin || setting.linkedin
      setting.medium = medium || setting.medium
      setting.landing_bg = bg['landing_bg'] || setting.landing_bg
      setting.article_bg = bg['article_bg'] || setting.article_bg
      setting.portfolio_bg = bg['portfolio_bg'] || setting.portfolio_bg
      setting.about_bg = bg['about_bg'] || setting.about_bg
      setting.contact_bg = bg['contact_bg'] || setting.contact_bg

      await setting.save()

      return response.status(200).json(setting)
    }
  }
}

module.exports = SettingController
