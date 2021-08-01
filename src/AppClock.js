import axios from 'axios'
import { useState, useEffect } from 'react'
import er from 'euclidean-rhythms'
import * as Tone from 'tone'

import './App.css'
import Layout from './ui/Layout'
import { useKeyPress } from './hooks'
import { getAllNotes3Octaves, initMidi, sendMidiEvent } from './midi'

const initialChannelConfig = {
  notes: -2,
  steps: 8,
  volume: -5,
  pitch: '440',
  release: 0.5,
  enabled: false
}

const playModeConfiguration = {
  SAMPLES: {
    noteRange: [220, 880],
    volumeRange: [-15, 4],
    duration: [0, 1]
  },
  MIDI: {
    noteRange: [0, 48],
    scale: getAllNotes3Octaves(),
    volumeRange: [0, 1],
    duration: [0, 1]
  }
}

const audioCtx = new window.AudioContext()
const lookahead = 25.0
const scheduleAheadTime = 0.1
let firstTimeLoad = true

function App () {
  const [currentSamplePack, setCurrentSamplePack] = useState(-1)
  const [availableSamplePacks, setAvailableSamplePacks] = useState([])
  const [sampleFiles, setSampleFiles] = useState([])
  const [channelConfig, setChannelConfig] = useState({})
  const [currentChannel, setCurrentChannel] = useState(-1)
  const [sequencerMode, setSequencerMode] = useState('EDIT')
  const [playMode, setPlayMode] = useState('SAMPLES')
  const [currentStep, setCurrentStep] = useState(0)
  const [bpm, setBpm] = useState(120)
  const [midiConfig, setMidiConfig] = useState({})
  const [midiDevices, setMidiDevices] = useState([])
  const [currentMidiDevice, setCurrentMidiDevice] = useState(-1)
  const [timeDivider, setTimeDivider] = useState(4)

  const keyboard = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k']

  useKeyPress((key) => {
    if (keyboard.indexOf(key) >= 0) {
      setPlayMode(playMode => {
        setSequencerMode(sequencerMode => {
          if (sequencerMode === 'PLAY') {
            setCurrentChannel(keyboard.indexOf(key))
            return
          }
          setSampleFiles((current) => {
            if (playMode === 'SAMPLES') { playSample(current, keyboard.indexOf(key)) }
            return current
          })

          return sequencerMode
        })
        return playMode
      })
    }
  })

  useEffect(async () => {
    const { data: availableSamples } = await axios('http://localhost:3002/sample-packs')
    setAvailableSamplePacks(availableSamples)
  }, [])

  useEffect(() => {
    if (sequencerMode === 'EDIT') {
      setCurrentStep(0)
    }
  }, [sequencerMode])

  useEffect(() => {
    if (availableSamplePacks[0]) { onSelectSamplePack(0) }
  }, [availableSamplePacks])

  useEffect(async () => {
    if (playMode === 'MIDI') {
      const midiConfigObject = Array.from(Array(9)).reduce((ac, item, channelIndex) => ({
        ...ac,
        [channelIndex]: {
          note: 12,
          volume: 0.5,
          release: 0.5
        }
      }))

      const midiControllers = await initMidi()
      setMidiDevices(midiControllers)
      setMidiConfig(midiConfigObject)
    }
  }, [playMode])

  const getSamplePack = async (name) => {
    if (!name) return
    const samplePack = []
    for (let index = 0; index < 8; index++) {
      const wavFile = await import(`./assets/sample-packs/${name}/${index + 1}.wav`)
      const sample = new Tone.Sampler({
        urls: {
          A4: wavFile.default
        }
      }).toDestination()
      samplePack.push(sample)
    }
    return samplePack
  }

  const playSample = (sampleFiles, index, selectChannel = true) => {
    if (index >= 0 && sampleFiles.length > 0) {
      if (selectChannel) {
        setCurrentChannel(index)
      }
      const sample = sampleFiles[index]
      const currentConfig = window.channelConfig[index + 1]
      sample.volume.value = currentConfig.volume
      sample.triggerAttackRelease(currentConfig.pitch, currentConfig.release)
    }
  }

  const onSelectSamplePack = async (index) => {
    if (index === -1) return

    setCurrentSamplePack(index)
    const samplePack = await getSamplePack(availableSamplePacks[index])
    setSampleFiles(samplePack)

    const channelObject = {}
    const channelConfigObject = Array.from(Array(samplePack.length + 1)).reduce((ac, item, channelIndex) => {
      if (firstTimeLoad) {
        channelObject[channelIndex] = {
          ...initialChannelConfig,
          euclideanPattern: er.getPattern(4, 16)
        }
      } else {
        channelObject[channelIndex] = {
          ...channelConfig[channelIndex]
        }
      }

      return {
        ...ac,
        [channelIndex]: channelObject[channelIndex]
      }
    }
    )

    if (firstTimeLoad) {
      setCurrentChannel(0)
    }

    firstTimeLoad = false

    setChannelConfig(channelConfigObject)
  }

  const onChangeConfig = (index, key, value, callback = () => {}) => {
    const newConfig = {
      [index + 1]: {
        ...channelConfig[index + 1],
        [key]: value
      }
    }

    setChannelConfig({
      ...channelConfig,
      ...newConfig
    })
  }

  const onChangeMIDI = (index, key, value, callback = () => {}) => {
    const newConfig = {
      [index + 1]: {
        ...midiConfig[index + 1],
        [key]: value
      }
    }

    setMidiConfig({
      ...midiConfig,
      ...newConfig
    })
  }

  const onSelectMidi = (e) => {
    setCurrentMidiDevice(e.target.value)
  }
  const steps = [0, 0, 0, 0, 0, 0, 0, 0]

  const playSamplesOrMidi = (channelIndex) => {
    const { euclideanPattern } = window.channelConfig[channelIndex + 1]
    if (steps[channelIndex] === euclideanPattern.length) { steps[channelIndex] = 0 }

    if (window.channelConfig[channelIndex + 1].enabled && euclideanPattern[steps[channelIndex]] === 1) {
      if (playMode === 'SAMPLES') {
        playSample(sampleFiles, channelIndex, false)
      } else {
        sendMidiEvent(midiConfig[channelIndex + 1].note, midiConfig[channelIndex + 1].volume, currentMidiDevice, midiConfig[channelIndex + 1].release)
      }
    }

    setCurrentStep(steps[window.currentChannel])
    steps[channelIndex]++
  }

  const startSequencer = () => {
    scheduler()
  }

  let currentNote = 0
  let nextNoteTime = 0.0

  function nextNote () {
    const secondsPerBeat = 60.0 / bpm

    nextNoteTime += 0.25 * secondsPerBeat // Add beat length to last beat time

    // Advance the beat number, wrap to zero
    currentNote++
    if (currentNote === 16) {
      currentNote = 0
    }
  }

  const notesInQueue = []

  function scheduleNote (beatNumber, time) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push({ note: beatNumber, time: time })
    for (let i = 0; i < 8; i++) {
      playSamplesOrMidi(i)
    }
  }

  function scheduler () {
    // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
    while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
      scheduleNote(currentNote, nextNoteTime)
      nextNote()
    }
    window.sequencerTimer = window.setTimeout(scheduler, lookahead)
  }

  window.channelConfig = channelConfig
  window.currentChannel = currentChannel

  return (
    <div className='App'>
      <Layout
        availableSamplePacks={availableSamplePacks}
        currentSamplePack={currentSamplePack}
        onSelectSamplePack={onSelectSamplePack}
        sampleFiles={sampleFiles}
        playSample={playSample}
        onChangeConfig={onChangeConfig}
        channelConfig={channelConfig}
        currentChannel={currentChannel}
        bpm={bpm}
        setBpm={setBpm}
        startSequencer={startSequencer}
        sequencerMode={sequencerMode}
        setSequencerMode={setSequencerMode}
        setCurrentChannel={setCurrentChannel}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        playModeConfiguration={playModeConfiguration}
        playMode={playMode}
        setPlayMode={setPlayMode}
        midiConfig={midiConfig}
        onChangeMIDI={onChangeMIDI}
        midiDevices={midiDevices}
        onSelectMidi={onSelectMidi}
        currentMidiDevice={currentMidiDevice}
        timeDivider={timeDivider}
        setTimeDivider={setTimeDivider}
      />
    </div>
  )
}

export default App
