const { json } = require('body-parser');
const { getUsername, getEmailId } = require('./functions');

require('dotenv').config();
const express = require('express'), 
      app = express(), 
      bodyParser = require('body-parser'), 
      mongoose = require('mongoose'), 
      bcrypt = require('bcrypt'), 
      functions = require('./functions');
const saltRounds = 10;

app.set('view engine' , 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json(['application/json']));

// Mongoose Connection to Atlas and Schema
mongoose.connect(`mongodb+srv://${process.env.CLUSTER_USERNAME}:${process.env.CLUSTER_PASSWORD}@cluster0.ca3lk.mongodb.net/SocialForumVITBhopal?retryWrites=true&w=majority`);
const userSchema = new mongoose.Schema({ 
  loginInfo: {
    email: String, 
    password: String
  },
  userInfo: { 
    name: {
      firstName: String, 
      lastName: String
    }, 
    description: String, 
    hobbies: [
      {
        hobby: String
      }
    ],
    skills: [
      {
        skill: String, 
        proficiency: Number 
      }
    ]
  }, 
  userPosts: [
    {
      postTitle: String, 
      postBody: String, 
      likes: Number, 
      comments : [
        {
          userName: String , 
          comment: String
        }
      ]
    }
  ]
})
const User = mongoose.model('User', userSchema);

// GET Requests
app.get('/', (req, res)=> {
  res.redirect('/login');
})
app.get('/:username/home', (req, res)=>{
  const userEmail = getEmailId(req.params.username);
  User.findOne({'loginInfo.email': userEmail}, (err, foundUser)=>{
    if(!err){
      console.log(String(foundUser._id));
      res.render('home', {
        name: foundUser.userInfo.name, 
        aboutMe: foundUser.userInfo.description,
        hobbies: foundUser.userInfo.hobbies, 
        userId: String(foundUser._id)
      });
    }
  })
})
app.get('/login', (req, res)=>{
  res.render('login', {message: null});
})
app.get('/register', (req, res)=>{
  res.render('register', {reason: null, status: null});
})
app.get('/events', (req, res)=>{
  res.render('events');
})
app.get('/:username/home/skills', (req, res)=>{
  const userEmail = getEmailId(req.params.username);
  User.findOne({'loginInfo.email': userEmail}, (err, foundUser)=>{
    if(!err){
      res.json(foundUser.userInfo.skills);
      console.log("The skills should've been successfully sent back to the client")
    }
  })
})
app.get('/:username/home/hobbies', (req, res)=>{
  const userEmail = getEmailId(req.params.username);
  User.findOne({'loginInfo.email': userEmail}, (err, foundUser)=>{
    if(!err){
      res.json(foundUser.userInfo.hobbies);
      console.log("The hobbies should've been successfully sent back to the client")
    }
  })
})

// POSTS Requests
app.post('/register', (req, res)=> {
  console.log(req.body);
  const userEmail = req.body.userEmail, 
        userPassword = req.body.userPassword,
        saltRounds = 10;

  // SERVER SIDE VALIDATION
  // Checking if email is already registered 
  User.findOne({"loginInfo.email": userEmail}, (err, foundUser)=>{
    if(!err){
      if(foundUser === null){
        //Hashing the password
        bcrypt.hash(userPassword, saltRounds, (err, hash)=>{
          if(!err){
            const newUser = new User({
              loginInfo: {
                email: userEmail, 
                password: hash
              }, 
              userInfo: {
                  name: {
                  firstName: '---', 
                  lastName: '---'
                }, 
                description: '---', 
              }
            })
            newUser.save();
          }
          else{
            console.log(err);
          }
        })
        res.status(200).send({message: 'Account successfully registered', color: 'green'});
      }
      // When entered email id is already registered 
      else{
        res.status(200).send({message: 'Email already registered', color: 'red'});
      }
    }
  })
})
app.post('/login', (req, res)=>{
  const userEmail = req.body.userEmail, 
        userPassword = req.body.userPassword;
  
  //Check if account exists or not
  User.findOne({"loginInfo.email":  userEmail}, (err, foundUser)=>{
    if(!err){
      if(foundUser != null){
        const hash = foundUser.loginInfo.password;
        bcrypt.compare(userPassword, hash, (err, result)=>{
          if(result == true){
            // Convert userEmail to username for url
            username = functions.getUsername(userEmail);
            res.redirect(`/${username}/home`);
          }
          else{
            res.render('login', {message: 'Password do not match', status: 'red'});
          }
        })
      }
      // When no account with the entered email id exists 
      else{
        res.render('login', {message: 'No such account exists', status: 'red'})
      }
    }
  })
})
app.post('/:username/home/updateProfile', (req, res)=> {
  console.log(req.body);
  const updateProfile = {
    hobbies: [], 
    skills: req.body.skills
  }
  // Removing any extra whitespace from hobbies
  req.body.hobbies.forEach((hobby)=>{
    updateProfile.hobbies.push(String(hobby.trim()));
  })

  // Convert username from url into email id
  const userEmail = functions.getEmailId(req.params.username);

  // Update Name 
  if(req.body.firstName !== '' && req.body.lastName !== ''){
    User.findOneAndUpdate({"loginInfo.email": userEmail}, {
      $set: {
        "userInfo.name.firstName": req.body.firstName, 
        "userInfo.name.lastName": req.body.lastName, 
      }
    }, (err)=>{
      if(!err){
        console.log('Name and description successfully updated');
      }
    })
  }
  else if((req.body.firstName !== '' && req.body.lastName === '') || (req.body.firstName === '' && req.body.lastName !== '')){
    console.log('Both first and last name required');
  }

  // Update description 
  if(req.body.aboutMe != ''){
    User.findOneAndUpdate({"loginInfo.email": userEmail}, {
      $set: {
        "userInfo.description": req.body.aboutMe
      }
    }, (err)=>{
      if(!err){
        console.log('The description was successfully updated');
      }
    })
  }
  
  // Check if skill is already present or not
  User.findOne({"loginInfo.email": userEmail}, (err, foundUser)=>{
    if(!err){
      if(req.body.skills.length !== 0){
        updateProfile.skills.forEach((skill)=>{
          const result = functions.isSkillPresent(skill.skill, foundUser.userInfo.skills);
          if(result === false){
            foundUser.userInfo.skills.push({
              skill: skill.skill, 
              proficiency: skill.proficiency
            })
            console.log(skill.skill + " successfully added");
          }
        })
        foundUser.save();
      }
    }
  })

  // Check if the hobbies are already present or not
  User.findOne({"loginInfo.email": userEmail}, (err, foundUser)=>{
    if(!err){
      updateProfile.hobbies.forEach((hobby)=>{
        if(hobby !== ''){
          const result = functions.isHobbyPresent(hobby, foundUser.userInfo.hobbies); 
          if(result === false){
            foundUser.userInfo.hobbies.push({hobby: hobby});
            console.log(hobby + ' is successfully added');
          }
        }
      })
      foundUser.save();
    }
  })
  res.status(200).send();
})

app.listen('3000', ()=>{
  console.log('The server is running on port 3000');
})