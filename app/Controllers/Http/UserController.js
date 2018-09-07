'use strict'

const User = use('App/Models/User')

class UserController {
  async show ({ response }) {
    // const user = await User.find(1)
    return response.status(200).json('Bonjour')
  }

  async register ({request, response}) {
    const users = await User.all()
    if (users.length > 0) {
      return response.status(403).json('A user is already present in the database')
    } else {
      const params = request.all()
      let fields = [
        'username',
        'first_name',
        'last_name',
        'profile_pic',
        'birthday',
        'facebook',
        'twitter',
        'job_title',
        'viadeo',
        'linkedin',
        'job_title',
        'email',
        'password'
      ]
      const user = new User()
      fields.forEach((element) => {
        if (params[element]) {
          user[element] = params[element]
        }
      })

      await user.save()
      return response.status(201).json(user)
    }
  }
}

module.exports = UserController
