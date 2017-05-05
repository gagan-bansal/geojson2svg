// extend.js
// extend b to a with shallow copy
module.exports = function(a, b) {
  var c = {}
  Object.keys(a).forEach(function(key) {
    c[key] = a[key]
  })
  Object.keys(b).forEach(function(key) {
    c[key] = b[key]
  })
  return c
} 
