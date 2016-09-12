function Timers() {

    this.timers = {};
    this.idCounter = 0;

}

// Use `id` for those timeouts which you want to stop manually, e.g. for those which iterate themselves.
Timers.prototype.setTimeout = function (id, callback, delay, triggerBeforeClear) {

    var self = this;

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

        triggerBeforeClear: triggerBeforeClear,
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