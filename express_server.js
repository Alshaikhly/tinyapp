const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieParser());

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
}

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
  const user_Id = req.cookies.user_Id;
  const user = users[user_Id];
  let templateVars = { urls: urlDatabase, user };
  res.render('urls_index', templateVars);
});

app.get("/register", (req, res) => {
  const user_Id = req.cookies.user_Id;
  const user = users[user_Id];
  let templateVars = { user }
  res.render("urls_registration", templateVars )
})

app.get("/urls/new", (req, res) => {
  const user_Id = req.cookies.user_Id;
  const user = users[user_Id];
  let templateVars = { urls: urlDatabase, user }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_Id = req.cookies.user_Id;
  const user = users[user_Id];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/register", (req, res) => {
  const userId = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;
  const newUser = {
    id: userId,
    email,
    password
  }
  users[userId] = newUser;
  res.cookie("user_Id", userId);
  res.redirect("/urls");
})

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

app.post("/urls", (req, res) => {
  let newRandomString = generateRandomString();
  urlDatabase[newRandomString] = req.body.longURL;
  res.redirect(`/urls/${newRandomString}`);
});

app.listen(PORT, () =>{
  console.log(`Example app listening on port ${PORT}`);
});