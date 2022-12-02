require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
const app = express();

app.use(express.static('build'));
app.use(express.json());
app.use(cors());

morgan.token('data', function (req, res) {
  return JSON.stringify(req.body);
});

app.use(morgan(':method :url :status :res[content-length] :response-time ms :data'));

app.get('/api/persons', (request, response) => {
  Person.find({}).then(person => {
    response.json(person);
  });
});

app.get('/info', (request, response) => {
  Person.countDocuments()
    .then(result => {
      response.send(`
        <p>Phonebook has info for ${result} people</p>
        <p>${new Date()}</p>
      `);
    })
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name && !body.number) {
    return response.status(400).json({
      error: 'Name and number are missing'
    });
  }

  if (!body.name) {
    return response.status(400).json({
      error: 'Name is missing'
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'Number is missing'
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then(savedPerson => {
    response.json(savedPerson);
  });
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  next(error);
}

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
