const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

morgan.token('body', (req) => JSON.stringify(req.body))

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))

let persons = [
      { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
  
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const numberofpersons = persons.length
    const date = new Date().toString()
    response.send(`Phonebook has info for ${numberofpersons} people <br /><br />${date}`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => {
      return p.id === id
    })
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const theids = persons.map(p=>p.id)
  if (theids.includes(id)) {
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
  } else {
    return response.status(400).json({ 
      error: 'person does not exist' 
    })
  }
})

const generateId = () => {
  const max = 120
  const theids = persons.map(p=>p.id)
  let randomNum = Math.floor(Math.random()*max) + 1
  while (theids.includes(randomNum)) randomNum = Math.floor(Math.random()*max) + 1
  return randomNum
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log('requet body', request.body)
  if (!body) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  if (!body.number) {
    return response.status(401).json({ 
      error: 'number missing' 
    })
  }

  if (!body.name) {
    return response.status(402).json({ 
      error: 'name missing' 
    })
  } else {
    const thenames = persons.map(p => p.name.toLocaleLowerCase())
    if (thenames.includes(body.name.toLowerCase())) {
      return response.status(403).json({ 
        error: 'name must be unique' 
      })
    }
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})