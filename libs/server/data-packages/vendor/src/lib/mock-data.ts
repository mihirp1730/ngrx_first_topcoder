import { PackageStatuses, ResultsResponseResult } from '@apollo/api/data-packages/vendor';
import { v4 as uuid } from 'uuid';

// TODO: remove later once actual data source is connected:
const mockDataType: string[] = ['Wells', 'Survey 2d', 'Survey 3d' ];

// TODO: remove later once actual data source is connected:
const mockRegions: string[] = ['North America', 'North America Atlantic', 'North America Gulf', 'North America Pacific', 'Europe'];

// TODO: remove later once actual data source is connected:
/* istanbul ignore next */
export function generateMockData(count: number): ResultsResponseResult[] {
  const mockDate = new Date();
  const mockPackages: ResultsResponseResult[] = [];
  const mockStatuses = [
    PackageStatuses.Draft,
    PackageStatuses.Published,
    PackageStatuses.Publishing,
    PackageStatuses.Unpublished
  ];
  for (let i = 0; i < count; i++) {
    mockDate.setHours(mockDate.getHours() - 7);
    const mockId = uuid();
    const subscriptionsActive = Math.floor(Math.random() * 25)
    const subscriptionsPending = Math.floor(Math.random() * 25)
    mockPackages.push({
      id: mockId,
      image: null,
      name: `${mockId.substring(0, 3).toUpperCase()} Mock Package`,
      status: mockStatuses[Math.floor(Math.random() * mockStatuses.length)],
      dataType: [mockDataType[Math.floor(Math.random() * mockDataType.length)]],
      region: [mockRegions[Math.floor(Math.random() * mockRegions.length)]],
      createdBy: 'Test User',
      createdOn: mockDate.toISOString(),
      lastUpdatedBy: 'Test User',
      lastUpdatedOn: mockDate.toISOString(),
      subscriptionsActive: subscriptionsActive < 5 ? 0 : subscriptionsActive,
      subscriptionsPending: subscriptionsPending < 5 ? 0 : subscriptionsPending
    });
  }
  return mockPackages;
}
