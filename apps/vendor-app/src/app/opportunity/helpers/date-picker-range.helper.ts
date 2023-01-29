import { ValidatorFn } from '@angular/forms';
import { DATE_RANGE_DELIMITER } from '@slb-dls/angular-material/date-range-picker';
import * as moment from 'moment';

export function dateRangeValidator(): ValidatorFn {
  return control => {
    if (!control.value) return null;
    if (control.value !== '' && control.value.search(DATE_RANGE_DELIMITER) === -1) {
      return { 'invalidSelection': true };
    }
    if (control.value !== '' && control.value.search(DATE_RANGE_DELIMITER) > 6) {
      const d1 = Date.parse(control.value.split(DATE_RANGE_DELIMITER)[0]);
      const d2 = Date.parse(control.value.split(DATE_RANGE_DELIMITER)[1]);
      if (d1 === d2) {
        return { 'invalidDateRange': true };
      }
    }
    if (control.value !== '' && control.value.search(DATE_RANGE_DELIMITER) > 6) {
      const endDate = Date.parse(control.value.split(DATE_RANGE_DELIMITER)[1]);
      if (moment(endDate).diff( moment(Date.now()), 'days') < 0) {
        return { 'invalidEndDate': true };
      }
    }
    return null;
  }
}