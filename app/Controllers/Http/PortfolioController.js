'use strict'

const Project = use('App/Models/Project')
const Drive = use('Drive')
const Env = use('Env')
const Helpers = use('Helpers')
const { validate } = use('Validator')

class PortfolioController {
  async index ({response}) {
    const projects = await Project.query().with('tags').fetch()
    return response.status(200).json(projects)
  }

  async store ({request, response}) {
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
      let illustration = ''
      let images = []
      let errors = []
      const {title, draft, extra, website, github} = request.all()
      let {content} = request.all()
      const tags = request.input('tags').split(',').map(Number)

      const project = await Project.create({title, draft, content, website, github, illustration, images})
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
        illustration = `${Env.get('APP_URL')}/projects/${project.id}/${single.clientName}`
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
        images = multi.movedList().map(
          image => {
            return `${Env.get('APP_URL')}/projects/${project.id}/images/${image.clientName}`
          }
        )
      }

      // Handling extras

      if (extra && extra.length > 0) {
        for (let i = 0; i < extra.length; i++) {
          if (content.includes(extra[i])) {
            const basename = extra[i].split(/[\\/]/).pop()
            await Drive.move(Helpers.publicPath(`projects/tmp/${basename}`),
              Helpers.publicPath(`projects/${project.id}/extra/${basename}`))

            content = content.replace(/\/tmp\//g, `/${project.id}/extra/`)
          }
        }
      }

      if (errors.length > 0) {
        return response.status(401).json(errors)
      }

      project.illustration = illustration
      project.images = images
      project.content = content
      await project.save()

      return response.status(200).json(project)
      /* Need to handle images, extras and illustration */
    }
  }

  async upload ({request, response}) {
    const file = request.file('file', {
      type: ['image']
    })

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

    return response.status(200).json(post)
  }
}

module.exports = PortfolioController
