'use strict'

class UserRequest {
  get rules () {
    return {
      first_name: 'string|required',
      last_name: 'string|required',
      email: 'email|required',
      birthday: 'string|required',
      about_en: 'required',
      about_fr: 'required',
      job_title: 'string|required',
      password: 'string|min:8'
    }
  }
}

module.exports = UserRequest
