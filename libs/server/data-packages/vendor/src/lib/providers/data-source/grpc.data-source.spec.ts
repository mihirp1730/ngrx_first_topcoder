import { noop } from 'lodash';
import { v4 as uuid } from 'uuid';

import { GrpcDataSource } from './grpc.data-source';

class MockDataPackageService {
  getDataPackages = noop;
  getDataPackage = noop;
  getMarketingRepresentations = noop;
}

const mockFilter = {
  filters: {
    status: {
      value: null
    },
    region: {
      value: null
    },
    dataType: {
      value: null
    }
  }
}

const dataPackageId = 'pkgid-1';
describe('GrpcDataSource', () => {
  let dataSource: GrpcDataSource;
  let mockLoadSyncRef: any;
  let existsSyncFactoryRef: any;
  let mockLoadPackageDefinitionRef: any;

  beforeEach(() => {
    mockLoadSyncRef = () => null;
    existsSyncFactoryRef = () => true;
    mockLoadPackageDefinitionRef = {
      com: {
        slb: {
          xchange: {
            resource: {
              DataPackageService: MockDataPackageService
            }
          }
        }
      }
    };
    dataSource = new GrpcDataSource(
      'grpcHost',
      'grpcPort',
      'protoPath',
      () => existsSyncFactoryRef,
      () => mockLoadSyncRef,
      () => () => mockLoadPackageDefinitionRef
    )
  });

  it('should be defined', () => {
    expect(dataSource).toBeTruthy();
  });

  describe('init', () => {
    it('should reject with a missing service', (done) => {
      mockLoadPackageDefinitionRef = {};
      dataSource.init()
        .catch((error) => {
          expect(error).toBeTruthy();
          done();
        });
    });
    it('should reject with a missing proto file', (done) => {
      existsSyncFactoryRef = () => false;
      dataSource.init()
        .catch((error) => {
          expect(error).toBeTruthy();
          done();
        });
    });
    it('should return with a data source instance', (done) => {
      dataSource.init()
        .then((ref) => {
          expect(ref).toBe(dataSource);
          done();
        });
    });
  });

  describe('queryPackages', () => {

    beforeEach(async () => {
      await dataSource.init();
    });

    it('should return with a value', (done) => {
    const mockUserId = uuid();
    const billingAccountId = uuid();
    const authorization = uuid();
    jest.spyOn(dataSource, 'getAllPackages').mockReturnValue(Promise.resolve([
      {
        dataPackageId,
        name: 'pkg-name',
        status: 'DRAFT',
        regions: [],
        media: [],
        createdBy: 'test-user',
        createdDate: '29-09-2021',
        lastModifiedBy: 'test-user',
        lastModifiedDate: '29-09-2021'
      }
    ] as any));
    jest.spyOn(dataSource, 'getPackageProfile').mockReturnValue(Promise.resolve({
      regions: ['test-1', 'test-2'],
      media: [
        {
          fileId: 'file_id',
          fileName: 'file_name',
          fileType: 'jpeg',
          caption: '',
          profileImage: true
        }
      ]
    } as any));
    jest.spyOn(dataSource, 'getDatatypes').mockReturnValue(Promise.resolve(['data-type-1', 'data-type-1'] as any));
    dataSource.queryPackages(mockUserId, billingAccountId, authorization, mockFilter)
      .then((response) => {
        expect(response).toBeTruthy();
        done();
      });
  });
  });
  describe('getAllPackages', () => {
    beforeEach(async () => {
      await dataSource.init();
    });

    it('should reject with a missing client', (done) => {
      dataSource.client = null;
      dataSource.getAllPackages(mockFilter, {} as any)
        .catch((error) => {
          expect(error).toBeTruthy();
          done();
        });
    });

    it('should reject with any client error', (done) => {
      jest.spyOn(dataSource.client, 'getDataPackages').mockImplementationOnce(() => { throw new Error(uuid()) });
      dataSource.getAllPackages(mockFilter, {} as any)
        .catch((error) => {
          expect(error).toBeTruthy();
          done();
        });
    });

    it('should reject with a bad response', (done) => {
      (dataSource.client as any).getDataPackages = (args, metadata, callback) => {
        callback(null, null);
      };
      dataSource.getAllPackages(mockFilter, {} as any)
        .catch((error) => {
          expect(error).toBeNull();
          done();
        });
    });
    it('should return with a value', (done) => {
      (dataSource.client as any).getDataPackages = (args, metadata, callback) => {
        callback(null, { dataPackages: [
          {
            dataPackageId
          }
        ]});
      };
      dataSource.getAllPackages(mockFilter, {} as any)
        .then((response) => {
          expect(response).toBeTruthy();
          done();
        });
    });
    it('should return empty value', (done) => {
      (dataSource.client as any).getDataPackages = (args, metadata, callback) => {
        callback(null, { dataPackages: [] });
      };
      dataSource.getAllPackages(mockFilter, {set: jest.fn()} as any)
        .then((response) => {
          expect(response).toBeTruthy();
          done();
        });
    });
  });

  describe('getPackageProfile', () => {
    beforeEach(async () => {
      await dataSource.init();
    });

    it('should reject with a missing client', (done) => {
      dataSource.client = null;
      dataSource.getPackageProfile(dataPackageId, {set: jest.fn()} as any)
        .catch((error) => {
          expect(error).toBeTruthy();
          done();
        });
    });

    it('should reject with any client error', (done) => {
      jest.spyOn(dataSource.client, 'getDataPackage').mockImplementationOnce(() => { throw new Error(uuid()) });
      dataSource.getPackageProfile(dataPackageId, {set: jest.fn()} as any)
        .catch((error) => {
          expect(error).toBeTruthy();
          done();
        });
    });

    it('should return with a value', (done) => {
      (dataSource.client as any).getDataPackage = (args, metadata, callback) => {
        callback(null, {
          dataPackage: {
            dataPackageProfile :
            {
              dataPackageId: 'pkgid-1'
            }
          }
        });
      };
      dataSource.getPackageProfile(dataPackageId, {set: jest.fn()} as any)
        .then((response) => {
          expect(response).toBeTruthy();
          done();
        });
    });
    it('should return empty value', (done) => {
      (dataSource.client as any).getDataPackage = (args, metadata, callback) => {
        callback(null, { dataPackage: { dataPackageProfile: {} } });
      };
      dataSource.getPackageProfile(dataPackageId, {set: jest.fn()} as any)
        .then((response) => {
          expect(response).toBeTruthy();
          done();
        });
    });
  });

  describe('getDatatypes', () => {
    beforeEach(async () => {
      await dataSource.init();
    });
    it('should reject with a missing client', (done) => {
      dataSource.client = null;
      dataSource.getDatatypes(dataPackageId, { set: jest.fn() } as any)
        .catch((error) => {
          expect(error).toBeTruthy();
          done();
        });
    });
    it('should reject with any client error', (done) => {
      jest.spyOn(dataSource.client, 'getMarketingRepresentations').mockImplementationOnce(() => { throw new Error(uuid()) });
      dataSource.getDatatypes(dataPackageId, { set: jest.fn() } as any)
        .catch((error) => {
          expect(error).toBeTruthy();
          done();
        });
    });
    it('should return with a value', (done) => {
      (dataSource.client as any).getMarketingRepresentations = (args, metadata, callback) => {
        callback(null, {
          marketingRepresentations: [
            {
              dataType: 'dataType-1'
            }
          ]
        });
      };
      dataSource.getDatatypes(dataPackageId, {set: jest.fn()} as any)
        .then((response) => {
          expect(response).toBeTruthy();
          done();
        });
    });
    it('should return empty value', (done) => {
      (dataSource.client as any).getMarketingRepresentations = (args, metadata, callback) => {
        callback(null, { dataPackage: { dataPackageProfile: {} } });
      };
      dataSource.getDatatypes(dataPackageId, {set: jest.fn()} as any)
        .then((response) => {
          expect(response).toBeTruthy();
          done();
        });
    });
  });
});
