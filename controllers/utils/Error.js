/** 
 * Custom error to include
 * a message and a code
 * 
 */

var log = require("./../../Logger").child({
  module : "utils/Error.js"
});

function MyError(msg, code, status) {
Error.captureStackTrace(this, this.constructor);
this.message = msg;
this.code = code;
this.status = status;
}

MyError.new = function(error){
  return new MyError(error.message, error.code, error.status);
}

MyError.prototype.toJSON = function () {
if (this.status) {
  return {
    message: this.message,
    code: this.code,
    status: this.status
  }
}

return {
  message: this.message,
  code: this.code
}
}

module.exports = MyError;