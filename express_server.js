const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const session = require("cookie-session");
const { redirect } = require("express/lib/response");
const bcrypt = require('bcryptjs');
const getUserByEmail = require('./helpers')

function generateRandomString() {
  let genString = Math.random().toString(36).slice(2,8)
  return genString
}

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


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

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
    // resave: false,
    name: 'session',
    keys: ['banana']
    // saveUninitialized: false
}))

app.set("view engine", "ejs");

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/", (req, res) => {
  res.send("Hello!");
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

app.get("/urls", (req, res) => {
  let id = req.session['userID']
  let userUrlObj = urlsForUser(id)
  console.log(userUrlObj)
  const templateVars = { urls: userUrlObj };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL']
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let longUrl = req.body.longURL
  let shortUrl = generateRandomString()
  urlDatabase[shortUrl]['longURL'] = longUrl
  res.redirect(`/urls/${shortUrl}`);
});

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

app.post("/login", (req, res) => {
  let userID = req.session.user_id
  let userAcc = users[userID]

  let inputEmail = req.body['email']
  let inputPass = req.body['password']

  let sysEmail;

  const templateVars = {
    urls: urlDatabase
  };

  if(typeof userAcc == 'undefined')  {
    return res.render("urls_index", templateVars);
  }
  sysEmail = userAcc['email']

  if (inputEmail === sysEmail && bcrypt.compareSync(inputPass, userAcc['password'])) {
      templateVars['user'] = userAcc;
  } else  {
    res.status(403)
  }
  
  res.render("urls_index", templateVars); 
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.body.user_id)
  const templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
  res.redirect(`/urls`);
});

app.post('/register', (req, res) => {
  let emailAdd = req.body.email
  let pass = req.body.password
  let passwordAdd = bcrypt.hashSync(pass, 10);

  if(!(emailAdd || pass)) {
    console.log('need to fill in data')
    res.status(400)
    return res.redirect('/urls');
  }
  
  for (let user in users) {
    let sysEmail = users[user]['email']
    if(sysEmail === emailAdd) {
      console.log('email in use already')
      res.status(400)
      return res.redirect('/urls');
    }
  }

  let id = generateRandomString()
  req.session.user_id = id;

  users[id] = {}
  users[id]['id'] = id
  users[id]['email'] = emailAdd;
  users[id]['password'] = passwordAdd;
  console.log(users)
  res.redirect('/urls')
});