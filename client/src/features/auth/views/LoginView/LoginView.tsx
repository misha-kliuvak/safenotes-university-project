import { yupResolver } from '@hookform/resolvers/yup'
import React, { FC, useEffect } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { SharedIcons } from '@/packages/icons'
import { withStore } from '@/common/store/withStore'
import config from '@/config'
import { StoreType } from '@/common/store'
import { AuthLayout } from '@/features/auth/layouts'
import { LoginSchema } from '@/features/auth/schemas'
import {
  FontWeight,
  Form,
  FormHelper,
  FormItem,
  FullScreenLoading,
  NavLink,
  OAuthButton,
  PasswordInput,
  Spacer,
  Text,
  TextInput,
  TextTypes
} from '@/packages/ui'
import { Button } from '@/packages/ui/button'
import { NavLinkType } from '@/packages/ui/button/NavLink/NavLInk'
import { ROUTES } from '@/router'

const mapStateToProps = ({ auth }: StoreType) => ({
  failedFields: auth.failedFields,
  loading: auth.functionLoading.login,
  login: auth.login
})

type LoginView = ReturnType<typeof mapStateToProps>

const LoginView: FC<LoginView> = ({ failedFields, login, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    trigger
  } = useForm({
    resolver: yupResolver(LoginSchema),
    reValidateMode: 'onChange',
    mode: 'onChange'
  })

  useEffect(() => {
    if (isDirty && Object.keys(failedFields)) {
      trigger()
    }
  }, [failedFields])

  const onSubmit = (values: FieldValues) => {
    login(values)
  }

  return (
    <AuthLayout
      title="Login to your account"
      subtitle="Or create a new if you don't have one"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    >
      <div className="login-page">
        <FullScreenLoading loading={loading} />
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormItem errors={errors.email?.message}>
            <TextInput
              {...register('email')}
              name="email"
              label="Email"
              placeholder="Email"
              invalid={FormHelper.isFieldInvalid('email', errors)}
            />
          </FormItem>
          <FormItem errors={errors.password?.message}>
            <PasswordInput
              {...register('password')}
              name="password"
              label="Password (6 or more characters)"
              placeholder="Password"
              invalid={FormHelper.isFieldInvalid('password', errors)}
            />
          </FormItem>
          <Spacer size={10} ignoreGridGap />
          <Button type="submit" width="default" disabled={!isValid} uppercase>
            Login
          </Button>
        </Form>

        <div className="social-section">
          <Text className="social-section__description">Or login with</Text>

          <Spacer size={10} vertical />
          <NavLink
            href={config.googleAuthUrl}
            type={NavLinkType.NONE}
            width="auto"
            useActiveState={false}
          >
            <OAuthButton type="google" />
          </NavLink>

          <Spacer size={10} vertical />
          <NavLink
            href={config.linkedInAuthUrl}
            type={NavLinkType.NONE}
            width="auto"
            useActiveState={false}
          >
            <OAuthButton type="linkedin" />
          </NavLink>
        </div>
        <div className="bottom-section">
          <Text type={TextTypes.BODY_SMALL} weight={FontWeight.MEDIUM}>
            Do not have an account?
          </Text>
          <Spacer size={5} vertical />
          <NavLink
            href={ROUTES.SIGN_UP}
            width="auto"
            className="auth-goto-link"
          >
            <Text type={TextTypes.BODY_SMALL} weight={FontWeight.BOLD} asSpan>
              Sign up
            </Text>
            <Spacer size={5} vertical />
            <SharedIcons.Arrow size={16} />
          </NavLink>
        </div>
      </div>
    </AuthLayout>
  )
}

export default withStore(mapStateToProps)(LoginView)
