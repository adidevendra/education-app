import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export async function startOtel() {
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'education-api',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  });
  const exporters = [] as any[];
  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    exporters.push(new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }));
  } else {
    exporters.push(new ConsoleSpanExporter());
  }
  const sdk = new NodeSDK({
    resource,
    traceExporter: exporters[0],
    instrumentations: [getNodeAutoInstrumentations()],
  });
  await sdk.start();
  return sdk;
}
