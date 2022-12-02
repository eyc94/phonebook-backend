const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>');
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://admin:${password}@cluster0.b6luilg.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length > 3) {
  mongoose
    .connect(url)
    .then(() => {
      const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
      });

      return person.save();
    })
    .then(() => {
      console.log(`Added ${process.argv[3]} number ${process.argv[4]} to the Phonebook!`);
      return mongoose.connection.close();
    });
}

if (process.argv.length === 3) {
  mongoose
    .connect(url)
    .then(() => {
      Person.find({}).then(result => {
        console.log('Phonebook:');
        result.forEach(person => {
          console.log(person.name, person.number);
        });
        mongoose.connection.close();
      });
    })
    .catch((err) => console.log(err));
}
