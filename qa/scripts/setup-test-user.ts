import { chromium, type Browser, type Page } from 'playwright';

async function setupTestUser() {
  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    console.log('Navigating to Vikunja registration page...');
    await page.goto('http://localhost:8080/auth/register');
    await page.waitForLoadState('load');

    // Fill registration form
    const username = 'testuser123';
    const email = 'testuser123@test.com';
    const password = 'TestPassword123!';

    console.log(`Registering user: ${username}`);
    
    // Fill username
    const usernameInput = page.locator('input[name="username"], input#username, input[placeholder*="username" i]').first();
    await usernameInput.fill(username);

    // Fill email
    const emailInput = page.locator('input[type="email"], input#email, input[placeholder*="email" i]').first();
    await emailInput.fill(email);

    // Fill password
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill(password);
    await passwordInputs.nth(1).fill(password); // confirm password

    // Click register button
    const registerButton = page.locator('button:has-text("Register"), button:has-text("Sign up"), button[type="submit"]').first();
    await registerButton.click();

    // Wait for navigation or success
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`Current URL after registration: ${currentUrl}`);

    if (currentUrl.includes('login') || currentUrl.includes('dashboard') || currentUrl.includes('projects')) {
      console.log('✅ Test user created successfully!');
      console.log(`Username: ${username}`);
      console.log(`Password: ${password}`);
      return true;
    } else {
      console.log('⚠️  User may already exist or registration form changed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the setup
setupTestUser().then((success) => {
  if (success) {
    console.log('\n✅ Test user setup complete');
    process.exit(0);
  } else {
    console.log('\n⚠️  Test user may already exist - this is OK if tests can login');
    process.exit(0);
  }
}).catch((error) => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});
