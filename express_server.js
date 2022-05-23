const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { redirect } = require("express/lib/response");

function generateRandomString() {
  let genString = Math.random().toString(36).slice(2,8)
  return genString
}

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  res.cookie('username', req.body['username'])
  const templateVars = {
    username: req.body.username,
    urls: urlDatabase
  };
  // res.render("urls_index", templateVars);
  res.render("urls_index", templateVars);
});

// const templateVars = {
//   username: req.cookies["username"],
//   // ... any other vars
// };
// res.render("urls_index", templateVars);

app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username)
  const templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
  res.redirect(`/urls`);
});