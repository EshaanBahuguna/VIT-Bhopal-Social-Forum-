const { json } = require('body-parser');
const { postcss } = require('tailwindcss');
const { getUsername, getEmailId } = require('./functions');

require('dotenv').config();
const express = require('express'), 
      app = express(), 
      bodyParser = require('body-parser'), 
      mongoose = require('mongoose'), 
      bcrypt = require('bcrypt'), 
      functions = require('./functions'), 
      Filter = require('bad-words'), 
      filter = new Filter(),
      fs = require('fs'), 
      multer = require('multer');
const saltRounds = 10;

app.set('view engine' , 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json(['application/json']));

// Multer Storage
const upload = multer({storage: multer.memoryStorage()});
const uploadMaterial = multer({storage: multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, './subject materials');
  },
  filename: (req, file, cb)=>{
    cb(null, file.originalname);
  }
})})

// Mongoose Connection to Atlas and Schema
mongoose.connect(`mongodb+srv://${process.env.CLUSTER_USERNAME}:${process.env.CLUSTER_PASSWORD}@cluster0.ca3lk.mongodb.net/SocialForumVITBhopal?retryWrites=true&w=majority`);
const userSchema = new mongoose.Schema({ 
  loginInfo: {
    email: String, 
    password: String, 
    loginStatus: Boolean, 
    admin: Boolean
  },
  userInfo: { 
    name: {
      firstName: String, 
      lastName: String
    }, 
    profilePhoto: Buffer, 
    profilePhotoType: String, 
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
      id: Number, 
      postTitle: String, 
      postBody: String, 
      likes: Number, 
      comments : [
        {
          username: String , 
          comment: String
        }
      ]
    }
  ],
  likedPosts: [
    {
      _id: String, 
      username: String
    }
  ]
})
const User = mongoose.model('User', userSchema);
const Contact = mongoose.model('Contact', {
  name: String, 
  email: String, 
  message: String
});
const Event = mongoose.model('Event', {
  holidays: [
    {
      month: String, 
      holidayName: String, 
      date: String
    }
  ], 
  events: [
    {
      month: String,
      eventName: String, 
      date: String
    }
  ]
})
const Post = mongoose.model('Post', {
  _id: String, 
  title: String, 
  body: String, 
  username: String
})

