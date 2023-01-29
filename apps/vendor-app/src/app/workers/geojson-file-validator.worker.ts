import * as Comlink from 'comlink';
import { GeojsonFileProcessor } from '@apollo/app/shape-file-validator';

// Exposing actual implementation to the webworker
Comlink.expose(GeojsonFileProcessor);
