import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { DataTypeName } from '../../core/models/attribute-data-type.model';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
    static getValidatorsByDataType(dataTypeName: string): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    switch (dataTypeName) {
      case DataTypeName.String:
        validators.push(ValidationService.stringValidator());
        break;
      case DataTypeName.Integer:
        validators.push(ValidationService.integerValidator());
        break;
      case DataTypeName.Decimal:
        validators.push(ValidationService.decimalValidator());
        break;
      case DataTypeName.Boolean:
        validators.push(ValidationService.booleanValidator());
        break;
      case DataTypeName.Date:
        validators.push(ValidationService.dateValidator());
        break;
      case DataTypeName.JSON:
        validators.push(ValidationService.jsonValidator());
        break;
    }

    return validators;
  }

  static stringValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      // String validation - ensure it's not just numbers
      const value = control.value.toString();
      if (/^\d+$/.test(value)) {
        return { invalidString: { value: control.value, message: 'This field should contain text, not just numbers' } };
      }

      return null;
    };
  }

  static integerValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const value = control.value.toString();
      if (!/^\d+$/.test(value)) {
        return { invalidInteger: { value: control.value, message: 'Please enter a valid whole number' } };
      }

      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0) {
        return { invalidInteger: { value: control.value, message: 'Please enter a positive whole number' } };
      }

      return null;
    };
  }

  static decimalValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const value = control.value.toString();
      if (!/^\d+(\.\d+)?$/.test(value)) {
        return { invalidDecimal: { value: control.value, message: 'Please enter a valid decimal number' } };
      }

      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return { invalidDecimal: { value: control.value, message: 'Please enter a positive decimal number' } };
      }

      return null;
    };
  }

  static booleanValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined) return null;

      const value = control.value.toString().toLowerCase();
      const validValues = ['true', 'false', '1', '0', 'yes', 'no'];

      if (!validValues.includes(value)) {
        return { invalidBoolean: { value: control.value, message: 'Please enter true/false, yes/no, or 1/0' } };
      }

      return null;
    };
  }

  static dateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const date = new Date(control.value);
      if (isNaN(date.getTime())) {
        return { invalidDate: { value: control.value, message: 'Please enter a valid date' } };
      }

      return null;
    };
  }

  static jsonValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      try {
        JSON.parse(control.value);
        return null;
      } catch (e) {
        return { invalidJson: { value: control.value, message: 'Please enter valid JSON format' } };
      }
    };
  }

  static priceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const value = parseFloat(control.value);
      if (isNaN(value) || value <= 0) {
        return { invalidPrice: { value: control.value, message: 'Price must be a positive number' } };
      }

      if (value > 999999.99) {
        return { invalidPrice: { value: control.value, message: 'Price cannot exceed 999,999.99' } };
      }

      return null;
    };
  }

  static stockValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const value = parseInt(control.value, 10);
      if (isNaN(value) || value < 0) {
        return { invalidStock: { value: control.value, message: 'Stock quantity must be a non-negative whole number' } };
      }

      return null;
    };
  }

  static getInputType(dataTypeName: string): string {
    switch (dataTypeName) {
      case DataTypeName.Integer:
        return 'number';
      case DataTypeName.Decimal:
        return 'number';
      case DataTypeName.Date:
        return 'date';
      case DataTypeName.Boolean:
        return 'text'; // We'll use a select for boolean
      case DataTypeName.JSON:
        return 'textarea';
      default:
        return 'text';
    }
  }

  static getPlaceholder(dataTypeName: string, attributeName: string): string {
    switch (dataTypeName) {
      case DataTypeName.String:
        return `Enter ${attributeName.toLowerCase()}`;
      case DataTypeName.Integer:
        return `Enter ${attributeName.toLowerCase()} (whole number)`;
      case DataTypeName.Decimal:
        return `Enter ${attributeName.toLowerCase()} (decimal number)`;
      case DataTypeName.Boolean:
        return `Select true or false`;
      case DataTypeName.Date:
        return `Select date`;
      case DataTypeName.JSON:
        return `Enter valid JSON format`;
      default:
        return `Enter ${attributeName.toLowerCase()}`;
    }
  }

  static getBooleanOptions(): { value: string; label: string }[] {
    return [
      { value: '', label: 'Select...' },
      { value: 'true', label: 'True' },
      { value: 'false', label: 'False' }
    ];
  }
}
