'use strict'

const Schema = use('Schema')

class TagSchema extends Schema {
  up () {
    this.create('tags', (table) => {
      table.string('name').notNullable()
      table.text('description_en').notNullable()
      table.text('description_fr').notNullable()
      table.string('slug').notNullable()
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('tags')
  }
}

module.exports = TagSchema
