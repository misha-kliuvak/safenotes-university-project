import { registerDecorator, ValidationOptions } from 'class-validator';
import isImageURL from 'image-url-validator';

export function IsImageUrlOrFile(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isImageUrl',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        ...validationOptions,
        message: 'image must be an valid URL',
      },
      validator: {
        async validate(value: any) {
          if (typeof value === 'string') {
            return isImageURL(value);
          }
          return true;
        },
      },
    });
  };
}
