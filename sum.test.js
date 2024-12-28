
/*
import { SiExpertsexchange } from 'react-icons/si';
import sum from './sum'

const sum = sum;
test('should take 1 and 2 and return 3 ', () => {
  expect(sum(1,2).toBe(3))
})

expect() is first declared before the method

.toBe() method can be used with any Primitive Value (String, Number, Boolean)

.toEqual() method is used to compare the values of Objects and Arrays

*/


test('2 + 2 is equal to 4', () => {
  expect(2+2).toBe(4);
})


test('object assignment', () => {
  const data = {one : 1};
  data['two'] = 2
  expect(data).toEqual({one: 1, two: 2})
})


test('should be an object with both 3 and 4 ', () => {
  const data1 = { tag: 3, tag: 4}
  expect(data1).toEqual({tag:3, tag:4})
})

