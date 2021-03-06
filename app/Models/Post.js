'use strict'

const Model = use('Model')

class Post extends Model {
  static boot () {
    super.boot()

    this.addTrait('@provider:Lucid/Slugify', {
      fields: { slug: 'title' },
      strategy: 'dbIncrement',
      disableUpdates: false
    })
  }

  tags () {
    return this
      .belongsToMany('App/Models/Tag')
      .pivotTable('post_tag')
  }

  comments () {
    return this.hasMany('App/Models/Comment')
  }
}
module.exports = Post
