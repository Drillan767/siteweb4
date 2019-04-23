'use strict'

class TagRequest {
  get rules () {
    return {
      name_en: 'required|string',
      name_fr: 'string',
      icon: 'string|required',
      description_en: 'required',
      description_fr: 'required'
    }
  }
}

module.exports = TagRequest
