var PIXEL_SIZE = 16;

var GAME_H = 432;

var CAMERA_W = 1200;

var START_X = 50;

var IMAGE_TYPE = 'image/gif';

var SPRITES = {

    // Each `sprite` is converted into `new Image()`.
    // WARNING: dataString is not full, `R0lGODlh` is added in `loadImages()`.

    HERO: {
        sprite: 'HgAFAKECAPYHB////wAAAAAAACH5BAEKAAIALAAAAAAeAAUAAAIfVCx4mueYogm02oupbBRYX4FduEjZiTYeVDLmAk9VAQA7',
        frames: ['still', 'stepLeft', 'stepRight', 'jump', 'punched', 'dead'],
        w: 5,
        h: 5
    },

    BIRD: {
        sprite: 'CAAEAKECAAAAADEAK////////yH5BAEKAAMALAAAAAAIAAQAAAILnA93wSEBHByNsgIAOw==',
        frames: ['0', '1'],
        w: 4,
        h: 4
    },

    MOUSE: {
        sprite: 'CAADAMIEAAAAAAEBAepMTHx8fP///////////////yH5BAEKAAQALAAAAAAIAAMAAAMLSDS6CoOJCGOIIwEAOw==',
        frames: ['0', '1'],
        w: 4,
        h: 3
    },

    FIRE: {
        sprite: 'DwADAMICAC8iErxhB/+DCv/ICv30BP////+DCv+DCiH5BAEKAAcALAAAAAAPAAMAAAMTeCeq0/AM8hZhCihByp3eAwRaAgA7',
        frames: ['0', '1', 'dead'],
        w: 5,
        h: 3
    },

    STONE: {
        sprite: 'CAAIAKECAE5MSV5bV////////yH5BAEKAAIALAAAAAAIAAgAAAINhBFxl9aLFJxvpcrkKgA7',
        frames: ['0'],
        w: 8,
        h: 8
    },

    CACTUS: {
        sprite: 'AwAFAMIFAFJTDCd8HkibQFCxJVu8Qf///////////yH5BAEKAAcALAAAAAADAAUAAAMJCBIxSgEMsUYCADs=',
        frames: ['0'],
        w: 3,
        h: 5
    },

    BIG_CACTUS: {
        sprite: 'BQAKAMIBAFJTDCd8HkibQFCxJeqV7Sd8Hid8Hid8HiH5BAEKAAcALAAAAAAFAAoAAAMVGBIwvYIwJ0ZkwTZSgxrMVoGOt1gJADs=',
        frames: ['0'],
        w: 5,
        h: 10
    },

    BAT: {
        sprite: 'BgACAKECAAAAADEnNv///////yH5BAEKAAIALAAAAAAGAAIAAAIFjAwiaVEAOw==',
        frames: ['0', '1'],
        w: 3,
        h: 2
    },

    HYDRA: {
        sprite: 'FQAHAKEDAAAAAHk+PvQfH////yH5BAEKAAMALAAAAAAVAAcAAAIk1I4Cp+gD4gFGwveWvRzF1SyMRmrc56BDAElsK04b7Knw9i0FADs=',
        frames: ['0', '1', 'dead'],
        w: 7,
        h: 7
    },

    SHOT: {
        sprite: 'DAADAMIEAMvIvdLRzvTz8f///wAAAAAAAAAAAAAAACH5BAEKAAQALAAAAAAMAAMAAAMQCARBIUQMMpUjEdfVXpxDAgA7',
        frames: ['0', '1', '2', '3'],
        w: 3,
        h: 3
    },

    BALL: {
        sprite: 'AQABAIABAM/Nzf///yH5BAEKAAEALAAAAAABAAEAAAICRAEAOw==',
        frames: ['0'],
        w: 1,
        h: 1
    },

    POWERUP_GP: {
        sprite: 'BAACAKEAAAAAAP///wAAAAAAACH5BAEKAAIALAAAAAAEAAIAAAIERGJgBQA7',
        frames: ['0', '1'],
        w: 2,
        h: 2
    },

    POWERUP_SU: {
        sprite: 'BAACAKEBAAAAAPkWFvkWFvkWFiH5BAEKAAIALAAAAAAEAAIAAAIERGJgBQA7',
        frames: ['0', '1'],
        w: 2,
        h: 2
    },

    POWERUP_DD: {
        sprite: 'BAACAKEAAAAAABah+QAAAAAAACH5BAEKAAIALAAAAAAEAAIAAAIERGJgBQA7',
        frames: ['0', '1'],
        w: 2,
        h: 2
    }

};

