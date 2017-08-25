const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const assert = require('assert');

let WordSchema = new Schema({ 
  word: { type: String, required: true },
  rhyme: { type: String, required: true }
});

/*======================================
=            Static Methods            =
======================================*/

WordSchema.statics.getIdByWord = function (word, callback) {
  this.findOne({ word: word })
  .select('_id')
  .exec((err, res) => {
    assert.equal(null, err);
    callback(res);
  });
};

WordSchema.statics.getIdsByWords = function (words, callback) {
  this.find({
    word: { $in: words }
  })
  .select('_id')
  .exec((err, res) => {
    assert.equal(null, err);
    callback(res);
  });
};

WordSchema.statics.getIdsByNR = function (num, rhyme, callback) {
  this.find({
    rhyme: rhyme,
    $where: 'this.word.length === ' + num
  })
  .select('_id')
  .exec((err, res) => {
    assert.equal(null, err);
    callback(res);
  });
};

module.exports = mongoose.model('Word', WordSchema, 'words');