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
      _rawArticleModel.findNoAnalyzed(function(error,docs){
        //ScrapeRule.findOne({'ENTITY_CODE':'Hoy'},function(err,docs){
        latestArticles=docs;
        resolve(latestArticles);
      })
    }).catch(function(e){});
/* GET home page. */
var entries=0;
router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'text/html;charset=utf-8');
  //res.setHeader('Content-Encoding', 'utf-8');
//[------------------------------------------------------------------
 
//-------------------------------------------------------------------]

//[-------------------------------------------------]
var handleError=function(error){
  //throw new Error(error);
console.log(error);

}

findArticles.then(function(_latestArticles){
  var idx=0;
  var _latestArticles=_latestArticles;
  var endx=_latestArticles.length;
  //Main function to extract meaning cloud entities data
  if(endx>0){
  function analyze(){
    
      var rawArticleEntry=  new RawArticle({});
      rawArticleEntry= _latestArticles[idx];
      idx++;
      res.write("<p>working with "+rawArticleEntry._id+"</p>");
      console.log(rawArticleEntry._id);
      options.form.txt=rawArticleEntry.bodyText;
      if(rawArticleEntry.analyzed!==true){
      request(options, function (error, response, body) {
        if (error) handleError(error);
        try{
          //Grab the extended info
          rawArticleEntry.extended=JSON.parse(body);
          rawArticleEntry.analyzed=true;
          rawArticleEntry.normalized=false;
        }catch(e){}
        //Load model to be able to save to mongodb
        var currentArticle=mongoose.model("RawArticle");
        //Article has extended data?
        currentArticle.findOneAndUpdate({_id:rawArticleEntry._id},{extended:rawArticleEntry.extended,analyzed:rawArticleEntry.analyzed,normalized:false,lastUpdated:Date()},{new:false},function(error,result){
        if(error)
          res.json(mResponse.response(null, null, "something went wrong", null));
        else
       {
        
         //console.log(result);
         console.log(idx); 
       }
       if(idx==endx){
        clearInterval(intervalObj);
        console.log("finished");
      }
      
        
 });
      

})
res.write("<p>done "+rawArticleEntry._id+" "+rawArticleEntry.title+" </p>");
      }
else{
  res.write("<p>Skipping"+rawArticleEntry._id+" "+rawArticleEntry.title+" </p>");
}
};
const intervalObj = setInterval(analyze,15000);
  }
  else{
    res.write("Nada que analizar");
  }
});

//---------------------------------------------------]
});

  
module.exports = router;


