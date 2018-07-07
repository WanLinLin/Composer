const f = require('util').format;
const mongoose = require('mongoose');

// setup mongoose promise library
mongoose.Promise = Promise;

// DB configuration
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const url = f(`mongodb://${user}:${password}@${host}/googu`);

module.exports = () => {
  mongoose.connect(url);
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  return db
}
