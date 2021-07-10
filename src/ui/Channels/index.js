import { Container, Step } from './styles'

const Channels = (props) => {
  return (
    <Container>
      <ul>
        {props.samples.map((sample, index) =>
          <div key={index} class={props.currentChannel === index ? 'selectedStep' : ''}>
            <Step
              onClick={
            () => {
              if (props.sequencerMode === 'PLAY') {
                props.setCurrentChannel(index)
                return
              }
              props.playSample(props.samples, index)
            }
          }
            >
              <span>
                {index + 1}
              </span>
            </Step>
          </div>

        )}
      </ul>
    </Container>
  )
}

export default Channels
