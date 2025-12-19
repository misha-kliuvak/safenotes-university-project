import { FieldErrors, FieldValues } from 'react-hook-form'
import { UseFormSetError } from 'react-hook-form/dist/types/form'
import { ValidationError } from 'yup'
import { TFailedFields } from '@/common/types'

export class FormHelper {
  static isFieldValid (fieldName: string, errors: FieldErrors = {}) {
    return !(fieldName in errors)
  }

  static isFieldInvalid (fieldName: string, errors: FieldErrors) {
    return !FormHelper.isFieldValid(fieldName, errors)
  }

  static formatYupErrors (errors: ValidationError) {
    return errors.inner.reduce(
      (allErrors, currentError: ValidationError) => ({
        ...allErrors,
        [currentError.path as string]: {
          type: currentError.type ?? 'validation',
          message: currentError.message
        }
      }),
      {}
    )
  }

  static displayApiValidationErrorsInUi (
    failedFields: TFailedFields,
    useFormSetErrorFn: UseFormSetError<FieldValues>
  ) {
    if (failedFields && Object.keys(failedFields).length) {
      Object.keys(failedFields)
        .forEach((key: string) => {
          useFormSetErrorFn(key, {
            message: failedFields[key][0],
            type: 'validate'
          })
        })
    }
  }
}
