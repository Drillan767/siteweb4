'use strict'

const Schema = use('Schema')

class SettingSchema extends Schema {
  up () {
    this.create('settings', (table) => {
      table.string('linkedin')
      table.string('medium')
      table.string('twitter')
      table.string('facebook')
      table.string('landing_bg').notNullable()
      table.string('about_bg').notNullable()
      table.string('contact_bg').notNullable()
      table.string('article_bg').notNullable()
      table.string('portfolio_bg').notNullable()
      table.boolean('dark_mode')
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('settings')
  }
}

module.exports = SettingSchema
