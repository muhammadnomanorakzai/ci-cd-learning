// Simple functions jo hum test karenge
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

// ❌ var use karo — ESLint error aayega
var name = "Noman"  

function add(a, b) {
  return a + b;
}

module.exports = { add, subtract, multiply };