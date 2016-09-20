// Timers() class is used to wrap setTimeout/clearTimeout by keeping timers in an object.
// That allows, for example, to clear all the timers simultaneously, avoiding "timer leaks".

function Timers() {

    this.timers = {};
    this.idCounter = 0;

}

// Use `id` for those timeouts which you want to stop manually, e.g. for those which iterate themselves.
Timers.prototype.setTimeout = function (id, callback, delay, triggerBeforeClear) {

    var self = this;

    // ID can be provided by the user.
    if (typeof id == 'function') {
        triggerBeforeClear = delay;
        delay = callback;
        callback = id;
        id = self.idCounter++;
    } else {
        self.clearTimeout(self.timers[id]);
    }

    self.timers[id] = {

        timerID: setTimeout(function () {
            callback();
            delete self.timers[id];
        }, delay),

        triggerBeforeClear: triggerBeforeClear, // If set to true, `callback` will be invoked just before clearing.
        callback: callback

    };

    return id;

};

Timers.prototype.clearTimeout = function (id) {

    var self = this,
        timer = self.timers[id];

    if (!timer) return;

    if (timer.triggerBeforeClear) timer.callback(); // That is used to immediately stop oscillators.

    clearTimeout(timer.timerID);
    delete self.timers[id];

};

Timers.prototype.nullifyTimers = function () {

    var self = this;

    Object.keys(self.timers).forEach(self.clearTimeout.bind(self));

    self.timers = {};
    self.idCounter = 0;

};