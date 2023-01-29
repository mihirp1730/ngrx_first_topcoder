import { ITracingConfig } from '@apollo/api/interfaces';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { CompositePropagator, HttpBaggagePropagator, HttpTraceContextPropagator } from '@opentelemetry/core';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/tracing';

export class Tracer {
  public static build(options: ITracingConfig): NodeSDK {

    const metricsExporter = options.isDev ? {} : {
      metricExporter: new PrometheusExporter({
        port: options.metricsPort
      })
    };

    return new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: options.serviceName
      }),
      ...metricsExporter,
      metricInterval: options.metricsInterval,
      spanProcessor: new BatchSpanProcessor(
        new ZipkinExporter({
          serviceName: options.serviceName,
          url: `${options.spanProcessorHost}:${options.spanProcessorPort}/api/v2/spans`
        })
      ),
      contextManager: new AsyncLocalStorageContextManager(),
      textMapPropagator: new CompositePropagator({
        propagators: [
          new JaegerPropagator(),
          new HttpTraceContextPropagator(),
          new HttpBaggagePropagator(),
          new B3Propagator(),
          new B3Propagator({
            injectEncoding: B3InjectEncoding.MULTI_HEADER
          })
        ]
      }),
      instrumentations: [getNodeAutoInstrumentations()]
    });
  }
}
