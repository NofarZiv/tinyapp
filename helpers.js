
const getUserByEmail = function(email, database) {
  for (let key in database) {
    if (email === database[key].email) {
      return database[key];
    }
  }
  return undefined;
};



module.exports = getUserByEmail;