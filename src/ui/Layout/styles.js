import styled from 'styled-components'

const DeviceLayout = styled.div`
    width: 735px;
    height: 657px;
    background: #007d7d;
    position: relative;
    padding: 20px 34px 34px 24px;
    `

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: transparent;
`

const RightCircleTop = styled.img`
    position: absolute;
    top: 0;
    margin: 16px;
    right: 0;
`

const LeftCircleTop = styled.img`
    position: absolute;
    top: 0;
    margin: 16px;
    left: 0;
`

const RightCircleBottom = styled.img`
    position: absolute;
    bottom: 0;
    margin: 16px;
    right: 0;
`

const LeftCircleBottom = styled.img`
    position: absolute;
    bottom: 0;
    margin: 16px;
    left: 0;
`

const DeviceName = styled.div`
  color: #fff;
  margin: 0;
  margin-bottom: 12px;
  display:flex;
  justify-content: space-between;
  font-family: 'Futura';
  align-items: center;
  div {
      display:flex;
      align-items:center;
  }
  h1 {
    font-weight: 100;
    font-size: 26px;
    margin-left: 10px;
    letter-spacing: 0.06em;
  }

  h3 {
    font-weight: 100;
    font-size: 16px;
    text-align: right;
    letter-spacing: 0.03em;
  }
`

const DeviceSection = styled.div`
    width: 100%;
    height: 100%;
    border: 1.5px solid #FFFFFF;
    box-sizing: border-box;
    border-radius: 10px;
    padding: 24px 0px;
    h2 {
        font-family: 'Futura';
        font-size: 18px;
        font-weight: 100;
        color: #fff;
        margin: 0;
    }
`

const DeviceContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const GreenScreen = styled.div`
    height: 38px;
    width: fit-content;
    min-width: 20px;
    padding: 0px 10px;
    display:flex;
    text-transform: uppercase;
    justify-content: center;
    align-items:center;
    background: #162340;
    margin: 0;
    font-family: 'Monda';
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    color: #FAFFBC;
    text-align: center;
`

const Row = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-around;
    align-items: center;
    margin: 38px 0px 0px 0px;
    height: 46px;
`

const RowDivider = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-around;
    align-items: baseline;
    margin: 0;
    position:relative;
`

const Column = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: space-around;
    align-items: center;
`

const Control = styled.div`
    height: 88px;
    width: 60%;
`

const MainControl = styled.div`
    position: relative;
    bottom: 10px;
    height: 88px;
    width: 50%;
`

const Separator = styled.div`
    width: 144px;
    margin: 15px 0;
`

const SmallSeparator = styled.div`
    border-top: 0.5px solid #FFFFFF;
    width: 154px;
    margin: 4px 0;
`

const GreenScreenContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
`

const GridScreen = styled.img`
    position: absolute;
    width: 304px !important;
    top: 317px;
    height: 336px;
    mix-blend-mode: screen`

const OscilloscopeScreen = styled.video`
    width: 298px !important;
    height: 284px;
    margin-top: 20px;
    object-fit: cover;
    box-shadow: 0px 0px 7px 1px rgb(0 0 0 / 75%);
    mix-blend-mode:difference;
`

const ScreenMessage = styled.h2`
    position: absolute;
    margin: 0;
    top: 243px;
    font-size: 13px;
    font-family: 'Monda';
    color: #a1fd84;
    width: 175px;
    z-index: 1;
    opacity: 1;
    background: black;
    left: 31%;
`

const KnobContainer = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    span {
      color: #fff;
      font-size: 9px;
      font-family: Futura;
      margin-top: 5px;
    }
`

const DeviceColumn = styled.div`
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const SlidersContainer = styled.div`
    margin: -2px 0px 9px 0px;
    display: flex;
`
const DeviceSelect = styled.select`
    opacity: 0;
    position: relative;
    bottom: 39px;
    width: 170px;
    height: 38px;
`

const LissajousCanvas = styled.canvas`
    transform: scale(0.5);
    z-index: 0;
    stroke: #fff;
`

const Circle = styled.ul`
     position: relative;
     width: 200px;
     height: 200px;
     border-radius: 50%;
     padding: 0;
     list-style: none;
     top: 98px;
     right: 6px;
     transform: rotate(0deg) !important;

    >  * {
        display: block;
        position: absolute;
        width: 1em;
        height: 1em;
    }

    ${props => {
        let rotation = 0
        const angle = (360 / props.size)
        return Array.from(Array(props.size)).map((i, index) => {
        const child = `
        *:nth-of-type(${index + 1}) {
          transform: rotate(${rotation * 1}deg) translate(100px) rotate(${rotation * -1}deg);
        }
        `
        rotation = rotation + angle
        return child
    }).join()
    }
    }

`

export {
  DeviceLayout,
  Container,
  Circle,
  ScreenMessage,
  RightCircleTop,
  LeftCircleTop,
  RightCircleBottom,
  LeftCircleBottom,
  DeviceSection,
  DeviceName,
  DeviceContent,
  GreenScreen,
  Row,
  Control,
  Separator,
  GreenScreenContainer,
  SmallSeparator,
  OscilloscopeScreen,
  GridScreen,
  KnobContainer,
  DeviceColumn,
  SlidersContainer,
  DeviceSelect,
  LissajousCanvas,
  MainControl,
  Column,
  RowDivider
}
