'use strict'

const User = use('App/Models/User')

class UserController {
  async show ({ response }) {
    const user = await User.find(1)
    return response.status(200).json(user)
  }

  async register ({request, response}) {
    const users = await User.all()
    if (users.length > 0) {
      return response.status(403).json('A user is already present in the database')
    } else {
      const params = request.all()

      let fields = [
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

  async logged ({auth, response}) {
    try {
      await auth.getUser()
      return response.status(200).json(true)
    } catch (e) {
      response.status(200).json(false)
    }
  }

  async login ({request, auth, session, response}) {
    const {email, password, remember} = request.all()
    const user = await User.query().where('email', email).first()

    if (user) {
      const logged = await auth.remember(remember).attempt(user.email, password)
      return response.status(200).json(logged)
    } else {
      return response.status(404).json(null)
    }
  }

  async logout ({auth, response}) {
    await auth.logout()
    return response.status(200).json('logged_out')
  }
}

module.exports = UserController
