import { Fragment, useRef, useState, useEffect } from 'react'
import 'react-rangeslider/lib/index.css'
import * as skins from 'react-rotary-knob-skin-pack'
import { Knob } from 'react-rotary-knob'
import er from 'euclidean-rhythms'

import circlesBottom from '../../assets/screw-circles-bottom.svg'
import picidaeIcon from '../../assets/picidae-icon.svg'
import lissajous from '../../assets/lissajous.png'

import SliderSwitch from '../../components/SliderSwitch'
import NumericControl from '../../components/NumericControl'
import { useKeyPress } from '../../hooks'

import { Led } from '../Leds/styles'
import { arrayRotate, getRandomInt } from '../../utils'

import {
  DeviceLayout,
  RightCircleBottom,
  LeftCircleBottom,
  DeviceName,
  DeviceContent,
  DeviceSection,
  DeviceColumn,
  Row,
  GreenScreen,
  GreenScreenContainer,
  DeviceSelect,
  Control,
  KnobContainer,
  MainControl,
  Column,
  Circle,
  LissajousCurve,
  RowDivider,
  ControlSection,
  Button,
  RandomButtonStyles
} from './styles'

import Channels from '../Channels'

const Screws = () => (
  <>
    <RightCircleBottom src={circlesBottom} />
    <LeftCircleBottom src={circlesBottom} />
  </>
)

