import { useEffect, useState } from 'react'

type TReturnType = [
  value: boolean,
  toggle: () => void,
  utils: {
    toggleOn: () => void
    toggleOff: () => void
  }
]

export function useToggle (defaultValue = false): TReturnType {
  const [toggleValue, setToggleValue] = useState(false)

  useEffect(() => {
    setToggleValue(defaultValue)
  }, [defaultValue])

  const toggle = (): void => setToggleValue(!toggleValue)
  const toggleOn = (): void => setToggleValue(true)
  const toggleOff = (): void => setToggleValue(true)

  return [
    toggleValue,
    toggle,
    {
      toggleOn,
      toggleOff
    }
  ]
}
