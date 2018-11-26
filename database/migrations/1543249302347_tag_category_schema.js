'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TagCategorySchema extends Schema {
  up () {
    this.create('tag_categories', (table) => {
      table.string('name', 50).notNullable().unique()
      table.string('icon')
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('tag_categories')
  }
}

module.exports = TagCategorySchema
