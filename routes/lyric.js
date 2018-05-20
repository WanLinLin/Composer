var express = require('express');
var router = express.Router();
var lyricController = require('../controllers/lyric_contorller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('lyric', { title: 'googu' });
});

router.post('/', function(req, res) {
  lyricController.recommendLyrics(req, res);
});

module.exports = router;