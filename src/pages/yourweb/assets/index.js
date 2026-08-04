export default Object.fromEntries(
  Object.entries(import.meta.glob('./*.{svg,png}', { eager: true, import: 'default' })).map(
    ([path, url]) => [path.replace('./', '').replace(/\.(svg|png)$/, ''), url],
  ),
);
