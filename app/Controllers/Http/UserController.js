/* eslint-disable camelcase */
'use strict'

const User = use('App/Models/User')
const Token = use('App/Models/Token')
const { validate } = use('Validator')
const Encryption = use('Encryption')
const Drive = use('Drive')
const Mail = use('Mail')
const Helpers = use('Helpers')
const Env = use('Env')
const randomString = require('random-string')

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

  async upload ({request, response}) {
    const image = request.file('image', {
      types: ['image'],
      allowedExtensions: ['jpg', 'png', 'jpeg'],
      size: '10mb'
    })

    if (image) {
      await image.move(Helpers.publicPath('user/tmp'), {
        overwrite: true
      })
      if (!image.moved()) {
        return response.status(401).json(image.message())
      } else {
        return `${Env.get('APP_URL')}/user/tmp/${image.clientName}`
      }
    } else {
      return response.status(401).json({message: 'Image is not satisfactory.'})
    }
  }

  async data ({request, response}) {
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
        job_title: 'string|required',
        password: 'string|min:8'
      })

      if (validation.fails()) {
        return response.status(401).json(validation.messages())
      } else {
        const {first_name, last_name, email, birthday, extra_images, job_title, password} = request.all()
        let {about_en, about_fr} = request.all()
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
        } else if (!image && user.profile_pic.length === 0) {
          return response.status(401).json([{message: 'Overlord needs an image.'}])
        }

        if (extra_images) {
          if (extra_images.includes(',')) {
            let images = []
            extra_images.split(',').map(image => {
              if (about_en.includes(image) || about_fr.includes(image)) {
                images.push(image)
              }
            })
            for (let i = 0; i < images.length; i++) {
              if (!Drive.exists(Helpers.publicPath(`user/${images[i]}`))) {
                await Drive.move(Helpers.publicPath('user/tmp'), Helpers.publicPath('user'), true)
              }

              about_fr = about_fr.replace(/tmp\//g, '')
              about_en = about_en.replace(/tmp\//g, '')
            }
          } else {
            if (about_fr.includes(extra_images) || about_en.includes(extra_images)) {
              if (!Drive.exists(Helpers.publicPath(`user/${extra_images}`))) {
                await Drive.move(Helpers.publicPath('user/tmp'), Helpers.publicPath('user'), true)
              }

              about_fr = about_fr.replace(/tmp\//g, '')
              about_en = about_en.replace(/tmp\//g, '')
              await Drive.delete('user/tmp')
            }
          }
          await Drive.delete('user/tmp')
        }

        user.first_name = first_name || user.first_name
        user.last_name = last_name || user.last_name
        user.email = email || user.email
        user.birthday = birthday || user.birthday
        user.job_title = job_title || user.job_title
        user.about_en = about_en || user.about_en
        user.about_fr = about_fr || user.about_fr
        user.profile_pic = profile_pic || user.profile_pic
        user.password = password || user.password

        await user.save()
        return response.status(200).json(user)
      }
    }
  }

  async logged ({response}) {
    return response.status(200).json('ok')
  }

  async login ({request, auth, response}) {
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
    const { refresh_token } = request.only(['refresh_token'])
    const validation = await validate({ refresh_token }, {
      refresh_token: 'required'
    })
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

  async reset ({request, response}) {
    const validation = await validate(request.all(), {
      email: 'email|required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const { email } = request.all()
      const user = await User.findBy('email', email)
      if (user) {
        user.reset_token = randomString({length: 40})
        await user.save()

        await Mail.send('notifications.password_reset', user.toJSON(), (message) => {
          message
            .from('noreply@josephlevarato.me', 'Overlord')
            .to(user.email)
            .subject('Password reset requested')
        })

        return response.status(200).json('ok')
      } else {
        return response.status(401).json([{message: 'No one here has this email address, mate'}])
      }
    }
  }

  async verifyHash ({request, response}) {
    const validation = await validate(request.all(), {
      hash: 'string|required'
    })

    if (validation.fails()) {
      return response.status(401).json('no')
    } else {
      const { hash } = request.all()
      const user = await User.findBy('reset_token', hash)
      if (!user) {
        return response.status(401).json('no')
      }
    }
  }

  async resetPassword ({ request, auth, response }) {
    const validation = await validate(request.all(), {
      password: 'string|required',
      hash: 'string|required'
    })
    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const { password, hash } = request.all()
      const user = await User.findBy('reset_token', hash)
      if (!user) {
        return response.status(401).json([{message: 'Unable to find you in the database, please send a message to the admin'}])
      } else {
        user.password = password
        user.reset_token = ''
        await user.save()
        return response.status(200).json(await auth.withRefreshToken().attempt(user.email, password))
      }
    }
  }
}

module.exports = UserController
