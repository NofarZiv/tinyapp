const express = require("express");
const cookieSession = require('cookie-session');
const getUserByEmail  = require('./helpers');
const bcrypt = require("bcryptjs");
const app = express()
app.use(cookieSession({
  name: 'session',
  keys: ["this is a secret key"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const PORT = 8080; 


app.set("view engine", "ejs");


function generateRandomString() {
  return Math.random().toString(36).slice(2).substring(0, 6);
};


function urlsForUser(id) {
  let userUrlsObj = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrlsObj[key] = urlDatabase[key].longURL;
    }
  }
  return userUrlsObj;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.status(302).redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send("<html><body>You need to be logged in or to register to see the URLs.</body></html>");
  }
  let userUrls = urlsForUser(req.session.user_id);
  const templateVars = { 
    user_id: users[req.session.user_id],
    urls: userUrls
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect(`/login`);
  }
  user_id = users[req.session.user_id];
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send("<html><body>You need to be logged in to create a new URL.</body></html>");
  }
  let id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }; 
  res.redirect(`/urls/${id}`) 
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send("<html><body>Please log in to see the short url.</body></html>");
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("<html><body>URL not found.</body></html>");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).send("<html><body>You do not have premission to delete this URL.</body></html>");
  }
  const templateVars = {
    user_id: users[req.session.user_id], 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    return res.status(404).send("<html><body>Shortened URL not found.</body></html>");
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send("<html><body>Please log in to delete the URL.</body></html>");
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("<html><body>URL not found.</body></html>");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(404).send("<html><body>You do not have premission to delete this URL.</body></html>");
  }
  delete urlDatabase[req.params.id]; 
  res.redirect(`/urls`); 
});

app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send("<html><body>Please log in to edit this URL.</body></html>");
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("<html><body>URL not found.</body></html>");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(404).send("<html><body>You do not have premission to edit this URL.</body></html>");
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls`); 
});


app.post("/login", (req, res) => {
  let userEmail = getUserByEmail(req.body.email, users);
  if (userEmail === undefined) {
    return res.status(403).send("Email cannot be found");
  }
  if (!bcrypt.compareSync(req.body.password, userEmail.password)) {
    return res.status(403).send("Incorrect password");
  }
  let userId = userEmail.id
  req.session.user_id = userId;
  res.redirect("/urls"); 
});

app.post("/logout", (req, res) => {
  req.session = null; 
  res.redirect(`/login`); 
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect(`/urls`);
  }
  const templateVars = {
    user_id: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email or password can not be empty");
  } 
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("Email already exists");
  } 
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  let userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: hashedPassword
  }
  req.session.user_id = userId;
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect(`/urls`);
  }
  const templateVars = {
    user_id: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

