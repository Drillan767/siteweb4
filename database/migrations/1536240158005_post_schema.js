'use strict'

const Schema = use('Schema')

class PostSchema extends Schema {
  up () {
    this.create('posts', (table) => {
      table.increments()
      table.string('title').notNullable()
      table.text('content').notNullable()
      table.string('illustration').notNullable()
      table.string('lang').notNullable()
      table.string('slug').notNullable().unique()
      table.boolean('draft').notNullable()

      table.timestamps()
    })
  }

  down () {
    this.drop('posts')
  }
}

module.exports = PostSchema
