var express = require('express');
//var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var router = express.Router();
var _ = require('lodash');
var mongoose=require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var identityService=require('../Services/identity.service');
var db=require("../models/db");
var ArticleRaw=require("../models/articleRaw.schema");
var ScrapeRules=require("../models/scraperules.schema");
var xpath=require("xpath");
var dom = require('xmldom').DOMParser;
//Outlet scraping models 
//var _models=require('../Services/loadScrapingModels');
//var scrapeModels=[];
var latestArticles=[];
var currentArticle=new ArticleRaw({});


var options = { method: 'POST',
  url: 'http://api.meaningcloud.com/topics-2.0',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  form: 
   { key: 'f1dcc2e4bd96f96e123bff9cd68c0dcf',
     lang: 'es',
     txt: '',
     url:'',
     doc:'',
     tt: 'ecq' } };


/* GET home page. */
var entries=0;
router.get('/', function(req, res, next) {
  var _rawArticleModel=new ArticleRaw({});
  //[------------------------------------------------------------------
  var findArticles=new Promise(function(resolve,reject){
    _rawArticleModel.findAll(function(error,docs){
      //ScrapeRule.findOne({'ENTITY_CODE':'Hoy'},function(err,docs){
      latestArticles=docs;
      resolve(latestArticles);
    })
  }).catch(function(e){});
  //-------------------------------------------------------------------]
  //console.log(latestArticles);
  
  //scrapeModels=docs;
 
  //console.log(scrapeModels);
  //var scrModel=scrapeModels[0];
  //var outlets=0;
/*var getMeaning=new Promise(function(resolve,reject){2
    console.log(currentArticle);
    entries++;
    options.form.txt=currentArticle.bodyText;
    //consol(options);
  /*request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(entries);
    resolve(body);*/
  

//}).catch(function(e){

//});
//[-------------------------------------------------]
findArticles.then(function(_latestArticles){
  console.log(_latestArticles.length);
_.each(_latestArticles,function(article){
  //var entries=0;
 // article=new ArticleRaw();
  //article=_article;
  options.form.txt=article.bodyText;
  setTimeout(function(){
  request(options, function (error, response, body) {
      if (error) throw new Error(error);
      //console.log(body);
      //article.extended=JSON.stringify(body);
      console.log(article._id);
      article.update({_id:article._id},{$set:{xcerpt:"YOYO"}},{safe : true, upsert : true, new : true},function(a){
        console.log(a);
      })

})
  },5000);
  
  //currentArticle=article;
  //console.log(article.title);
  //getMeaning.then(function(){
  //  console.log("Done");
  //})
  //options.form.txt=currentArticle.title;
  //console.log(article);
});
});
//---------------------------------------------------]
});

  
module.exports = router;


