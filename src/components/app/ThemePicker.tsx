/** initVibe — applies the default ATRC OG Light theme on startup.
 * ThemePicker has been removed; ATRC OG Light is the only theme.
 */

export type VibeId = 'atrc-og-light';


/** Clears any legacy theme from localStorage and removes data-vibe attribute. */
export function initVibe() {
  if (typeof window === 'undefined') return;
  // Remove any previously saved theme — only atrc-og-light exists now
  localStorage.removeItem('atrc-vibe');
  document.documentElement.removeAttribute('data-vibe');
}
