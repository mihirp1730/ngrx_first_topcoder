import { HttpClient } from '@angular/common/http';
import {
    HttpClientTestingModule, HttpTestingController
} from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { mockAuthCodeFlowService, mockSecureEnvironmentService } from '../../shared/services.mock';
import { MapLargeHelperService } from './maplarge-helper.service';

const deploymentInfo = {
    name: 'slb-ml-server-2',
    connectionInfo: {
        baseUrls: ['baseUrl'],
        userId: 'mlUser',
        accessToken: 'mlToken'
    }
};

const tables = [
    {
        acctcode: 'slb',
        columns: [
            {
                id: 'slb/test',
                name: 'source',
                type: 'Poly'
            },
        ],
        created: '2020-03-16T11:58:58.5990123Z',
        folder: null,
        host:
            'host',
        id: 'slb/tenant',
        inram: false,
        name: 'tenant1_wke_well_1_0_0',
        rowCount: 4,
        tags: [],
        version: '637199567385990123'
    }
];

const count = {
    "data": {
        "allGeo": {},
        "totals": {
            "Records": 1
        },
        "tablename": "2S21QQGC6J/SeismicSurvey2d/637962442240542538",
        "data": {
            "OpportunityId": [
                "OP-VD7-smmqrhmt8m0g-674696414093"
            ],
            "OpportunityId_Count": [
                1
            ]
        }
    }
};
describe('MapLargeHelperService', () => {
    let service: MapLargeHelperService;
    let httpMock: HttpTestingController;


    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                MapLargeHelperService,
                HttpClient,
                {
                    provide: SecureEnvironmentService,
                    useValue: mockSecureEnvironmentService
                },
                {
                    provide: AuthCodeFlowService,
                    useValue: mockAuthCodeFlowService
                  },
            ]
        });

        service = TestBed.inject(MapLargeHelperService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should be created', inject([MapLargeHelperService], () => {
        expect(service).toBeTruthy();
    }));

    it('getDeployment: should return deployment', () => {
        service
            .getDeployment()
            .subscribe((deployment: any) => {
                expect(deployment.connectionInfo).toBeDefined();
                expect(deployment.connectionInfo.accessToken).toBeDefined();
                expect(deployment.connectionInfo.userId).toBeDefined();
                expect(deployment.connectionInfo.baseUrls).toBeDefined();
            });
        const tableRequest = httpMock.expectOne('');
        tableRequest.flush(deploymentInfo);
        httpMock.verify();
    });
    it('getTableNames: should return active tables', () => {
        service
            .getActiveTables({
                baseUrl: "test",
                userId: 'mlUser',
                accessToken: 'mlToken'
            })
            .subscribe((tables: any) => {
                expect(tables.length).toEqual(1);
            });
        const tableRequest = httpMock.expectOne('test/Remote/GetActiveTables?verbose=true');
        tableRequest.flush(tables);
        httpMock.verify();
    });

    it('getCount: should return count', () => {
        service.getCountFromMl(["OP-id"], "Asset", "vendor", {
            baseUrl: "test",
            userId: 'mlUser',
            accessToken: 'mlToken'
        }).subscribe((count: any) => {
            expect(count.data.data.OpportunityId_Count).toEqual(1);
        });
        const tableRequest = httpMock.expectOne('test/Api/ProcessDirect');
        tableRequest.flush(count);
        httpMock.verify();
    });
});
