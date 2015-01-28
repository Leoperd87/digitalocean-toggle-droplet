/**
 * Created by fima on 29.01.15.
 */
var readline = require('readline');

module.exports = (function() {
  /**
   * Simple menu
   * @param {string} caption Menu title
   * @param {Array.<string>} items Array of menu items
   * @param {function} cb Callback function
   * @param {object} opt_scope An optional scope to call the callback in.
   * @constructor
   */
  var Dialog = function(caption, items, cb, opt_scope) {
    this.rl_ = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.caption_ = caption;
    this.items_ = items;
    opt_scope = opt_scope !== undefined ? opt_scope : this;
    this.cb_ = cb.bind(opt_scope);
  };
  Dialog.prototype = {
    clear: function() {
      console.log('\033[2J');
    },
    render: function() {
      this.clear();

      console.log(this.caption_);
      console.log('-------------------------');

      for (var i = 0; i < this.items_.length; i++) {
        console.log(i + ' : ' + this.items_[i]);
      }

      this.rl_.question('>>', function(answer) {
        if (answer === parseInt(answer).toString()) {
          this.cb_(parseInt(answer));
        } else {
          this.render();
        }
      }.bind(this));
    },
    close: function() {
      this.clear();
      this.rl_.close();
    }
  };
  return Dialog;
})();
