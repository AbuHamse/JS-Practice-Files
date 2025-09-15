// bookScraper.js
import puppeteer from "puppeteer";

async function scrapeBooks() {
  // Launch the browser
  const browser = await puppeteer.launch({ headless: true }); // set headless: false to see it in action
  const page = await browser.newPage();

  // Go to the target website
  await page.goto("https://books.toscrape.com/");

  // Scrape data
  const books = await page.evaluate(() => {
    // Select all book elements
    const bookElements = document.querySelectorAll(".product_pod");
    let bookData = [];

    bookElements.forEach(book => {
      const title = book.querySelector("h3 a").getAttribute("title");
      const price = book.querySelector(".price_color").innerText;

      bookData.push({ title, price });
    });

    return bookData;
  });

  // Print results
  console.log("Books found:");
  console.log(books);

  // Close browser
  await browser.close();
}

// Run the scraper
scrapeBooks().catch(console.error);
