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
  
  //res.setHeader('Content-Type', 'text/html;charset=utf-8');
  var ScrapeRule=new ScrapeRules({});
  ScrapeRule.findAll(function(err,docs){
  //ScrapeRule.findOne({'ENTITY_CODE':'Hoy'},function(err,docs){
  scrapeModels=docs;
  var outlets=0;
_.each(scrapeModels,function(scrModel){
  
  var entries=0;
  var articles_count=0;
  //We have the scrape models for each news outlet
  //now we iterate over each one and scrape the related outlet headlines
  //Lets define the extraction function
  var extract=new Promise(function(resolve,reject){
   
    request(scrModel.ENTITY_URL, function(error, response, html){
    if(!error){
      //For this outlet lets grab the URL
      var url=scrModel.ENTITY_URL;
      //Load the headlines page complete
      var $ = cheerio.load(html);
      // Let's extract each headline single entry (article)
      // Later we'll extract each detail
      articles_count=$(scrModel.ARTICLE_ENTRY).length;
      $(scrModel.ARTICLE_ENTRY).each(function(){
       
        var article=new ArticleRaw();
        var data = $(this);
          article.title=data.find(scrModel.TITLE_SELECTOR).text();
          if(article.title.indexOf("<img src=")!==-1){
            article.title=data.find(scrModel.TITLE_SELECTOR).attr("alt");
          }
          else{
            article.title =dataNormalizer("header",data.find(scrModel.TITLE_SELECTOR).text(),["|Fotos:","|Video:","Fotos:","Fotos","Video:","Audio","AUDIO:"]);
          }
          
            //Do we have a title? if so let's start grabbing
            if(article.title && article.title.length>0){
              //Set the base outlet url for article
              article.outlet=url;
              //Set the unique id as hash of title + outlet URL
              //This is because we can find simlar titles out there
              article.newsId=identityService.HASHtoId(article.title+article.outlet);
              //Do we have a main category for this article?
              article.mainCategory=data.find(scrModel.ARTICLE_MAIN_CATEGORY).text(); 
              //Article excerpt summary
              article.xcerpt=data.find(scrModel.ARTICLE_XCERPT).text();
              //Extract xcerpt image if exist and add it to images array
              var xcerptImage=data.find(scrModel.XCERPT_IMAGE).attr('src');
               if(xcerptImage){
                article.images.push(xcerptImage);
              }
             
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
                      //Let's clean the article
                      article.cleanBody();
                      article.cleanTitle();
                      article.extended={};
                      //Let's try to save article to database
                      article.save(function (err,art) {
                        entries++;
                        if (err) {
                          res.write("<p>Article"+" "+article._id+" Exists</p>");
                          article.handleError(err);
                        }
                        else{
                        //If we save it, let put reference of it in our temp array holder  
                        articles.data.push(art);
                        }
                        });
                        if(articles_count===entries){
                          outlets++;
                          //console.log("done for "+scrModel.ENTITY_CODE+" entries:"+entries+"/Outlets count"+outlets);
                          res.write("done for "+scrModel.ENTITY_CODE+" entries:"+entries+"/Outlets count"+outlets);
                          resolve(articles.data);
                          
                          }
                    
                  })
                  
                }
                });
          }
         })
       
         
  }
 
  
 
});
  }).catch(function(e){
    console.log("Error ocurred on "+e);
  })
  extract.then(function(data){
    console.log(data);
    if(outlets==scrapeModels.length-1){
      console.log("Finished");
      res.write(articles.data);

    }
  })
  
  
});

  });



});
module.exports = router;


