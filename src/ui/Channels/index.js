import { Container, Step } from './styles'

const Channels = (props) => {
  return (
    <Container>
      <ul>
        {props.samples.map((sample, index) =>
          <div key={index} class={props.currentChannel === index ? 'selectedStep' : ''}>
            <Step
              onClick={
            () => props.playSample(props.samples, index)
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
