'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CommentSchema extends Schema {
  up () {
    this.create('comments', (table) => {
      table.increments()
      table.string('email').notNullable()
      table.string('name').notNullable()
      table.text('comment').notNullable()
      table.boolean('accepted')
      table.integer('reply')
      table.integer('post_id')
      table.timestamps()
    })
  }

  down () {
    this.drop('comments')
  }
}

module.exports = CommentSchema
