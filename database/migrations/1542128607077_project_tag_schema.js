'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PortfolioTagSchema extends Schema {
  up () {
    this.create('project_tag', (table) => {
      table.integer('tag_id').unsigned()
      table.foreign('tag_id').references('tag.id').onDelete('cascade')
      table.integer('project_id').unsigned().index('project_id')
      table.foreign('project_id').references('project.id').onDelete('cascade')
    })
  }

  down () {
    this.drop('portfolio_tags')
  }
}

module.exports = PortfolioTagSchema
