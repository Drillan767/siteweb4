'use strict'

const Model = use('Model')

class Post extends Model {
  static boot () {
    super.boot()

    this.addTrait('@provider:Lucid/Slugify', {
      fields: { slug: 'title' },
      strategy: 'dbIncrement',
      disableUpdates: false
    })
  }

  tags () {
    return this
      .belongsToMany('App/Models/Tag')
      .pivotTable('post_tag')
  }

  comments () {
    return this.hasMany('App/Models/Comment')
  }
}
module.exports = Post

// De base, un champ de texte est disponible en bas de chaque article. Si un commentaire existe déjà, une fonction
// "reply" est disponible. Celle-ci fait apparaitre un champ de texte plus petit en dessous et au dessus du champ de texte principal
// au 'submit', il faut checker l'id du commentaire auquel on répond et l'ajouter à this.comment.reply. Valeur de base: 0
// <div v-for="(comment, index) in article.comments" v-if="comment.reply === 0">
// <div v-if="comment.reply === comment.id"> <- pas sûr de ça
// Check nk.info au pire
