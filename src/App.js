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

  const startSequencer = () => {
    const steps = [0, 0, 0, 0, 0, 0, 0, 0]
    window.sequencerTimer = setInterval(() => {
      const euclideanPattern1 = window.channelConfig[1].euclideanPattern
      const euclideanPattern2 = window.channelConfig[2].euclideanPattern
      const euclideanPattern3 = window.channelConfig[3].euclideanPattern
      const euclideanPattern4 = window.channelConfig[4].euclideanPattern
      const euclideanPattern5 = window.channelConfig[5].euclideanPattern
      const euclideanPattern6 = window.channelConfig[6].euclideanPattern
      const euclideanPattern7 = window.channelConfig[7].euclideanPattern
      const euclideanPattern8 = window.channelConfig[8].euclideanPattern

      if (steps[0] === euclideanPattern1.length) steps[0] = 0
      if (steps[1] === euclideanPattern2.length) steps[1] = 0
      if (steps[2] === euclideanPattern3.length) steps[2] = 0
      if (steps[3] === euclideanPattern4.length) steps[3] = 0
      if (steps[4] === euclideanPattern5.length) steps[4] = 0
      if (steps[5] === euclideanPattern6.length) steps[5] = 0
      if (steps[6] === euclideanPattern7.length) steps[6] = 0
      if (steps[7] === euclideanPattern8.length) steps[7] = 0

      if (window.channelConfig[1].enabled && euclideanPattern1[steps[0]] === 1) {
        if (playMode === 'SAMPLES') {
          playSample(sampleFiles, 0, false)
        } else {
          sendMidiEvent(midiConfig[1].note, midiConfig[1].volume, currentMidiDevice, midiConfig[1].release)
        }
      }

      if (window.channelConfig[2].enabled && euclideanPattern2[steps[1]] === 1) {
        if (playMode === 'SAMPLES') {
          playSample(sampleFiles, 1, false)
        } else {
          sendMidiEvent(midiConfig[2].note, midiConfig[2].volume, currentMidiDevice, midiConfig[2].release)
        }
      }

      if (window.channelConfig[3].enabled && euclideanPattern3[steps[2]] === 1) {
        if (playMode === 'SAMPLES') {
          playSample(sampleFiles, 2, false)
        } else {
          sendMidiEvent(midiConfig[3].note, midiConfig[3].volume, currentMidiDevice, midiConfig[3].release)
        }
      }
      if (window.channelConfig[4].enabled && euclideanPattern4[steps[3]] === 1) {
        if (playMode === 'SAMPLES') {
          playSample(sampleFiles, 3, false)
        } else {
          sendMidiEvent(midiConfig[4].note, midiConfig[4].volume, currentMidiDevice, midiConfig[4].release)
        }
      }

      if (window.channelConfig[5].enabled && euclideanPattern5[steps[4]] === 1) {
        if (playMode === 'SAMPLES') {
          playSample(sampleFiles, 4, false)
        } else {
          sendMidiEvent(midiConfig[5].note, midiConfig[5].volume, currentMidiDevice, midiConfig[5].release)
        }
      }

      if (window.channelConfig[6].enabled && euclideanPattern6[steps[5]] === 1) {
        if (playMode === 'SAMPLES') {
          playSample(sampleFiles, 5, false)
        } else {
          sendMidiEvent(midiConfig[6].note, midiConfig[6].volume, currentMidiDevice, midiConfig[6].release)
        }
      }

      if (window.channelConfig[7].enabled && euclideanPattern7[steps[6]] === 1) {
        if (playMode === 'SAMPLES') {
          playSample(sampleFiles, 6, false)
        } else {
          sendMidiEvent(midiConfig[7].note, midiConfig[7].volume, currentMidiDevice, midiConfig[7].release)
        }
      }
      if (window.channelConfig[8].enabled && euclideanPattern8[steps[7]] === 1) {
        if (playMode === 'SAMPLES') {
          playSample(sampleFiles, 7, false)
        } else {
          sendMidiEvent(midiConfig[8].note, midiConfig[8].volume, currentMidiDevice, midiConfig[8].release)
        }
      }

      setCurrentStep(steps[window.currentChannel])

      steps[0]++; steps[1]++; steps[2]++; steps[3]++; steps[4]++; steps[5]++; steps[6]++; steps[7]++
    }, ((60 / bpm) * 1000) / timeDivider)
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
