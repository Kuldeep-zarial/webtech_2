
document.addEventListener('DOMContentLoaded', async () => {
    await Tone.start();
    console.log('Tone.js is ready');
});

const piano = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: "triangle"
    },
    envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1
    }
}).toDestination();

const guitar = new Tone.PluckSynth({
    attackNoise: 1,
    dampening: 4000,
    resonance: 0.98
}).toDestination();

const drums = {
    kick: new Tone.MembraneSynth().toDestination(),
    snare: new Tone.NoiseSynth({
        noise: {
            type: 'white'
        },
        envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0
        }
    }).toDestination(),
    hihat: new Tone.MetalSynth({
        frequency: 200,
        envelope: {
            attack: 0.001,
            decay: 0.1,
            sustain: 0
        }
    }).toDestination(),
    tom: new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        oscillator: {
            type: 'sine'
        }
    }).toDestination(),
    crash: new Tone.MetalSynth({
        frequency: 1000,
        envelope: {
            attack: 0.001,
            decay: 1,
            sustain: 0
        }
    }).toDestination()
};

const flute = new Tone.Synth({
    oscillator: {
        type: 'sine'
    },
    envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 1,
        release: 0.8
    }
}).toDestination();


const volumeSlider = document.getElementById('masterVolume');
Tone.Destination.volume.value = Tone.gainToDb(volumeSlider.value / 100);

volumeSlider.addEventListener('input', (e) => {
    Tone.Destination.volume.value = Tone.gainToDb(e.target.value / 100);
});

document.querySelectorAll('.piano-keys .key').forEach(key => {
    key.addEventListener('mousedown', () => {
        const note = key.dataset.note;
        piano.triggerAttack(note);
        key.classList.add('active');
    });

    key.addEventListener('mouseup', () => {
        const note = key.dataset.note;
        piano.triggerRelease([note]);
        key.classList.remove('active');
    });

    key.addEventListener('mouseleave', () => {
        const note = key.dataset.note;
        piano.triggerRelease([note]);
        key.classList.remove('active');
    });
});

document.querySelectorAll('.guitar-strings .string').forEach(string => {
    string.addEventListener('mousedown', () => {
        const note = string.dataset.note;
        guitar.triggerAttack(note);
        string.classList.add('active');
    });

    string.addEventListener('mouseup', () => {
        guitar.triggerRelease();
        string.classList.remove('active');
    });
});

document.querySelectorAll('.drum-kit .drum').forEach(drum => {
    drum.addEventListener('mousedown', () => {
        const sound = drum.dataset.sound;
        switch(sound) {
            case 'kick':
                drums.kick.triggerAttackRelease('C1', '8n');
                break;
            case 'snare':
                drums.snare.triggerAttackRelease('8n');
                break;
            case 'hihat':
                drums.hihat.triggerAttackRelease('32n');
                break;
            case 'tom':
                drums.tom.triggerAttackRelease('C3', '8n');
                break;
            case 'crash':
                drums.crash.triggerAttackRelease('32n');
                break;
        }
        drum.classList.add('active');
    });

    drum.addEventListener('mouseup', () => {
        drum.classList.remove('active');
    });
});


document.querySelectorAll('.flute-notes .note').forEach(note => {
    note.addEventListener('mousedown', () => {
        const noteValue = note.dataset.note;
        flute.triggerAttack(noteValue);
        note.classList.add('active');
    });

    note.addEventListener('mouseup', () => {
        flute.triggerRelease();
        note.classList.remove('active');
    });

    note.addEventListener('mouseleave', () => {
        flute.triggerRelease();
        note.classList.remove('active');
    });
});

let isPlaying = false;
const sequence = {
    piano: ['C4', 'E4', 'G4'],
    guitar: ['E2', 'A2', 'D3'],
    drums: ['kick', 'snare', 'hihat'],
    flute: ['C5', 'E5', 'G5']
};

const playAll = document.getElementById('playAll');
const stopAll = document.getElementById('stopAll');

let loop = new Tone.Loop((time) => {
    if (isPlaying) {
        
        sequence.piano.forEach(note => {
            piano.triggerAttackRelease(note, '4n', time);
        });
        
       
        sequence.guitar.forEach((note, index) => {
            guitar.triggerAttackRelease(note, '8n', time + index * 0.2);
        });
        
       
        drums.kick.triggerAttackRelease('C1', '8n', time);
        drums.snare.triggerAttackRelease('8n', time + 0.2);
        drums.hihat.triggerAttackRelease('32n', time + 0.4);
        
      
        sequence.flute.forEach((note, index) => {
            flute.triggerAttackRelease(note, '8n', time + index * 0.3);
        });
    }
}, '2n').start(0);

playAll.addEventListener('click', () => {
    if (!isPlaying) {
        isPlaying = true;
        Tone.Transport.start();
        playAll.textContent = 'Playing...';
    }
});

stopAll.addEventListener('click', () => {
    isPlaying = false;
    Tone.Transport.stop();
    playAll.textContent = 'Play All';
    
    
    piano.releaseAll();
    guitar.triggerRelease();
    flute.triggerRelease();
});
