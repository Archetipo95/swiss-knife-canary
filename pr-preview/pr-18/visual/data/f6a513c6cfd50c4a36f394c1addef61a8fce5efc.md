# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: stories.visual.js >> Fixture/Button › Primary
- Location: tests/stories.visual.js:95:3

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  3758 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: fixture-button--primary.png

Call log:
  - Expect "toHaveScreenshot(fixture-button--primary.png)" with timeout 15000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 3758 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 3758 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- button "Primary" [ref=e3]
```

# Test source

```ts
  54  |   await page.goto(url);
  55  |   await page.waitForFunction(storyHasSettled, undefined, { polling: 100, timeout: 30_000 });
  56  |   return page.evaluate(storyErrors);
  57  | }
  58  | 
  59  | // One page per worker, reused across stories: Storybook's preview bundle stays in the HTTP cache
  60  | // instead of being downloaded and parsed for every story. Each story still loads with a full
  61  | // navigation.
  62  | const test = base.extend({
  63  |   storyPage: [
  64  |     async ({ browser }, use, workerInfo) => {
  65  |       const { baseURL, locale, timezoneId, viewport, deviceScaleFactor, userAgent, hasTouch, isMobile } =
  66  |         workerInfo.project.use;
  67  |       const context = await browser.newContext({
  68  |         baseURL,
  69  |         locale,
  70  |         timezoneId,
  71  |         viewport,
  72  |         deviceScaleFactor,
  73  |         userAgent,
  74  |         hasTouch,
  75  |         isMobile
  76  |       });
  77  |       const page = await context.newPage();
  78  |       await page.addInitScript(recordStoryOutcome, visual.ciMarkerAttribute);
  79  |       await page.addInitScript(recordSettledElements);
  80  |       if (visual.fixedTime) {
  81  |         // Before the clock: it replaces requestAnimationFrame.
  82  |         await page.addInitScript(keepRendering);
  83  |         // Time starts at fixedTime and runs. A frozen Date.now() (setFixedTime) makes Vue drop the
  84  |         // outer handlers of every click (its event timestamp check), so play functions break.
  85  |         await page.clock.install({ time: new Date(visual.fixedTime) });
  86  |       }
  87  |       await use(page);
  88  |       await context.close();
  89  |     },
  90  |     { scope: 'worker' }
  91  |   ]
  92  | });
  93  | 
  94  | for (const story of stories) {
  95  |   test(`${story.title} › ${story.name}`, async ({ storyPage: page }, testInfo) => {
  96  |     testInfo.annotations.push({ type: 'story', description: story.id });
  97  |     // A retry starts clean: no images or axe report left by a failed attempt.
  98  |     if (settings.galleryDir) fs.rmSync(path.join(settings.galleryDir, story.id), { recursive: true, force: true });
  99  |     if (settings.a11yDir) fs.rmSync(path.join(settings.a11yDir, `${story.id}.json`), { force: true });
  100 | 
  101 |     await page.setViewportSize(visual.defaultViewport);
  102 |     const url = `/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`;
  103 |     let errors = await renderStory(page, url);
  104 | 
  105 |     // The play function must run at the story's own viewport, so reload when it differs. A
  106 |     // mobile-only play can fail at the default size, so only the final render counts.
  107 |     const context = await page.evaluate(readStoryContext);
  108 |     const viewport = resolveViewport(context, visual);
  109 |     const current = page.viewportSize();
  110 |     if (current?.width !== viewport.width || current?.height !== viewport.height) {
  111 |       await page.setViewportSize({ width: viewport.width, height: viewport.height });
  112 |       errors = await renderStory(page, url);
  113 |     }
  114 |     if (errors.length > 0) throw new Error(`${STORY_FAILURE_PREFIX}:\n${errors.join('\n\n')}`);
  115 | 
  116 |     const overrides = context.parameters?.swissKnife?.visual ?? {};
  117 |     test.skip(Boolean(overrides.skip), 'parameters.swissKnife.visual.skip');
  118 | 
  119 |     // Best effort: it only avoids capturing a fallback font while a stylesheet is still loading.
  120 |     await page.waitForFunction(stylesheetsSettled, undefined, { polling: 100, timeout: 15_000 }).catch(() => undefined);
  121 |     await page.evaluate(prepareAssets);
  122 |     await page.waitForFunction(imagesComplete, undefined, { polling: 100, timeout: 15_000 });
  123 |     // A visible spinner means the story is still loading: wait for it, up to the cap. Stories
  124 |     // that show a spinner on purpose just wait out the cap.
  125 |     await page
  126 |       .waitForFunction(noLoadingIndicators, undefined, { polling: 100, timeout: visual.loadingTimeoutMs })
  127 |       .catch(() => undefined);
  128 |     if (Number.isInteger(overrides.delay) && overrides.delay > 0) await page.waitForTimeout(overrides.delay);
  129 | 
  130 |     const scanA11y = async () => {
  131 |       if (!settings.a11yDir || isA11yDisabled(context.parameters)) return;
  132 |       await scanStory(page, {
  133 |         storyId: story.id,
  134 |         parameters: context.parameters,
  135 |         reportDir: settings.a11yDir,
  136 |         scope: a11y.scope,
  137 |         disabledRules: a11y.disabledRules
  138 |       });
  139 |     };
  140 | 
  141 |     const snapshotName = `${story.id}.png`;
  142 |     const isNewStory = testInfo.config.updateSnapshots !== 'all' && !fs.existsSync(testInfo.snapshotPath(snapshotName));
  143 |     if (isNewStory) {
  144 |       testInfo.annotations.push({ type: 'new', description: story.id });
  145 |       const screenshot = await page.screenshot(SCREENSHOT_OPTIONS);
  146 |       saveToGallery(story.id, 'pr', screenshot);
  147 |       await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
  148 |       await scanA11y();
  149 |       return;
  150 |     }
  151 | 
  152 |     const maxDiffPixels = Number.isInteger(overrides.maxDiffPixels) ? overrides.maxDiffPixels : undefined;
  153 |     try {
> 154 |       await expect(page).toHaveScreenshot(snapshotName, {
      |                          ^ Error: expect(page).toHaveScreenshot(expected) failed
  155 |         fullPage: visual.fullPage,
  156 |         ...(maxDiffPixels !== undefined && { maxDiffPixels })
  157 |       });
  158 |     } catch (error) {
  159 |       // Playwright shortens the file names of long story ids, so take the compared images from
  160 |       // its own attachments instead of guessing the output path.
  161 |       const comparedImage = suffix =>
  162 |         testInfo.attachments.find(({ name, path }) => path && name.endsWith(suffix))?.path;
  163 |       saveToGallery(story.id, 'base', testInfo.snapshotPath(snapshotName));
  164 |       saveToGallery(story.id, 'pr', comparedImage('-actual.png'));
  165 |       saveToGallery(story.id, 'diff', comparedImage('-diff.png'));
  166 |       // Changed stories still get their accessibility scan before the diff fails the test.
  167 |       await scanA11y();
  168 |       throw error;
  169 |     }
  170 |     // Every story shows its PR rendering, so the report doubles as a gallery.
  171 |     const screenshot = await page.screenshot(SCREENSHOT_OPTIONS);
  172 |     saveToGallery(story.id, 'pr', screenshot);
  173 |     await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
  174 |     await scanA11y();
  175 |   });
  176 | }
  177 | 
  178 | // Baselines of this shard whose story no longer exists in the head Storybook: a deleted story, or
  179 | // a broken stories glob that leaves Storybook empty. Reported as a change that needs approval.
  180 | test('Removed stories', async ({}, testInfo) => {
  181 |   // Marks this test as the removed-stories check (not a story) in the results, even when skipped.
  182 |   testInfo.annotations.push({ type: 'removed-check' });
  183 |   const baselines = fs.existsSync(settings.snapshotDir)
  184 |     ? fs
  185 |         .readdirSync(settings.snapshotDir)
  186 |         .filter(file => file.endsWith('.png'))
  187 |         .map(file => file.slice(0, -'.png'.length))
  188 |     : [];
  189 |   const removed = baselines
  190 |     .filter(id => shardOf(id, settings.shard.total) === settings.shard.index && !indexedIds.has(id))
  191 |     .sort();
  192 |   if (testInfo.config.updateSnapshots === 'all') {
  193 |     // Capturing baselines: drop those of deleted stories, so a local baseline folder stays in sync.
  194 |     for (const id of removed) fs.rmSync(path.join(settings.snapshotDir, `${id}.png`), { force: true });
  195 |     test.skip(true, 'capturing baselines');
  196 |   }
  197 |   test.skip(removed.length === 0, 'no removed stories');
  198 |   testInfo.annotations.push({ type: 'removed', description: removed.join(',') });
  199 |   throw new Error(`Removed stories (baseline without a story): ${removed.join(', ')}`);
  200 | });
  201 | 
```