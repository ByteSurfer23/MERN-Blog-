const mongoose = require('mongoose');
const {Schema,model} = mongoose;
const Userschema = new Schema({
    username:{type:String,required:true,min:4,unique:true},
    password:{type:String,required:true},
});
const Usermodel = model('user',Userschema);
module.exports = Usermodel;