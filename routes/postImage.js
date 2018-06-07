var express = require('express');
var tesseract = require('tesseract.js');
var router = express.Router();
const fileType = require('file-type')
const fs = require('fs')
const multer = require('multer');
var urlToImage = require('url-to-image');
var img="images/google.png";
var urx="http://google.com google.png";

    request = require('request');

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};




router.get('/x/:url', (req, res) => {
   // res.render("hello");
    download(req.params.url, 'googlex.png', function(){
        console.log('done');
    });
    res.end();
//console.log(m);
})
module.exports = router;
