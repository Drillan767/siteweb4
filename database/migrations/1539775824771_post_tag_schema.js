'use strict'

const Schema = use('Schema')

class PostTagSchema extends Schema {
  up () {
    this.create('post_tag', (table) => {
      table.integer('tag_id').unsigned().index('tag_id')
      table.foreign('tag_id').references('tag.id').onDelete('cascade')
      table.integer('post_id').unsigned().index('post_id')
      table.foreign('post_id').references('post.id').onDelete('cascade')
    })
  }

  down () {
    this.drop('post_tag')
  }
}

module.exports = PostTagSchema
