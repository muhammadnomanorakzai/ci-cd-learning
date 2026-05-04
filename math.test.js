const { add, subtract, multiply } = require('./math');

// ADD tests
test('adds 2 + 3 to equal 5', () => {
  expect(add(2, 3)).toBe(5);
});

test('adds negative numbers', () => {
  expect(add(-1, -1)).toBe(-2);
});

// SUBTRACT tests
test('subtracts 10 - 4 to equal 6', () => {
  expect(subtract(10, 4)).toBe(6);
});

// MULTIPLY tests
test('multiplies 3 * 3 to equal 9', () => {
  expect(multiply(3, 3)).toBe(9);
});

// ❌ Yeh test fail karega — intentionally
test('adds 2 + 2 to equal 5 (wrong)', () => {
  expect(add(2, 2)).toBe(4);
});