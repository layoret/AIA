/* This route is for normalize and save as article schema an already NLP analyzed article*/
var express = require('express');
//var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var router = express.Router();
var _ = require('lodash');
var mongoose=require('mongoose');
//var MongoClient = require('mongodb').MongoClient;
var identityService=require('../Services/identity.service');
var db=require("../models/db");
var RawArticle=require("../models/articleRaw.schema");
var Article=require("../models/article.schema");
//var ScrapeRules=require("../models/scraperules.schema");
var latestArticles=[];
var entries=0;
var findArticles=new Promise(function(resolve,reject){
    var _rawArticleModel=new RawArticle({});
      _rawArticleModel.findNoNormalized(function(error,docs){
        //ScrapeRule.findOne({'ENTITY_CODE':'Hoy'},function(err,docs){
        latestArticles=docs;
        resolve(latestArticles);
      })
    }).catch(function(e){});
/* GET home page. */
var handleError=function(error){
  //throw new Error(error);
  console.log(error);

  }
  function getEntities(from,to){
    _.each(from.entity_list,function(entity){
      //console.log(entity.sementity.type+" for "+entity.form);
      sementity=entity.sementity.type.split(">");
      to.entities.push({
        category:entity.sementity.type,
        subtype:sementity[sementity.length-1],
        value:entity.form
      })
    })
  }
router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'text/html;charset=utf-8');
  findArticles.then(function(_latestArticles){
    console.log("Will be working with "+_latestArticles.length+" articles");
    var idx=0;
    var _latestArticles=_latestArticles;
    var endx=_latestArticles.length;
    //Main function to extract meaning cloud entities data
    if(endx>0){
      function normalize(){
        var rawArticleEntry=  new RawArticle({});
        var articleEntry=new Article({});
       //console.log(articleEntry);
        rawArticleEntry= _latestArticles[idx];
        idx++;
        res.write("<p>working with "+rawArticleEntry._id+"</p>");
        console.log(rawArticleEntry._id);
        //options.form.txt=rawArticleEntry.bodyText;
        if(rawArticleEntry.normalized!==true){
          //Populate the clean article from rawArticle
          //--------------- Non mutable values ------
          articleEntry.title=rawArticleEntry.title;
          articleEntry.newsId=rawArticleEntry.newsId;
          articleEntry.date=rawArticleEntry.date;
          articleEntry.dateCreated=rawArticleEntry.dateCreated;
          articleEntry.originalOutlet=rawArticleEntry.outlet;
          articleEntry.originalLink=rawArticleEntry.link;
          articleEntry.images=rawArticleEntry.images;
          articleEntry.tags=rawArticleEntry.tags;
          articleEntry.AIAbodyText=rawArticleEntry.bodyText;
          articleEntry.AIABodyHTML=rawArticleEntry.bodyHTML;
          articleEntry.AIAxcerpt=rawArticleEntry.xcerpt;
        //Load model to be able to save to mongodb
        var currentArticle=mongoose.model("RawArticle");
        //Article has extended data?
        var extendedSource=rawArticleEntry.extended;
        getEntities(extendedSource,articleEntry);
        //getOrganizations(raw)
        articleEntry.save(function (err,art) {
          if (err) {
            res.write("<p>Article"+" "+articleEntry._id+" Exists</p>");
           // article.handleError(err);
          }
          else{
            //console.log(art);
          }
        });
        currentArticle.findOneAndUpdate({_id:rawArticleEntry._id},{analyzed:rawArticleEntry.analyzed,normalized:false,lastUpdated:Date()},{new:false},function(error,result){
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

res.write("<p>done "+rawArticleEntry._id+" "+rawArticleEntry.title+" </p>");
      }
else{
  res.write("<p>Skipping"+rawArticleEntry._id+" "+rawArticleEntry.title+" </p>");
}
};
const intervalObj = setInterval(normalize,1500);
  }
  else{
    res.write("Nada que analizar");
  }
});

//---------------------------------------------------]
});

  
module.exports = router;


