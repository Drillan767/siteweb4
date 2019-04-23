'use strict'

class ContactRequest {
  get rules () {
    return {
      name: 'string|required',
      object: 'string|required',
      email: 'email|required',
      message: 'required|min:20',
      read: 'boolean|required'
    }
  }

  get validateAll () {
    return true
  }
}

module.exports = ContactRequest
