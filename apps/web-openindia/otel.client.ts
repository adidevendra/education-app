import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';

if (typeof window !== 'undefined') {
  const provider = new WebTracerProvider();
  const otlp = process.env.NEXT_PUBLIC_OTLP_ENDPOINT;
  const exporter = otlp ? new OTLPTraceExporter({ url: otlp }) : new ConsoleSpanExporter();
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter as any));
  provider.register();
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation(),
      new DocumentLoadInstrumentation(),
    ],
  });
}
