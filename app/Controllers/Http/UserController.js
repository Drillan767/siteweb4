'use strict'

const User = use('App/Models/User')
const Token = use('App/Models/Token')
const { validate } = use('Validator')
const Encryption = use('Encryption')
const Helpers = use('Helpers')
const Env = use('Env')

class UserController {
  async show ({ response }) {
    const user = await User.first()
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

  async data ({request, response}) {
    console.log(request.all())
    const user = await User.first()
    let profile_pic = null
    if (!user) {
      return response.status(500).json('No user found, wtf.')
    } else {
      const validation = await validate(request.all(), {
        first_name: 'string|required',
        last_name: 'string|required',
        email: 'email|required',
        birthday: 'string|required',
        about_en: 'required',
        about_fr: 'required',
        job_title: 'string|required'
      })

      if (validation.fails()) {
        return response.status(401).json(validation.messages())
      } else {
        const {first_name, last_name, email, birthday, about_en, about_fr, job_title} = request.all()
        const image = request.file('profile_pic', {
          types: ['image'],
          allowedExtensions: ['jpg', 'png', 'jpeg'],
          size: '10mb'
        })

        if (image) {
          await image.move(Helpers.publicPath('user'), {
            overwrite: true
          })
          if (!image.moved()) {
            return response.status(401).json(image.error())
          } else {
            profile_pic = `${Env.get('APP_URL')}/user/${image.clientName}`
          }
        }

        user.first_name = first_name || user.first_name
        user.last_name = last_name || user.last_name
        user.email = email || user.email
        user.birthday = birthday || user.birthday
        user.job_title = job_title || user.job_title
        user.about_en = about_en || user.about_en
        user.about_fr = about_fr || user.about_fr
        user.profile_pic = profile_pic || user.profile_pic

        await user.save()
        return response.status(200).json(user)
      }
    }
  }

  async logged ({auth, response}) {
    try {
      const user = await auth.getUser()
      return user
    } catch (e) {
      response.send('Missing or invalid jwt token')
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

    const { refresh_token } = request.only(['refresh_token'])
    const validation = await validate({ refresh_token }, rules)
    const decrypted = Encryption.decrypt(refresh_token)

    if (!validation.fails()) {
      try {
        const token = await Token.findBy('token', decrypted)
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
