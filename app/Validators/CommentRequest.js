'use strict'

class CommentRequest {
  get rules () {
    return {
      name: 'required',
      email: 'email|required',
      comment: 'required',
      reply: 'integer|required',
      accepted: 'boolean|required',
      post_id: 'integer|required'
    }
  }
}

module.exports = CommentRequest
