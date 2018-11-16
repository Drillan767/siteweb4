'use strict'

const Model = use('Model')

class Project extends Model {
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
      .pivotTable('project_tag')
  }
}

module.exports = Project
