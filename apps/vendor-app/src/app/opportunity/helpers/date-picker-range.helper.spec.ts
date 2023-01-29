import { AbstractControl } from '@angular/forms';
import * as moment from 'moment';
import { dateRangeValidator } from './date-picker-range.helper';

describe('dateRangeValidator', () => {
  it('should return null', () => {
    const endDate= moment().add(1,'days').format('DD-MMM-YYYY');
    const control = { value: `03-Mar-2022 — ${endDate}` };
    const result = dateRangeValidator()(control as AbstractControl);
    expect(result).toBe(null);
  });

  it('should return invalidDateRange error', () => {
    const control = { value: '03-Mar-2022 — 03-Mar-2022' };
    const errorMsg = { "invalidDateRange": true };
    const result = dateRangeValidator()(control as AbstractControl);
    expect(result).toStrictEqual(errorMsg);
  });

  it('should return invalidSelection error', () => {
    const control = { value: '03-Mar-2022' };
    const errorMsg = { "invalidSelection": true };
    const result = dateRangeValidator()(control as AbstractControl);
    expect(result).toStrictEqual(errorMsg);
  });

  it('should return invalidEndDate error', () => {
    const control = { value: '03-Mar-2022 — 01-Jun-2022' };
    const errorMsg = { "invalidEndDate": true };
    const result = dateRangeValidator()(control as AbstractControl);
    expect(result).toStrictEqual(errorMsg);
  });
});
