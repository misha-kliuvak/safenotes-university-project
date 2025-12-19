import React from 'react'

export type ChangeEvent = React.ChangeEvent<HTMLInputElement>
export type ClickEvent<T> = (e: React.MouseEvent<T, MouseEvent>) => void
export type Maybe<T> = T | null

export type Dictionary<T = any> = Record<string, T>
export type TFailedFields = Dictionary<string[]>
