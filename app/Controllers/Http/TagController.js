'use strict'

const Tag = use('App/Models/Tag')

class TagController {
  async all ({request, response}) {
    const tags = await Tag.all()
    return response.status(200).send(tags)
  }

  async show ({params, response}) {
    const tag = await Tag.query().where('slug', params.slug).first()
    return response.status(200).send(tag)
  }

  async store ({request, response}) {
    let data = request.all()
    if (!data.name_fr) {
      data.name_fr = data.name_en
    }
    const tag = await Tag.create(data)
    return response.status(201).send(tag)
  }

  async update ({request, params, response}) {
    const tag = await Tag.find(params.id)
    const {name_fr, name_en, description_en, description_fr} = request.all()
    tag.name_fr = name_fr || tag.name_fr
    tag.name_en = name_en || tag.name_en
    tag.description_en = description_en || tag.description_en
    tag.description_fr = description_fr || tag.description_fr

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
