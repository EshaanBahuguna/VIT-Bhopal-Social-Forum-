const express = require('express'), 
      app = express(), 
      bodyParser = require('body-parser');

app.set('view engine' , 'ejs');
app.use(express.static(__dirname + '/public'));


app.get('/home', (req, res)=>{
  res.render('home');
})
app.get('/login', (req, res)=>{
  res.render('login');
})

app.listen('3000', ()=>{
  console.log('The server is running on port 3000');
})