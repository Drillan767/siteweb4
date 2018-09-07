'use strict'

const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('username', 80).notNullable().unique()
      table.string('first_name', 80).notNullable()
      table.string('last_name', 80).notNullable()
      table.date('birthday')
      table.string('facebook')
      table.string('profile_pic')
      table.string('twitter')
      table.string('viadeo')
      table.string('linkedin')
      table.string('job_title')
      table.string('email', 254).notNullable().unique()
      table.string('password', 60).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
