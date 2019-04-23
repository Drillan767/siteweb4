'use strict'

class ProjectRequest {
  get rules () {
    return {
      title: 'string|required',
      tags: 'required',
      content: 'required|min:30',
      draft: 'required',
      repository: 'string|required',
      website: 'string|required'
    }
  }
}

module.exports = ProjectRequest
