export type TStoryWithText<T = object> = { text?: string } & T

export type TOption = {
  id: string
  label: string
  icon?: JSX.Element
  disabled?: boolean
  hidden?: boolean
}
