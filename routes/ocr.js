var express = require('express');
var tesseract = require('tesseract');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/image', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
module.exports = router;
