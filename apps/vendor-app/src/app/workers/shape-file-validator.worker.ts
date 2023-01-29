import * as Comlink from 'comlink';
import { ShapeFileProcessor } from '@apollo/app/shape-file-validator';

// Exposing actual implementation to the webworker
Comlink.expose(ShapeFileProcessor);
