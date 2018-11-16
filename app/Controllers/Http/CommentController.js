'use strict'

const Comment = use('App/Models/Comment')
const Mail = use('Mail')
const { validate } = use('Validator')

class CommentController {
  async list ({request, response}) {
    const { post_id } = request.only(['post_id'])
    if (post_id) {
      const comments = await Comment
        .query()
        .where('post_id', post_id)
        .fetch()

      return response.status(200).json(comments)
    } else {
      return response.status(401).json({error: 'No post id provided'})
    }
  }

  async all ({request, response}) {
    const comments = await Comment.query().with('post').fetch()
    return response.status(200).json(comments)
  }

  async store ({ request, response }) {
    let data = request.all()
    const validation = await validate(data,
      {
        name: 'required',
        email: 'email|required',
        comment: 'required',
        reply: 'integer|required',
        accepted: 'boolean|required',
        post_id: 'boolean|required'
      })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      if (data.honey_pot) {
        return response.status(401).json({error: 'I SAID GOOD DAY SIR'})
      } else {
        delete data.honey_pot
        const comment = await Comment.create(data)
        await Mail.send('notifications.comment', comment, (message) => {
          message
            .from('noreply@josephlevarato.me', 'Website')
            .to('jlevarato@pm.me')
            .subject('New comment on an article')
        })
        return response.status(201).json(comment)
      }
    }
  }

  async edit ({request, response}) {
    const validation = await validate(request.all(),
      {
        id: 'integer|required',
        decision: 'string|required'
      })

    if (validation.fails()) {
      return response.status(401).json(validation.message())
    } else {
      const { id, decision } = request.only(['id', 'decision'])
      const comment = await Comment.find(id)
      comment.accepted = decision === 'accept' ? 1 : 0
      await comment.save()
      return response.status(200).json(comment)
    }
  }

  async destroy ({params, response}) {
    const comment = await Comment.find(params.id)
    await comment.delete()
    return response.status(200).json('ok')
  }
}

module.exports = CommentController
