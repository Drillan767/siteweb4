'use strict'

const Project = use('App/Models/Project')
const Tag = use('App/Models/Tag')
const Drive = use('Drive')
const Env = use('Env')
const Helpers = use('Helpers')
const { validate } = use('Validator')
const gm = require('gm').subClass({imageMagick: true})

class PortfolioController {
  async index ({response}) {
    const projects = await Project
      .query()
      .where('draft', false)
      .with('tags')
      .fetch()
    return response.status(200).json(projects)
  }

  async show ({params, response}) {
    const project = await Project
      .query()
      .with('tags')
      .where('slug', params.slug)
      .first()

    if (project) {
      return response.status(200).json(project)
    } else {
      return response.status(404).json('not found')
    }
  }

  async store ({request, response}) {
    let errors = []
    const validation = await validate(request.all(),
      {
        title: 'string|required',
        tags: 'required',
        content: 'required|min:30',
        draft: 'required',
        github: 'string|required',
        website: 'string|required'
      })
    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const data = request.all()
      data.illustration = ''
      data.images = ''
      data.thumbnail = {}
      let tags = data.tags
      delete data.tags
      const project = await Project.create(data)

      tags = tags.split(',').map(Number)
      if (tags && tags.length > 0) {
        await project.tags().attach(tags)
      }

      // handling illustration

      const single = request.file('illustration', {
        types: ['image'],
        extnames: ['png', 'jpg', 'jpeg']
      })
      await single.move(Helpers.publicPath(`projects/${project.id}`))
      if (!single.moved()) {
        errors.push(single.error())
      } else {
        project.illustration = `${Env.get('APP_URL')}/projects/${project.id}/${single.clientName}`
        if (Drive.exists(Helpers.publicPath(`projects/${project.id}/${single.clientName}`))) {
          // Small
          gm(Helpers.publicPath(`projects/${project.id}/${single.clientName}`))
            .resize('50', '%')
            .gravity('Center')
            .crop('278', '197')
            .write(Helpers.publicPath(`projects/${project.id}/small.${single.subtype}`), (e) => {
              if (e) {
                console.log(e)
              } else {
                data.thumbnail.small = `${Env.get('APP_URL')}/projects/${project.id}/small.${single.subtype}`
              }
            })
          // Wide
          gm(Helpers.publicPath(`projects/${project.id}/${single.clientName}`))
            .resize('50', '%')
            .gravity('Center')
            .crop('463', '197')
            .write(Helpers.publicPath(`projects/${project.id}/wide.${single.subtype}`), (e) => {
              if (e) {
                console.log(e)
              } else {
                data.thumbnail.wide = `${Env.get('APP_URL')}/projects/${project.id}/wide.${single.subtype}`
              }
            })
        }
      }

      // Handling multi

      const multi = request.file('images', {
        types: ['image'],
        extnames: ['png', 'jpg', 'jpeg']
      })
      await multi.moveAll(Helpers.publicPath(`projects/${project.id}/images`))
      if (!multi.movedAll()) {
        multi.errors().map(error => {
          errors.push(error)
        })
      } else {
        project.images = JSON.stringify(
          multi.movedList().map(
            image => {
              return `${Env.get('APP_URL')}/projects/${project.id}/images/${image.clientName}`
            }
          )
        )
      }

      // Handling extras

      if (data.extra) {
        if (typeof data.extra === 'string') {
          if (project.content.includes(data.extra)) {
            const basename = data.extra.split(/[\\/]/).pop()
            await Drive.move(Helpers.publicPath(`projects/tmp/${basename}`),
              Helpers.publicPath(`projects/${project.id}/extra/${basename}`))

            project.content = project.content.replace(/\/tmp\//g, `/${project.id}/extra/`)
          }
        } else {
          for (let i = 0; i < data.extra.length; i++) {
            if (project.content.includes(data.extra[i])) {
              const basename = data.extra[i].split(/[\\/]/).pop()
              await Drive.move(Helpers.publicPath(`projects/tmp/${basename}`),
                Helpers.publicPath(`projects/${project.id}/extra/${basename}`))

              project.content = project.content.replace(/\/tmp\//g, `/${project.id}/extra/`)
            }
          }
        }
      }

      if (errors.length > 0) {
        return response.status(401).json(errors)
      }

      await project.save()
      return response.status(201).json(project)
    }
  }

  async update ({params, request, response}) {
    const project = await Project.find(params.id)
    let errors = []
    const validation = await validate(request.all(),
      {
        title: 'string|required',
        tags: 'required',
        content: 'required|min:30',
        draft: 'required',
        github: 'string|required',
        website: 'string|required'
      })
    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const data = request.all()
      data.thumbnail = ''
      let tags = data.tags
      delete data.tags

      // handling illustration

      const single = request.file('illustration', {
        types: ['image'],
        extnames: ['png', 'jpg', 'jpeg']
      })
      if (single) {
        let old = project.illustration.split(/[\\/]/).pop()
        await Drive.delete(Helpers.publicPath(`projects/${project.id}/${old}`))
        await single.move(Helpers.publicPath(`projects/${project.id}`))
        if (!single.moved()) {
          errors.push(single.error())
        } else {
          data.illustration = `${Env.get('APP_URL')}/projects/${project.id}/${single.clientName}`
          if (Drive.exists(Helpers.publicPath(`projects/${project.id}/${single.clientName}`))) {
            // Small
            gm(Helpers.publicPath(`projects/${project.id}/${single.clientName}`))
              .resize('50', '%')
              .gravity('Center')
              .crop('278', '197')
              .write(Helpers.publicPath(`projects/${project.id}/small.${single.subtype}`), (e) => {
                if (e) {
                  console.log(e)
                }
              })
            // Wide
            gm(Helpers.publicPath(`projects/${project.id}/${single.clientName}`))
              .resize('50', '%')
              .gravity('Center')
              .crop('463', '197')
              .write(Helpers.publicPath(`projects/${project.id}/wide.${single.subtype}`), (e) => {
                if (e) {
                  console.log(e)
                }
              })
            data.thumbnail = JSON.stringify({
              small: `${Env.get('APP_URL')}/projects/${project.id}/small.${single.subtype}`,
              wide: `${Env.get('APP_URL')}/projects/${project.id}/wide.${single.subtype}`
            })
          }
        }
      } else {
        data.thumbnail = null
      }

      // Handling multi

      const multi = request.file('images', {
        types: ['image'],
        extnames: ['png', 'jpg', 'jpeg']
      })
      if (multi) {
        await Drive.delete(Helpers.publicPath(`projects/${project.id}/images`))
        await multi.moveAll(Helpers.publicPath(`projects/${project.id}/images`))
        if (!multi.movedAll()) {
          multi.errors().map(error => {
            errors.push(error)
          })
        } else {
          data.images = JSON.stringify(
            multi.movedList().map(
              image => {
                return `${Env.get('APP_URL')}/projects/${project.id}/images/${image.clientName}`
              }
            )
          )
        }
      }

      if (data.extra) {
        if (typeof data.extra === 'string') {
          if (project.content.includes(data.extra)) {
            const basename = data.extra.split(/[\\/]/).pop()
            await Drive.move(Helpers.publicPath(`projects/tmp/${basename}`),
              Helpers.publicPath(`projects/${project.id}/extra/${basename}`))

            project.content = project.content.replace(/\/tmp\//g, `/${project.id}/extra/`)
          }
        } else {
          for (let i = 0; i < data.extra.length; i++) {
            if (project.content.includes(data.extra[i])) {
              const basename = data.extra[i].split(/[\\/]/).pop()
              await Drive.move(Helpers.publicPath(`projects/tmp/${basename}`),
                Helpers.publicPath(`projects/${project.id}/extra/${basename}`))

              project.content = project.content.replace(/\/tmp\//g, `/${project.id}/extra/`)
            }
          }
        }
      }

      if (errors.length > 0) {
        return response.status(401).json(errors)
      }

      project.title = data.title || project.title
      project.illustration = data.illustration || project.illustration
      project.draft = data.draft || project.draft
      project.thumbnail = data.thumbnail || project.thumbnail
      project.content = data.content || project.content
      project.images = data.images || project.images
      project.website = data.website || project.website
      project.github = data.github || project.github

      await project.save()
      await project.tags().detach()
      await project.tags().attach(tags)
      return response.status(200).json(project)
    }
  }

  async upload ({request, response}) {
    const file = request.file('file', {
      type: ['image']
    })

    const { id, type } = request.all()
    // available types: multi|extra
    if (id) {
      await file.move(Helpers.publicPath(`project/${id}`))
    }
    await file.move(Helpers.publicPath('projects/tmp'), {
      overwrite: true
    })

    if (!file.moved()) {
      return response.status(401).json(file.errors())
    } else {
      return response.status(200).json(`${Env.get('APP_URL')}/projects/tmp/${file.clientName}`)
    }
  }

  async deleteUploads ({request, response}) {
    const validation = await validate(request.all(), {
      urls: 'required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const { urls } = request.only(['urls'])
      for (const url in urls) {
        await Drive.delete(url)
      }

      return response.status(200).json('ok')
    }
  }

  async delete ({params, response}) {
    const project = await Project.find(params.id)
    if (!project) {
      return response.status(404).json(null)
    } else {
      await project.tags().detach()
      await project.delete()
      return response.status(200).json('ok')
    }
  }

  async publish ({request, response}) {
    const param = request.only(['id'])
    const project = await Project.find(param.id)
    project.draft = !project.draft
    await project.save()

    return response.status(200).json(project)
  }

  async related ({request, response}) {
    const validation = await validate(request.all(), {
      tag_id: 'integer|required',
      project_id: 'integer|required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const { tag_id, project_id } = request.all()
      const tag = await Tag.find(tag_id)
      const projects = await tag
        .project()
        .whereNot('id', project_id)
        .fetch()

      return response.status(200).json(projects)
    }
  }
}

module.exports = PortfolioController
