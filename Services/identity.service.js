var md5=require('md5');

exports.HASHtoId=function(input,prefix){
    var res=md5(input);
    if(prefix){
        return prefix+"-"+res;
    }
    else{
        return res;
    }
}