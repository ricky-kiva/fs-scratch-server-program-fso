const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')

require('dotenv').config()

const Note = require('./models/note')

const app = express()

morgan.token('post-body', (req, res) => {
    if (req.method === 'POST' && req.body) {
        return JSON.stringify(req.body)
    }
    return ' '
})

const unknownEndpoint = (request, response) =>
    response.status(404).send({
        status: 'error', 
        message: 'Unknown Endpoint'
    })

app.use(express.json()) // impl. json-parser on Express
app.use(cors())
app.use(express.static('dist')) // make Express show static content from `dist` dir.
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))

/* Overridden by Morgan
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
} */

// app.use(requestLogger) // impl. custom middleware

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response) => {
    const id = request.params.id

    Note.findById(id)
        .then(note => 
            note 
                ? response.json(note) 
                : response.status(404).end() // handle if no res. with such `id` is found
        )
        .catch(error => {
            console.log(error)
            response.status(400).send({ error: 'malformatted id' }) // handle if `id` is not in MongoDB `id` format
        })
})

app.post('/api/notes', (request, response) => {
    const body = request.body

    if (body.content === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false
    })

    note.save().then(savedNote => { response.json(savedNote) })
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0
    return maxId + 1
}

app.use(unknownEndpoint) // impl. custom middleware

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})