var express = require('express');
//var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var router = express.Router();
var Article=require('../models/article.model');
var models=[];
var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
router.get('/', function(req, res, next) {
MongoClient.connect("mongodb://kloudsix.com:27017", function (err, client) {
    
    if(client.isConnected){
    console.log("wei");
      var db=client.db("AIANews");
    db.collection('DataScrappers', function (err, collection) {
    if(err){
      console.log(err);
    }
    var items=collection.find({});
    console.log(items);
    //.then(function(err,items){
     items.forEach(function(b){
       models.push(b);
     })
   
  })
}
  if(err) throw err;

  //Write databse Insert/Update/Query code here..
             
});
      //console.log(models);
      res.send(models);

  
  
  
});

module.exports = router;
