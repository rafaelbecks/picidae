import WebMidi from 'webmidi'
import { Scale } from '@tonaljs/tonal'

const getAllNotes3Octaves = () => {
  return [
    ...Scale.get('c2 chromatic').notes,
    ...Scale.get('c3 chromatic').notes,
    ...Scale.get('c4 chromatic').notes,
    ...Scale.get('c5 chromatic').notes
  ]
}

const initMidi = async () =>
  new Promise((resolve, reject) => {
    WebMidi.enable(function (err) {
      if (err) {
        reject(err)
      }
      resolve(WebMidi.outputs)
    })
  })

const allNotes = getAllNotes3Octaves()

const sendMidiEvent = (note, velocity, midiController, duration = null) => {
  if (note && midiController !== -1) {
    WebMidi.outputs[midiController].playNote([allNotes[note]], 1, { velocity, duration })
  }
}

export { initMidi, sendMidiEvent, getAllNotes3Octaves }
