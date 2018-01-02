// Requires
const express = require('express'); // HTTP engine
const shortid = require('shortid'); // ID generator

const collName = 'items'; // Collection name

var getItemById = (db, id) => {
  var item = db
  .get(collName)
  .find({ id })
  .value();
  return filterRaw(item);
}

var filterRaw = raw => {
  return Object.assign(raw, {
    index: undefined
  })
}

// Items router declaration
const items = express.Router();
items.get('/', function (req, res) {
  var items = req.db
  .get(collName)
  .sortBy('index')
  .value();
  res.json(items.map(raw => filterRaw(raw)));
});

items.get('/:id', function (req, res) {
  var id = req.params.id;
  var item = getItemById(req.db, id);
  if (!item) return res.status(404).json({
    error: `no item with id '${id}' was found`
  })
  res.json(item);
});

items.delete('/:id', function (req, res, next) {
  var id = req.params.id;
  var item = getItemById(req.db, id);
  if (!item) return res.status(404).json({
    error: `no item with id '${id}' was found`
  })

  var lastIndex = req.db.get(collName)
  .size()
  .value() - 1;

  for(var i = item.index + 1; i <= lastIndex; i++ ) {
    req.db.get(collName)
    .find({ index: i })
    .assign({ index: i - 1})
    .write()
  }

  req.db.get(collName)
  .remove({ id })
  .write()

  res.json(true);
});

items.post('/', express.json(), function (req, res) {
  var id = shortid.generate();
  var index = req.db.get(collName)
  .size()
  .value();
  req.db
    .get(collName)
    .push(Object.assign({}, req.body, { id, index }))
    .write();

  var item = req.db
    .get(collName)
    .find({ id })
    .value();
  
  res.json(item);
});

module.exports = items;