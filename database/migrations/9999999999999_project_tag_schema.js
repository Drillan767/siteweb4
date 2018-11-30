'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PortfolioTagSchema extends Schema {
  up () {
    this.create('project_tag', (table) => {
      table.integer('tag_id').unsigned().references('id').inTable('tags')
      table.integer('project_id').unsigned().references('id').inTable('projects')
    })
  }

  down () {
    this.drop('project_tag')
  }
}

module.exports = PortfolioTagSchema
