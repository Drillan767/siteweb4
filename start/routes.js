'use strict'

const Route = use('Route')

Route.group(() => {
  Route.post('post', 'PostController.store')
  Route.get('posts', 'PostController.index')
  Route.get('post/:id', 'PostController.show')
  Route.put('post/:id', 'PostController.update')
  Route.delete('post/:id', 'PostController.delete')
}).prefix('api/v1')
