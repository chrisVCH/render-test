const mongoose = require('mongoose')

if (process.argv.length !== 5 && process.argv.length !== 3) {
  console.log('give password, name and number as arguments or password ONLY as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.vyk604h.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {

    const pname = process.argv[3]
    const pnumber = process.argv[4]
    const person = new Person({
        name: pname,
        number: pnumber,
      })
      
      person.save().then(result => {
        console.log(`added ${pname} number ${pnumber} to phonebook`)
        mongoose.connection.close()
      })
} else {
    Person
        .find({})
        .then(persons => {
            console.log('phonebook:')
            persons.forEach(person => {
                console.log(`${person.name} ${person.number}`)
            })
            mongoose.connection.close()
        })
}
