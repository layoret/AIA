//--------------------------- Main Scrapping JOB ---------
//@author:Julian De La Rosa
//2018 - juliandelarosa@icloud.com
//---------------------------------------------------------
/*This is the job kernel that extracts information in raw from
  outlets specified in the rules collections. Each outlet has a collection
  in the main mongodb/nosql database. The basics of this file is to extract
  based on such rules the main "headlines" in the outlets. For now
  this version is only for Dominican Republic Oulets. Future versions will have
  worldwide outlets.
*/ 
//---------------------------------------------------------
// Create an express module
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
var ArticleRaw=require("../models/articleRaw.schema");
var ScrapeRules=require("../models/scraperules.schema");

//This variable will hold the outlet scraping models 
var scrapeModels=[];
//This variable will hold the articles fetched.  Since this is global it contains the articles scrapped in a run
var articles={
  data:[]
};
//Fancy function for normalize info
var titleNormalizer=function(type,input,non){
  var result="";
    if(type==="header"){
      _.each(non,function(x){
        result=input.replace(x,"");
      });
    
    }
    return result;
}
//Normalize hyperlink or news detail link
/*DELETE?var linkNormalizer=function(_value,_base){  
  if(_value.indexOf("http",0)){
    return _value;
  }
  else{
    return _base+_value;
  }
}*/

//Route entry
router.get('/', function(req, res, next) {
  console.log("Hello AIA");
  //Load ScrapeRule schema
  var ScrapeRule=new ScrapeRules({});
  //Load all Scraping Rules on database
  ScrapeRule.findAll(function(err,docs){
  //Assign the returned documents array to the variable defined 
  //Remember these documents are JQuery Path based on cheerio
  scrapeModels=docs;
  var outlets=0;
  var total_entries=0;
  var total_articles=0;
  //Iterate over each document returned and stored in session variable
_.each(scrapeModels,function(scrModel){
  //Each document belongs to an oulet, let's increment the amount of outlets
  outlets++;
  //Assign overall entries
  var entries=0;
  //Assign articles_count;
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
      total_articles+=articles_count;
      console.log("Working on "+scrModel.ENTITY_CODE);
      console.log(articles_count+" hay para "+scrModel.ENTITY_CODE);
      $(scrModel.ARTICLE_ENTRY).each(function(){
        entries++;
        total_entries++;
        var rawArticle=new ArticleRaw();
        var data = $(this);
          rawArticle.title=data.find(scrModel.TITLE_SELECTOR).text();
          console.log(rawArticle.title);
          if(rawArticle.title.indexOf("<img src=")!==-1){
            rawArticle.title=data.find(scrModel.TITLE_SELECTOR).attr("alt");
          }
          else{
            rawArticle.title =titleNormalizer("header",data.find(scrModel.TITLE_SELECTOR).text(),["|Fotos:","|Video:","Fotos:","Fotos","Video:","Audio","AUDIO:"]);
          }
          
            //Do we have a title? if so let's start grabbing
            if(rawArticle.title && rawArticle.title.length>0){
              //Set the base outlet url for article
              rawArticle.outlet=url;
              //Set the unique id as hash of title + outlet URL
              //This is because we can find simlar titles out there
              rawArticle.newsId=identityService.HASHtoId(rawArticle.title+rawArticle.outlet);
              //Do we have a main category for this article?
              //->article.mainCategory=data.find(scrModel.ARTICLE_MAIN_CATEGORY).text(); 
              //Article  summary
              rawArticle.xcerpt=data.find(scrModel.ARTICLE_XCERPT).text();
              //Extract xcerpt image if exist and add it to images array
              var xcerptImage=data.find(scrModel.XCERPT_IMAGE).attr('src');
               if(xcerptImage){
                rawArticle.images.push(xcerptImage);
              }
             
              //Extract the detail link
              if(data.find(scrModel.RECIPE_DETAIL).attr('href')){
                rawArticle.link=data.find(scrModel.RECIPE_DETAIL).attr('href');
              }
              else{
                rawArticle.link=data.find('a').attr('href');
              }
              if(rawArticle.link.indexOf("http",0)){
                rawArticle.link=rawArticle.outlet+rawArticle.link;
              }
           
              //--- ARTICLE DETAIL AFTER LINK ---------
              //Now with the link let's go deeper and scrape the detail
              request(rawArticle.link, function(error, response, html){
                //There's a response?
                if(!error){
                  //Load html on cheerio parser
                  var _$ = cheerio.load(html);
                  //Let's try to take the real date based on meta-tags
                  try{
                  rawArticle.setDate(_$(scrModel.RECIPE_DATE_GET.split("/@")[0]).attr(scrModel.RECIPE_DATE_GET.split("/@")[1]));
                  }catch(e){}
                  //Let's try to extract article tags for tag-cloud found on meta-tags
                  try{
                  _$(scrModel.RECIPE_TAGS.split("/@")[0]).each(function(){
                    rawArticle.tags.push(_$(this).attr(scrModel.RECIPE_TAGS.split("/@")[1]));
                    
                  });
                  //Grab images URL from headline
                  rawArticle.images.push(_$(scrModel.ARTICLE_IMAGE_1.split("/@")[0]).attr(scrModel.ARTICLE_IMAGE_1.split("/@")[1]));
                }catch(e){}
                  //--- ARTICLE MAIN CONTENT BODY ---/
                  //Now the content of the main article
                  _$(scrModel.ARTICLE_CONTENT.split("/@")[0]).each(function(){
                    var data = _$(this); 
                    //Grab body of article in both plain and html format
                      rawArticle.setBody(data.find(scrModel.ARTICLE_CONTENT.split("/@")[1]));
                      //this is the date inserted on local database NOT ARTICLE DATE
                      rawArticle.dateCreated=new Date();
                      //Let's clean the article
                      rawArticle.cleanBody();
                      //Clean the title from non descriptive info
                      //Note: Some outlets have something like VIDEO:NNNN AUDIO:NNN this need to be cleaned
                      rawArticle.cleanTitle();
                      //
                      rawArticle.extended={};
                      //Let's try to save article to database
                      rawArticle.save(function (err,art) {
                        //console.log(article);
                        
                        if (err) {
                          res.write("<p>Article"+" "+rawArticle._id+" Exists</p>");
                         // article.handleError(err);
                        }
                        else{
                        //If we save it, let put reference of it in our temp array holder  
                        res.write("<p>Article"+" "+rawArticle._id+" Saved</p>");
                        articles.data.push(art);
                        
                        }

                        });
                        //console.log(articles_count);
                        //console.log(entries);
                         
                           
                  });
                  
                }
                });
          }
         
         });
         if(articles_count===entries){
          console.log("finished")
          console.log("done for "+scrModel.ENTITY_CODE+" entries:"+entries+"/Outlets count"+outlets);
          res.write("done for "+scrModel.ENTITY_CODE+" entries:"+entries+"/Outlets count"+outlets);
          resolve(articles.data);
          
          }      
         
  }
      
  
 
});
  }).catch(function(e){
    console.log("Error ocurred on "+e);
  })
  //console.log("Working");
  extract.then(function(data){
 
    console.log("Finished with "+total_articles);
 
    
  });
  
  
});

  });



});
module.exports = router;


