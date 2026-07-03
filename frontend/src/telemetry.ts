import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import type { TracerProvider } from '@opentelemetry/sdk-trace-base';

// Get OTLP endpoint and token from environment variables
const OTLP_ENDPOINT = import.meta.env.VITE_OTLP_ENDPOINT || '';
const OTLP_TOKEN = import.meta.env.VITE_OTLP_TOKEN || '';

// Create resource with service name
const resource = Resource.create({
  [ATTR_SERVICE_NAME]: 'b2a-learning-journal-frontend',
  'service.environment': import.meta.env.MODE || 'development',
  'deployment.environment': import.meta.env.VITE_DEPLOYMENT_ENV || 'local',
});

// Setup Tracing for Frontend
export function setupFrontendTracing() {
  if (!OTLP_ENDPOINT || !OTLP_TOKEN) {
    console.log('OTLP endpoint or token not configured, skipping tracing setup');
    return;
  }

  const tracerProvider = new WebTracerProvider({ resource });
  (tracerProvider as TracerProvider).addSpanProcessor(
    new SimpleSpanProcessor(new OTLPTraceExporter({
      url: `${OTLP_ENDPOINT}/v1/traces`,
      headers: {
        Authorization: `Basic ${OTLP_TOKEN}`,
      },
    }))
  );

  tracerProvider.register();
  console.log('OpenTelemetry tracing initialized for frontend');
  return tracerProvider;
}

// Initialize telemetry
export function initializeFrontendTelemetry() {
  try {
    setupFrontendTracing();
  } catch (error) {
    console.error('Failed to initialize OpenTelemetry:', error);
  }
}
