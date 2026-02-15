import type { ProfilerOnRenderCallback } from 'react';

type PerfMetricType = 'route-render' | 'input-latency';

type PerfMetric = {
    type: PerfMetricType;
    name: string;
    value: number;
    unit: 'ms';
    ts: number;
    meta?: Record<string, string>;
};

declare global {
    interface Window {
        __didimPerfMetrics?: PerfMetric[];
    }
}

const MAX_METRICS = 300;

const isPerfEnabled = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }
    if (import.meta.env.DEV) {
        return true;
    }
    return window.localStorage.getItem('__didim_perf') === '1';
};

const pushMetric = (metric: PerfMetric): void => {
    if (typeof window === 'undefined' || !isPerfEnabled()) {
        return;
    }
    if (!window.__didimPerfMetrics) {
        window.__didimPerfMetrics = [];
    }
    window.__didimPerfMetrics.push(metric);
    if (window.__didimPerfMetrics.length > MAX_METRICS) {
        window.__didimPerfMetrics.splice(0, window.__didimPerfMetrics.length - MAX_METRICS);
    }
};

export const routeRenderProfilerCallback: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration
) => {
    pushMetric({
        type: 'route-render',
        name: id,
        value: Number(actualDuration.toFixed(2)),
        unit: 'ms',
        ts: Date.now(),
        meta: {
            phase,
            baseDuration: Number(baseDuration.toFixed(2)).toString(),
        },
    });
};

export const measureInputLatency = (name: string): void => {
    if (typeof window === 'undefined' || !isPerfEnabled()) {
        return;
    }
    const start = performance.now();
    requestAnimationFrame(() => {
        const latency = performance.now() - start;
        pushMetric({
            type: 'input-latency',
            name,
            value: Number(latency.toFixed(2)),
            unit: 'ms',
            ts: Date.now(),
        });
    });
};

export const summarizePerfMetrics = (): string => {
    if (typeof window === 'undefined') {
        return 'No metrics (server)';
    }
    const metrics = window.__didimPerfMetrics || [];
    if (metrics.length === 0) {
        return 'No metrics collected';
    }

    const summarizeByName = (type: PerfMetricType) => {
        const bucket = metrics.filter((metric) => metric.type === type);
        const grouped = new Map<string, number[]>();
        bucket.forEach((metric) => {
            if (!grouped.has(metric.name)) {
                grouped.set(metric.name, []);
            }
            grouped.get(metric.name)!.push(metric.value);
        });
        const lines: string[] = [];
        grouped.forEach((values, key) => {
            const avg = values.reduce((acc, cur) => acc + cur, 0) / values.length;
            const max = Math.max(...values);
            lines.push(`${key}: avg ${avg.toFixed(2)}ms / max ${max.toFixed(2)}ms / n=${values.length}`);
        });
        return lines.sort();
    };

    const routeLines = summarizeByName('route-render');
    const inputLines = summarizeByName('input-latency');
    return [
        '[route-render]',
        ...routeLines,
        '[input-latency]',
        ...inputLines,
    ].join('\n');
};

