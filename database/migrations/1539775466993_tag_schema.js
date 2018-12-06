'use strict'

const Schema = use('Schema')

class TagSchema extends Schema {
  up () {
    this.create('tags', (table) => {
      table.string('name_fr', 50).notNullable().unique()
      table.string('name_en', 50).notNullable().unique()
      table.integer('category_id').notNullable()
      table.string('icon').notNullable()
      table.text('description_en').notNullable()
      table.text('description_fr').notNullable()
      table.string('slug', 50).notNullable().unique()
      table.increments().unsigned()
      table.timestamps()
    })
  }

  down () {
    this.drop('tags')
  }
}

module.exports = TagSchema
