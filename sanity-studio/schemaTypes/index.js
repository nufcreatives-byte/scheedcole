import {defineField, defineType} from 'sanity'

const imageField = (name, title) => defineField({
  name, title, type: 'image', options: {hotspot: true},
  fields: [defineField({name: 'alt', title: 'Image description', type: 'string'})]
})

const home = defineType({
  name: 'home', title: 'Home', type: 'document',
  fields: [
    defineField({name: 'title', title: 'Internal title', type: 'string', initialValue: 'Home'}),
    defineField({name: 'heroName', title: 'Name on cover', type: 'string'}),
    defineField({name: 'heroRole', title: 'Role on cover', type: 'string'}),
    imageField('heroImage', 'Cover photograph'),
    defineField({name: 'practiceStatement', title: 'The practice statement', type: 'text'}),
    defineField({name: 'aboutIntro', title: 'About introduction', type: 'text'}),
    defineField({name: 'contactText', title: 'Contact introduction', type: 'text'}),
    defineField({name: 'email', title: 'Contact email', type: 'string'})
  ]
})

const project = defineType({
  name: 'project', title: 'Work', type: 'document',
  fields: [
    defineField({name: 'title', title: 'Project title', type: 'string', validation: r => r.required()}),
    defineField({name: 'slug', title: 'Page address', type: 'slug', options: {source: 'title'}, validation: r => r.required()}),
    defineField({name: 'locationDate', title: 'Location and date', type: 'string'}),
    defineField({name: 'projectType', title: 'Type of work', type: 'string'}),
    defineField({name: 'summary', title: 'Short description', type: 'text'}),
    defineField({name: 'story', title: 'Project story', type: 'array', of: [{type: 'block'}]}),
    imageField('coverImage', 'Cover photograph'),
    defineField({name: 'gallery', title: 'Project photographs', type: 'array', of: [{type: 'image', options: {hotspot: true}, fields: [{name: 'alt', title: 'Image description', type: 'string'}]}]}),
    defineField({name: 'order', title: 'Display order', type: 'number', description: 'Smaller numbers appear first.'})
  ]
})

const press = defineType({
  name: 'press', title: 'Press', type: 'document',
  fields: [
    defineField({name: 'title', title: 'Article title', type: 'string', validation: r => r.required()}),
    defineField({name: 'publication', title: 'Publication', type: 'string'}),
    defineField({name: 'date', title: 'Date', type: 'date'}),
    defineField({name: 'dateLabel', title: 'Displayed date', type: 'string', description: 'Use when only the month or year is known.'}),
    defineField({name: 'relatedProject', title: 'Related project', type: 'reference', to: [{type: 'project'}]}),
    defineField({name: 'url', title: 'Article link', type: 'url', validation: r => r.required().uri({scheme: ['http', 'https']})})
  ]
})
export const schemaTypes = [home, project, press]
