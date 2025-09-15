/**
 * webScraping.js
 * Puppeteer scaffold for polite, modular scraping.
 *
 * Features:
 * - Launch Puppeteer (headless or headed)
 * - Rotate user-agents
 * - Check robots.txt for disallow rules (basic)
 * - Throttle requests, basic concurrency
 * - Retry on transient errors
 * - Save results to JSON and CSV
 *
 * Usage: node webScraping.js
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch'); // npm i node-fetch
const createCsvWriter = require('csv-writer').createObjectCsvWriter; // npm i csv-writer

/* -------------------- CONFIG -------------------- */
const CONFIG = {
  headless: true,                // set false while debugging
  concurrency: 3,                // number of pages to run in parallel
  delayBetweenRequestsMs: 1200,  // polite delay per page
  maxRetries: 2,                 // retries per page
  outputDir: './output',
  jsonFile: 'results.json',
  csvFile: 'results.csv',
  userAgentRotation: [
    // simple list — extend as needed
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
  ],
  defaultTimeout: 30_000
};

/* -------------------- UTILITIES -------------------- */

/**
 * Basic robots.txt check for path (only checks for User-agent: * Disallow)
 * Note: this is a simple check — not a full robots parser.
 */
async function isUrlAllowedByRobots(url) {
  try {
    const u = new URL(url);
    const robotsUrl = `${u.origin}/robots.txt`;
    const res = await fetch(robotsUrl, { timeout: 5000 });
    if (!res.ok) return true; // no robots or blocked fetch -> assume allowed (conservative)
    const text = await res.text();
    const lines = text.split(/\r?\n/).map(l => l.trim());
    // Collect Disallow lines under User-agent: *
    let applies = false;
    const disallows = [];
    for (const line of lines) {
      if (!line) continue;
      if (/^User-agent:\s*\*/i.test(line)) {
        applies = true;
        continue;
      }
      if (/^User-agent:/i.test(line)) {
        applies = false;
        continue;
      }
      if (applies && /^Disallow:/i.test(line)) {
        const rule = line.split(':')[1].trim();
        if (rule) disallows.push(rule);
      }
    }
    const pathPart = u.pathname;
    for (const rule of disallows) {
      // very simple prefix-match
      if (pathPart.startsWith(rule)) return false;
    }
    return true;
  } catch (err) {
    // If robots.txt cannot be fetched or parsed, default to allowing — but log
    console.warn('robots.txt check failed:', err.message);
    return true;
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function ensureOutputDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/* -------------------- SCRAPING CORE -------------------- */

/**
 * scrapePage: visits a URL and extracts fields according to selectorMap
 * - selectorMap: { fieldName: { selector: 'CSS', attr: 'text'|'href'|'attrName' } }
 */
async function scrapePage(browser, url, selectorMap = {}) {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(CONFIG.defaultTimeout);

  // rotate UA
  const ua = randomFrom(CONFIG.userAgentRotation);
  await page.setUserAgent(ua);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // simple bot-check handling: if site shows captcha or challenge, skip
    const pageContent = await page.content();
    if (/captcha|recaptcha|please verify/i.test(pageContent)) {
      console.warn('Captcha or bot challenge detected, skipping:', url);
      await page.close();
      return { url, skipped: true, reason: 'captcha' };
    }

    // Extract fields
    const result = { url };
    for (const [key, cfg] of Object.entries(selectorMap)) {
      const selector = cfg.selector;
      const attr = cfg.attr || 'text';
      try {
        await page.waitForSelector(selector, { timeout: 4000 });
        if (attr === 'text') {
          const val = await page.$eval(selector, el => el.innerText.trim());
          result[key] = val;
        } else if (attr === 'html') {
          const val = await page.$eval(selector, el => el.innerHTML);
          result[key] = val;
        } else {
          // assume attribute
          const val = await page.$eval(selector, (el, a) => el.getAttribute(a), attr);
          result[key] = val;
        }
      } catch (err) {
        // field missing — store null and continue
        result[key] = null;
      }
    }

    await page.close();
    return result;
  } catch (err) {
    await page.close();
    throw err;
  }
}

/* -------------------- CONCURRENCY / QUEUE -------------------- */

/**
 * Simple promise-pool to process many URLs with limited concurrency.
 *
 * - tasks: array of { url, selectorMap }
 * - worker: async function(task) => result
 */
async function processWithPool(tasks, worker, concurrency = 3) {
  const results = [];
  let index = 0;

  async function runner() {
    while (true) {
      let current;
      // fetch next task
      if (index < tasks.length) {
        current = tasks[index++];
      } else break;

      try {
        const res = await worker(current);
        results.push(res);
      } catch (err) {
        results.push({ url: current.url, error: err.message || String(err) });
      }
    }
  }

  // start N runners
  const runners = [];
  for (let i = 0; i < concurrency; i++) runners.push(runner());
  await Promise.all(runners);

  return results;
}

/* -------------------- SAVE OUTPUT -------------------- */
async function saveJson(results) {
  await ensureOutputDir(CONFIG.outputDir);
  const fp = path.join(CONFIG.outputDir, CONFIG.jsonFile);
  fs.writeFileSync(fp, JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved JSON ->', fp);
}

async function saveCsv(results) {
  if (!results || results.length === 0) return;
  await ensureOutputDir(CONFIG.outputDir);
  // Flatten keys for CSV header
  const keys = Array.from(
    results.reduce((acc, row) => {
      Object.keys(row).forEach(k => acc.add(k));
      return acc;
    }, new Set())
  );
  const csvWriter = createCsvWriter({
    path: path.join(CONFIG.outputDir, CONFIG.csvFile),
    header: keys.map(k => ({ id: k, title: k }))
  });
  await csvWriter.writeRecords(results);
  console.log('Saved CSV ->', path.join(CONFIG.outputDir, CONFIG.csvFile));
}

/* -------------------- MAIN -------------------- */

async function main() {
  // Example target pages and extraction plan
  const tasks = [
    // Replace with the pages you want to scrape and the selectors you need
    {
      url: 'https://example.com/page1',
      selectorMap: {
        title: { selector: 'h1', attr: 'text' },
        price: { selector: '.price', attr: 'text' },
        link: { selector: 'a.cta', attr: 'href' }
      }
    },
    {
      url: 'https://example.com/page2',
      selectorMap: {
        title: { selector: 'h1', attr: 'text' },
        description: { selector: '.desc', attr: 'text' }
      }
    }
    // add more
  ];

  // Basic robots check for each domain — you may want to be more strict
  for (const t of tasks) {
    const allowed = await isUrlAllowedByRobots(t.url);
    if (!allowed) {
      console.warn('Blocked by robots.txt — skipping:', t.url);
      t.skipReason = 'robots';
    }
  }

  const browser = await puppeteer.launch({ headless: CONFIG.headless });

  // worker wraps scrapePage + retries + polite delay
  const worker = async (task) => {
    if (task.skipReason) return { url: task.url, skipped: true, reason: task.skipReason };

    let attempt = 0;
    let lastErr = null;
    while (attempt <= CONFIG.maxRetries) {
      try {
        // polite delay between attempts
        if (attempt > 0) await wait(500 + Math.random() * 1000);
        const res = await scrapePage(browser, task.url, task.selectorMap);
        // delay after success to be polite
        await wait(CONFIG.delayBetweenRequestsMs);
        return res;
      } catch (err) {
        lastErr = err;
        attempt++;
        console.warn(`Error scraping ${task.url} (attempt ${attempt}/${CONFIG.maxRetries}):`, err.message || err);
      }
    }
    return { url: task.url, error: lastErr ? (lastErr.message || String(lastErr)) : 'unknown' };
  };

  const tasksToRun = tasks.filter(t => !t.skipReason || t.skipReason !== 'robots');
  const results = await processWithPool(tasksToRun, worker, CONFIG.concurrency);

  await saveJson(results);
  await saveCsv(results);

  await browser.close();
  console.log('Done. Total:', results.length);
}

/* -------------------- RUN -------------------- */
if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

/**
 * Quick notes & tips

Replace the tasks array with your target URLs and selector map. For list pages, you might first 
fetch the list page, extract links, then enqueue detail-page tasks.

Don’t scrape behind logins or bypass paywalls. If a site uses heavy JS rendering
 (like some travel sites), Puppeteer can render them — but respect ToS.

If you need concurrency across many hosts, consider introducing domain-based throttling
 so you don't overload a single host.

For production: add logging, rotating IPs (only with legal permission/contract), and a 
persistent queue (Redis, Bull) if scale is large.

If the site uses frequent UI changes (selectors brittle), prefer XPath or more 
robust JS evaluation patterns, or a CSS class-agnostic 
approach like querySelector('h1') + heuristics.
 * 
 */