const bcrypt = require('bcrypt')

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

const userEmailLookup = (email, database) => {
  for (let id in database) {
    if (database[id].email === email) {
       return database[id];
    } 
  }
  return false;
}

module.exports = {
   matchUserId,
   generateRandomString,
   userEmailLookup,
   }