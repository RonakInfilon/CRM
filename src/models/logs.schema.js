const mongoose=require('mongoose');

const logschema=new mongoose.Schema({
  // method:String,
  endPoint:String,
  userId:Number,
  IpAddeess:String,
  statusBody:Number,
  requestBody:Object,
  responsemessage:String,
  timeStamp:{
    type:Date,
    default:Date.now
  }
})


module.exports=mongoose.model("ApiLog",logschema);
