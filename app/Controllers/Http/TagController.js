'use strict'

const Tag = use('App/Models/Tag')
const Category = use('App/Models/TagCategory')
const { validate } = use('Validator')

class TagController {
  async all ({request, response}) {
    const tags = await Tag
      .query()
      .with('category')
      .fetch()

    return response.status(200).send(tags)
  }

  async show ({params, response}) {
    const tag = await Tag
      .query()
      .where('slug', params.slug)
      .with('category')
      .with('posts')
      .with('project')
      .first()
    return response.status(200).send(tag)
  }

  async store ({request, response}) {
    const validation = await validate(request.all(), {
      name_en: 'required|string',
      name_fr: 'string',
      description_en: 'required',
      description_fr: 'required',
      category_id: 'integer|required'
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
    const {name_fr, name_en, category_id, description_en, description_fr} = request.all()
    tag.name_fr = name_fr || tag.name_fr
    tag.name_en = name_en || tag.name_en
    tag.category_id = category_id || tag.category_id
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

  async allCategories ({response}) {
    const categories = await Category.all()
    return response.status(200).json(categories)
  }

  async showCategory ({params, response}) {
    const category = await Category.find(params.id)
    return response.status(200).json(category)
  }

  async storeCategory ({request, response}) {
    const validation = await validate(request.all(), {
      name_fr: 'string|required',
      name_en: 'string|required',
      icon: 'string|required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const data = request.all()
      const category = await Category.create(data)
      return response.status(201).json(category)
    }
  }

  async updateCategory ({params, request, response}) {
    const category = Category.find(params.id)
    const data = request.all()
    category.name_fr = data.name_fr || category.name_fr
    category.name_en = data.name_en || category.name_en
    category.icon = data.icon || category.icon
    await category.save()
    return response.json(200).json(category)
  }

  async deleteCategory ({request, response}) {
    const validation = await validate(request.only(['id']), {
      id: 'integer|required'
    })

    if (validation.fails()) {
      return response.status(401).json()
    } else {
      const { id } = request.all()
      await Category.delete(id)
      return response.status(200).json('ok')
    }
  }
}

module.exports = TagController
