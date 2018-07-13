var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var router = express.Router();
//var Article=require('../models/article.model');
var models=[];
//var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
//For simple query we use the mongoclient native db
//The default route
router.get('/', function(req, res, next) {
//connect to mongodb
MongoClient.connect("mongodb://kloudsix.com:27017", function (err, client) {
    
    if(client.isConnected){
   // console.log("wei");
    var db=client.db("AIANews");
    db.collection('DataScrappers', function (err, collection) {
    if(err){
      console.log(err);
    }
    var items=collection.find({});
     items.forEach(function(b){
       models.push(b);
     })
   
  })
}
  if(err) throw err;
             
});
      //Return the scrapping models
      res.send(models);
});

module.exports = router;
