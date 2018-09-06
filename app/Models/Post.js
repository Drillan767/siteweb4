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

  static get table () {
    return 'posts'
  }

  static get primaryKey () {
    return 'id'
  }
}
module.exports = Post
