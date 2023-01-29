import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { noop } from 'lodash';
import * as jwtDecode from 'jwt-decode';

import { SESSION_SERVICE_API_URL } from '@apollo/app/engine';

export enum PERFORMANCE_INDICATOR {
  apolloMapSearchTime = 'APOLLO_MAP_SEARCH_TIME',
  apolloMapSelectionTime = 'APOLLO_MAP_SELECTION_TIME',
  allLayerDisabledTime = 'APOLLO_ALL_LAYERS_DISABLE_TIME',
  allLayerEnabledTime = 'APOLLO_ALL_LAYERS_ENABLE_TIME',
  apolloApplyFilterTime = 'APOLLO_APPLY_FILTER_TIME',
  gaiaLightLoadTime = 'GAIA_LIGHT_LOAD_TIME'
}

interface IPerformanceMeasurement {
  performanceIndicator: PERFORMANCE_INDICATOR;
  latency: number;
  subid: string;
  dataPartition: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceIndicatorService {
  public performanceTimings = {};
  public subid: string;
  public dataPartition: string;

  private bandwidthMbps: number = null;
  private measurementsBeforeBandwidth: IPerformanceMeasurement[] = [];

  constructor(private httpClient: HttpClient, @Inject(SESSION_SERVICE_API_URL) private sessionServiceApi: string) {
    Object.values(PERFORMANCE_INDICATOR).forEach((indicator) => this.cleanRecord(indicator));
  }

  public async getBandwidth(): Promise<number> {
    return this.bandwidthMbps;
  }

  public async setBandwidth(bandwidthMbps: number): Promise<void> {
    // Keep the provided value and only function if its a value we can work with.
    this.bandwidthMbps = bandwidthMbps;
    if (this.bandwidthMbps === null) {
      return;
    }
    // Copy the contents of any measurements made before bandwidth was set.
    const measurements = [...this.measurementsBeforeBandwidth];
    // Clear out the contents so we don't report duplicates.
    this.measurementsBeforeBandwidth = [];
    // Post measurements back-to-back.
    for (const measurement of measurements) {
      await this.postMeasurement(measurement);
    }
  }

  public setSauthToken(stoken: string) {
    const user: any = jwtDecode(stoken);
    this.subid = user.subid;
  }

  public setDataPartition(dataPartition: string): void {
    this.dataPartition = dataPartition;
  }

  public startTiming(indicator: PERFORMANCE_INDICATOR) {
    // Because we're recording new times, clear whatever exists...
    this.cleanRecord(indicator);
    // ... and record the new time:
    this.performanceTimings[indicator].startTime = performance.now();
  }

  public endTiming(indicator: PERFORMANCE_INDICATOR) {
    // Record the end time...
    this.performanceTimings[indicator].endTime = performance.now();
    // ... and report it:
    this.reportPerformance(indicator);
  }

  public reportPerformance(indicator: PERFORMANCE_INDICATOR) {
    // Verify we have a report-able performance indicator:
    const { endTime, startTime } = this.performanceTimings[indicator];
    if (startTime === 0 || endTime === 0 || startTime > endTime) {
      return;
    }

    // If we have cached a report-able indicator, then clear out the indicator for the next timing:
    this.cleanRecord(indicator);

    // Using the cached times, post to the performance endpoint:
    const performanceIndicator = indicator;
    const latency = endTime - startTime;
    const subid = this.subid;
    const dataPartition = this.dataPartition;
    this.postMeasurement({ performanceIndicator, latency, subid, dataPartition });
  }

  public cleanRecord(indicator: PERFORMANCE_INDICATOR) {
    this.performanceTimings[indicator] = {
      endTime: 0,
      startTime: 0
    };
  }

  private async postMeasurement(performanceMeasurement: IPerformanceMeasurement): Promise<void> {
    // Check to see if we have a bandwidth value to post with...
    const { bandwidthMbps } = this;
    if (bandwidthMbps === null) {
      // ... if we do not then add our measurement to the queue, for later.
      this.measurementsBeforeBandwidth.push(performanceMeasurement);
    } else {
      // ... otherwise we have a bandwidth value to post with.
      const url = `${this.sessionServiceApi}/LogAtlasClientPerformance`;
      // Post and forget - we don't care about the response from the endpoint.
      await this.httpClient.post(url, { ...performanceMeasurement, bandwidthMbps }).subscribe(noop);
    }
  }
}
