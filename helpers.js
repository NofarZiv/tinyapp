
const getUserByEmail = function(email, database) {
  for (let key in database) {
    if (email === database[key].email) {
      return database[key];
    }
  }
  return undefined;
};

const urlsForUser = function(id, database) {
  let userUrlsObj = {};
  for (let key in database) {
    if (database[key].userID === id) {
      userUrlsObj[key] = database[key].longURL;
    }
  }
  return userUrlsObj;
};

const generateRandomString = function() {
  return Math.random().toString(36).slice(2).substring(0, 6);
};


module.exports = { getUserByEmail, urlsForUser, generateRandomString };