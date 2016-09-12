function Music() {

    var self = this,
        vol;

    self.context = new AudioContext();

    vol = self.context.createGain();
    vol.gain.value = 0.05;
    vol.connect(self.context.destination);

    self.dest = vol;

    self.tracks = [];

    self.timers = new Timers();

    self.start(MUSIC);

    window.addEventListener('keydown', function (e) {
        if (e.code === 'KeyQ') {
            if (self.isPlaying) {
                self.end();
            } else {
                self.start(MUSIC);
            }
        }
    });

}

Music.prototype.start = function (composition) {

    var self = this;

    self.tracks = [];

    Object.keys(composition).forEach(function (trackName) {
        self.tracks.push(new Track(self.context, self.dest, composition[trackName], self.timers));
    });

    self.tracks.forEach(function (track) {
        track.play();
    });

    self.isPlaying = true;

};

Music.prototype.end = function () {

    var self = this;

    self.tracks.forEach(function (track) {
        track.stop();
    });

    self.isPlaying = false;

};

function Track(ctx, dest, track, timers) {

    var self = this;

    self.ctx = ctx;
    self.dest = dest;

    self.track = track;
    self.pos = 0;

    self.timers = timers;

}

Track.prototype.play = function () {

    var self = this,
        notes = self.track.notes,

        note,
        noteValue;

    if (self.pos == notes.length) self.pos = 0;

    note = notes[self.pos];
    noteValue = WHOLE_NOTE / notes[self.pos + 1];

    // For note == 0 is a pause.
    note && self.playNote(notes[self.pos], noteValue);
    self.pos += 2;

    self.timers.setTimeout(self.play.bind(self), noteValue);

};

Track.prototype.playNote = function (note, noteValue) {

    var self = this,
        osc = self.ctx.createOscillator();

    osc.frequency.value = NOTES[note] / 2;
    osc.type = self.track.oType || 'sine'; // Options: sine, square, sawtooth, triangle.

    osc.connect(self.dest);
    osc.start();

    self.timers.setTimeout(osc.stop.bind(osc), noteValue - 20, true);

};

Track.prototype.stop = function () {

    this.timers.nullifyTimers();

};