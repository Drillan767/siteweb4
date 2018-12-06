'use strict'

const Model = use('Model')

class Tag extends Model {

  posts () {
    return this
      .belongsToMany('App/Models/Post')
      .pivotTable('post_tag')
  }

  project () {
    return this.belongsToMany('App/Models/Project')
  }

  static get hidden () {
    return ['created_at', 'updated_at', 'pivot']
  }

  static boot () {
    super.boot()

    this.addTrait('@provider:Lucid/Slugify', {
      fields: { slug: 'name_en' },
      strategy: 'dbIncrement',
      disableUpdates: false
    })
  }
}

module.exports = Tag
