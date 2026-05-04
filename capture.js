const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport for a nice hero image size
  await page.setViewport({ width: 1200, height: 800 });

  // Navigate to the local server
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });

  // Inject a mock session to bypass login and show admin dashboard
  await page.evaluate(() => {
    localStorage.setItem('hicare_session', JSON.stringify({
      id: 1,
      name: "Admin",
      email: "admin@example.com",
      role: "admin"
    }));
  });

  // Reload the page so the session takes effect
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });

  // Wait a bit for animations to settle
  await new Promise(r => setTimeout(r, 1500));

  // Take the screenshot and overwrite the public hero image
  await page.screenshot({ path: 'public/product-hero.png', fullPage: false });

  await browser.close();
  console.log('Screenshot updated at public/product-hero.png');
})();
