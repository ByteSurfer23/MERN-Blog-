const mongoose = require('mongoose');// here we create the schema for the post
const {Schema,model} = mongoose;
const PostSchema = new Schema({
    title:String,
    summary:String,
    content:String,
    file:String,
    //author:{type:Schema.Types.ObjectId,ref:'user'},// tell mongodb that this field will be filled from the schema called user
},{
    timestamp:true,
});
const PostModel = model('posts',PostSchema);
module.exports = PostModel; 
//createing a new model for storing all the post in the format of the given schema 
