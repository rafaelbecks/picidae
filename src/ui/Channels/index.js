import { Container, Step } from './styles'
import { Led } from '../Leds/styles'

const Channels = (props) => {
  return window.channelConfig && (
    <Container>
      <ul>
        {props.samples.map((sample, index) =>
          <div key={index} class={props.currentChannel === index ? 'selectedStep' : ''}>
            <Step
              onClick={
            () => {
              if (props.sequencerMode === 'PLAY' || props.playMode === 'MIDI') {
                props.setCurrentChannel(index)
                return
              }
              if (props.playMode === 'SAMPLES') { props.playSample(props.samples, index) }
            }
          }
            >
              <span>
                {index + 1}
              </span>
            </Step>
            <Led
              onClick={() => {
                props.onChangeConfig(index, 'enabled', !window.channelConfig[index + 1].enabled)
              }}
              className={window.channelConfig[index + 1] && window.channelConfig[index + 1].enabled ? `ledOn${index}` : `ledOff${index}`}
            />
          </div>

        )}
      </ul>
    </Container>
  )
}

export default Channels
