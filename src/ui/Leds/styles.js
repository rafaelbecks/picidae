import styled from 'styled-components'

const Led = styled.div`
    width: 12px;
    height: 12px;
    border-radius: 20px;
    cursor: pointer;
`

const Note = styled.span`
    font-family: Futura;
    font-style: normal;
    font-size: 11px;
    color:#fff;
    position: absolute;
    cursor: pointer;
`

export {
  Led,
  Note
}
