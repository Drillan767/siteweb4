'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/
const Hash = use('Hash')
const Factory = use('Factory')
const Env = use('Env')

Factory.blueprint('App/Models/User', async () => {
  return {
    first_name: 'Joseph',
    last_name: 'Levarato',
    email: 'jlevarato@pm.me',
    profile_pic: 'http://placekitten.com/g/600/800',
    about_en: 'lorem ipsum dolor sic amet',
    about_fr: 'lorem ipsum dolor sic amet',
    job_title: 'Ingénieur DevOps',
    birthday: '1993-01-27',
    password: Env.get('USER_PASSWORD')
  }
})

Factory.blueprint('App/Models/Setting', () => {
  return {
    website_name: 'Joseph Levarato',
    dark_mode: true,
    social_medias: JSON.stringify({instagram: 'instagram', gitlab: 'gitlab', etc: 'etc'})
  }
})
