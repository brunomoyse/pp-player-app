import { afterEach, describe, expect, it, jest } from '@jest/globals';

import {
  captureException,
  captureMessage,
  isMonitoringEnabled,
  setMonitoringBackend,
  type MonitoringBackend,
} from '@/lib/monitoring';

describe('monitoring seam', () => {
  afterEach(() => {
    setMonitoringBackend(null);
    jest.restoreAllMocks();
  });

  it('is disabled until a backend is registered', () => {
    expect(isMonitoringEnabled()).toBe(false);
    setMonitoringBackend({ captureException: jest.fn(), captureMessage: jest.fn() });
    expect(isMonitoringEnabled()).toBe(true);
    setMonitoringBackend(null);
    expect(isMonitoringEnabled()).toBe(false);
  });

  it('no-ops without throwing when no backend is registered', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => captureException(new Error('boom'))).not.toThrow();
    expect(() => captureMessage('hi')).not.toThrow();
  });

  it('routes exceptions and messages to the registered backend with context', () => {
    const backend: MonitoringBackend = {
      captureException: jest.fn(),
      captureMessage: jest.fn(),
    };
    setMonitoringBackend(backend);

    const err = new Error('kaboom');
    captureException(err, { operation: 'GetMe' });
    captureMessage('heads up', { level: 'warning' });

    expect(backend.captureException).toHaveBeenCalledWith(err, { operation: 'GetMe' });
    expect(backend.captureMessage).toHaveBeenCalledWith('heads up', { level: 'warning' });
  });

  it('stops routing after the backend is cleared', () => {
    const backend: MonitoringBackend = {
      captureException: jest.fn(),
      captureMessage: jest.fn(),
    };
    setMonitoringBackend(backend);
    setMonitoringBackend(null);
    jest.spyOn(console, 'error').mockImplementation(() => {});

    captureException(new Error('after-clear'));
    expect(backend.captureException).not.toHaveBeenCalled();
  });
});
