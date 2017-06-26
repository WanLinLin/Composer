var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RelationSchema = new Schema({ 
  f_word: [{ type: Schema.Types.ObjectId, ref: 'Word' , required: true}],
  t_word: [{ type: Schema.Types.ObjectId, ref: 'Word' , required: true}],
  link: { type: Number, required: true },
  distance: { type: Number, required: true }
});

module.exports = mongoose.model('Relation' , RelationSchema, 'relations');