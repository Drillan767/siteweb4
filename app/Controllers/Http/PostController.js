'use strict'

const Post = use('App/Models/Post')
const Helpers = use('Helpers')
const Env = use('Env')
const { validate } = use('Validator')
const FIELDS = ['title', 'content', 'lang', 'draft']

class PostController {
  async index ({ response }) {
    const posts = await Post.all()
    return response.status(200).json(posts)
  }

  async show ({params, response}) {
    const post = await Post.query().where('slug', params.slug).first()
    return response.json(post)
  }

  async store ({request, response}) {
    const params = request.body
    const illustration = request.file('illustration', {
      types: ['image'],
      allowedExtensions: ['jpg', 'png', 'jpeg'],
      size: '3mb'
    })

    const validation = await validate(params, {
      title: 'required|min:5|max:60',
      content: 'required|min:30',
      lang: 'required',
      draft: 'required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    }

    const post = new Post()

    post.title = params.title
    post.content = params.content
    post.lang = params.lang
    post.draft = params.draft

    // Handling the file upload, setting up the right directory
    const latest = await Post.last()
    const id = latest ? latest.id : 1
    await illustration.move(Helpers.publicPath('articles/' + id))

    if (!illustration.moved()) {
      return response.status(500).json(illustration.error())
    } else {
      post.illustration = `${Env.get('APP_URL')}/articles/${id}/${illustration.clientName}`
    }

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
