require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

morgan.token('body', (req) => JSON.stringify(req.body))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
  
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })  
    
})

app.get('/info', (request, response) => {
    Person.find({})
      .then(persons => {
        const numberofpersons = persons.length
        const date = new Date().toString()
        console.log('persons...', persons);
        response.send(`<div><p>Phonebook has info for ${numberofpersons} people</p><p>${date}</p></div>`)    
      })      
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
      .then(person => {
        if (person) {
          response.json(person)
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
})

/* used in exercise 3.??
  const generateId = () => {
  const max = 120
  Person.find({})
    .then(persons => {
      const theoldids = persons.map(p=>p.oldid)
      let randomNum = Math.floor(Math.random()*max) + 1
      if (persons) {
        while (theoldids.includes(randomNum)) randomNum = Math.floor(Math.random()*max) + 1
      }
      return randomNum
    })      
}
 */

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log('requet body post', request.body)
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
/*     const thenames = persons.map(p => p.name.toLocaleLowerCase())
    if (thenames.includes(body.name.toLowerCase())) {
      return response.status(403).json({ 
        error: 'name must be unique' 
      })
    }
 */   

    const person = new Person({
      //oldid: generateId(),
      name: body.name,
      number: body.number,
    })

    person.save()
      .then(savedPerson => {
        response.json(savedPerson)
      })
      .catch(error => next(error))
  }  
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})