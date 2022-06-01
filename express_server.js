const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const session = require("cookie-session");
const { redirect } = require("express/lib/response");
const bcrypt = require('bcryptjs');
const getUserByEmail = require('./helpers')

//login status init
let loggedIn = false;

//generate random string function
function generateRandomString() {
  let genString = Math.random().toString(36).slice(2,8)
  return genString
}

//initial urlDatabase
const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48l2"
    }
};

//inital users
// CAN REMOVE THIS
const users = {} 
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     id: "user2RandomID", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
//   }
// }

//move to helpers.js
function urlsForUser(id)  {
  let userUrls = {};
  for (let url in urlDatabase)  {
    let urlCreator = urlDatabase[url]['userID']
    if (id === urlCreator)  {
      userUrls[url] = urlDatabase[url]
    }
  }
  return userUrls;
}

app.use(bodyParser.urlencoded({extended: true}));

app.use(
  session({
    name: 'session',
    keys: ['banana']
}))

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  console.log(req.session.user_id)
  if(req.session.user_id) {
    res.redirect("/urls")
  } else {
    res.redirect("/login")
  }
});

app.get("/urls", (req, res) => {
  //check if res.cookie is there (FIX)
  // if (!req.session.userID)  {
  //   res.status(400).send('please log in')
  // }

  let id = req.session['user_id']
  // add userAcc based on ID
  let userAcc = users[id]
  let userUrlObj = urlsForUser(id)
  console.log(userUrlObj)

  const templateVars = { urls: userUrlObj, user:userAcc };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let userAcc = users[req.session.user_id]
  const templateVars = { user: userAcc }
  if(req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(urlDatabase)
  let id = req.session['user_id']
  let userAcc = users[id]
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user: userAcc };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL']
  res.redirect(longURL);
});

//POST URL
app.post("/urls", (req, res) => {
  let longUrl = req.body.longURL
  console.log(longUrl)
  let shortUrl = generateRandomString()
  console.log(urlDatabase)
  urlDatabase[shortUrl] = {}
  urlDatabase[shortUrl]['longURL'] = longUrl
  urlDatabase[shortUrl]['userID'] = req.session.user_id
  
  res.redirect(`/urls/${shortUrl}`);
});

//POST DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = { urls: urlDatabase };
  delete templateVars['urls'][req.params.shortURL]
  res.render("urls_index", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.body.shortURL]['longURL'] = req.body['longURL']
  for(let url in urlDatabase) {
    // if(user_id === )
  }
  let userURLS = req.params
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//POST LOGIN
app.post("/login", (req, res) => {
  // user inputted data
  let inputEmail = req.body['email']
  let inputPass = req.body['password']

  // lookup user by email
  let userID = getUserByEmail(inputEmail, users)
  let userAcc = users[userID]

  //if userAcc undefined return error
  if(inputEmail == '' || inputPass == '') {
    return res.status(403).send('Please input email and pass')
  }
  if(typeof userID == 'undefined')  {
    // res.render("urls_index", templateVars);
    return res.status(403).send('No user with that email')
  }
  const templateVars = {
    urls: urlDatabase
  };
  // compare password using bcrypt
  if (bcrypt.compareSync(inputPass, userAcc['password'])) {
    templateVars['user'] = userAcc;
  } else  {
    return res.status(403).send('No user with that email/pass')
  }

  globalThis.loggedIn = true;

  res.render("urls_index", templateVars); 
  res.redirect('/urls');
});

//POST LOGOUT
app.post("/logout", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  req.session.user_id = {}
  res.render("urls_index", templateVars);
  res.redirect(`/urls`);
});

//POST REGISTER
app.post('/register', (req, res) => {
  let emailAdd = req.body.email
  let pass = req.body.password
  let passwordEncrypt = bcrypt.hashSync(pass, 10);

  // check if either strings are empty
  if(emailAdd === '' || pass === '') {

    res.status(400).send('Please fill in both email and password')
    return res.redirect('/register');
  }
  
  // check if email is already in users
  for (let user in users) {
    let sysEmail = users[user]['email']
    if(sysEmail === emailAdd) {
      res.status(400).send('email in use already')
      return res.redirect('/register');
    }
  }

  let id = generateRandomString()
  req.session.user_id = id;

  users[id] = {}
  users[id]['id'] = id
  users[id]['email'] = emailAdd;
  users[id]['password'] = passwordEncrypt;

  res.redirect('/login')
});