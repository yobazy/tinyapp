// Get user info by email
const getUserByEmail = function(email, database)  {
    for(let user in database) {
      if(database[user]['email'] === email) {
        return user;
      }
    }
    return undefined;
  };

// Return urls for specific user
const urlsForUser = function(id, urlDatabase)  {
    let userUrls = {};
    for (let url in urlDatabase)  {
      let urlCreator = urlDatabase[url]['userID']
      if (id === urlCreator)  {
        userUrls[url] = urlDatabase[url]
      }
    }
    return userUrls;
  }

//generate random string function
const generateRandomString = function() {
  let genString = Math.random().toString(36).slice(2,8)
  return genString
}

module.exports = { 
  getUserByEmail, 
  urlsForUser, 
  generateRandomString 
};