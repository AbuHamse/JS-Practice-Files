function getUser(userId) {
  return new Promise((resolve, reject) => {
    // Simulating database call
    setTimeout(() => {
      resolve({ id: userId, name: 'John' });
    }, 1000);
  });
}

function getUserPosts(user) {
  return new Promise((resolve, reject) => {
    // Simulating API call
    setTimeout(() => {
      resolve(['Post 1', 'Post 2', 'Post 3']);
    }, 1000);
  });
}

// Chain the promises
getUser(123)
  .then(user => {
    console.log('User:', user);
    return getUserPosts(user);
  })
  .then(posts => {
    console.log('Posts:', posts);
  })
  .catch(error => {
    console.error('Error:', error);
  });