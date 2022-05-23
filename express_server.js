const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { redirect } = require("express/lib/response");

function generateRandomString() {
  let genString = Math.random().toString(36).slice(2,8)
  return genString
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let longUrl = req.body.longURL
  let shortUrl = generateRandomString()
  urlDatabase[shortUrl] = longUrl
  res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params.shortURL)
  const templateVars = { urls: urlDatabase };
  console.log(templateVars)
  delete templateVars['urls'][req.params.shortURL]
  res.render("urls_index", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.body.shortURL] = req.body['longURL']
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/login", (req, res) => {
  // res.cookie('user', req.body['user_id'])
  let userID = req.cookies['user_id']
  let inputEmail = req.body['email']
  let inputPass = req.body['password']
  let userAcc = users[userID]
  console.log(userAcc)
  let sysEmail = ''
  if(typeof userAcc != 'undefined')  {
    sysEmail = userAcc['email']
  }
  console.log('input', inputEmail)

  const templateVars = {
    urls: urlDatabase
  };

  if (inputEmail === sysEmail && inputPass === userAcc['password']) {
      templateVars['user'] = userAcc;
  } else  {
    res.status(403)
  }
  res.cookie('user_id', userAcc['id'])
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
  let passwordAdd = req.body.password
  console.log('bool', (emailAdd || passwordAdd))

  if(!(emailAdd || passwordAdd)) {
    res.status(400)
    return res.redirect('/urls');
  }
  
  for (let user in users) {
    console.log(user)
    let sysEmail = users[user]['email']
    console.log('sysEmail', sysEmail)
    if(sysEmail === emailAdd) {
      console.log('added already')
      res.status(400)
      return res.redirect('/urls');
    }
  }

  let id = generateRandomString()
  res.cookie('user_id', id)

  users[id] = {}
  users[id]['id'] = id
  users[id]['email'] = emailAdd;
  users[id]['password'] = passwordAdd;
  res.redirect('/urls')
});