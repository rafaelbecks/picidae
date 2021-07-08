import { useEffect } from 'react'

export const useKeyPress = (handler) => {
  const downHandler = ({ key }) => {
    if (key) {
      handler(key)
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', downHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [])
}
