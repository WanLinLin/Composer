var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var f = require('util').format;
var assert = require('assert');
var nodejieba = require('nodejieba');

console.log("loading dict...");
nodejieba.load({
  userDict: 'dict/dict.txt.big.txt'
});

/*==============================================
=            Database Configuration            =
==============================================*/
var user = encodeURIComponent('Leo');
var password = encodeURIComponent('Leo@composer');
var authMechanism = "DEFAULT";
var url = f("mongodb://%s:%s@localhost:27017/composer?authMechanism=%s", user, password, authMechanism);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Composer' });
});

router.post('/', function(req, res) {
  console.log(req.body);

  // cut the sentence
  var wordArr = nodejieba.cut(req.body.inputSentence);

  var rWord = wordArr.pop();
  var rRhyme = req.body.rhyme;
  var rNum = req.body.wordNum;
  var recWordArr = [];

  var request = {
    tWord: rWord,
    rhyme: rRhyme,
    num: rNum,
    fWords: wordArr
  };

  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    var relationCollection = db.collection("relations");
    var wordCollection = db.collection("words");
    var rhymeCollection = db.collection("rhymes");

    // find the tWord id
    wordCollection.findOne({word: request.tWord}, function(err, doc) {
      assert.equal(null, err);
      console.log("find the tWordId");

      var tWordId = doc._id;

      // find the words match the rhyme and the length
      wordCollection.find({rhyme: request.rhyme, $where: "this.word.length === " + request.num}).toArray(function(err, docs) {
        assert.equal(null, err);
        console.log("find " + docs.length + " nrWords");

        var nrWords = [];
        for (var i = 0; i < docs.length; i++) {
          nrWords.push(docs[i]._id);
        }

        // find the relations
        relationCollection.find(
          // query
          { f_word: tWordId,
          t_word: {$in: nrWords},
          link: {$gte: "1"} })
          // projection
          // { t_word: true })
        // sort in discending
        .sort({distance: -1})
        // limit
        .limit(10)
        .toArray(function(err, docs) {
          assert.equal(null, err);
          console.log("find the relations");

          // find the recommend word
          for (var i = 0; i < docs.length; i++) {
            wordCollection.findOne({_id: docs[i].t_word}, function(err, doc) {
              assert.equal(null, err);
              recWordArr.push(doc.word);

              // the end of query on db
              if (recWordArr.length === docs.length) {
                db.close();
                res.send(recWordArr);

                for (var i = 0; i < recWordArr.length; i++) {
                  console.log(recWordArr[i]);
                }
              }
            });
          }
        });
      });

    });
  });
});

module.exports = router;
