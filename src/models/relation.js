const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const assert = require('assert');

let RelationSchema = new Schema({ 
  f_word: [{ type: Schema.Types.ObjectId, ref: 'Word' , required: true}],
  t_word: [{ type: Schema.Types.ObjectId, ref: 'Word' , required: true}],
  link: { type: Number, required: true },
  distance: { type: Number, required: true }
});

RelationSchema.statics.findByFwTws = function(fWordId, tWordsIds) {
  return this.find({
    f_word: fWordId,
    t_word: { $in: tWordsIds }
  })
  .populate('t_word')
  .limit(20)
  .exec()
}

RelationSchema.statics.getCounts = function(fWordsIds, tRels) {
  // return an empty array when tRels is empty
  if (tRels.length === 0) {
    return Promise.resolve([])
  }

  return Promise.all(tRels.map((function(rel, i) {
    return this.count({
      f_word: { $in: fWordsIds },
      t_word: rel.t_word[0]._id,
    })
    .exec()
    .then(count => ({
      ...rel.toObject(),
      count,
    }))
  }).bind(this)))
};

module.exports = mongoose.model('Relation' , RelationSchema, 'relations');