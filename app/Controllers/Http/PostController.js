'use strict'

const Post = use('App/Models/Post')
const Tag = use('App/Models/Tag')
const Helpers = use('Helpers')
const Drive = use('Drive')
const Env = use('Env')
const { validateAll, validate } = use('Validator')
const gm = require('gm').subClass({imageMagick: true})

class PostController {
  async index ({ response }) {
    const posts = await Post
      .query()
      .with('tags')
      .fetch()
    return response.status(200).json(posts)
  }

  async infinite ({request, response}) {
    const { page, limit } = request.all()
    const posts = await Post
      .query()
      .with('tags')
      .paginate(page, limit)
    return response.status(200).json(posts)
  }

  async show ({params, response}) {
    const post = await Post
      .query()
      .with('tags')
      .where('slug', params.slug)
      .first()

    if (post) {
      post.tags = await post.tags().fetch()
      return response.status(200).send(post)
    } else {
      return response.status(404).send(null)
    }
  }

  async store ({request, response}) {
    let illustration = ''
    const image = request.file('illustration', {
      types: ['image'],
      allowedExtensions: ['jpg', 'png', 'jpeg'],
      size: '10mb'
    })

    const validation = await validateAll(request.all(), {
      title: 'required|min:5|max:60',
      tags: 'required',
      content: 'required|min:30',
      lang: 'required',
      draft: 'required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    }

    let {title, content, lang, draft} = request.all()
    let thumbnail = ''
    draft = (draft === '1')
    const post = await Post.create({title, content, thumbnail, lang, draft, illustration})
    const tags = request.input('tags').split(',').map(Number)
    if (tags && tags.length > 0) {
      await post.tags().attach(tags)
    }

    if (image) {
      await image.move(Helpers.publicPath('articles/' + post.id), {
        name: image.clientName.replace(/ /gm, '-')
      })

      if (!image.moved()) {
        return response.status(401).json([image.error()])
      } else {
        post.illustration = `${Env.get('APP_URL')}/articles/${post.id}/${image.clientName}`
        if (Drive.exists(Helpers.publicPath(`articles/${post.id}/${image.clientName}`))) {
          gm(Helpers.publicPath(`articles/${post.id}/${image.clientName}`))
            .resize('50', '%')
            .gravity('Center')
            .crop('370', '320')
            .write(Helpers.publicPath(`articles/${post.id}/thumb.${image.subtype}`), (e) => {
              if (e) console.log(e)
            })
          post.thumbnail = `${Env.get('APP_URL')}/articles/${post.id}/thumb.${image.subtype}`
        }

        await post.save()
      }
    }

    return response.status(201).json(post)
  }

  async update ({params, request, response}) {
    const post = await Post.query().where('slug', params.slug).first()
    let illustration = null
    const { title, content, draft, lang } = request.all()
    const tags = request.input('tags').split(',').map(Number)
    post.title = title || post.title
    post.content = content || post.content
    post.lang = lang || post.lang
    post.draft = (draft === '1') || post.draft

    const image = request.file('illustration', {
      types: ['image'],
      allowedExtensions: ['jpg', 'png', 'jpeg'],
      size: '10mb'
    })

    if (image) {
      const file = post.illustration.replace(Env.get('APP_URL'), '')
      await Drive.delete(Helpers.publicPath(file))
      await image.move(Helpers.publicPath(`articles/${post.id}`), {
        overwrite: true,
        name: image.clientName.replace(/ /gm, '-')
      })

      if (!image.moved()) {
        return response.status(401).json([image.error()])
      } else {
        illustration = `${Env.get('APP_URL')}/articles/${post.id}/${image.clientName}`
      }
    }

    post.illustration = illustration || post.illustration

    await post.save()

    await post.tags().detach()
    await post.tags().attach(tags)

    return response.status(200).json(post)
  }

  async delete ({params, response}) {
    const post = await Post.find(params.id)
    if (!post) {
      return response.status(404).json(null)
    } else {
      await post.tags().detach()
      await Drive.delete(Helpers.publicPath(`articles/${params.id}`))
      await post.delete()
      return response.status(200).json('ok')
    }
  }

  async publish ({request, response}) {
    const { id } = request.only(['id'])
    const post = await Post.find(id)
    post.draft = !post.draft
    await post.save()
    return response.status(200).json(post)
  }

  async related ({request, response}) {
    const validation = await validate(request.all(), {
      postId: 'integer|required',
      tagId: 'integer|required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const {postId, tagId} = request.all()
      const tag = await Tag.find(tagId)
      const posts = await tag
        .posts()
        .where('draft', false)
        .whereNot('id', postId)
        .fetch()
      return response.status(200).json(posts)
    }
  }
}

module.exports = PostController