// Duration of a whole note.
var WHOLE_NOTE = 1920;

// Frequencies.
var NOTES = {

    C3: 130.81,
    E3: 164.81,
    F3: 174.61,
    G3: 196,
    A3: 220,

    C4: 261.63,

    D4: 293.66,

    E4: 329.63,
    F4: 349.23,
    F4S: 369.99,
    G4: 392,

    A4: 440,

    C5: 523.35,
    D5: 587.33

};

// Note & note value pairs; bigger is shorter as note value here is a denominator in 1/n fraction.
// 0 is for pause.
// One line for a half of a whole note (by duration).
var MUSIC = {
    T0: {
        oType: 'triangle',
        notes: [
            'A3', 1, 'A3', 1,
            'G3', 1, 'G3', 1,
            'F3', 1, 'F3', 1,
            'E3', 1, 'C3', 1
        ]
    },
    T1: {
        oType: 'sawtooth',
        notes: [

            'A4', 4, 0, 8, 'G4', 8,
            'A4', 8, 'A4', 16, 'G4', 16, 'C5', 8, 'D5', 8,

            0, 4, 'A4', 8, 'A4', 16, 0, 16,
            'A4', 8, 0, 8, 'G4', 8, 0, 8,

            'A4', 4, 0, 8, 'G4', 8,
            'A4', 8, 'A4', 16, 'G4', 16, 'C5', 8, 'D5', 8,

            0, 4, 'G4', 8, 'G4', 16, 0, 16,
            'G4', 8, 0, 8, 'F4', 8, 0, 8,

            'A4', 4, 0, 8, 'G4', 8,
            'A4', 8, 'A4', 16, 'G4', 16, 'C5', 8, 'D5', 8,

            0, 4, 'F4', 8, 'F4', 16, 0, 16,
            'F4', 8, 0, 8, 'E4', 8, 0, 8,

            'A4', 4, 0, 8, 'G4', 8,
            'A4', 8, 'A4', 16, 'G4', 16, 'C5', 8, 'D5', 8,

            0, 4, 'E4', 8, 'E4', 16, 0, 16,
            'E4', 8, 0, 8, 'C4', 8, 0, 8

        ]
    }
};

var COLOR_WHITE = '#f9d4c1';
var COLOR_RED = '#f65555';
var COLOR_BLUE = '#1499ff';

var WIN_MESSAGES = ['YOU WIN!', 'DONE!', 'YOU ROCK!', 'GOOD JOB!'];
var LOSE_MESSAGES = ['NOT TODAY', 'MAYBE, NEXT TIME', 'YOU WERE NEAR', 'YOU LOSE'];

// Land texture colors.

var LAND = [
    [65,26,50],
    [100,44,38],
    [40,77,66]
];

var SAND = [
    [236, 193, 89],
    [203, 193, 135],
    [239, 222, 128]
];

var DARK_SAND = [
    [196, 143, 59],
    [163, 133, 95],
    [179, 182, 88]
];

// Sky texture colors.

var SKY = [
    [93, 139, 228],
    [98, 144, 233],
    [103, 149, 238],
    [108, 154, 243]
];

var NIGHT_SKY = [
    [41, 2, 100],
    [47, 5, 107],
    [37, 3, 93],
    [0, 2, 96]
];