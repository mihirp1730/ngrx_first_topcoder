import { Pipe, PipeTransform } from '@angular/core';
import { IDataObject } from '@apollo/app/services/opportunity';

@Pipe({
    name: 'dataObjectsCount'
})
export class DataObjectsPipe implements PipeTransform {
    transform(objects: IDataObject[], startIndex = 0): number {
        let count = 0;
        objects.forEach((object, index) => {
            if (index >= startIndex) {
                count = count + object.count;
            }
        });
        return count;
    }
}