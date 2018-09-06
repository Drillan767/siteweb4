'use strict'

const Schema = use('Schema')

class PortfolioSchema extends Schema {
  up () {
    this.create('portfolios', (table) => {
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('portfolios')
  }
}

module.exports = PortfolioSchema
