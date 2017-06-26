var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WordSchema = new Schema({ 
  word: { type: String, required: true },
  rhyme: { type: String, required: true }
});

module.exports = mongoose.model('Word', WordSchema, 'words');