const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieParser());

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: bcrypt.hashSync('cookinglessons', 10)
  }
}

const addNewUser = (email, password) => {
  const userId = generateRandomString()
    const newUser = {
      id: userId,
      email,
      Password: bcrypt.hashSync(password, 10)
    };

    users[userId] = newUser;

    return userId;
};

const checkUserLogin = (email, password) => {
  const user = userEmailLookup(email)
  console.log(user);
  if (user && bcrypt.compareSync(password, user.password)) {
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
      returunUrl[shortUrl] = shortUrlObj
    }
  }
  return returunUrl;
}

const matchUserId = (id, ownerId) => {
   if (id === ownerId) {
    return true
  }
  return false
}

const generateRandomString = function() {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const userEmailLookup = (email) => {
  for (let id in users) {
    if (users[id].email === email) {
       return users[id];
    } 
  }
  return false;
}

const passwordLookup = password => {
  for (const id in users) {
    if (users[id].password === password) {
      return id;
    }
  }
}

let urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
  let templateVars = { urls: getUrlsByUserId(user_Id), user};
  res.render('urls_index', templateVars);
});

app.get("/register", (req, res) => {
  const user_Id = req.cookies.user_Id;
  const user = users[user_Id];
  let templateVars = { user }
  res.render("urls_registration", templateVars )
});

app.get("/login", (req, res) => {
  const user_Id = req.cookies.user_Id;
  const user = users[user_Id];
  let templateVars = { user }
  res.render("urls_login", templateVars)
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
  const idObj = urlDatabase[req.params.shortURL]
  const posterId = idObj.userID
  const redirect = req.params.shortURL
  
  if (!matchUserId(user_Id, posterId)) {
    res.status(403).send('You are not allowed to to edit this URL');
  }
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL].longURL
  let templateVars = { shortURL, longURL, user };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = userEmailLookup(email);

  if (email === '' || password === '') {
    return res.status(400).send('Please fill out the empty fields');
  }

  if(user){
    return res.status(400).send('The account already exists');
  } else {
    userId = addNewUser(email, password);
    // console.log(users);
    res.cookie("user_Id", userId);
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
    return res.status(403).send('Sorry the email or password are not correct, try again or try to register')
  } else {
    userId = user.id
    res.cookie("user_Id", userId);
    res.redirect("/urls");
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_Id')
  res.redirect("/urls")
});
app.post("/urls/:shortURL/delete", (req, res) =>{
  const user_Id = req.cookies.user_Id
  const idObj = urlDatabase[req.params.shortURL]
  const posterId = idObj.userID
  const shortURL = req.params.shortURL
  
  if (!matchUserId(user_Id, posterId)) {
    res.status(403).send('You are not allowed to to edit this URL');
  }
  delete urlDatabase[shortURL]
  res.redirect("/urls");
})

app.post("/urls/:shortURL/edit", (req, res) =>{
  const user_Id = req.cookies.user_Id
  const idObj = urlDatabase[req.params.shortURL]
  const posterId = idObj.userID
  const redirect = req.params.shortURL
  
  if (!matchUserId(user_Id, posterId)) {
    res.status(403).send('You are not allowed to to edit this URL');
  }
  res.redirect(`/urls/${redirect}`);
})

app.post("/urls/:shortURL", (req, res) =>{
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.Newurl;
  res.redirect('/urls');
})

app.post("/urls", (req, res) => {
  let newRandomString = generateRandomString();
  const longURL = req.body.longURL
  const userID = req.cookies.user_Id
  urlDatabase[newRandomString] = {longURL, userID};
  // console.log("req.body.user_Id>>", req.body.longURL);
  // console.log(urlDatabase[newRandomString]);
  // console.log(urlDatabase);
  res.redirect(`/urls/${newRandomString}`);
});

app.listen(PORT, () =>{
  console.log(`Example app listening on port ${PORT}`);
});
