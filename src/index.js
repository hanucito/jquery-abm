// Config
const PORT = 3000;
const DB_FILENAME = `${__dirname}/db.json`;

// Requires
const express = require('express'); // HTTP engine
const lowdb = require('lowdb'); // DB engine
const FileSync = require('lowdb/adapters/FileSync'); // DB adapter

// MockUp DB initialization: I'm using LowDB to mock up a database engine for demo purposes only

const db = lowdb(new FileSync(DB_FILENAME));
db
  .defaults({ items: [], user: {} })
  .write();

// App Server initialization
const app = express();

// Stores db instance in request object for all api endpoints
app.all('/api/*', (req, res, next) => {
  req.db = db;
  next();
});

app.use('/api/items', require('./routes/items'));

// Generic 404 for all non existant api endpoints
app.all('/api/*', (req, res, next) => {
  res.status(404).json({
    error: 'endpoint not available'
  });
});

app.use(express.static(__dirname + '/public'));

app.listen(PORT, function () {
  console.log(`LowDB Rest-API running on ${PORT}`);
});