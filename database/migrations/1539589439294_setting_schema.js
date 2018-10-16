'use strict'

const Schema = use('Schema')

class SettingSchema extends Schema {
  up () {
    this.create('settings', (table) => {
      table.string('linkedin')
      table.string('medium')
      table.string('twitter')
      table.string('facebook')
      table.string('landscape_bg')
      table.string('about_bg')
      table.string('contact_bg')
      table.string('article_bg')
      table.string('portfolio_bg')
      table.boolean('dark_mode')
      table.boolean('bg_images')
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('settings')
  }
}

module.exports = SettingSchema
