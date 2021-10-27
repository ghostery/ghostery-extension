import { svg, html, define } from '/hybrids.js';

const heart = svg`
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
`;

define({
  tag: "panel-footer",
  content: () => html`
    <footer>
      <a href="mailto:support@ghostery.com?body=PLEASE%20INCLUDE%20A%20DESCRIPTION%20AND%20A%20PICTURE%20OF%20THE%20ISSUE%20YOU%20ARE%20EXPERIENCING%3A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0AURL%3A%20https%3A%2F%2Fwww.ghostery.com%2Fdata-request%0D%0AGhostery%20version%3A%208.5.9%0D%0ADatabase%20Version%3A%20d1768a1010766a98e79d9af3e925e260%0D%0ABrowser%20name%3A%20Ghostery%20Desktop%20Browser%0D%0ABrowser%20version%3A%2020219%0D%0ALanguage%3A%20en%0D%0AOS%3A%20mac%0D%0A%0D%0ACategory%3A%20site_analytics%0D%0AAllowed%20Trackers%3A%20Matomo%0D%0ABlocked%20Trackers%3A%20%0D%0A&subject=Broken Page Report">Report a broken page</a>
      <span class="dot">&middot;</span>
      <a href="https://www.ghostery.com/submit-a-tracker">Report a tracker</a>
      <a href="https://www.ghostery.com/" class="subscribe">${heart} <span>Subscribe</span></a>
    </footer>
  `,
});