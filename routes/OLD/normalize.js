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
var scrapeModels=[];
var articles={
  data:[]
};
var dataNormalizer=function(type,input,non){
  var result="";
    if(type==="header"){
      _.each(non,function(x){
        result=input.replace(x,"");
      })
    
    }
    return result;
}
var linkNormalizer=function(_value,_base){  
  if(_value.indexOf("http",0)){
    return _value;
  }
  else{
    return _base+_value;
  }
}

/* GET home page. */

router.get('/', function(req, res, next) {

  var ScrapeRule=new ScrapeRules({});
  ScrapeRule.findAll(function(err,docs){
  //ScrapeRule.findOne({'ENTITY_CODE':'Hoy'},function(err,docs){
  scrapeModels=docs;
 
  //console.log(scrapeModels);
  //var scrModel=scrapeModels[0];
  var outlets=0;
_.each(scrapeModels,function(scrModel){
  var entries=0;
  //We have the scrapemodels for each news outlet
  //Iterate over each entity and scrape it
  //_.each(scrapeModels,function(scrModel){
  //Make the request
  //var url=scrModel.ENTITY_URL;
  var extract=new Promise(function(resolve,reject){
    request(scrModel.ENTITY_URL, function(error, response, html){
    if(!error){
      var url=scrModel.ENTITY_URL;
      //Load headline content
      var $ = cheerio.load(html);
      // Let's extract each headline
      $(scrModel.ARTICLE_ENTRY).each(function(){
        entries++;
        //console.log(entries);
        var article=new ArticleRaw();
        var data = $(this);  
          article.title =dataNormalizer("header",data.find(scrModel.TITLE_SELECTOR).text(),["|Fotos","|Video","Fotos:"]);
           
            if(article.title.length>0){
              //console.log(article.title); 
              //Set the base outlet url for article
              article.outlet=url;
              //Set the unique id as hash of title + outlet URL
              article.newsId=identityService.HASHtoId(article.title+article.outlet);
              article.mainCategory=data.find(scrModel.ARTICLE_MAIN_CATEGORY).text();
              article.xcerpt=data.find(scrModel.ARTICLE_XCERPT).text();
              //Extract xcerpt image if exist and add it to images array
              var xcerptImage=data.find(scrModel.XCERPT_IMAGE).attr('src');
               if(xcerptImage){
                article.images.push(xcerptImage);
              }
              //console.log(article.xcerpt);
              //Extract the detail link
              if(data.find(scrModel.RECIPE_DETAIL).attr('href')){
                article.link=data.find(scrModel.RECIPE_DETAIL).attr('href');
              }
              else{
                article.link=data.find('a').attr('href');
              }
              if(article.link.indexOf("http",0)){
                article.link=article.outlet+article.link;
              }
              //console.log(article.link);
              //--- ARTICLE DETAIL AFTER LINK ---------
              //Now with the link let's go deeper and scrape the detail
              request(article.link, function(error, response, html){
                if(!error){
                  var _$ = cheerio.load(html);
                  //Let's take the real date based on meta-tags
                  try{
                  article.setDate(_$(scrModel.RECIPE_DATE_GET.split("/@")[0]).attr(scrModel.RECIPE_DATE_GET.split("/@")[1]));
                  }catch(e){}
                  //Article tags for tag-cloud found on meta-tags
                  try{
                  _$(scrModel.RECIPE_TAGS.split("/@")[0]).each(function(){
                    article.tags.push(_$(this).attr(scrModel.RECIPE_TAGS.split("/@")[1]));
                    
                  });
                  article.images.push(_$(scrModel.ARTICLE_IMAGE_1.split("/@")[0]).attr(scrModel.ARTICLE_IMAGE_1.split("/@")[1]));
                }catch(e){}
                  //--- ARTICLE MAIN CONTENT BODY ---/
                  //Now the content of the main article
                  _$(scrModel.ARTICLE_CONTENT.split("/@")[0]).each(function(){
                    var data = _$(this); 
                    //Grab body of article in both plain and html format
                      article.setBody(data.find(scrModel.ARTICLE_CONTENT.split("/@")[1]));
                      //this is the date inserted on local database NOT ARTICLE DATE
                      article.dateCreated=new Date();
                      //Save the article
                      //console.log(article);
                      article.cleanBody();
                      article.cleanTitle();
                      article.save(function (err,art) {
                        if (err) {
                          article.handleError(err);
                        }
                        else{
                        articles.data.push(art);
                        }
                        });
              
                    
                  })
                  
                }
                });
          }
         })
       
   
  }
  outlets++;
  console.log("done for "+scrModel.ENTITY_CODE+" entries:"+entries+"/Outlets count"+outlets);
  resolve(articles.data);
});
  }).catch(function(e){
    console.log("Error ocurred on "+e);
  })
  extract.then(function(data){
    console.log(data);
    if(outlets==scrapeModels.length-1){
      console.log("Finished");
      res.send(articles.data);

    }
  })
  //console.log(scrModel.ENTITY_CODE);
  
});

  });



});
module.exports = router;


