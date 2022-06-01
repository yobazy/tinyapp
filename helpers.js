
const getUserByEmail = function(email, database)  {
    for(let user in database) {
      if(database[user]['email'] === email) {
        return user;
      }
    }
    return undefined;
  };

const urlsForUser = function(id)  {
    let userUrls = {};
    for (let url in urlDatabase)  {
      let urlCreator = urlDatabase[url]['userID']
      if (id === urlCreator)  {
        userUrls[url] = urlDatabase[url]
      }
    }
    return userUrls;
  }

  module.exports = { getUserByEmail, urlsForUser};