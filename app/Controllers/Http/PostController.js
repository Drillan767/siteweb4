'use strict'

const Post = use('App/Models/Post')

class PostController {

  async index ({ response }) {
    let posts = await Post.all()
    return response.json(posts)
  }

  async show ({params, response}) {
    const post = await Post.find(params.id)
    return response.json(post)
  }

  async store ({request, response}) {

    const params = request.only(['title', 'illustration', 'content', 'lang', 'draft'])
    const post = new Post()
    post.title = params.title
    post.illustration = params.illustration
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
