'use strict'

const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('first_name', 80).notNullable()
      table.string('last_name', 80).notNullable()
      table.date('birthday')
      table.string('profile_pic')
      table.text('about_en')
      table.text('about_fr')
      table.string('job_title')
      table.string('email', 150).notNullable().unique()
      table.string('reset_token')
      table.string('password', 60).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
