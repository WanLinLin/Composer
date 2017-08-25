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

RelationSchema.statics.findByFwTws = function(fWordId, tWordsIds, callback) {
  this.find({
    f_word: fWordId,
    t_word: { $in: tWordsIds }
  })
  .populate('t_word')
  .limit(20)
  .exec((err, res) => {
    assert.equal(null, err);
    callback(res);
  });
};

RelationSchema.statics.getCounts = function(fWordsIds, tRels, callback) {
  let rels = [];

  // return an empty array when tRels is empty
  if (tRels.length === 0) {
    return callback([]);
  }

  for (let i = 0; i < tRels.length; i++) {
    rels[i] = tRels[i].toObject();
    let tWord = rels[i].t_word[0]._id;

    this.count({
      f_word: { $in: fWordsIds },
      t_word: tWord,
    })
    .exec((err, res) => {
      rels[i].count = res;

      if(i === tRels.length - 1) callback(rels);
    });
  }
};

module.exports = mongoose.model('Relation' , RelationSchema, 'relations');