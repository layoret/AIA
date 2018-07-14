
// view engine setup
const mongoose = require('mongoose');
//var dbURI="mongodb://kloudsix.com:27017/AIANews";
var dbURI="mongodb://localhost:27017/AIANews";
const options = {

    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
  };
global.dbconnection=(global.dbConnection?global.dbConnection:mongoose.connect(dbURI,options));
mongoose.connection.on('connected', function () {  
    console.log('Mongoose default connection open to ' + dbURI);
  }); 

  //When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});
mongoose.connection.on('error', function (err) {  
    console.log('Ocurrio un error'); 
  });
// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    console.log('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
}); 
var handleError=function(val){
    console.log("Error");
}

module.exports={
    conn:global.dbconnection,
handleError:handleError
}
