import { FC, PropsWithChildren, ReactElement } from 'react'

// if condition is true, then component will render
interface IConditionalRenderProps extends PropsWithChildren {
  condition?: boolean
  fallbackElement?: ReactElement | JSX.Element | string | null
}

export function conditionalRender(
  condition: boolean,
  ComponentA: JSX.Element,
  ComponentB: ReactElement | JSX.Element | null = null
): JSX.Element | null {
  return condition ? ComponentA : ComponentB
}

export const ConditionalRender: FC<IConditionalRenderProps> = (
  {
    condition = false,
    children,
    fallbackElement
  }: IConditionalRenderProps) =>
  conditionalRender(
    condition,
    <>{children}</>,
    fallbackElement ? <>{fallbackElement}</> : <></>
  )

export default ConditionalRender
