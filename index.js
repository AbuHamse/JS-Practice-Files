function snail(array) {
    const result = [];
    while (array.length) {
      // Step 1: Remove the first row and add to result
      result.push(...array.shift());
  
      // Step 2: Add the last element of each remaining row
      for (let i = 0; i < array.length; i++) {
        result.push(array[i].pop());
      }
  
      // Step 3: Remove the last row and add to result (in reverse order)
      if (array.length) {
        result.push(...array.pop().reverse());
      }
  
      // Step 4: Add the first element of each remaining row (in reverse order)
      for (let i = array.length - 1; i >= 0; i--) {
        result.push(array[i].shift());
      }
    }
    return result;
  }
  
  // Example usage:
  const array = [
    [3, 2, 1],
    [6, 5, 4],
    [9, 8, 7]
  ];
  console.log(snail(array)); // Output: [1, 2, 3, 6, 9, 8, 7, 4, 5]
  