// GET REQUESTS
// Routes for Home page
app.get('/', (req, res)=> {
  res.redirect('/login');
})
app.get('/:username/home', (req, res)=>{
  const userEmail = getEmailId(req.params.username);
  
  User.findOneAndUpdate({"loginInfo.email": userEmail}, {$set: {"loginInfo.loginStatus": true}}, (err, foundUser)=>{
    if(!err){
      if(foundUser != null){  
        // Render the user home page
        res.render('home', {
          name: foundUser.userInfo.name, 
          aboutMe: foundUser.userInfo.description,
          hobbies: foundUser.userInfo.hobbies, 
          userId: String(foundUser._id)
        });
      }
      else{
        res.redirect('/login');
      }
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
      console.log("The skills should've been successfully sent back to the client");
    }
  })
})
app.get('/:username/home/hobbies', (req, res)=>{
  const userEmail = getEmailId(req.params.username);
  User.findOne({'loginInfo.email': userEmail}, (err, foundUser)=>{
    if(!err){
      res.json(foundUser.userInfo.hobbies);
      console.log("The hobbies should've been successfully sent back to the client");
    }
  })
})
app.get('/:userId/profilePhoto', (req, res)=>{

  User.findById(req.params.userId, (err, foundUser)=>{
    if(!err){
      res.json({image: {
        data: foundUser.userInfo.profilePhoto.toString('base64'), 
        type: foundUser.userInfo.profilePhotoType
      }});
    }
  })
})
app.get('/:username/home/logout', (req, res)=>{
  const userEmail = functions.getEmailId(req.params.username);

  User.findOneAndUpdate({"loginInfo.email": userEmail}, {$set: {"loginInfo.loginStatus": false}}, (err)=>{
    if(!err){
      res.redirect('/login');
    }
  });
})
app.get('/:username/home/posts', (req, res)=>{
  res.render('posts');
})
app.get('/:username/home/posts/getAllPosts', (req, res)=>{
  const userEmail = functions.getEmailId(req.params.username);
  User.findOne({"loginInfo.email": userEmail}, (err, foundUser)=>{
    if(!err){
      res.json(foundUser.userPosts);
    }
  })
}) 
app.get('/getPosts', (req, res)=>{
  Post.find({}, (err, allPosts)=>{
    res.send(allPosts);
    console.log("All Posts made by the users should've been successfully sent back to the client");
  })
})
app.get('/getLikedPosts/userId=:userId', (req, res)=>{
  User.findById({_id: req.params.userId}, (err, foundUser)=>{
    if(!err){
      res.json({
        likedPosts: foundUser.likedPosts
      })
    }
  })
})
app.get('/likesAndCommentsNumber/email=:email&postId=:postId', (req, res)=>{
   User.findOne({'loginInfo.email': req.params.email}, (err, foundUser)=>{
    if(!err){
      foundUser.userPosts.forEach((post)=>{
        if(String(post._id) === String(req.params.postId)){
          res.json({
            likes: post.likes, 
            comments: post.comments.length
          })
        }
      })
    }
   })
})
app.get('/getComments/email=:email&postId=:postId', (req, res)=>{
  User.findOne({"loginInfo.email": req.params.email}, (err, foundUser)=>{
    if(!err){
      foundUser.userPosts.forEach((post)=>{
        if(String(req.params.postId) == String(post._id)){
          res.json(post.comments);
        }
      })
    }
  })
})
app.get('/likePost/email=:email&postId=:postId&userId=:userId', (req, res)=>{
  
  // Check whether the post has been liked or not
  User.findById(req.params.userId.trim(), (err, foundUser)=>{
    if(!err){
      let postFound = false, posPost;
      for(let i = 0; i < foundUser.likedPosts.length; i++){
        if(foundUser.likedPosts[i].username === req.params.email && String(foundUser.likedPosts[i]._id) === String(req.params.postId)){
          postFound = true;
          posPost = i;
          break;
        }
      }
      
      if(foundUser.likedPosts.length === 0 || !postFound){
        // Add the details of the newly liked post to the likedPost field of the user who has liked the post
        const newLikedPost = {
          username: req.params.email, 
          _id: req.params.postId
        }
        foundUser.likedPosts.push(newLikedPost);
        foundUser.save((err)=>{
          if(!err){
            console.log('likedPost added to DB');

            // Increment the value for the User whose post was liked
            User.findOne({"loginInfo.email": req.params.email}, (err, foundUser2)=>{
              for(let i = 0; i < foundUser2.userPosts.length; i++){
                if(String(foundUser2.userPosts[i]._id) === String(req.params.postId)){
                  foundUser2.userPosts[i].likes += 1;
                  foundUser2.save((err, updatedDetails)=>{
                    if(!err){
                      console.log(`${req.params.postId} of ${req.params.email} has been liked`);
                      res.json({
                        liked: true,
                        likedNumber: updatedDetails.userPosts[i].likes,
                        unliked: false
                      })
                    }
                  })
                  break;
                }
              }
            })
          }
        })
      }
      else if(postFound){
        // Remove the post from likedPosts who has unliked the post
        User.findByIdAndUpdate(req.params.userId.trim(), {$pull: {likedPosts: {_id: req.params.postId}}}, (err)=>{
          if(!err){
            console.log("post removed from likedPost DB");
          }
        })

        // Reduce the value of liked number from the person's post that got disliked
        User.findOne({"loginInfo.email": req.params.email}, (err, foundUser2)=>{
          for(let i = 0; i < foundUser2.userPosts.length; i++){
            if(String(req.params.postId) === String(foundUser2.userPosts[i]._id)){
              foundUser2.userPosts[i].likes -= 1;
              foundUser2.save((err, updatedDetails)=>{
                if(!err){
                  console.log(`${req.params.postId} of ${req.params.email} has been disliked`);
                  res.json({
                    liked: false,
                    likedNumber: updatedDetails.userPosts[i].likes,
                    unliked: true
                  })
                }
              })
              break;
            }
          }
        })
      }
    }
  })
})
app.get('/:username/userImage', (req, res)=>{
  User.findOne({"loginInfo.email": req.params.username}, (err, foundUser)=>{
    if(!err){
      res.json({
        data: foundUser.userInfo.profilePhoto.toString('base64'), 
        type: foundUser.userInfo.profilePhotoType
      })
    }
  })
})

