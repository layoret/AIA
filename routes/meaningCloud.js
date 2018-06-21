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
var RawArticle=require("../models/articleRaw.schema");
var ScrapeRules=require("../models/scraperules.schema");
var xpath=require("xpath");
var dom = require('xmldom').DOMParser;
//Outlet scraping models 
//var _models=require('../Services/loadScrapingModels');
//var scrapeModels=[];
var latestArticles=[];



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
  var _rawArticleModel=new RawArticle({});
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
      try{
        article.extended=JSON.parse(body);
     /* article.extended.entities=JSON.parse(body.entity_list);
      article.extended.concept=JSON.parse(body.concept_list);
      article.extended.quotes=JSON.parse(body.quotation_list);*/
      }catch(e){}
      var currentArticle=mongoose.model("RawArticle");
      console.log(article._id);
      //article.xcerpt="YOYO";
      currentArticle.findOneAndUpdate({_id:article._id},article,{new:true},function(error,result){
        if(error)
      res.json(mResponse.response(null, null, "something went wrong", null));
    else
       {
         console.log(result); 
       }
 });
      

})

},15000);
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


