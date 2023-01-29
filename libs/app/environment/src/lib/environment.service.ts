/**
 * Copyright (c) 2021 Schlumberger. All Rights Reserved. Schlumberger Private.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private static responseCache: { [path: string]: any } = {};

  public static getHost(nativeDocument: Document): string {
    let baseWithProtocol: string = nativeDocument.baseURI;
    // If baseURI ends with '/' then remove it:
    const lastIndex = baseWithProtocol.length - 1;
    if (baseWithProtocol[lastIndex] === '/') {
      baseWithProtocol = baseWithProtocol.substring(0, lastIndex);
    }
    // Remove any HTTP protocols from the above baseURI:
    if (baseWithProtocol.startsWith('http://')) {
      return baseWithProtocol.substring(7);
    }
    if (baseWithProtocol.startsWith('https://')) {
      return baseWithProtocol.substring(8);
    }
    // If no protocol exists, then return as-is:
    return baseWithProtocol;
  }

  public static getEnvironment(path: string, variablesToReplace?: { key: string; value: string }[]): any {
    if (!(path in EnvironmentService.responseCache)) {
      EnvironmentService.responseCache[path] = EnvironmentService.sendHttpRequest(path);
    }

    if (!(path in EnvironmentService.responseCache) || !EnvironmentService.responseCache[path]) {
      return undefined;
    }

    let result = EnvironmentService.responseCache[path];

    if (variablesToReplace) {
      variablesToReplace.forEach((item) => (result = result.replace(new RegExp(`\\$${item.key}`, 'g'), item.value)));
    }

    result = result.replace(new RegExp('"\\$[a-zA-Z_]+"', 'g'), '""');
    return JSON.parse(result);
  }

  private static sendHttpRequest(path: string): any {
    const request = new XMLHttpRequest();
    request.open('GET', encodeURI(path), false);
    request.overrideMimeType('application/json');
    request.send();

    if (request.status === 200) {
      return request.responseText;
    } else {
      throw new Error("Environment settings file doesn't exist!");
    }
  }
}
