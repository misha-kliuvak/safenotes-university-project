import { Color } from './color'

export function TextColor(color: Color): Color {
  return color
}

export function BackgroundColor(color: Color) {
  return `background-${color}`
}

export function HoverColor(color: Color) {
  return `hover-${color}`
}

export type ColorType =
  | typeof TextColor
  | typeof BackgroundColor
  | typeof HoverColor
