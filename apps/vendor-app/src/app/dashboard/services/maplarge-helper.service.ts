import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthUser } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { IMlConnectionInfo } from '@apollo/app/services/opportunity';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MapLargeHelperService {

    constructor(
        private httpClient: HttpClient,
        private readonly environment: SecureEnvironmentService,
        private authCodeFlowService: AuthCodeFlowService
    ) {
        this.authCodeFlowService.getUser().subscribe((user) => {
            this.userAuth = user;
          });
     }

    private userAuth: AuthUser;

    private prepareHeaders() {
        return {
            'appKey': this.environment.secureEnvironment.app.key,
            'slb-data-partition-id': this.environment.secureEnvironment.xchange.mlAccount,
            'data-partition-id': this.environment.secureEnvironment.xchange.mlAccount,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.userAuth.gisToken}`
        }
    }
    public getDeployment(): Observable<any> {
        const headers: any = this.prepareHeaders();
        return this.httpClient.get(this.environment.secureEnvironment.map.deploymentUrl, { headers }) as Observable<any>;
    }

    public getActiveTables(
        connectionInfo: IMlConnectionInfo
    ): Observable<any> {
        const headers = {
            'Content-Type': 'application/json',
            "mltoken": connectionInfo.accessToken,
            "mlUser": connectionInfo.userId,
        };
        return this.httpClient.get<any>(`${connectionInfo.baseUrl}/Remote/GetActiveTables?verbose=true`,
            { headers });
    }

    public getCountFromMl(
        opportunityIds: string[],
        tableName: string,
        vendorBillingAccount: string,
        connectionInfo: IMlConnectionInfo
    ): any {
        const req = {
            "action": "table/query",
            "query": {
                "engineVersion": 0,
                "groupby": [
                    "OpportunityId"
                ],
                "sqlselect": [
                    `OpportunityId.count`,
                    "OpportunityId"
                ],
                "start": 0,
                "table": {
                    "name": `${vendorBillingAccount}/${tableName}`
                },
                "take": -1,
                "truncatestringellipsis": "",
                "truncatestringlength": 0,
                "where": [
                    [
                        {
                            "col": "OpportunityId",
                            "isValid": true,
                            "test": "EqualAny",
                            "value": opportunityIds
                        }
                    ]
                ]
            }
        };
        const body = new HttpParams()
            .set('uParams', "action:table%2Fquery;fallbackToPoll:true")
            .set('request', JSON.stringify(req));
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            "mltoken": connectionInfo.accessToken,
            "mlUser": connectionInfo.userId
        };
        return this.httpClient.post<any>(`${connectionInfo.baseUrl}/Api/ProcessDirect`,
            body, { headers });
    }
}
