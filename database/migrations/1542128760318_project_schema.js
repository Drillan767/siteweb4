'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProjectSchema extends Schema {
  up () {
    this.create('projects', (table) => {
      table.increments()
      table.string('title').notNullable().unique()
      table.string('illustration').notNullable()
      table.boolean('draft').notNullable()
      table.text('content').notNullable()
      table.text('images')
      table.string('website')
      table.string('github')
      table.string('slug').notNullable().unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('projects')
  }
}

module.exports = ProjectSchema
