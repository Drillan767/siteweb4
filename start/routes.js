'use strict'

const Route = use('Route')

Route.group(() => {
  Route.post('post', 'PostController.store').middleware('auth')
  Route.get('posts', 'PostController.index')
  Route.get('post/:id', 'PostController.show')
  Route.put('post/:id', 'PostController.update').middleware('auth')
  Route.delete('post/:id', 'PostController.delete').middleware('auth')

  Route.post('user', 'UserController.register')
  Route.get('user', 'UserController.show')
  Route.post('login', 'UserController.login')
  Route.delete('logout', 'UserController.logout')
  Route.get('logged_in', 'UserController.logged')
}).prefix('api/v1')
