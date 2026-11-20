const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(express.urlencoded({ extended: false }));
const users = [];
const exercises = [];

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', function (req, res) {
  const newUser = { username: req.body.username, _id: String(users.length + 1)};
  users.push(newUser);

  res.json(newUser);
});

app.get('/api/users', function (req, res) {
  res.json(users);
});

app.post('/api/users/:_id/exercises', function (req, res) {
  const user = users.find(u => u._id === req.params._id);
  if (!user) {
  return res.json({ error: 'user not found' });
}

  const date = req.body.date ? new Date(req.body.date + 'T00:00:00') : new Date();

  const exercise = {
    userId: user._id,
    description: req.body.description,
    duration: Number(req.body.duration),
    date: date
  };
  exercises.push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    date: date.toDateString(),
    duration: exercise.duration,
    description: exercise.description
  });
});

app.get('/api/users/:_id/logs', function (req, res) {
  const user = users.find(u => u._id === req.params._id);
  if (!user) {
    return res.json({ error: 'user not found' });
  }

  let userExercises = exercises.filter(e => e.userId === user._id);
  

if (req.query.from) {
  const from = new Date(req.query.from + 'T00:00:00');
  userExercises = userExercises.filter(e => e.date >= from);
}

if (req.query.to) {
  const to = new Date(req.query.to + 'T00:00:00');
  userExercises = userExercises.filter(e => e.date <= to);
}

if (req.query.limit) {
  userExercises = userExercises.slice(0, Number(req.query.limit));
}


  const log = userExercises.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString()
  }));

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

