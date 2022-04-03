require('dotenv').config();
const express = require('express'), 
      app = express(), 
      bodyParser = require('body-parser'), 
      mongoose = require('mongoose'), 
      bcrypt = require('bcrypt');
const saltRounds = 10;

app.set('view engine' , 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

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
  res.render('home');
})
app.get('/login', (req, res)=>{
  res.render('login', {message: null, status: null});
})
app.get('/register', (req, res)=>{
  res.render('register', {reason: null});
})
app.get('/events', (req, res)=>{
  res.render('events');
})

// POSTS Requests
app.post('/register', (req, res)=> {
  const userEmail = req.body.userEmail, 
        userPassword = req.body.userPassword, 
        confirmPassword = req.body.confirmPassword;
  
  // Server side validation
  const re = /@vitbhopal.ac.in$/
  let validEmail = re.test(userEmail);
  let validPassword;
  if(userPassword === confirmPassword){
    validPassword = true;
  }
  else{
    validPassword = false;
  }

  //Storing the email and password in the database
  if(validEmail == true && validPassword == true){
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
                }
              })
              newUser.save();
            }
            else{
              console.log(err);
            }
          })
          res.render('login', {message: 'Account successfully registered', status: 'green'});
        }
        // When entered email id is already registered 
        else{
          res.render('register', {reason: 'Email already registered'});
        }
      }
    })
  }
  // When entered password is incorrect 
  else if(validPassword == false){
    res.render('register', {reason: 'Password do not match'});
  }
  // When entered email id is incorrect 
  else if(validEmail == false){
    res.render('register', {reason: 'Email is incorrect'});
  }
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
            let username = '';
            for(let i = 0;  i < userEmail.length; i++){
              if(userEmail[i] === '@'){
                break;
              }
              else if(userEmail[i] === '.'){
                username += '-';
              }
              else{
                username += userEmail[i];
              }
            }
            console.log(username);
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
// app.post('/home', (req, res)=> {
//   console.log('Request Recieved!');
//   console.log(req.body);
//   res.status(200).send('Request was successfully recieved! :D');
// })

app.listen('3000', ()=>{
  console.log('The server is running on port 3000');
})