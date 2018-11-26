'use strict'

const Schema = use('Schema')

class PostTagSchema extends Schema {
  up () {
    this.create('post_tag', (table) => {
      table.integer('tag_id').unsigned().references('id').inTable('tags')
      table.integer('post_id').unsigned().references('id').inTable('posts')
    })
  }

  down () {
    this.drop('post_tag')
  }
}

module.exports = PostTagSchema
