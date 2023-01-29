import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
@GaiaTraceClass
export class AppHealthService {
  healthCheck(appKey: string): any {
    if (!appKey) {
      console.log('App Key not defined');

      throw new NotFoundException({
        statusCode: 404,
        message: 'App Key not found in headers to make call to this /health endpoint',
        error: 'Not Found'
      });
    } else {
      console.log('App key is defined');

      return { statusCode: 200, message: 'OK', error: 'No Error' };
    }
  }
}