// Routes for Admin page
app.get('/admin', (req, res)=>{
  res.redirect('/login');
})
app.get('/adminPage', (req, res)=>{
  res.render('admin');
})
app.get('/getAllEvents', (req, res)=>{
  Event.findOne({}, (err, foundEvent)=>{
    if(!err){
      res.json(foundEvent.events);
    }
  })
})
app.get('/getAllHolidays', (req, res)=>{
  Event.findOne({}, (err, foundEvent)=>{
    if(!err){
      res.json(foundEvent.holidays);
    }
  })
})
app.get('/getContactCards', (req, res)=>{
  Contact.find({}, (err, foundContacts)=>{
    if(!err){
      res.json({contacts: foundContacts});
    }
  })
})
app.get('/getActiveAccounts', (req, res)=>{
  User.countDocuments({"loginInfo.loginStatus": true}, (err, count)=> {
    if(!err){
      res.json({activeAccounts: count});
    }
  })
})
app.get('/getUserAccounts', (req, res)=>{
  User.countDocuments({}, (err, count)=> {
    if(!err){
      res.json({userAccounts: count});
    }
  })
})

// Routes for Materials page
app.get('/materials', (req, res)=>{
  res.render('materials');
})
app.get('/getMaterials', (req, res)=>{
  fs.readdir('./subject materials/', (err, dir)=>{
    if(!err){
      let materialNames = [];
      dir.forEach((name)=>{
        materialNames.push(name.substring(0, name.length-4));
      })

      res.json(materialNames);
    }
  })
})
app.get('/getMaterials/:name', (req, res)=>{
  console.log('./subject materials/' + req.params.name + '.zip')
  res.download(__dirname + '/subject materials/' + req.params.name + '.zip', req.params.name + '.zip');
})

