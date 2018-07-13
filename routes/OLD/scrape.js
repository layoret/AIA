var express = require('express');
//var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var router = express.Router();
var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
var Article=require('../models/article.model');
var _models=require('../Services/loadScrapingModels');
var scrapeModels={};
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
var linkNormalizer=function(_value){  
  if(_value.indexOf("http",0)){
    return _value;
  }
  else{
    return "http://"+_value;
  }
}

/* GET home page. */

router.get('/', function(req, res, next) {
  _models.getSCRModels.then(function(scmodels){
  scrapeModels=scmodels;
  _.each(scrapeModels,function(model){
  //console.log();  
  var url =model.ENTITY_URL;
  //console.log(url);
  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      // Finally, we'll define the variables we're going to capture
      $(model.SCRAPE_TITULARES).each(function(){
        //var id,title, release, rating;
       // var json = {id:"", title : "", link : "", xcerpt : ""};
        // Let's store the data we filter into a variable so we can easily see what's going on.
        var article=new Article();
             var data = $(this);
           
        // In examining the DOM we notice that the title rests within the first child element of the header tag. 
        // Utilizing jQuery we can easily navigate and get the text by writing the following code:
            article.construct();
            article.title = dataNormalizer("header",data.find("h2.art-title").text(),["|Fotos","|Video"]);
            if(data.find('a').attr('href')){
            article.link=linkNormalizer(data.find('a').attr('href'));
            }
            console.log(article.title);
            
        // Once we have our title, we'll store it to the our json object.

             //json.title = title;
             if(article.title.length>0){
              article.setNewsId();
              article.outlet=url;
             articles.data.push(article);
             }
         })
         
      //var _arts=_.uniqBy(arts.data, 'newsId');
         //arts.data=_arts;
      //console.log(JSON.stringify(arts));
      // Connect to the db


   
  }
  
 // });
 

});
});
});
MongoClient.connect("mongodb://kloudsix.com:27017", function (err, client) {
    
  if(client.isConnected){
    var db=client.db("AIANews");
  db.collection('NewsTest', function (err, collection) {
  _.each(articles.data,function(a){
    try{
    /*collection.insertOne(a,function(error,success){
      if(error){
        console.log("error");
      }
    })*/
  }catch(e){}
    
 })
 
})
}
if(err) throw err;

//Write databse Insert/Update/Query code here..
           
});
res.send(JSON.stringify(articles));

});

module.exports = router;
