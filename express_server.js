const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const session = require("cookie-session");
const { redirect } = require("express/lib/response");
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('./helpers');
const { urlsForUser } = require('./helpers');
const { generateRandomString } = require('./helpers');

//initialize urlDatabase
const urlDatabase = {};

//initalize users database
const users = {};


app.use(bodyParser.urlencoded({extended: true}));

app.use(
  session({
    name: 'session',
    keys: ['banana']
  }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// GET URLS
app.get("/urls", (req, res) => {

  let id = req.session['user_id'];

  // add userAcc based on ID
  let userAcc = users[id];
  let userUrlObj = urlsForUser(id, urlDatabase);

  const templateVars = { urls: userUrlObj, user:userAcc };
  res.render("urls_index", templateVars);
});

// GET REGISTER PAGE
app.get("/register", (req, res) => {
  res.render("register");
});

// GET LOGIN PAGE
app.get("/login", (req, res) => {
  res.render("login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// GET HELLO WORLD PAGE
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// GET NEW URL PAGE
app.get("/urls/new", (req, res) => {
  let userAcc = users[req.session.user_id];
  const templateVars = { user: userAcc };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// GET SPECIFIC URL PAGE
app.get("/urls/:shortURL", (req, res) => {
  let id = req.session['user_id'];
  console.log(id)
  console.log(users)
  let userAcc = users[id];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user: userAcc 
  };
  console.log(templateVars)
  console.log(userAcc)
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

//POST URL
app.post("/urls", (req, res) => {
  let longUrl = req.body.longURL;
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {};
  urlDatabase[shortUrl]['longURL'] = longUrl;
  urlDatabase[shortUrl]['userID'] = req.session.user_id;
  
  res.redirect(`/urls/${shortUrl}`);
});

//POST DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  let id = req.session['user_id'];
  let userAcc = users[id];
  const templateVars = { urls: urlDatabase, user: userAcc };
  delete templateVars['urls'][req.params.shortURL];
  res.render("urls_index", templateVars);
});

//POST URL
app.post("/urls/:id", (req, res) => {
  let id = req.session['user_id'];
  let userAcc = users[id];
  console.log(urlDatabase)
  urlDatabase[req.body.shortURL] = {}
  urlDatabase[req.body.shortURL]['longURL'] = req.body['longURL'];
  urlDatabase[req.body.shortURL]['userID'] = id
  let userUrls = urlsForUser(id, urlDatabase);
  console.log(urlDatabase)
  console.log(userUrls)
  const templateVars = { urls: userUrls, user: userAcc };
  res.render("urls_index", templateVars);
});

//POST LOGIN
app.post("/login", (req, res) => {
  // user inputted data
  let inputEmail = req.body['email'];
  let inputPass = req.body['password'];

  // lookup user by email
  let userID = getUserByEmail(inputEmail, users);
  let userAcc = users[userID];

  //if userAcc undefined return error
  if (inputEmail == '' || inputPass == '') {
    return res.status(403).send('Please input email and pass');
  }
  if (typeof userID === 'undefined')  {
    return res.status(403).send('No user with that email');
  }

  req.session.user_id = userID

  let userUrls = urlsForUser(userID, urlDatabase)
  const templateVars = {
    urls: userUrls
  };
  // compare password using bcrypt
  if (bcrypt.compareSync(inputPass, userAcc['password'])) {
    templateVars['user'] = userAcc;
  } else  {
    return res.status(403).send('No user with that email/pass');
  }

  res.render("urls_index", templateVars);
  res.redirect('/urls');
});

//POST LOGOUT
app.post("/logout", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  req.session.user_id = {};
  res.render("urls_index", templateVars);
  res.redirect(`/urls`);
});

//POST REGISTER
app.post('/register', (req, res) => {
  let emailAdd = req.body.email;
  let pass = req.body.password;
  let passwordEncrypt = bcrypt.hashSync(pass, 10);

  // check if either strings are empty
  if (emailAdd === '' || pass === '') {

    res.status(400).send('Please fill in both email and password');
    return res.redirect('/register');
  }
  
  // check if email is already in users
  for (let user in users) {
    let sysEmail = users[user]['email'];
    if (sysEmail === emailAdd) {
      res.status(400).send('email in use already');
      return res.redirect('/register');
    }
  }

  let id = generateRandomString();
  req.session.user_id = id;

  users[id] = {};
  users[id]['id'] = id;
  users[id]['email'] = emailAdd;
  users[id]['password'] = passwordEncrypt;

  res.redirect('/urls');
});