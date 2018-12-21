'use strict'

const Route = use('Route')

Route.group(() => {
  Route.post('post', 'PostController.store').middleware('auth')
  Route.get('posts', 'PostController.index')
  Route.post('post/infinite', 'PostController.infinite')
  Route.get('post/:slug', 'PostController.show')
  Route.post('post/related', 'PostController.related')
  Route.put('post/:slug', 'PostController.update').middleware('auth')
  Route.post('post/publish', 'PostController.publish').middleware('auth')
  Route.delete('post/:id', 'PostController.delete').middleware('auth')

  Route.get('all_comments', 'CommentController.all')
  Route.post('comments', 'CommentController.list')
  Route.post('comment', 'CommentController.store')
  Route.delete('comment', 'CommentController.destroy').middleware('auth')
  Route.post('comment/decision', 'CommentController.edit').middleware('auth')
  Route.delete('comment/delete/:id', 'CommentController.destroy').middleware('auth')

  Route.get('portfolio', 'PortfolioController.index')
  Route.post('portfolio/related', 'PortfolioController.related')
  Route.post('portfolio/upload', 'PortfolioController.upload').middleware('auth')
  Route.post('portfolio/upload/delete', 'PortfolioController.deleteUploads').middleware('auth')
  Route.post('portfolio/store', 'PortfolioController.store').middleware('auth')
  Route.post('portfolio/publish', 'PortfolioController.publish').middleware('auth')
  Route.post('portfolio/:id', 'PortfolioController.update').middleware('auth')
  Route.get('portfolio/:slug', 'PortfolioController.show')
  Route.delete('portfolio/:id', 'PortfolioController.delete').middleware('auth')

  Route.post('tag', 'TagController.store').middleware('auth')
  Route.put('tag/:id', 'TagController.update').middleware('auth')
  Route.get('tags', 'TagController.all')
  Route.get('tag/:slug', 'TagController.show')
  Route.delete('tag/:id', 'TagController.delete').middleware('auth')

  Route.get('messages', 'ContactController.index').middleware('auth')
  Route.get('message/:id', 'ContactController.show').middleware('auth')
  Route.delete('message', 'ContactController.delete').middleware('auth')
  Route.post('message', 'ContactController.store')
  Route.post('message/read', 'ContactController.read').middleware('auth')

  Route.post('settings', 'SettingController.edit').middleware('auth')
  Route.get('admin_settings', 'SettingController.get').middleware('auth')
  Route.post('all', 'SettingController.dashboard').middleware('auth')
  Route.get('settings', 'SettingController.settings')

  Route.post('user', 'UserController.register')
  Route.post('user/token/refresh', 'UserController.refreshToken')
  Route.post('user/reset', 'UserController.reset')
  Route.post('user/reset/token', 'UserController.verifyHash')
  Route.post('user/reset/password', 'UserController.resetPassword')
  Route.put('user_data', 'UserController.data').middleware('auth')
  Route.post('user/upload', 'UserController.upload').middleware('auth')
  Route.get('user', 'UserController.show')
  Route.post('login', 'UserController.login')
  Route.post('logout', 'UserController.logout')
  Route.post('logged_in', 'UserController.logged').middleware('auth')
}).prefix('api/v1')
