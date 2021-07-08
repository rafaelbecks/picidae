import axios from 'axios'
import { useState, useEffect } from 'react'
import er from 'euclidean-rhythms'
import * as Tone from 'tone'

import './App.css'
import Layout from './ui/Layout'
import { useKeyPress } from './hooks'

const initialChannelConfig = {
  euclideanPattern: er.getPattern(4, 8),
  notes: -2,
  steps: 8,
  volume: -5,
  pitch: '440',
  release: 0.5,
  filter: {
    lp: 1500,
    hp: 0
  },
  reverb: {}
}

function App () {
  const [currentSamplePack, setCurrentSamplePack] = useState(-1)
  const [availableSamplePacks, setAvailableSamplePacks] = useState([])
  const [sampleFiles, setSampleFiles] = useState([])
  const [channelConfig, setChannelConfig] = useState({})
  const [currentChannel, setCurrentChannel] = useState(-1)
  // const [currentStep, setCurrentStep] = useState(0)
  // const [bpm, setBpm] = useState(120)

  const keyboard = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k']

  useKeyPress((key) => {
    if (keyboard.indexOf(key) >= 0) {
      setSampleFiles((current) => {
        playSample(current, keyboard.indexOf(key))
        return current
      })
    }
  })

  useEffect(async () => {
    const { data: availableSamples } = await axios('http://localhost:3002/sample-packs')
    setAvailableSamplePacks(availableSamples)
    // setEuclideanPattern(er.getPattern(7, 11))
    // console.log(euclideanPattern)
  }, [])

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

  const playSample = (sampleFiles, index) => {
    if (index >= 0 && sampleFiles.length > 0) {
      setCurrentChannel(index)
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

  // const startSequencer = (sequencerTimer) => {
  //   let step = 0
  //   sequencerTimer = setInterval(() => {
  //     if (step === euclideanPattern.length) {
  //       step = 0
  //       setCurrentStep(0)
  //     }
  //     if (euclideanPattern[step] === 1) {
  //       console.log('play')
  //       playSample(currentSamplePack[0])
  //     } else {
  //       playSample(currentSamplePack[1])
  //     }

  //     step++
  //     setCurrentStep(currentStep + 1)
  //   }, ((60 / bpm) * 1000) / 4)
  // }

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
      />
    </div>
  )
}

export default App
