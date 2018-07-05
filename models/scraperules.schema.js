var mongoose=require("mongoose");
var md5 = require("md5");
var ScrapingruleSchema=mongoose.Schema({
    ENTITY_FILE_NAME:{type:String,default:"",required:true},
    ENTITY_CODE:{type:String,default:"",required:true},
    ENTITY_URL:{type:String,default:"",required:true},
    ENTITY_LOGO:{type:String,default:"",required:false},
    RECIPE_DETAIL:{type:String,default:"",required:true},
    RECIPE_DATE_GET:{type:String,default:"",required:true},
    RECIPE_TAGS:{type:String,default:"",required:false},
    ARTICLE_IMAGE_1:{type:String,default:"",required:false},
    ARTICLE_IMAGE_2:{type:String,default:"",required:false},
    ARTICLE_VIDEO:{type:String,default:"",required:false},
    TITLE_SELECTOR:{type:String,default:"title",required:false},
    ARTICLE_XCERPT:{type:String,default:"title",required:false},
    XCERPT_IMAGE:{type:String,default:"",required:false},
    ARTICLE_ENTRY:{type:String,default:"article",required:false},
    ARTICLE_CONTENT:{type:String,required:false},
    ARTICLE_AUDIO:{type:String,required:false},
    OUTLET_CREDIBILITY:{type:String,required:false},
    OUTLET_COUNTRY:{type:String,default:"DO",required:false}
})
ScrapingruleSchema.methods.findAll = function (cb) {
    return this.model('Scrapingrule').find({/*ENTITY_CODE:"El Nacional"*/}, cb);
  };
  ScrapingruleSchema.methods.findOne = function (input,cb) {
    return this.model('Scrapingrule').find(input, cb);
  };
//ScrapeModel.methods.find=function()
module.exports=mongoose.model("Scrapingrule",ScrapingruleSchema);