
var md5 = require('md5');
class Article
    {    
        constructor(){
            this.newsId="";
            this.title="Place article title";
            this.date=new Date();
            this.body="Place article body";
            this.link="";
            this.outlet="";
            this.images;
        }
        construct(newsId,title,date,body,link,outlet){
            this.newsId=newsId;
            this.title=title;
            this.date=date;
            this.body=body;
            this.link=link;
            this.outlet=outlet;
        }
        
        setNewsId(){
            this.newsId=md5(this.title+this.link);
        }
        getOutlet(){
            return this.outlet;
        }
        getNewsId() {
            return this.newsId;
        }
        getTitle() {
            return this.title;
        }
        getDate() {
            return this.date;
        }
        getBody() {
            return this.body;
        }
        getLink() {
            return this.link;
        }
   }
   module.exports = Article ;