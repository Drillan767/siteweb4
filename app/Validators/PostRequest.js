'use strict'

class PostRequest {
  get rules () {
    return {
      title: 'required|min:5|max:60',
      tags: 'required',
      content: 'required|min:30',
      lang: 'required',
      draft: 'required'
    }
  }
}

module.exports = PostRequest
