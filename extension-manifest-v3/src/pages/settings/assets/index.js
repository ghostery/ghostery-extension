export default Object.fromEntries(
  Object.entries(
    import.meta.glob('./*.svg', { eager: true, import: 'default' }),
  ).map(([path, url]) => [path.replace('./', '').replace('.svg', ''), url]),
);
