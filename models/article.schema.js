var mongoose=require("mongoose");
var md5 = require("md5");
var ArticleSchema=new mongoose.Schema({
            
    title:{type:String,default:"",required:true},
    date:{
        type:Date,
        default:Date.now,
    },
    dateCreated:{
        type:Date,
        default:Date.now,
    },
    newsId:{
        type:String,
        required:true,
        unique:true,
        default:function(){
            if(this.title){
                return md5(this.title);
            }
            else{
        return null;
            }
        }
    },
   AIAbodyText:String,
   AIABodyHTML:String,
   AIAxcerpt:String,
   orignaLink:String,
   originalOutlet:String,
   images:[String],
   tags:[String],
   mainCategory:String
            
})
ArticleSchema.methods.findAll=function(cb){
    return this.model('Article').find({},cb);
}
module.exports=mongoose.model("Article",ArticleSchema);