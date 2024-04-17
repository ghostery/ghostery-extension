import { html } from 'hybrids';

export default {
  render: () => html`
    <template
      layout="column gap overflow:y:auto padding:4:2"
      layout@768px="padding:5:6"
      layout@992px="padding:6:3 area::2"
      layout@1280px="padding:8:3"
    >
      <slot layout::slotted(*)@1280px="width:::720px self:center:start"></slot>
    </template>
  `,
};
