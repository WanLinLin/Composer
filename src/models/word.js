const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const assert = require('assert');

const WordSchema = new Schema({
  word: { type: String, required: true },
  rhyme: { type: String, required: true }
});

WordSchema.statics.getIdByWord = function(word) {
  return this.findOne({ word: word })
    .select('_id')
    .exec()
}

WordSchema.statics.getIdsByWords = function (words) {
  return this.find({
    word: { $in: words }
  })
    .select('_id')
    .exec()
}

WordSchema.statics.getIdsByNR = function (num, rhyme) {
  return this.find({
    rhyme: rhyme,
    $where: 'this.word.length === ' + num
  })
    .select('_id')
    .exec()
}

module.exports = mongoose.model('Word', WordSchema, 'words');