var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SentenceSchema = new Schema({ 
  author: { type: String, required: true },
  words: [{ type: Schema.Types.ObjectId, ref: 'Word' }],
  sentence: { type: String, required: true }
});

module.exports = mongoose.model('Sentence', SentenceSchema, 'sentences');