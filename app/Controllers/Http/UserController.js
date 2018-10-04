'use strict'

const User = use('App/Models/User')
const Token = use('App/Models/Token')
const { validate } = use('Validator')
const Encryption = use('Encryption')

class UserController {
  async show ({ response }) {
    const user = await User.find(1)
    return response.status(200).json(user)
  }

  async register ({request, response}) {
    const rules = {
      first_name: 'required',
      last_name: 'required',
      email: 'required|email|unique:users,email',
      password: 'required'
    }

    const {first_name, last_name, email, password} = request.only([
      'email',
      'password',
      'first_name',
      'last_name'
    ])

    const validation = await validate({email, password, first_name, last_name}, rules)

    if (!validation.fails()) {
      try {
        const user = await User.create({email, first_name, last_name, password})
        return response.send(user)
      } catch (e) {
        response.status(401).send({error: 'Please try again'})
      }
    } else {
      response.status(401).send(validation.messages())
    }
  }

  async logged ({auth, response}) {
    try {
      const { email, first_name, last_name } = await auth.getUser()
      return { email, first_name, last_name }
    } catch (e) {
      response.send('Missing or invalid jwt token');
    }
  }

  async login ({request, auth, session, response}) {
    const rules = {
      email: 'required|email',
      password: 'required'
    }

    const {email, password} = request.only(['email', 'password'])
    const validation = await validate({ email, password }, rules)

    if (!validation.fails()) {
      try {
        return await auth.withRefreshToken().attempt(email, password)
      } catch (e) {
        response.status(401).send({ error: 'Invalid email or password' })
      }
    } else {
      response.status(401).send(validation.messages())
    }
  }

  async refreshToken ({ request, response, auth }) {
    const rules = {
      refresh_token: 'required'
    }

    const { refresh_token } = request.only(['refresh_token'])

    const validation = await validate({ refresh_token }, rules)

    if (!validation.fails()) {
      try {
        return await auth
          .newRefreshToken()
          .generateForRefreshToken(refresh_token)
      } catch (e) {
        response.status(401).send({ error: 'Invalid refresh token' })
      }
    } else {
      response.status(401).send(validation.messages())
    }
  }

  async logout ({request, auth, response}) {
    const rules = {
      refresh_token: 'required'
    }

    const refresh_token = request.only(['refresh_token'])
    const validation = await validate({ refresh_token }, rules)
    const decrypted = Encryption.decrypt(refresh_token)

    if (!validation.fails()) {
      try {
        const token = Token.findBy('token', decrypted)

        if (token) {
          token.delete()
          response.status(200).send({status: 'ok'})
        } else {
          response.status(401).send({error: 'Invalid refresh token'})
        }
      } catch (e) {
        response.status(401).send({error: 'Something went terribly wrong'})
      }
    } else {
      response.status(401).send(validation.messages())
    }
  }
}

module.exports = UserController
