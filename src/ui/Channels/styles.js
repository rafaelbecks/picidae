import styled from 'styled-components'

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    ul{
        list-style: none;
        display: flex;
        padding: 0;

        > div {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center
        }
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
    margin-bottom: 5px;
`

export { Container, Step }
