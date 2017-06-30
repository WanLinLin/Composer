const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const assert = require('assert');

let RelationSchema = new Schema({ 
  f_word: [{ type: Schema.Types.ObjectId, ref: 'Word' , required: true}],
  t_word: [{ type: Schema.Types.ObjectId, ref: 'Word' , required: true}],
  link: { type: Number, required: true },
  distance: { type: Number, required: true }
});

/*======================================
=            Static Methods            =
======================================*/

RelationSchema.statics.getRelations = function(fWord, tWords, callback) {
  this.find({
    f_word: fWord ,
    t_word: { $in: tWords },
    link: { $gte: 1}
  })
  .sort({ distance: -1 })
  .populate('f_word')
  .populate('t_word')
  .exec(function (err, res) {
    assert.equal(null, err);
    callback(res);
  });
};

module.exports = mongoose.model('Relation' , RelationSchema, 'relations');