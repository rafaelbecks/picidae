import styled from 'styled-components'

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    ul{
        list-style: none;
        display: flex;
        padding: 0;
    }
`

const Step = styled.li`
    width: 54px;
    height: 45px;
    background: rgba(196,196,196, 0.2);
    box-sizing: border-box;
    margin: 0 12px;
    color: #fff;
    font-family: 'Futura';
    cursor: pointer;
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    // border-radius: 6px;
`

export { Container, Step }
