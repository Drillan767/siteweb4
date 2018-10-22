'use strict'

const Model = use('Model')

class Tag extends Model {
  posts () {
    return this
      .belongsToMany('App/Models/Post')
      .pivotTable('post_tag')
  }

  project () {
    return this.belongsToMany('App/Model/Portfolio')
  }

  static boot () {
    super.boot()

    this.addTrait('@provider:Lucid/Slugify', {
      fields: { slug: 'name' },
      strategy: 'dbIncrement',
      disableUpdates: false
    })
  }
}

module.exports = Tag
