/**
 * Created by fima on 29.01.15.
 */
var readline = require('readline');

module.exports = (function() {
  var Dialog = function(caption, items, cb, opt_h) {
    this.rl_ = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.caption_ = caption;
    this.items_ = items;
    opt_h = opt_h !== undefined ? opt_h : this;
    this.cb_ = cb.bind(opt_h);
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
