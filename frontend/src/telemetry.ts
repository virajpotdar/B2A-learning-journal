// Get OTLP endpoint and token from environment variables
const OTLP_ENDPOINT = import.meta.env.VITE_OTLP_ENDPOINT || '';
const OTLP_TOKEN = import.meta.env.VITE_OTLP_TOKEN || '';

// Setup Tracing for Frontend
export function setupFrontendTracing() {
  if (!OTLP_ENDPOINT || !OTLP_TOKEN) {
    console.log('OTLP endpoint or token not configured, skipping tracing setup');
    return;
  }

  console.log('OpenTelemetry tracing disabled for now to fix build errors');
  return null;
}

// Initialize telemetry
export function initializeFrontendTelemetry() {
  try {
    setupFrontendTracing();
  } catch (error) {
    console.error('Failed to initialize OpenTelemetry:', error);
  }
}
