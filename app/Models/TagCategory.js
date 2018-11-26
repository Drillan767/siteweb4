'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class TagCategory extends Model {
  tag () {
    return this.hasMany('App/Models/Tag')
  }
}

module.exports = TagCategory
