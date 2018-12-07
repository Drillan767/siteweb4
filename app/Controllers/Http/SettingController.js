'use strict'
/* eslint-disable camelcase */
const { validate } = use('Validator')
const Setting = use('App/Models/Setting')
const User = use('App/Models/User')
const Message = use('App/Models/Contact')
const Comment = use('App/Models/Comment')
const Project = use('App/Models/Project')
const Post = use('App/Models/Post')

class SettingController {
  async get ({response}) {
    const settings = await Setting.first()
    if (settings) {
      response.status(200).json(settings)
    } else {
      response.status(404).json('not found')
    }
  }

  async edit ({request, response}) {
    const validation = await validate(request.all(), {
      social_medias: 'required',
      website_name: 'string|required',
      dark_mode: 'boolean|required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    }

    const setting = await Setting.find(1)
    const data = request.all()

    if (!setting) {
      const setting = await Setting.create(data)

      return response.status(201).json(setting)
    } else {
      setting.social_medias = data.social_medias || setting.social_medias
      setting.website_name = data.website_name || setting.website_name
      setting.dark_mode = data.dark_mode || setting.dark_mode

      await setting.save()

      return response.status(200).json(setting)
    }
  }

  async settings ({response}) {
    const user = await User.first()
    const settings = await Setting.first()
    if (user && settings && user !== settings) {
      return response.status(200).send({user: user, settings: settings})
    } else {
      return response.status(404).json(null)
    }
  }

  async dashboard ({response}) {
    return response.status(200).json({
      articles: {
        all: await Post.getCount(),
        published: await Post.query().where('draft', false).getCount(),
        draft: await Post.query().where('draft', true).getCount()
      },
      projects: {
        all: await Project.getCount(),
        published: await Project.query().where('draft', false).getCount(),
        draft: await Project.query().where('draft', true).getCount()
      },
      comments: {
        all: await Comment.getCount(),
        accepted: await Comment.query().where('accepted', true).getCount(),
        pending: await Comment.query().where('accepted', false).getCount()
      },
      messages: {
        all: await Message.getCount(),
        read: await Message.query().where('read', true).getCount(),
        pending: await Message.query().where('read', false).getCount()
      }
    })
  }
}

module.exports = SettingController
