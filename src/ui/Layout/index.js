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
import { arrayRotate } from '../../utils'

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
  ControlSection
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
    setCurrentStep
  }
) => {
  const sampleSelect = useRef(null)
  const [rotationIndex, setRotationIndex] = useState({})
  const pitchValue = channelConfig[currentChannel + 1] && Number(channelConfig[currentChannel + 1].pitch).toFixed(2)
  const euclideanPattern = channelConfig[currentChannel + 1] ? channelConfig[currentChannel + 1].euclideanPattern : []
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
                  <SliderSwitch values={['SAMPLES', 'MIDI']} onChange={(val) => console.log(val)} />
                  <GreenScreenContainer>
                    <GreenScreen
                      style={{ width: '150px' }}
                    >{availableSamplePacks[currentSamplePack]
                      ? availableSamplePacks[currentSamplePack]
                      : 'NO SAMPLES SELECTED'}
                    </GreenScreen>
                    <DeviceSelect
                      ref={sampleSelect} onChange={async (e) => {
                        await onSelectSamplePack(Number(e.target.value))
                      }}
                      value={currentSamplePack}
                    >
                      <option value='-1'>No samples selected </option>
                      {availableSamplePacks.map((item, index) => (<option value={index} key={index}>{item}</option>))}
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
                        // onChangeConfig(currentChannel, 'rotationIndex', 0)
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
                        onChangeConfig(currentChannel, 'pitch', String(val))
                      }}
                      min={220}
                      max={880}
                      value={pitchValue}
                      skin={skins.s13}
                      preciseMode={false}
                    />
                    <span>{pitchValue}</span>
                  </KnobContainer>
                </Control>
                <MainControl>
                  <h3>VOLUME</h3>
                  <KnobContainer className='bigKnob'>
                    <Knob
                      unlockDistance={0}
                      onChange={(val) => {
                        onChangeConfig(currentChannel, 'volume', val)
                      }}
                      min={-15}
                      max={4}
                      skin={skins.s13}
                      preciseMode={false}
                    />
                    <span>{channelConfig[currentChannel + 1] && channelConfig[currentChannel + 1].volume.toFixed(2)}</span>
                  </KnobContainer>
                </MainControl>
                <Control>
                  <h3>RELEASE</h3>
                  <KnobContainer>
                    <Knob
                      unlockDistance={0}
                      onChange={(val) => {
                        onChangeConfig(currentChannel, 'release', val)
                      }}
                      min={0}
                      max={1}
                      skin={skins.s13}
                      preciseMode={false}
                    />
                    <span>{channelConfig[currentChannel + 1] && channelConfig[currentChannel + 1].release.toFixed(2)}</span>
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

                <Control>
                  <h3 className='smallMargin'>DIVIDER</h3>
                  <GreenScreenContainer row>
                    <NumericControl
                      width='30px'
                      minValue={0} maxValue={10} initialValue={0.5}
                      onChange={(value) => console.log(value)}
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
                <Row>
                  <GreenScreenContainer>
                    <h2>BANK</h2>
                    <GreenScreen
                      style={{ width: '150px', marginTop: '20px' }}
                    >PATTERN #1
                    </GreenScreen>
                  </GreenScreenContainer>
                </Row>
              </ControlSection>
            </div>
          </RowDivider>
          <RowDivider>
            <Channels samples={sampleFiles} playSample={playSample} onChangeConfig={onChangeConfig} currentChannel={currentChannel} sequencerMode={sequencerMode} setCurrentChannel={setCurrentChannel} />
          </RowDivider>
        </DeviceSection>

      </DeviceContent>

    </DeviceLayout>
  )
}

export default Layout