// POSTS Requests
// Routes for login & Registration Page
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
            const userImage = fs.readFileSync('./public/images/user image.png');

            const newUser = new User({
              loginInfo: {
                email: userEmail, 
                password: hash, 
                loginStatus: false, 
                admin: false
              }, 
              userInfo: {
                  name: {
                  firstName: '---', 
                  lastName: '---'
                }, 
                description: '---', 
                profilePhoto: userImage, 
                profilePhotoType: 'image/png'
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
            if(foundUser.loginInfo.admin === true){
              res.redirect('/adminPage');
            }
            else{
              // Convert userEmail to username for url
              username = functions.getUsername(userEmail);
              res.redirect(`/${username}/home`);
            }
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

// Routes for Home Page
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
app.post('/contact', (req, res)=>{
  // console.log(req.body);
  const newContact = new Contact({
    name: req.body.name, 
    email: req.body.email, 
    message: req.body.message
  })
  newContact.save();
  res.send('The Contact Form details were succesfully submitted');
})
app.post('/:username/home/makePost', (req, res)=>{  
  // Check for profanity in title
  const isTitleProfane = filter.isProfane(req.body.title); 
  // Check for profanity in body
  const isBodyProfane = filter.isProfane(req.body.body);
  
  // Store post in DB
  if(isTitleProfane === false && isBodyProfane === false){
    User.findById(req.body.userId, (err, foundUser)=>{
      if(!err){
        const idForNewPost = foundUser.userPosts.length + 1;
        const newPost = {
          id: idForNewPost, 
          postTitle: req.body.title, 
          postBody: req.body.body, 
          likes: 0
        }
        foundUser.userPosts.push(newPost);
        foundUser.save((err, updatedDetails)=>{
          // Saving the Post made to the POST collection with its id
          if(!err){
            console.log("The post was successfully in the DB");
            const postAdded = updatedDetails.userPosts[updatedDetails.userPosts.length-1];
            const post = new Post({
              _id: postAdded._id, 
              title: postAdded.postTitle, 
              body: postAdded.postBody,
              username: updatedDetails.loginInfo.email 
            })
            post.save();
            console.log('The new post was added to the POST Collection');
          }
        });
      }
    })
  }

  res.json({
    isTitleProfane: isTitleProfane, 
    isBodyProfane: isBodyProfane, 
    cleanTitle: filter.clean(req.body.title), 
    cleanBody: filter.clean(req.body.body), 
  })
})
app.post('/:username/home/posts/deletePost', (req, res)=>{
  const userEmail = functions.getEmailId(req.params.username);
  console.log(req.body)
  User.findOneAndUpdate({"loginInfo.email": userEmail}, {$pull: {userPosts: {_id: req.body.id}}}, (err)=>{
    if(!err){
      res.json({postDeleted: true});
    }
  })
})
app.post('/:username/home/deleteHobby', (req, res)=>{
  const hobby = req.body.hobby.trim(), 
        userEmail = functions.getEmailId(req.params.username); 
  
  User.findOneAndUpdate({"loginInfo.email": userEmail}, {$pull: {"userInfo.hobbies": {hobby: hobby}}},  (err)=>{
    if(!err){
      res.json({hobbyDeleted: true});
      console.log(hobby + ' was successfully deleted from the database');
    }
    else{
      console.log(err);
    }
  })
})
app.post('/:username/home/deleteSkill', (req, res)=>{
  const userEmail = functions.getEmailId(req.params.username);
  
  User.findOneAndUpdate({"loginInfo.email": userEmail}, {$pull: {"userInfo.skills": {skill: req.body.skill}}}, (err)=>{
    if(!err){
      res.json({skillDeleted: true});
      console.log(req.body.skill + ' was successfully deleted from the database');
    }
  })
})
app.post('/makeComment/email=:email&postId=:postId&userId=:userId', (req, res)=>{
  let username;
  // console.log(req.params, req.body);
  User.findById(req.params.userId, (err, foundUser)=>{
    if(!err){
      username = foundUser.loginInfo.email;
    }
  })
  User.findOne({"loginInfo.email": req.params.email}, (err, foundUser)=>{
    if(!err){
      let posts = foundUser.userPosts;
      for(let i = 0; i < posts.length; i++){
        if(String(posts[i]._id) === String(req.params.postId)){
          posts[i].comments.push({
            username: username, 
            comment: req.body.comment
          });
          
          foundUser.save((err)=>{
            if(!err){
              console.log('Comment added to post ' + req.params.postId);
              res.json({
                commentAdded: true
              })
            }
          })
          break;
        }
      }
    }
  })
})
app.post('/:userId/uploadImage', upload.single('image'), (req, res)=>{
  const imageSize = req.file.size / 1000000;
  if(imageSize > 16){
    res.json({
      image: null, 
      type: null,
      text: 'Image size should be less than 16 MB', 
      color: 'red'
    })
  }
  else{
    User.findById(req.params.userId, (err, foundUser)=>{
      foundUser.userInfo.profilePhoto = req.file.buffer; 
      foundUser.userInfo.profilePhotoType = req.file.mimetype;
  
      foundUser.save((err)=>{
        if(!err){
          console.log('Image uploaded to DB');
          res.json({
            image: req.file.buffer.toString('base64'), 
            type: req.file.mimetype,
            text: 'Image successfully uploaded', 
            color: 'green'
          })
        }
      })
    })
  }
})

// Routes for Admin Page
app.post('/addEvent', (req, res)=>{
  Event.findOne({}, (err, foundEvent)=>{
    if(!err){
      if(req.body.type === 'event'){
        foundEvent.events.push({
          eventName: req.body.name, 
          month: req.body.month, 
          date: req.body.date
        })
      }
      else if(req.body.type === 'holiday'){
        foundEvent.holidays.push({
          holidayName: req.body.name, 
          month: req.body.month, 
          date: req.body.date
        })
      }
      foundEvent.save();
    }
  })
  res.json({success: true});
})
app.post('/deleteEvent', (req, res)=>{
  Event.findOneAndUpdate({}, {$pull: {events: {_id: req.body.id}}}, (err, foundEvent)=>{
    if(!err){
      res.json({eventDeleted: true});
    }
    else{
      console.log(err);
    }
  })
})
app.post('/deleteHoliday', (req, res)=>{
  Event.findOneAndUpdate({}, {$pull: {holidays: {_id: req.body.id}}}, (err, foundEvent)=>{
    if(!err){
      res.json({holidayDeleted: true});
    }
    else{
      console.log(err);
    }
  })
})
app.post('/deleteContactCard', (req, res)=>{
  Contact.findByIdAndDelete(req.body.id, (err)=>{
    if(!err){
      res.json({contactDeleted: true});
    }
  })
})
app.post('/uploadMaterial', uploadMaterial.single('file'), (req, res)=>{
  fs.stat(`./subject materials/${req.file.originalname}`, (err, stats)=>{
    if(!err){
      res.send('File uploaded successfully!');
    }
  })
})

app.listen('3000', ()=>{
  console.log('The server is running on port 3000');
})
