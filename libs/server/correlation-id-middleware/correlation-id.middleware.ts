import { v4 as uuid } from 'uuid';

/**
 *  generateCorrelationId is a function that generates a random correlation ID.
 */
export function CorrelationIdMiddleware(generateCorrelationId: () => string = uuid) {
  return (req: any, res: any, next: () => void) => {
    const correlationHeader = req.header('correlation-id') || generateCorrelationId();
    req.headers['correlation-id'] = correlationHeader;
    res.set('correlation-id', correlationHeader);
    next();
  };
}
