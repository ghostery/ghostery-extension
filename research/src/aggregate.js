function quantile(sortedAsc, q) {
  if (sortedAsc.length === 0) return null;
  if (sortedAsc.length === 1) return sortedAsc[0];
  const pos = q * (sortedAsc.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sortedAsc[lo];
  return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (pos - lo);
}

export function median(values) {
  const n = values.filter((v) => typeof v === 'number' && !Number.isNaN(v)).sort((a, b) => a - b);
  return quantile(n, 0.5);
}

function mode(values) {
  const counts = new Map();
  for (const v of values) {
    const key = JSON.stringify(v);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let bestKey = null;
  let bestCount = -1;
  for (const [k, c] of counts) {
    if (c > bestCount) {
      bestCount = c;
      bestKey = k;
    }
  }
  return bestKey == null ? null : JSON.parse(bestKey);
}

function isPlainObject(x) {
  return x != null && typeof x === 'object' && !Array.isArray(x);
}

function flatten(obj, prefix = '', out = new Map()) {
  if (!isPlainObject(obj)) {
    out.set(prefix, obj);
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) flatten(v, path, out);
    else out.set(path, v);
  }
  return out;
}

function setAtPath(target, path, value) {
  const parts = path.split('.');
  let node = target;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!isPlainObject(node[parts[i]])) node[parts[i]] = {};
    node = node[parts[i]];
  }
  node[parts[parts.length - 1]] = value;
}

export function aggregateSamples(samples) {
  if (samples.length === 0) throw new Error('aggregateSamples: empty samples');
  if (samples.some((s) => s.error)) {
    return { ...samples[0], samples, error: samples.find((s) => s.error).error };
  }

  const flat = samples.map((s) => flatten(s));
  const allKeys = new Set();
  for (const f of flat) for (const k of f.keys()) allKeys.add(k);

  const aggregated = {};
  const stats = {};
  for (const key of allKeys) {
    const values = flat.map((f) => f.get(key)).filter((v) => v !== undefined);
    if (values.length === 0) continue;
    const numbers = values.filter((v) => typeof v === 'number' && !Number.isNaN(v));
    if (numbers.length === values.length && numbers.length > 0) {
      const sorted = [...numbers].sort((a, b) => a - b);
      const m = quantile(sorted, 0.5);
      setAtPath(aggregated, key, m);
      stats[key] = {
        median: m,
        p25: quantile(sorted, 0.25),
        p75: quantile(sorted, 0.75),
        min: sorted[0],
        max: sorted[sorted.length - 1],
        samples: numbers,
      };
    } else {
      setAtPath(aggregated, key, mode(values));
    }
  }

  return { ...aggregated, samples, stats, sampleCount: samples.length };
}
