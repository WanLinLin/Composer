const f = require('util').format;
const assert = require('assert');
const nodejieba = require('nodejieba');
const mongoose = require('mongoose');
const async = require('async');

// Models
const Word = require('../models/word');
const Relation = require('../models/relation');

// DB configuration
let db;
let user = encodeURIComponent('Leo');
let password = encodeURIComponent('Leo@googu');
let authMechanism = "DEFAULT";
let url = f("mongodb://%s:%s@localhost:27017/googu?authMechanism=%s", user, password, authMechanism);

// connect to mongodb
mongoose.connect(url);
db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// load jieba traditional Chinese dicttionary
nodejieba.load({ userDict: 'dict/dict.txt.big.txt' });

exports.recommendLyrics = function(req, res) {
  // cut the sentence
  let words = nodejieba.cut(req.body.inputSentence);
  console.log(words);
  // the last word
  let tWord = words.pop();
  let rhyme = req.body.rhyme;
  let num = req.body.wordNum;

  let fWordIds;
  let tWordId;
  let nrWordIds;

  async.waterfall([
    // find the tail word Id
    function(callback) {
      Word.getIdByWord(tWord, function(res) {
        tWordId = res;
        callback(null);
      });
    },
    // find the front words ids
    function(callback) {
      Word.getIdsByWords(words, function(res) {
        fWordIds = res;
        callback(null);
      });
    },
    // get the num and rhyme qualified words ids
    function(callback) { 
      Word.getIdsByNR(num, rhyme, function(res) {
        nrWordIds = res;
        callback(null);
      });
    },
    // get num rhyme qualified related words ordered by link and distance
    function(callback) {
      Relation.findByFwTws(tWordId, nrWordIds, function(res) {
        callback(null, res);
      });
    },
    // get rec words which exist in the same sentense with front words
    function(nrlRels, callback) {
      Relation.getCounts(fWordIds, nrlRels, function(res) {

        // sort by link, then distance, then count
        res.sort((a, b) => {
          if(a.link > b.link) return -1;
          if(a.link < b.link) return 1;
          if(a.distance > b.distance) return -1;
          if(a.distance < b.distance) return 1;
          if(a.count > b.count) return -1;
          if(a.count < b.count) return 1;

          return 0;
        });
        callback(null, res);
      });
    },
    // recommend nr words if there's no relation to the sentence
    function(recs, callback) {
      if (recs.length < 20) {
        let num = 20 - recs.length;

        // random nr words
        nrWordIds.sort(function() {
          return 0.5 - Math.random();
        });

        Word.find({
          _id: { $in: nrWordIds.slice(0, num) }
        })
        .exec(function (err, res) {
          assert.equal(null, err);
          callback(null, {recs: recs, nr: res});
        });
      }
      else {
        callback(null, {recs: recs});
      }
    }
    ],
    function (err, result) {
      assert.equal(null, err);
      let words = [];

      for (let i = 0; i < result.recs.length; i++) {
        words.push(result.recs[i].t_word[0].word);
      }

      if (result.nr) {
        for (let i = 0; i < result.nr.length; i++) {
          words.push(result.nr[i].word);
        }
      }

      res.json({words: words});
    }
  );

};

