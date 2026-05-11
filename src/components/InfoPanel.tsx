import { useState, type ReactNode } from 'react';
import styles from './InfoPanel.module.css';
import type { ApiKind } from '../types';

type Section = {
  id: ApiKind;
  title: string;
  subtitle: string;
  content: ReactNode;
};

const SECTIONS: Section[] = [
  {
    id: 'drag-drop',
    title: 'Drag and Drop API',
    subtitle: 'HTML5 standard built on a chain of events',
    content: (
      <>
        <p>
          The HTML5 Drag and Drop API lets users grab DOM elements and drop them
          onto other elements. It is event-based:{' '}
          <code>dragstart → dragover → drop → dragend</code>.
        </p>
        <p>
          <strong>Why it was created.</strong> Before HTML5, drag-and-drop on the
          web meant wiring up <code>mousedown</code>, <code>mousemove</code> and{' '}
          <code>mouseup</code> by hand, tracking pointer offsets, and faking
          drop targets in JavaScript. Microsoft shipped a native API in IE5
          (1999); HTML5 standardized that idea so every browser shared the same
          contract — and crucially, so the OS could hand files to the page (the
          modern file-drop upload pattern).
        </p>
        <p>
          <strong>The two non-obvious rules.</strong>
        </p>
        <ul>
          <li>
            An element is only draggable when <code>draggable=&quot;true&quot;</code>{' '}
            is set (with images and links as historical exceptions).
          </li>
          <li>
            The drop target <strong>must call <code>preventDefault()</code></strong>{' '}
            inside <code>dragover</code>. The default behavior is "do not allow
            a drop", and without preventing it the <code>drop</code> event never
            fires.
          </li>
        </ul>
        <p>
          Data flows between source and target through{' '}
          <code>event.dataTransfer</code>: a key/value store with a few
          standardized MIME types (<code>text/plain</code>, <code>text/uri-list</code>,{' '}
          <code>application/json</code>, etc).
        </p>
        <p>
          <strong>Caveats.</strong> The native API ignores touch events — mobile
          devices receive no <code>drag*</code> events at all. Real-world apps
          targeting touch use Pointer Events directly or a library like{' '}
          <code>dnd-kit</code>. The "ghost image" is browser-controlled and
          tricky to style, and <code>dragleave</code> fires when the cursor
          crosses over child elements, which is a frequent source of bugs.
        </p>
        <p>
          <strong>In this POC.</strong> Each card is <code>draggable</code> and
          writes its id into <code>dataTransfer</code> on <code>dragstart</code>.
          Each column accepts drops by calling <code>preventDefault()</code> on{' '}
          <code>dragover</code>, then reads the id on <code>drop</code> and asks
          the board to move the card in React state.
        </p>
      </>
    ),
  },
  {
    id: 'mutation',
    title: 'Mutation Observer API',
    subtitle: 'Async, batched DOM change notifications',
    content: (
      <>
        <p>
          A <code>MutationObserver</code> watches a DOM subtree and reports
          changes — children added or removed, attribute or text-content edits
          — in batches, asynchronously, as microtasks.
        </p>
        <p>
          <strong>Why it was created.</strong> The previous mechanism, "Mutation
          Events" (DOM Level 2, circa 2000), fired one synchronous event per
          change — <code>DOMNodeInserted</code>, <code>DOMSubtreeModified</code>,
          and friends. They were costly enough that they slowed down every page
          that used them, and the W3C eventually deprecated the whole spec. The
          observer pattern fixes this: the browser batches mutations and calls
          you once per microtask, off the hot path.
        </p>
        <p>
          <strong>Shape of the API.</strong>
        </p>
        <pre className={styles.code}>
{`const observer = new MutationObserver((records) => {
  for (const r of records) {
    // r.type: 'childList' | 'attributes' | 'characterData'
    // r.addedNodes, r.removedNodes, r.attributeName, r.oldValue, ...
  }
});
observer.observe(target, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class'],
});
// Later: observer.disconnect();`}
        </pre>
        <p>
          <strong>Where it shines.</strong> Detecting DOM changes you do not
          control: third-party scripts injecting widgets, framework portals
          mounting, dev tools, accessibility audits, "wait until this element
          appears" helpers in tests. It is also one of the only ways to react to
          mutations from outside React — including manual edits through DevTools.
        </p>
        <p>
          <strong>Caveats.</strong> It is asynchronous and cannot cancel
          changes. <code>subtree: true</code> can be expensive on large trees;
          prefer narrow targets and <code>attributeFilter</code>. Always{' '}
          <code>disconnect()</code> on unmount.
        </p>
        <p>
          <strong>In this POC.</strong> A single observer watches the board
          container with <code>{`{ childList: true, subtree: true }`}</code>.
          When you drag a card, React mutates the DOM and the observer logs the
          add/remove records to the event log on the left.{' '}
          <strong>Try this:</strong> open DevTools, delete a card node manually,
          and watch the observer fire — proving it works regardless of who
          changes the DOM.
        </p>
      </>
    ),
  },
  {
    id: 'intersection',
    title: 'Intersection Observer API',
    subtitle: 'Async visibility detection without scroll handlers',
    content: (
      <>
        <p>
          An <code>IntersectionObserver</code> tells you, asynchronously, when
          an element enters or leaves the viewport (or any scrolling ancestor).
        </p>
        <p>
          <strong>Why it was created.</strong> The traditional recipe was{' '}
          <code>window.addEventListener(&apos;scroll&apos;, ...)</code> plus{' '}
          <code>getBoundingClientRect()</code>. Both are synchronous and run on
          the main thread; <code>getBoundingClientRect()</code> can force a
          layout, so checking visibility on every scroll tick was a classic
          source of jank. IntersectionObserver moves the work off the main
          thread and notifies you only on actual visibility changes.
        </p>
        <p>
          <strong>The three knobs.</strong>
        </p>
        <ul>
          <li>
            <code>root</code> — the scrolling ancestor to measure against (the
            viewport when <code>null</code>).
          </li>
          <li>
            <code>rootMargin</code> — CSS-style margins that grow or shrink the
            root box. Negative margins fire the callback{' '}
            <em>before</em> the element actually touches the edge; positive
            margins fire after.
          </li>
          <li>
            <code>threshold</code> — a number or array of numbers in{' '}
            <code>[0, 1]</code>. The callback fires every time the intersection
            ratio crosses one of these values.
          </li>
        </ul>
        <pre className={styles.code}>
{`const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    // e.isIntersecting, e.intersectionRatio, e.target, e.time
  }
}, { threshold: [0, 0.5, 1], rootMargin: '0px' });
io.observe(element);`}
        </pre>
        <p>
          <strong>Where it shines.</strong> Lazy-loading images and components,
          infinite scroll, scroll-triggered animations, sticky element
          detection, ad viewability metrics. (For images specifically, the
          browser now ships <code>&lt;img loading=&quot;lazy&quot;&gt;</code>{' '}
          built on this same machinery.)
        </p>
        <p>
          <strong>Caveats.</strong> The callback is asynchronous, so it lags one
          frame behind a fast scroll. The first callback fires shortly after{' '}
          <code>observe()</code> reporting the initial state — useful, but it
          looks like "extra" events if you forget to expect them.
        </p>
        <p>
          <strong>In this POC.</strong> Each card registers its own observer
          with thresholds <code>[0, 0.5, 1]</code>. The green dot lights up when
          the card is at least 50% visible, off-viewport cards dim, and every
          transition is logged. Scroll a column to see it stream.
        </p>
      </>
    ),
  },
];

export function InfoPanel() {
  const [openId, setOpenId] = useState<ApiKind>('drag-drop');

  return (
    <section className={styles.panel}>
      <header className={styles.intro}>
        <h2 className={styles.heading}>Three web APIs, one demo</h2>
        <p className={styles.subheading}>
          Drag cards between columns. Each interaction triggers all three APIs
          you see explained below — watch the event log to see them fire.
        </p>
      </header>
      <div className={styles.sections}>
        {SECTIONS.map((section) => {
          const isOpen = openId === section.id;
          return (
            <article
              key={section.id}
              className={`${styles.section} ${styles[`section_${section.id}`]} ${
                isOpen ? styles.open : ''
              }`}
            >
              <button
                type="button"
                className={styles.sectionHeader}
                onClick={() => setOpenId(section.id)}
                aria-expanded={isOpen}
              >
                <div>
                  <h3 className={styles.sectionTitle}>{section.title}</h3>
                  <p className={styles.sectionSubtitle}>{section.subtitle}</p>
                </div>
                <span className={styles.chevron} aria-hidden>
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div className={styles.sectionBody}>{section.content}</div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
