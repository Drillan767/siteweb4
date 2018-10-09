'use strict'

const Post = use('App/Models/Post')
const Helpers = use('Helpers')
const Env = use('Env')
const { validateAll } = use('Validator')

class PostController {
  async index ({ response }) {
    const posts = await Post.all()
    return response.status(200).json(posts)
  }

  async show ({params, response}) {
    const post = await Post.query().where('slug', params.slug).first()
    console.log(post)
    if (post) {
      return response.status(200).send(post)
    } else {
      return response.status(404).send(null)
    }
  }

  async store ({request, response}) {
    const params = request.body
    const illustration = request.file('illustration', {
      types: ['image'],
      allowedExtensions: ['jpg', 'png', 'jpeg'],
      size: '3mb'
    })

    const validation = await validateAll(params, {
      title: 'required|min:5|max:60',
      tags: 'required|min:5|max:60',
      content: 'required|min:30',
      lang: 'required',
      draft: 'required'
    },
    {
      'title.required': 'The field "title" is required',
      'tags.required': 'The field "tags" is required',
      'content.required': 'The field "content" is required',
      'content.min': 'The post\'s length must be 30 characters minimum',
      'illustration.required': 'The field "illustration" is required'
    })

    const post = new Post()

    // Handling the file upload, setting up the right directory

    if (illustration) {
      const latest = await Post.last()
      const id = latest ? latest.id + 1 : 1
      await illustration.move(Helpers.publicPath('articles/' + id))

      if (!illustration.moved()) {
        return response.status(401).json([illustration.error()])
      } else {
        post.illustration = `${Env.get('APP_URL')}/articles/${id}/${illustration.clientName}`
      }
    } else {
      return response.status(401).json([{field: 'illustration', message: 'The field "illustration" is required'}])
    }

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    }

    post.title = params.title
    post.content = params.content
    post.lang = params.lang
    post.draft = params.draft

    await post.save()
    return response.status(201).json(post)
  }

  async update ({params, request, response}) {
    const post = await Post.find(params.id)
    post.title = params.title
    post.illustration = params.illustration
    post.content = params.content
    post.lang = params.lang
    post.draft = params.draft
    await post.save()

    return response.status(200).json(post)
  }

  async delete ({params, response}) {
    const post = await Post.find(params.id)
    if (!post) {
      return response.status(404).json(null)
    } else {
      return response.status(204).json(null)
    }
  }
}

module.exports = PostController
