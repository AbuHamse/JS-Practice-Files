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



  function fetchData() {
  return new Promise((resolve, reject) => {
    // Simulating an error
    reject(new Error('Network error'));
  });
}

fetchData()
  .then(
    data => console.log('Data:', data),
    error => console.log('Error handled in then:', error.message)
  );

// Alternative method using catch
fetchData()
  .then(data => console.log('Data:', data))
  .catch(error => console.log('Error handled in catch:', error.message));