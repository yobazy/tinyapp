
const getUserByEmail = function(email, database)  {
    for(let user in database) {
      if(database[user]['email'] === email) {
        return user;
      }
    }
    return undefined;
  };

  module.exports = getUserByEmail;