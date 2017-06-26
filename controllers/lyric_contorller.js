var f = require('util').format;
var assert = require('assert');
var nodejieba = require('nodejieba');
var mongoose = require('mongoose');
var async = require('async');

// Models
var Word = require('../models/word');
var Relation = require('../models/relation');

// DB configuration
var db;
var user = encodeURIComponent('Leo');
var password = encodeURIComponent('Leo@composer');
var authMechanism = "DEFAULT";
var url = f("mongodb://%s:%s@localhost:27017/composer?authMechanism=%s", user, password, authMechanism);

// connect to mongodb
mongoose.connect(url);
db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// load jieba traditional Chinese dicttionary
nodejieba.load({ userDict: 'dict/dict.txt.big.txt' });

exports.recommendLyrics = function(req, res) {

  // cut the sentence
  var words = nodejieba.cut(req.body.inputSentence);
  // the last word
  var tWord = words.pop();
  var rhyme = req.body.rhyme;
  var num = req.body.wordNum;

  async.waterfall([
    function(callback) {
      Word.findOne({ word: tWord }).exec(function (err, word) {
        assert.equal(null, err);
        callback(null, word._id);
      });
    },
    function(tWordId, callback) { 
      Word
      .find({
        rhyme: rhyme,
        $where: 'this.word.length === ' + num
      })
      .select('_id')
      .exec(function(err, nrWordIds) {
        assert.equal(null, err);
        callback(null, tWordId, nrWordIds);
      });
    }, 
    function(tWordId, nrWordIds, callback) {
      Relation
      .find({
        f_word: tWordId,
        t_word: { $in: nrWordIds },
        link: { $gte: 1 }
      })
    // .limit(10)
    .sort({ distance: -1 })
    .populate('t_word')
    .exec(function (err, relations) {
      assert.equal(null, err);
      callback(null, relations);
    });
  }
  ], function (err, result) {
    assert.equal(null, err);
    var words = [];

    for (var i = 0; i < result.length; i++) {
      words.push(result[i].t_word[0].word);
    }

    res.render('lyric', { title: 'Composer', words: words });
  }
  );
  
};