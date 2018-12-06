'use strict'

const Tag = use('App/Models/Tag')
const { validate } = use('Validator')

class TagController {
  async all ({request, response}) {
    const tags = await Tag.all()

    return response.status(200).send(tags)
  }

  async show ({params, response}) {
    const tag = await Tag
      .query()
      .where('slug', params.slug)
      .with('posts')
      .with('project')
      .first()
    return response.status(200).send(tag)
  }

  async store ({request, response}) {
    const validation = await validate(request.all(), {
      name_en: 'required|string',
      name_fr: 'string',
      icon: 'string|required',
      description_en: 'required',
      description_fr: 'required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      let data = request.all()
      if (!data.name_fr) {
        data.name_fr = data.name_en
      }

      const tag = await Tag.create(data)
      return response.status(201).send(tag)
    }
  }

  async update ({request, params, response}) {
    const tag = await Tag.find(params.id)
    const data = request.all()
    tag.name_fr = data.name_fr || tag.name_fr
    tag.name_en = data.name_en || tag.name_en
    tag.icon = data.icon || tag.icon
    tag.description_en = data.description_en || tag.description_en
    tag.description_fr = data.description_fr || tag.description_fr

    await tag.save()
    return response.status(200).send(tag)
  }

  async delete ({params, response}) {
    const tag = await Tag.find(params.id)
    await tag.delete()
    return response.status(200).send('ok')
  }
}

module.exports = TagController
