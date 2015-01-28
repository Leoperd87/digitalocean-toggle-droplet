/**
 * Created by fima on 26.01.15.
 */
module.exports = (function() {
  var Deffered = function() {
    this.callBacks_ = [];
    this.errBacks_ = [];
    this.fired_ = false;
    this.isSuccess_ = undefined;
    this.callBackData_ = undefined;
    this.errBackData_ = undefined;
    this.awaitD_ = undefined;
  };
  Deffered.prototype = {
    addCallback: function(f, h) {
      if (h === undefined) {
        h = this;
      }
      if (!this.fired_) {
        this.callBacks_.push(f.bind(h));
      } else {
        if (this.isSuccess_ === true) {
          f.call(h, this.callBackData_);
        }
      }
    },
    addErrback: function(f, h) {
      if (h === undefined) {
        h = this;
      }
      if (!this.fired_) {
        this.errBacks_.push(f.bind(h));
      } else {
        if (this.isSuccess_ === false) {
          f.call(h, this.errBackData_);
        }
      }
    },
    addBoth: function(f, h) {
      this.addCallback(f, h);
      this.addErrback(f, h);
    },
    addCallbacks: function(cb, eb, h) {
      this.addCallback(cb, h);
      this.addErrback(eb, h);
    },
    awaitDeferred: function(def) {
      this.awaitD_ = def;
    },
    callback: function(d) {
      if (this.awaitD_ === undefined) {
        this.callback_(d);
      } else {
        this.awaitD_.addBoth(this.callback_.bind(this, d));
      }
    },
    callback_: function(d) {
      if (!this.fired_ && this.isSuccess_ === undefined) {
        this.fired_ = true;
        this.isSuccess_ = true;
        for (var i = 0; i < this.callBacks_.length; i++) {
          this.callBacks_[i](d);
        }
      } else {
        console.log('WTF?!');
      }
    },
    errback: function(d) {
      if (this.awaitD_ === undefined) {
        this.errback_(d);
      } else {
        this.awaitD_.addBoth(this.errback_.bind(this, d));
      }
    },
    errback_: function(d) {
      if (!this.fired_ && this.isSuccess_ === undefined) {
        this.fired_ = true;
        this.isSuccess_ = false;
        this.errBackData_ = d;
        for (var i = 0; i < this.errBacks_.length; i++) {
          this.errBacks_[i](d);
        }
      } else {
        console.log('WTF?!');
      }
    }
  };

  return Deffered;
})();
