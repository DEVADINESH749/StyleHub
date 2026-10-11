const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:5173";

const CUSTOMER_EMAIL = "customer@stylehub.com";
const CUSTOMER_PASSWORD = "Customer@123";

const ADMIN_EMAIL = "deva@example.com";
const ADMIN_PASSWORD = "Test@123";

// This script runs from:
// C:\Users\devac\Desktop\StyleHub\frontend
//
// So ../screenshots means:
// C:\Users\devac\Desktop\StyleHub\screenshots

const screenshotDir = path.resolve(__dirname, "../screenshots");

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// ======================================================
// SAVE SCREENSHOT
// ======================================================

async function saveScreenshot(page, number, name) {
  const fileName = `${number}-${name}.png`;
  const filePath = path.join(screenshotDir, fileName);

  await page.screenshot({
    path: filePath,
    fullPage: true,
  });

  console.log(`Saved: ${fileName}`);
}

// ======================================================
// CUSTOMER / ADMIN LOGIN
// ======================================================

async function login(page, email, password) {
  console.log(`Logging in: ${email}`);

  await page.getByLabel("Email address").fill(email);

  await page.getByLabel("Password").fill(password);

  await page
    .getByRole("button", {
      name: "Sign In",
      exact: true,
    })
    .click();

  // Wait for login request and React state update.
  await page.waitForTimeout(2000);
}

// ======================================================
// SAFE WAIT
// ======================================================

async function wait(page, milliseconds = 700) {
  await page.waitForTimeout(milliseconds);
}

// ======================================================
// MAIN SCRIPT
// ======================================================

(async () => {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 1000,
    },
  });

  try {
    console.log("");
    console.log("====================================");
    console.log("StyleHub Screenshot Automation");
    console.log("====================================");
    console.log("");

    // ==================================================
    // OPEN STYLEHUB
    // ==================================================

    console.log("Opening StyleHub...");

    await page.goto(BASE_URL, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await wait(page, 1000);

    // ==================================================
    // 01 LOGIN
    // ==================================================

    await saveScreenshot(
      page,
      "01",
      "login"
    );

    // ==================================================
    // CUSTOMER LOGIN
    // ==================================================

    await login(
      page,
      CUSTOMER_EMAIL,
      CUSTOMER_PASSWORD
    );

    // Wait until customer home is available.
    await page.waitForSelector(
      "text=Trending Products",
      {
        timeout: 15000,
      }
    );

    await wait(page, 1000);

    // ==================================================
    // 02 HOME / PRODUCTS
    // ==================================================

    await saveScreenshot(
      page,
      "02",
      "home-products"
    );

    // ==================================================
    // 03 MEN CATEGORY
    // ==================================================

    console.log("Opening Men category...");

    await page
      .getByRole("button", {
        name: "Men",
        exact: true,
      })
      .click();

    await wait(page, 700);

    await saveScreenshot(
      page,
      "03",
      "men-category"
    );

    // ==================================================
    // 04 PRODUCT SEARCH
    // ==================================================

    console.log("Testing product search...");

    const searchBox = page.getByPlaceholder(
      "Search products by name...",
      {
        exact: true,
      }
    );

    await searchBox.fill("Denim");

    await wait(page, 700);

    await saveScreenshot(
      page,
      "04",
      "product-search"
    );

    // Clear search.
    await searchBox.fill("");

    // Select All category using exact match.
    await page
      .getByRole("button", {
        name: "All",
        exact: true,
      })
      .click();

    await wait(page, 700);

    // ==================================================
    // 05 CART
    // ==================================================

    console.log("Testing cart...");

    const addButtons = page.getByRole(
      "button",
      {
        name: "Add to Cart",
        exact: true,
      }
    );

    const addButtonCount = await addButtons.count();

    console.log(
      `Add to Cart buttons found: ${addButtonCount}`
    );

    if (addButtonCount > 0) {
      await addButtons.first().click();

      // Wait for cart API request.
      await wait(page, 1200);
    }

    // Scroll to cart through Navbar.
    const cartLink = page
      .locator('a[href="#cart"]')
      .first();

    if (await cartLink.count() > 0) {
      await cartLink.click();

      await wait(page, 800);
    }

    await saveScreenshot(
      page,
      "05",
      "cart"
    );

    // ==================================================
    // 06 CHECKOUT
    // ==================================================

    console.log("Opening checkout...");

    const checkoutHeading = page.getByRole(
      "heading",
      {
        name: "Checkout",
        exact: true,
      }
    );

    if (await checkoutHeading.count() > 0) {
      await checkoutHeading.scrollIntoViewIfNeeded();

      await wait(page, 500);
    }

    await saveScreenshot(
      page,
      "06",
      "checkout"
    );

    // ==================================================
    // 07 MY ORDERS
    // ==================================================

    console.log("Opening My Orders...");

    const ordersLink = page.locator(
      'a[href="#orders"]'
    ).first();

    if (await ordersLink.count() > 0) {
      await ordersLink.click();

      await wait(page, 1000);
    }

    await saveScreenshot(
      page,
      "07",
      "my-orders"
    );

    // ==================================================
    // CUSTOMER LOGOUT
    // ==================================================

    console.log("Logging out customer...");

    const signOutButton = page.getByRole(
      "button",
      {
        name: "Sign Out",
        exact: true,
      }
    );

    if (await signOutButton.count() > 0) {
      await signOutButton.click();

      await wait(page, 1200);
    }

    // ==================================================
    // OPEN LOGIN AGAIN
    // ==================================================

    await page.goto(BASE_URL, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await wait(page, 1000);

    // ==================================================
    // 08 ADMIN DASHBOARD
    // ==================================================

    console.log("Logging in as admin...");

    await login(
      page,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );

    // Give React time to complete admin role check.
    await wait(page, 2000);

    await saveScreenshot(
      page,
      "08",
      "admin-dashboard"
    );

    // ==================================================
    // FINISHED
    // ==================================================

    console.log("");
    console.log("====================================");
    console.log("ALL SCREENSHOTS CREATED SUCCESSFULLY");
    console.log("====================================");
    console.log("");
    console.log(`Screenshot folder:`);
    console.log(screenshotDir);
    console.log("");

  } catch (error) {
    console.error("");
    console.error("====================================");
    console.error("SCREENSHOT TEST FAILED");
    console.error("====================================");
    console.error("");
    console.error(error);
    console.error("");

    // Save a screenshot of the failure page.
    try {
      const errorPath = path.join(
        screenshotDir,
        "error.png"
      );

      await page.screenshot({
        path: errorPath,
        fullPage: true,
      });

      console.log(
        "Failure screenshot saved:",
        errorPath
      );
    } catch (screenshotError) {
      console.error(
        "Could not save failure screenshot:",
        screenshotError
      );
    }

    process.exitCode = 1;

  } finally {
    await browser.close();
  }
})();