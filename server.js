//server.js
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
//static file directory
app.use( express.static("public"));

//allows us to access POST request parameters
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//set view engine to ejs
app.set('view engine', 'ejs');

//our list of URLS
const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//index page
app.get("/", (req,res) =>{
  console.log('Cookies:', req.cookies);
  res.end("Hello!\n");
});

//urls page
app.get('/urls', (req, res) =>{
  let templateVars = { urls: urlDatabase,
  username: req.cookies['username'] };
  res.render("urls_index", templateVars);
});

//add urls page
app.get('/urls/new', (req, res) => {
  let templateVars = {
    username: req.cookies['username']
  };
  res.render('urls_new', templateVars);
});

//handle logout POST
app.post("/logout", (req, res) => {
console.log(`User logged out from ${req.cookies['username']}`);
res.clearCookie('username');
res.redirect("/urls");
});

//add urls POST
app.post('/urls', (req, res) => {
  console.log("POST happened at /urls")
  let id = generateRandomString()
  urlDatabase[id] = req.body.longURL
  let templateVars = { shortURL: id,
    longURL: req.body.longURL,
    username: req.cookies['username']
    };
    //redirect to id's page
  res.render('urls_show', templateVars);
});

//handle login POST
app.post('/login', (req, res) => {
  if (req.body.username != ""){
  console.log(`User logged in with username ${req.body.username}`);
  res.cookie('username', req.body.username);
    res.redirect('/urls');
  }
  else {
    res.redirect('/urls');
  }
});

//generate random String Function
function generateRandomString(){
  let randomStr = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++){
    randomStr += possible.charAt(Math.floor(Math.random() * possible.length));
  };
  return randomStr;
};

//single url page with 404 functionality
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]){
    res.redirect("/404")
  } else {
  let templateVars = { shortURL: req.params.id,
  longURL: urlDatabase[req.params.id],
  username: req.cookies['username'] };
  res.render("urls_show", templateVars);
  }
});

//delete URL resource
app.post('/urls/:id/delete', (req, res) =>{
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
});

//modify URL resource
app.post('/urls/:id/update', (req, res) =>{
  urlDatabase[req.params.id] = req.body.url;
  res.redirect(`/urls/${req.params.id}`);
});

//redirect short links
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL == undefined) {
    console.log("Client entered an incorrect shortURL")
    res.send("You entered an incorrect shortURL!\n")
  } else {console.log(`Redirected client to: ${longURL}`)
  res.redirect(longURL);
  }
});

app.get("/404", (req, res) => {
  res.render('404');
});

//custom 404 page
app.use((req, res, next) =>{
  console.log(`Client requested ${req.url}, giving them 404`)
  res.redirect('/404')
});

app.listen(8080);
console.log('8080 is the magic port');