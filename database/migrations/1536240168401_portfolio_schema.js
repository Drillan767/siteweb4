'use strict'

const Schema = use('Schema')

class PortfolioSchema extends Schema {
  up () {
    this.create('portfolios', (table) => {
      table.increments().unsigned()
      table.string('title', 150).notNullable().unique()
      table.string('illustration').notNullable()
      table.boolean('draft').notNullable()
      table.text('content').notNullable()
      table.text('images')
      table.string('website')
      table.string('github')
      table.string('slug', 150).notNullable().unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('portfolios')
  }
}

module.exports = PortfolioSchema
