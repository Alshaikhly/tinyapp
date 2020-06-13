const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const PORT = 8080;
const bodyParser = require('body-parser');
const helpers = require('./helpers');
let cookieSession = require('cookie-session');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['f080ac7b-b838-4c5f-a1f4-b0a9fee10130', 'c3fb18be-448b-4f6e-a377-49373e9b7e1a'],
}));

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync('cookinglessons', 10)
  }
};

let urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const addNewUser = (email, password) => {
  const userId = helpers.generateRandomString();
  const newUser = {
    id: userId,
    email,
    password: bcrypt.hashSync(password, 10)
  };

  users[userId] = newUser;

  return userId;
};

const checkUserLogin = (email, password) => {
  const user = helpers.userEmailLookup(email, users);
  
  if (bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};

const getUrlsByUserId = Id => {
  let returunUrl = {};

  for (const shortUrl in urlDatabase) {
    const shortUrlObj = urlDatabase[shortUrl];
    if (shortUrlObj.userID === Id) {
      returunUrl[shortUrl] = shortUrlObj;
    }
  }
  return returunUrl;
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user_Id = req.session.user_Id;
  const user = users[user_Id];
  let templateVars = { urls: getUrlsByUserId(user_Id), user};
  res.render('urls_index', templateVars);
});

app.get("/register", (req, res) => {
  const user_Id = req.session.user_Id;
  const user = users[user_Id];
  let templateVars = { user };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const user_Id = req.session.user_Id;
  const user = users[user_Id];
  let templateVars = { user };
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_Id = req.session.user_Id;
  const user = users[user_Id];
  let templateVars = { urls: urlDatabase, user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_Id = req.session.user_Id;
  const user = users[user_Id];
  const idObj = urlDatabase[req.params.shortURL];
  const posterId = idObj.userID;
  
  if (!helpers.matchUserId(user_Id, posterId)) {
    res.status(403).send('You are not allowed to to edit this URL');
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  let templateVars = { shortURL, longURL, user };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = helpers.userEmailLookup(email, users);

  if (email === '' || password === '') {
    return res.status(400).send('Please fill up the empty fields');
  }

  if (user) {
    return res.status(400).send('The account already exists');
  } else {
    const userId = addNewUser(email, password);
    req.session.user_Id = userId;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = checkUserLogin(email, password);

  if (email === '' || password === '') {
    return res.status(400).send('Please fill out the empty fields');
  }

  if (!user) {
    return res.status(403).send('Sorry the email or password are not correct, try again or try to register');
  } else {
    const userId = user.id;
    req.session.user_Id = userId;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session.user_Id = null;
  res.redirect("/urls");
});
app.post("/urls/:shortURL/delete", (req, res) =>{
  const user_Id = req.session.user_Id;
  const idObj = urlDatabase[req.params.shortURL];
  const posterId = idObj.userID;
  const shortURL = req.params.shortURL;
  
  if (!helpers.matchUserId(user_Id, posterId)) {
    res.status(403).send('You are not allowed to to edit this URL');
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) =>{
  const user_Id = req.session.user_Id;
  const idObj = urlDatabase[req.params.shortURL];
  const posterId = idObj.userID;
  const redirect = req.params.shortURL;
  
  if (!helpers.matchUserId(user_Id, posterId)) {
    res.status(403).send('You are not allowed to to edit this URL');
  }
  res.redirect(`/urls/${redirect}`);
});

app.post("/urls/:shortURL", (req, res) =>{
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.Newurl;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  let newRandomString = helpers.generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_Id;
  urlDatabase[newRandomString] = {longURL, userID};
  res.redirect(`/urls/${newRandomString}`);
});

app.listen(PORT, () =>{
  console.log(`Example app listening on port ${PORT}`);
});
