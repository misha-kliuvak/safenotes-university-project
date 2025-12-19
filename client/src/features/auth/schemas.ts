import * as yup from 'yup'
import { stores } from '@/common/store'

export const LoginSchema = yup
  .object({
    email: yup
      .string()
      .email('Invalid email')
      .required('Email is required')
      .test(
        'non-exist-email',
        'This email has not been found in our system ',
        () => {
          const { failedFields, clearErrors } = stores.auth

          const condition = !('email' in failedFields)

          clearErrors()
          return condition
        }
      ),
    password: yup
      .string()
      .min(5, 'Password must be at least 5 characters')
      .required('Password is required')
  })
  .required()

export const SignUpSchema = LoginSchema.concat(
  yup
    .object()
    .shape({
      email: yup
        .string()
        .email('Invalid email')
        .required('Email is required')
        .test('unique-email', 'This email has already been taken', () => {
          const { failedFields, clearErrors } = stores.auth

          const condition = !('email' in failedFields)

          clearErrors()
          return condition
        }),
      fullName: yup.string().required('Name is required')
    })
    .required()
)

export const ResetPasswordSchema = yup
  .object({
    email: yup.string().email('Invalid email').required('Email is required')
  })
  .required()

export const SetNewPasswordSchema = yup
  .object({
    password: yup
      .string()
      .min(5, 'Password must be at least 5 characters')
      .required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords does not match')
      .required('Confirm password is required')
  })
  .required()
