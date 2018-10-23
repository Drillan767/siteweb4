'use strict'

const Route = use('Route')

Route.group(() => {
  Route.post('post', 'PostController.store').middleware('auth:jwt')
  Route.get('posts', 'PostController.index')
  Route.get('post/:slug', 'PostController.show')
  Route.put('post/:slug', 'PostController.update').middleware('auth')
  Route.post('post/publish', 'PostController.publish').middleware('auth')
  Route.delete('post/:id', 'PostController.delete').middleware('auth')

  Route.post('tag', 'TagController.store').middleware('auth')
  Route.put('tag/:id', 'TagController.update').middleware('auth')
  Route.get('tags', 'TagController.all')
  Route.get('tag/:id', 'TagController.show')
  Route.delete('tag/:id', 'TagController.delete').middleware('auth')

  Route.post('/settings', 'SettingContrller.edit').middleware('auth')

  Route.post('user', 'UserController.register')
  Route.post('user/token/refresh', 'UserController.refreshToken')
  Route.get('user', 'UserController.show')
  Route.post('login', 'UserController.login')
  Route.post('logout', 'UserController.logout')
  Route.get('logged_in', 'UserController.logged')
}).prefix('api/v1')
