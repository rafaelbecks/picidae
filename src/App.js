import axios from 'axios'
import { useState, useEffect } from 'react'
import er from 'euclidean-rhythms'
import * as Tone from 'tone'

import './App.css'
import Layout from './ui/Layout'
import { useKeyPress } from './hooks'

const initialChannelConfig = {
  euclideanPattern: er.getPattern(4, 16),
  notes: -2,
  steps: 8,
  volume: -5,
  pitch: '440',
  release: 0.5,
  enabled: false
}

function App () {
  const [currentSamplePack, setCurrentSamplePack] = useState(-1)
  const [availableSamplePacks, setAvailableSamplePacks] = useState([])
  const [sampleFiles, setSampleFiles] = useState([])
  const [channelConfig, setChannelConfig] = useState({})
  const [currentChannel, setCurrentChannel] = useState(-1)
  const [sequencerMode, setSequencerMode] = useState('EDIT')
  const [currentStep, setCurrentStep] = useState(0)
  const [bpm, setBpm] = useState(120)

  const keyboard = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k']

  useKeyPress((key) => {
    if (keyboard.indexOf(key) >= 0) {
      setSequencerMode(sequencerMode => {
        if (sequencerMode === 'PLAY') {
          setCurrentChannel(keyboard.indexOf(key))
          return
        }
        setSampleFiles((current) => {
          playSample(current, keyboard.indexOf(key))
          return current
        })

        return sequencerMode
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

    const channelConfigObject = Array.from(Array(samplePack.length + 1)).reduce((ac, item, channelIndex) => ({
      ...ac,
      [channelIndex]: initialChannelConfig
    }))

    setChannelConfig(channelConfigObject)
    setCurrentChannel(0)
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

  const startSequencer = () => {
    let step = 0
    window.sequencerTimer = setInterval(() => {
      const euclideanPattern1 = window.channelConfig[1].euclideanPattern
      const euclideanPattern2 = window.channelConfig[2].euclideanPattern
      const euclideanPattern3 = window.channelConfig[3].euclideanPattern
      const euclideanPattern4 = window.channelConfig[4].euclideanPattern
      const euclideanPattern5 = window.channelConfig[5].euclideanPattern
      const euclideanPattern6 = window.channelConfig[6].euclideanPattern
      const euclideanPattern7 = window.channelConfig[7].euclideanPattern
      const euclideanPattern8 = window.channelConfig[8].euclideanPattern

      if (step === euclideanPattern1.length) {
        step = 0
      }

      if (window.channelConfig[1].enabled && euclideanPattern1[step] === 1) {
        playSample(sampleFiles, 0, false)
      }

      if (window.channelConfig[2].enabled && euclideanPattern2[step] === 1) {
        playSample(sampleFiles, 1, false)
      }

      if (window.channelConfig[3].enabled && euclideanPattern3[step] === 1) {
        playSample(sampleFiles, 2, false)
      }
      if (window.channelConfig[4].enabled && euclideanPattern4[step] === 1) {
        playSample(sampleFiles, 3, false)
      }

      if (window.channelConfig[5].enabled && euclideanPattern5[step] === 1) {
        playSample(sampleFiles, 4, false)
      }

      if (window.channelConfig[6].enabled && euclideanPattern6[step] === 1) {
        playSample(sampleFiles, 5, false)
      }

      if (window.channelConfig[7].enabled && euclideanPattern7[step] === 1) {
        playSample(sampleFiles, 6, false)
      }
      if (window.channelConfig[8].enabled && euclideanPattern8[step] === 1) {
        playSample(sampleFiles, 7, false)
      }
      setCurrentStep(step)

      step++
    }, ((60 / bpm) * 1000) / 4)
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
      />
    </div>
  )
}

export default App
