//Raw or original is the extracted article as is
var mongoose=require("mongoose");
var md5 = require("md5");
var RawArticleSchema=new mongoose.Schema({
            
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
           bodyText:String,
           bodyHTML:String,
           xcerpt:String,
           link:String,
           outlet:String,
           images:[String],
           tags:[String],
           mainCategory:String,
           extended:{ type: mongoose.Schema.Types.Mixed, default: {} },
           analyzed:{type:Boolean, default:false}
           
        
},{ minimize: false })
RawArticleSchema.methods.handleError=function(val){
    console.log("Error");
}
RawArticleSchema.methods.setDate=function(val){
    this.date=val;
}
//Clean extracted title
RawArticleSchema.methods.cleanTitle=function(){
    //The title is an Image Source... could happen
   
    this.title=this.title.replace(/(?:\r\n|\r|\n|\\|\")/g, '');
    this.title=this.title.replace("Fotos","");
    this.title=this.title.replace("Video","");
    this.title=this.title.replace("|","");

}
RawArticleSchema.methods.cleanBody=function(){
    this.bodyText=this.bodyText.replace(/Compartir en Twitter/g, "");
    this.bodyText=this.bodyText.replace(/Compartir en Facebook/g, "");
    this.bodyText=this.bodyText.replace(/Compartir en Google/g, "");
    this.bodyText=this.bodyText.replace(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/g,"");
}
RawArticleSchema.methods.setBody=function(val){
    this.bodyHTML=val.html();
    this.bodyText=val.text().replace(/(?:\r\n|\r|\n)/g, '');
    
    
}
RawArticleSchema.methods.findAll=function(cb){
    return this.model('RawArticle').find({},cb);
}

module.exports=mongoose.model("RawArticle",RawArticleSchema);