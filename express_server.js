const express = require("express");
const cookieParser = require('cookie-parser');
const app = express()
app.use(cookieParser())
const PORT = 8080; 


app.set("view engine", "ejs");


function generateRandomString() {
  return Math.random().toString(36).slice(2).substring(0, 6);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

let name = "username";

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
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  username = req.cookies["username"];
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL; 
  res.redirect(`/urls/${id}`) 
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
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
    username: req.cookies["username"],
    id: req.params.id, 
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", vars); 
});

app.post("/login", (req, res) => {
  res.cookie(name, req.body.username); 
  res.redirect(`/urls`); 
});

app.post("/logout", (req, res) => {
  res.clearCookie(name); 
  res.redirect(`/urls`); 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

