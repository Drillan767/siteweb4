'use strict'

const Contact = use('App/Models/Contact')
const { validate } = use('Validator')
const Mail = use('Mail')

class ContactController {
  async index ({response}) {
    const messages = await Contact.all()

    return response.status(200).json(messages)
  }

  async show ({params, response}) {
    const message = await Contact.find(params.id)
    if (message) {
      if (!message.read) {
        message.read = true
        message.save()
      }
      return response.status(200).json(message)
    } else {
      return response.status(404).json('not found')
    }
  }

  async store ({request, response}) {
    /* const validation = await validate(request.all(), {
      name: 'string|required',
      object: 'string|required',
      email: 'email|required',
      message: 'required|min:20',
      read: 'boolean|required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
    */
    const data = request.only(['name', 'object', 'email', 'message', 'read'])
    await Contact.create(data)
    /* await Mail.send('notifications.contact', data, (message) => {
        message
          .to('jlevarato@pm.me')
          .from('Overlord <overlord@jlevarato.me>')
          .subject('Someone contacted us')
      }) */
    return response.status(201).json('ok')
    // }
  }

  async read ({request, response}) {
    const validation = await validate(request.all(), {
      id: 'required|integer'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const { id } = request.all()
      const message = await Contact.find(id)
      message.read = true
      await message.save()

      return response.status(200).json(message)
    }
  }

  send ({request, response}) {
    // ...
  }

  async delete ({request, response}) {
    const validation = await validate(request.all(), {
      id: 'integer|required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.message())
    } else {
      await Contact.delete(request.id)
      return response.status(200).json('ok')
    }
  }
}

module.exports = ContactController
