const express = require("express");
const cookieParser = require('cookie-parser');
const app = express()
app.use(cookieParser())
const PORT = 8080; 


app.set("view engine", "ejs");


function generateRandomString() {
  return Math.random().toString(36).slice(2).substring(0, 6);
};

function userLookup(email) {
  for (let key in users) {
    if (email === users[key].email) {
      return users[key];
    }
  }
  return false;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    user_id: users[req.cookies["user_id"]],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect(`/login`);
  }
  user_id = users[req.cookies["user_id"]];
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    console.log(error);
    return res.status(403).send("<html><body>You need to be logged in to create a new URL.</body></html>");
  }
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL; 
  res.redirect(`/urls/${id}`) 
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies["user_id"]], 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    return res.status(404).send("<html><body>Shortened URL not found.</body></html>");
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]; 
  res.redirect(`/urls`); 
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`); 
});

app.post("/urls/:id/edit", (req, res) => {
  const vars = { 
    user_id: users[req.cookies["user_id"]],
    id: req.params.id, 
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", vars); 
});

app.post("/login", (req, res) => {
  if (userLookup(req.body.email) === false) {
    return res.status(403).send("Email cannot be found");
  }
  if (userLookup(req.body.email).password !== req.body.password) {
    return res.status(403).send("Password incorrect");
  }
  let userId = userLookup(req.body.email).id
  res.cookie("user_id", userId);
  res.redirect("/urls"); 
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); 
  res.redirect(`/login`); 
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect(`/urls`);
  }
  const templateVars = {
    user_id: users[req.cookies["user_id"]]
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email or password can not be empty");
  } 
  if (userLookup(req.body.email)) {
    return res.status(400).send("Email already exists");
  } 
  let userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", userId);
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect(`/urls`);
  }
  const templateVars = {
    user_id: users[req.cookies["user_id"]]
  };
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

