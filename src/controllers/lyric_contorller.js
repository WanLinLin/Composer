const f = require('util').format;
const nodejieba = require('nodejieba');
const mongoose = require('mongoose');

// Models
const Word = require('../models/word');
const Relation = require('../models/relation');

// DB configuration
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const url = f(`mongodb://${user}:${password}@${host}/googu`);

mongoose.Promise = Promise; // setup mongoose promise library
mongoose.connect(url);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// load jieba traditional Chinese dicttionary
nodejieba.load({ userDict: 'assets/dict.txt.big.txt' });

exports.recommendLyrics = function(req, res) {
  // cut the sentence
  const words = nodejieba.cut(req.body.inputSentence)
  console.log(words)
  const tailWord = words.pop()
  const rhyme = req.body.rhyme
  const wordNum = req.body.wordNum
  
  Promise.all([
    // find the tail word Id
    Word.getIdByWord(tailWord),
    // get the num and rhyme qualified words ids
    Word.getIdsByNR(wordNum, rhyme),
  ])
  .then(([tailWordId, numRhymeWordsIds]) =>
    Promise.all([
      // find the front words ids
      Word.getIdsByWords(words),
      // get num rhyme qualified related words ordered by link and distance
      Relation.findByFwTws(tailWordId, numRhymeWordsIds),
    ])
    .then(([frontWordsIds, numRhymeRelations]) =>
      Promise.all([
        // get rec words which exist in the same sentense with front words
        Relation.getCounts(frontWordsIds, numRhymeRelations)
        // sort by link, then distance, then count
        .then(res => res.sort((a, b) => {
          if(a.link > b.link) return -1;
          if(a.link < b.link) return 1;
          if(a.distance > b.distance) return -1;
          if(a.distance < b.distance) return 1;
          if(a.count > b.count) return -1;
          if(a.count < b.count) return 1;

          return 0;
        })),
        numRhymeWordsIds,
      ])
    )
  )
  .then(([recs, numRhymeWordsIds]) => {
    // recommend nr words if there's no relation to the sentence
    if (recs.length < 20) {
      const num = 20 - recs.length;

      // random nr words
      numRhymeWordsIds.sort(function() {
        return 0.5 - Math.random();
      });

      return Word.find({
        _id: { $in: numRhymeWordsIds.slice(0, num) }
      })
      .exec()
      .then(res => ({
        recs,
        nrs: res,
      }))
    }
    
    return {recs}
  })
  .then(({recs = [], nrs = []}) => 
    res.json({words: [
      ...recs.map(rec => rec.t_word[0].word),
      ...nrs.map(nr => nr.word),
    ]})
  )
};

