const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const User = require('./models/user');
const bcrypt = require('bcrypt');//installs bcrypt
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const Post = require('./models/post');
const uploadMiddleware = multer({dest:'uploads/'});
const cookieParser=require('cookie-parser');
app.use('/uploads',express.static(__dirname+'/uploads'));
const salt = bcrypt.genSaltSync(10);//generates a random string that is used to hash the password, the 10 passed here represents the complexity of hashing 
const secret = 'jabezblog';
app.use(cors({origin:'*'}));// here the app.post for login is listening at 4000 but the credentials are requested from 3000 so we make the required cors changes 
app.use(express.json());
app.use(cookieParser());
mongoose.connect('mongodb+srv://sjabezsam:n5yp9BOqRlaQfz3h@cluster0.ihikbq4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
app.post('/register',async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');// this allows the requests from any origin
  const {username,password} = req.body;
  try{
  const userDoc = await User.create({
    username,
    password:bcrypt.hashSync(password,salt),//hashes the password using the salt 
  });//creates a new user acc to the schema and returns a promise
  res.json(userDoc);
  }
  catch(error){
    console.error(error);
  }
});


app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });// tries to find the user with the required username
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);//compares if the password provided on hashing matches the hashed password of the user found
    if(passOk){//login successful
      jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{// tries to sign in the user 
        if(err) throw err;
        res.cookie('token',token).json({
          id:userDoc._id,
          username,
        }); // gives token as a response ,
      });
    }
    else{
      //login not successful
      res.status(400).json('wrong credentials');//gives response status as wrong credentials 
    }// NOTE: for each request in the function there can be only one possible response (PLS CHECK)
    //res.json({ passwordMatch: passOk });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/post',uploadMiddleware.single('file'),async (req,res)=>{
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length-1];
  const newPath = path+'.'+ext;
  fs.renameSync(path,newPath); 
  //const {token} = req.cookies;
  //jwt.verify(token,secret,{},async (err,info)=>{
    //if(err) throw err;
    const {title,summary,content} = req.body;
    const postDoc = await Post.create({
    title,
    summary,
    content,
    file:newPath,
  //});
  });
  res.json(postDoc);
});



app.get('/post',async (req,res)=>{
  res.json(await Post.find()
  .populate('author',['username']).limit(25));
})

 
app.get('/post/:id',async (req,res)=>{//the : indicates that the values after it must be an id (the values after it must be of the parameter specified)
  const{id} = req.params;
  const postDoc = await Post.findById(id);
  res.json(postDoc);
});

app.post('/logout',(req,res)=>{
  res.cookie('token','').json('ok');
})
app.listen(4000, () => {
  console.log('app is running on 4000');
});
/*
app.post(): listens to the given address, and perform the given call back 

mongodb+srv://sjabezsam:<password>@cluster0.ihikbq4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

n5yp9BOqRlaQfz3h
*/