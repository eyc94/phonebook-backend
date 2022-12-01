const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

morgan.token('data', function (req, res) {
  return JSON.stringify(req.body);
});

app.use(morgan(':method :url :status :res[content-length] :response-time ms :data'));

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
];

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/info', (request, response) => {
  const now = new Date();
  const numberOfPersons = persons.length;
  response.send(`
    <p>Phonebook has info for ${numberOfPersons} people</p>
    <p>${now}</p>
  `)
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(p => p.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);
  return response.status(204).end();
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

  if (persons.filter(p => p.name.toLowerCase() === body.name.toLowerCase()).length > 0) {
    return response.status(400).json({
      error: 'The name already exists in the phonebook'
    });
  }

  const person = {
    id: Math.floor(Math.random() * 99999999),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
