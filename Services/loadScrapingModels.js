var express = require('express');
//var fs = require('fs');
//var request = require('request');
//var cheerio = require('cheerio');
//var router = express.Router();
//var Article=require('../models/article.model');
var _xmodels={};
var _xitems=[];
var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;

exports.getSCRModels=new Promise(function(resolve,reject){
MongoClient.connect("mongodb://kloudsix.com:27017", function (err, client) {
    if(client.isConnected){
    var db=client.db("AIANews");
    db.collection('DataScrappers', function (err, collection) {
    var items=collection.find({});
     items.forEach(function(b){
      _xitems.push(b);
     });
       resolve(_xitems);
  })
}
  if(err) throw err;

             
});
    
  
  

});