const Layout = (
  {
    availableSamplePacks,
    currentSamplePack,
    onSelectSamplePack,
    playSample,
    sampleFiles,
    onChangeConfig,
    channelConfig,
    currentChannel,
    bpm, setBpm,
    startSequencer,
    sequencerMode,
    setCurrentChannel,
    setSequencerMode,
    currentStep,
    setCurrentStep,
    playMode,
    setPlayMode,
    playModeConfiguration,
    midiConfig,
    onChangeMIDI,
    midiDevices,
    onSelectMidi,
    currentMidiDevice,
    timeDivider,
    setTimeDivider
  }
) => {
  const sampleSelect = useRef(null)
  const [rotationIndex, setRotationIndex] = useState({})
  const pitchValue = channelConfig[currentChannel + 1] && Number(channelConfig[currentChannel + 1].pitch).toFixed(2)
  const sampleVolumeValue = channelConfig[currentChannel + 1] && channelConfig[currentChannel + 1].volume.toFixed(2)
  const euclideanPattern = channelConfig[currentChannel + 1] ? channelConfig[currentChannel + 1].euclideanPattern : []
  const noteValue = midiConfig[currentChannel + 1] ? midiConfig[currentChannel + 1].note : 12
  const midiVolumeValue = midiConfig[currentChannel + 1] ? midiConfig[currentChannel + 1].volume : 0.5
  const sampleReleaseValue = channelConfig[currentChannel + 1] && channelConfig[currentChannel + 1].release.toFixed(2)
  const midiReleaseValue = midiConfig[currentChannel + 1] && midiConfig[currentChannel + 1].release.toFixed(2)

  const currentNotes = euclideanPattern.filter(beat => beat === 1).length
  const currentSteps = euclideanPattern.length

  useKeyPress((key) => {
    if (key === ' ') {
      setSequencerMode(sequencerMode => {
        if (sequencerMode === 'EDIT') { return 'PLAY' }
        return 'EDIT'
      })
    }
  })

  useEffect(() => {
    if (currentChannel !== -1) {
      setRotationIndex({
        ...rotationIndex,
        [currentChannel]: 0
      })
    }
  }, [currentChannel])

  useEffect(() => {
    if (sequencerMode === 'PLAY') {
      startSequencer()
    }

    if (sequencerMode === 'EDIT') {
      window.clearInterval(window.sequencerTimer)
    }
  }, [sequencerMode])

  return (
    <DeviceLayout>
      <Screws />
      <DeviceName>
        <div>
          <img src={picidaeIcon} alt='granola-icon' />
          <h1>PICIDAE</h1>
        </div>
        <h3>
          euclidean rhythm <br />composer
        </h3>
      </DeviceName>
      <DeviceContent>
        <DeviceSection>
          <RowDivider>
            <DeviceColumn>
              <h2>PLAY MODE</h2>
              <Row style={{ height: '96px' }}>
                <Column>
                  <SliderSwitch value={playMode} values={['SAMPLES', 'MIDI']} onChange={(val) => setPlayMode(val)} />
                  <GreenScreenContainer>
                    <GreenScreen
                      style={{ width: '150px' }}
                    >{

                    playMode === 'SAMPLES'
                      ? (availableSamplePacks[currentSamplePack]
                          ? availableSamplePacks[currentSamplePack]
                          : `NO ${playMode} SELECTED`)
                      : midiDevices[currentMidiDevice] ? midiDevices[currentMidiDevice].name : 'NO DEVICE SELECTED'
                    }
                    </GreenScreen>
                    <DeviceSelect
                      ref={sampleSelect} onChange={async (e) => {
                        if (playMode === 'SAMPLES') {
                          await onSelectSamplePack(Number(e.target.value))
                          return
                        }

                        onSelectMidi(e)
                      }}
                      value={playMode === 'SAMPLES' ? currentSamplePack : currentMidiDevice}
                    >
                      <option value='-1'>No {playMode.toLowerCase()} selected </option>

                      {playMode === 'SAMPLES'
                        ? availableSamplePacks.map((item, index) => (<option value={index} key={index}>{item}</option>))
                        : midiDevices.map(({ id, name }, index) => (<option value={index} key={id}>{name}</option>))}
                    </DeviceSelect>
                  </GreenScreenContainer>

                </Column>
              </Row>
            </DeviceColumn>
            <DeviceColumn>
              <h2>RHYTHM</h2>
              <Row>
                <MainControl>
                  <h3>STEPS</h3>
                  <KnobContainer className='bigKnob'>
                    <Knob
                      unlockDistance={0}
                      onChange={(val) => {
                        const steps = Math.ceil(val)
                        setRotationIndex({
                          ...rotationIndex,
                          [currentChannel]: 0
                        })
                        onChangeConfig(currentChannel, 'euclideanPattern', er.getPattern(currentNotes, steps))
                      }}
                      min={currentNotes}
                      max={16}
                      value={currentSteps}
                      skin={skins.s13}
                      preciseMode={false}
                    />
                    <span>{currentSteps}</span>
                  </KnobContainer>
                </MainControl>
                <MainControl>
                  <h3>NOTES</h3>
                  <KnobContainer className='bigKnob'>
                    <Knob
                      unlockDistance={0}
                      onChange={(val) => {
                        const notes = Math.ceil(val)
                        setRotationIndex({
                          ...rotationIndex,
                          [currentChannel]: 0
                        })
                        onChangeConfig(currentChannel, 'euclideanPattern', er.getPattern(notes, currentSteps))
                      }}
                      min={0}
                      max={currentSteps}
                      value={currentNotes}
                      skin={skins.s13}
                      preciseMode={false}
                    />
                    <span>{currentNotes}</span>
                  </KnobContainer>
                </MainControl>
              </Row>
              <Button style={RandomButtonStyles}
                onClick={() => {
                    const steps = getRandomInt(4,16)
                    const notes = getRandomInt(1,steps)
                    const rotation = getRandomInt(0, 16)
                    setRotationIndex({
                      ...rotationIndex,
                      [currentChannel]: rotation
                    })
                    onChangeConfig(currentChannel, 'euclideanPattern', arrayRotate(er.getPattern(notes, steps), Math.ceil(rotation)))

                }}
              >RANDOM</Button>
            </DeviceColumn>

            <DeviceColumn>
              <h2>CHANNEL</h2>
              <Row style={{ marginBottom: 0 }}>
                <Control>
                  <h3>PITCH</h3>
                  <KnobContainer>
                    <Knob
                      unlockDistance={0}
                      onChange={(val) => {
                        if (playMode === 'SAMPLES') {
                          onChangeConfig(currentChannel, 'pitch', String(val))
                          return
                        }

                        onChangeMIDI(currentChannel, 'note', Math.ceil(val))
                      }}
                      min={playModeConfiguration[playMode].noteRange[0]}
                      max={playModeConfiguration[playMode].noteRange[1]}
                      value={playMode === 'SAMPLES' ? pitchValue : noteValue}
                      skin={skins.s13}
                      preciseMode={false}
                    />
                    <span>{playMode === 'SAMPLES' ? pitchValue : playModeConfiguration[playMode].scale[noteValue]}</span>
                  </KnobContainer>
                </Control>
                <MainControl>
                  <h3>VOLUME</h3>
                  <KnobContainer className='bigKnob'>
                    <Knob
                      unlockDistance={0}
                      onChange={(val) => {
                        if (playMode === 'SAMPLES') {
                          onChangeConfig(currentChannel, 'volume', val)
                          return
                        }

                        onChangeMIDI(currentChannel, 'volume', Number(val))
                      }}
                      min={playModeConfiguration[playMode].volumeRange[0]}
                      max={playModeConfiguration[playMode].volumeRange[1]}
                      value={playMode === 'SAMPLES' ? sampleVolumeValue : midiVolumeValue}
                      skin={skins.s13}
                      preciseMode={false}
                    />
                    <span>{playMode === 'SAMPLES' ? sampleVolumeValue : midiVolumeValue.toFixed(2)}</span>
                  </KnobContainer>
                </MainControl>
                <Control>
                  <h3>RELEASE</h3>
                  <KnobContainer>
                    <Knob
                      unlockDistance={0}
                      onChange={(val) => {
                        if (playMode === 'SAMPLES') {
                          onChangeConfig(currentChannel, 'release', val)
                          return
                        }

                        onChangeMIDI(currentChannel, 'release', Number(val))
                      }}
                      min={0}
                      max={1}
                      value={playMode === 'SAMPLES' ? sampleReleaseValue : midiReleaseValue}
                      skin={skins.s13}
                      preciseMode={false}
                    />
                    <span>{playMode === 'SAMPLES' ? sampleReleaseValue : midiReleaseValue}</span>
                  </KnobContainer>
                </Control>
              </Row>

            </DeviceColumn>
          </RowDivider>
          <RowDivider flexStart spaceAround style={{ margin: '20px 0' }}>
            <ControlSection>
              <h2>SEQUENCER</h2>
              <Row>
                <Control style={{ marginRight: '10px' }}>
                  <h3 className='smallMargin'>BPM</h3>
                  <GreenScreenContainer row>
                    <NumericControl
                      width='30px'
                      minValue={20} maxValue={220} initialValue={bpm}
                      onChange={(value) => setBpm(value)}
                    />
                  </GreenScreenContainer>
                </Control>

                <Control className='inputWithMask'>
                  <h3 className='smallMargin'>BEAT/STEPS</h3>
                  <GreenScreenContainer row>
                    <NumericControl
                      width='30px'
                      mask={['0', '1', '½', '⅓', '¼', '⅕', '⅙', '⅐']}
                      minValue={2} maxValue={7} initialValue={timeDivider}
                      onChange={(value) => setTimeDivider(value)}
                    />
                  </GreenScreenContainer>
                </Control>
              </Row>
              <Row
                style={{
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  marginTop: '21px',
                  height: 'fit-content'
                }}
              >
                <SliderSwitch
                  values={['EDIT', 'PLAY']} onChange={(val) => setSequencerMode(val)} value={sequencerMode}
                />
              </Row>
            </ControlSection>
            {euclideanPattern.length && (
              <>
                <Circle size={euclideanPattern.length}>
                  {euclideanPattern.map((beat, index) => (
                    <li key={index}><Led className={beat || (currentStep === index && sequencerMode === 'PLAY') ? `ledOn${currentChannel}` : `ledOff${currentChannel}`} /></li>
                  ))}
                </Circle>
                <LissajousCurve src={lissajous} />
                <KnobContainer className='rotationKnob'>
                  <Knob
                    unlockDistance={0}
                    onChange={(val) => {
                      setRotationIndex({
                        ...rotationIndex,
                        [currentChannel]: Math.ceil(val)
                      })
                      onChangeConfig(currentChannel, 'euclideanPattern', arrayRotate(er.getPattern(currentNotes, currentSteps), Math.ceil(val)))
                    }}
                    min={currentSteps}
                    max={0}
                    value={rotationIndex[currentChannel]}
                    skin={skins.s13}
                    preciseMode={false}
                  />
                  <span>ROTATION {rotationIndex[currentChannel]}</span>
                </KnobContainer>
              </>
            )}
            <div>
              <ControlSection>
                <Row style={{ marginTop: '0px', height: 'auto' }}>
                  <GreenScreenContainer>
                    <h2>BANK</h2>
                    <GreenScreen
                      style={{ width: '150px', margin: '20px 0' }}
                    >PATTERN #1
                    </GreenScreen>
                  </GreenScreenContainer>
                </Row>
                <Button>SAVE</Button>
              </ControlSection>
            </div>
          </RowDivider>
          <RowDivider>
            <Channels samples={sampleFiles} playSample={playSample} onChangeConfig={onChangeConfig} currentChannel={currentChannel} sequencerMode={sequencerMode} setCurrentChannel={setCurrentChannel} playMode={playMode} />
          </RowDivider>
        </DeviceSection>

      </DeviceContent>

    </DeviceLayout>
  )
}

export default Layout
