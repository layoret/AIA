
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
   //Normalized data
   entities:[{category:String,subtype:String,value:String}],
   cities:[String],
   categories:[String],
   persons:[String],
   organizations:[String],
   locations:[String],
   concepts:[String],
   mainCategory:String,
   //Related
   relatedArticles:[
       {
        article:{type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
        relation:String
       }
    ]
            
})
ArticleSchema.methods.findAll=function(cb){
    return this.model('Article').find({},cb);
}
module.exports=mongoose.model("Article",ArticleSchema);