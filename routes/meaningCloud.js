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

var findArticles=new Promise(function(resolve,reject){
    var _rawArticleModel=new RawArticle({});
      _rawArticleModel.findAll(function(error,docs){
        //ScrapeRule.findOne({'ENTITY_CODE':'Hoy'},function(err,docs){
        latestArticles=docs;
        resolve(latestArticles);
      })
    }).catch(function(e){});
/* GET home page. */
var entries=0;
router.get('/', function(req, res, next) {
  
//[------------------------------------------------------------------
 
//-------------------------------------------------------------------]

//[-------------------------------------------------]
findArticles.then(function(_latestArticles){
  var idx=0;
  var endx=_latestArticles.length-200;
  var _latestArticles=_latestArticles;
  //Main function to extract meaning cloud entities data
  function analyze(){
      //console.log(_latestArticles.length-1);
      var article=  new RawArticle({});
      article= _latestArticles[idx];
      idx++;
      console.log(article._id);
      options.form.txt=article.bodyText;
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        try{
          article.extended=JSON.parse(body);
        }catch(e){}
        var currentArticle=mongoose.model("RawArticle");
        currentArticle.findOneAndUpdate({_id:article._id},{extended:article.extended},{new:false},function(error,result){
        if(error)
          res.json(mResponse.response(null, null, "something went wrong", null));
        else
       {
         console.log(result);
         console.log(idx); 
       }
       if(idx==endx){
        clearInterval(intervalObj);
        console.log("finished");
      }
 });
      

})

};
const intervalObj = setInterval(analyze,15000);

});
//---------------------------------------------------]
});

  
module.exports = router;


