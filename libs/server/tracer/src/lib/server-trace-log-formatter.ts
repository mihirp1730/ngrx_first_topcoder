import { context, trace } from "@opentelemetry/api";

export const traceLogFormatter = (object: any): any => {
    const span = trace.getSpan(context.active());
    if (!span) return {...object};
  
    // eslint-disable-next-line no-unsafe-optional-chaining
    const {spanId, traceId, traceFlags} = trace
      .getSpan(context.active())
      ?.spanContext();
  
    return {
      ...object,
      span_id: spanId,
      trace_id: traceId,
      trace_flags: traceFlags,
    };
  };