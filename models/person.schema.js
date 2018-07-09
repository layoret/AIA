//Raw or original is the extracted article as is
var mongoose=require("mongoose");
var md5 = require("md5");
var PersonSchema=new mongoose.Schema({
            
            fullName:{type:String,default:"",required:true},
            firstName:{type:String,required:true},
            lastName:{type:String,required:true},
            linkedINProfile:{type:String,required:false},
            twitterProfile:{type:String,required:false},
            facebookProfile:{type:String,required:false},
            wikpedia:{type:String,required:false},
            professions:[{type:String,required:false}],
            relatedOrganizations:[{ type: Schema.Types.ObjectId, ref: 'Organization' }],
            relatedPerson:[{ type: Schema.Types.ObjectId, ref: 'Person' }],
            dates:[{type:String,required:false}],
            extended:{ type: mongoose.Schema.Types.Mixed, default: {} },
            news:[{ type: Schema.Types.ObjectId, ref: 'Article' }],
            quotesCitations:[{type:String,required:false}],
            sentiment:{
                positive:{type:Number,required:false},
                neutral:{type:Number,required:false},
                negative:{type:Number,required:false},
            }
            
            
           
        
},{ minimize: false })
PersonSchema.methods.handleError=function(val){
    console.log("Error");
}
PersonSchema.methods.setDate=function(val){
    this.date=val;
}
//Clean extracted title
PersonSchema.methods.cleanTitle=function(){
    //The title is an Image Source... could happen
   
    this.title=this.title.replace(/(?:\r\n|\r|\n|\\|\")/g, '');
    this.title=this.title.replace("Fotos","");
    this.title=this.title.replace("Video","");
    this.title=this.title.replace("|","");

}
PersonSchema.methods.cleanBody=function(){
    this.bodyText=this.bodyText.replace(/Compartir en Twitter/g, "");
    this.bodyText=this.bodyText.replace(/Compartir en Facebook/g, "");
    this.bodyText=this.bodyText.replace(/Compartir en Google/g, "");
    this.bodyText=this.bodyText.replace(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/g,"");
}
PersonSchema.methods.setBody=function(val){
    this.bodyHTML=val.html();
    this.bodyText=val.text().replace(/(?:\r\n|\r|\n)/g, '');
    
    
}
PersonSchema.methods.findAll=function(cb){
    return this.model('RawArticle').find({},cb);
}
PersonSchema.methods.findNoAnalyzed=function(cb){
    return this.model('RawArticle').find({analyzed:false},cb);
}

module.exports=mongoose.model("Person",PersonSchema);