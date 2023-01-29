import { DataPackageConstants } from './data-package.constants';

describe('DataPackageConstants', () => {
    it('should check create data package url', () => {
        expect(DataPackageConstants.createDataPackage).toEqual('/data-packages/');
    });
});