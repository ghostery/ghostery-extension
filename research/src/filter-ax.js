const DROPPED_ROLES = new Set([
  'generic',
  'none',
  'presentation',
  'InlineTextBox',
  'LineBreak',
  'StaticText',
  'Iframe',
  'LabelText',
  'Figcaption',
]);

const KEEP_PROPERTIES = new Set([
  'focused',
  'focusable',
  'expanded',
  'checked',
  'disabled',
  'pressed',
  'selected',
  'required',
  'invalid',
  'level',
]);

export function filterAxNodes(nodes) {
  const out = [];
  for (const n of nodes) {
    const role = n.role && n.role.value;
    if (!role) continue;
    if (DROPPED_ROLES.has(role)) continue;
    if (n.ignored) continue;
    const slim = { nodeId: n.nodeId, role };
    const name = n.name && n.name.value;
    if (name) slim.name = name;
    const val = n.value && n.value.value;
    if (val) slim.value = val;
    const desc = n.description && n.description.value;
    if (desc) slim.description = desc;
    if (n.childIds && n.childIds.length) slim.childIds = n.childIds;
    if (n.parentId) slim.parentId = n.parentId;
    if (n.properties && n.properties.length) {
      const props = {};
      for (const p of n.properties) {
        if (!KEEP_PROPERTIES.has(p.name)) continue;
        const v = p.value && p.value.value;
        if (v != null && v !== false) props[p.name] = v;
      }
      if (Object.keys(props).length) slim.properties = props;
    }
    out.push(slim);
  }
  return out;
}
