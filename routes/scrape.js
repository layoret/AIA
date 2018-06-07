var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var router = express.Router();
var md5 = require('md5');
var _ = require('lodash');
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
    return _value
  }
  else{
    return "http://"+_value;
  }
}
/* GET home page. */
router.get('/', function(req, res, next) {
  url = 'https://www.diariolibre.com/';
  request(url, function(error, response, html){
    if(!error){
      // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

      var $ = cheerio.load(html);

      // Finally, we'll define the variables we're going to capture

      
      var arts={
        data:[]
      };
      $('.td-article').each(function(){
        var id,title, release, rating;
        var json = {id:"", title : "", link : "", xcerpt : ""};
        // Let's store the data we filter into a variable so we can easily see what's going on.

             var data = $(this);

        // In examining the DOM we notice that the title rests within the first child element of the header tag. 
        // Utilizing jQuery we can easily navigate and get the text by writing the following code:

            json.title = dataNormalizer("header",data.find("h2.art-title").text(),["|Fotos","|Video"]);
            if(data.find('a').attr('href')){
            json.link=linkNormalizer(data.find('a').attr('href'));
            }
      
            json.id=md5(json.title);
        // Once we have our title, we'll store it to the our json object.

             //json.title = title;
             if(json.title.length>0){
             arts.data.push(json)
             }
         })
      var _arts=_.uniqBy(arts.data, 'id');
         arts.data=_arts;
      console.log(JSON.stringify(arts));
      //next();
      res.render('index', { body: JSON.stringify(arts) });
  }
  
  });
  
});

module.exports = router;
