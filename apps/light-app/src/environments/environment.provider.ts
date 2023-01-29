import { InjectionToken } from '@angular/core';

import { Env } from './environment.interface';

export const ENV = new InjectionToken<Env>('env');
