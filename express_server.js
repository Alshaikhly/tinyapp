const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieParser());

const generateRandomString = function() {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render('urls_index', templateVars);
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls")
})
app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username)
  res.redirect("/urls")
})

app.post("/urls/:shortURL/delete", (req, res) =>{
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete]
  res.redirect("/urls");
})

app.post("/urls/:shortURL/edit", (req, res) =>{
  const redirect = req.params.shortURL
  res.redirect(`/urls/${redirect}`);
})

app.post("/urls/:shortURL", (req, res) =>{
  urlDatabase[req.params.shortURL] = req.body.Newurl;
  res.redirect('/urls');
})

app.get("/urls/new", (req, res) => {
  const username = req.cookies["username"];
  res.render("urls_new", { username });
});

app.post("/urls", (req, res) => {
  let newRandomString = generateRandomString();
  urlDatabase[newRandomString] = req.body.longURL;
  res.redirect(`/urls/${newRandomString}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  const username = req.cookies["username"];
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const username = req.cookies["username"];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () =>{
  console.log(`Example app listening on port ${PORT}`);
});