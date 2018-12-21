'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BlacklistSchema extends Schema {
  up () {
    this.create('blacklists', (table) => {
      table.increments()
      table.string('crypted_ip')
      table.timestamps()
    })
  }

  down () {
    this.drop('blacklists')
  }
}

module.exports = BlacklistSchema
