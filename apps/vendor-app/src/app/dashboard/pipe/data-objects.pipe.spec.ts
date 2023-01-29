import { DataObjectsPipe } from "./data-objects.pipe";

describe('DataObjectsPipe', () => {
    const pipe = new DataObjectsPipe();
    it('transforms data objects to get count of all objects', () => {
        expect(pipe.transform([{
            name: 'Asset',
            count: 10
        }])).toBe(10);
    });
});