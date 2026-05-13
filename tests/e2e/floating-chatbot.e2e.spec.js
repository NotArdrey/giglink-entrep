const { test, expect } = require('@playwright/test');

function collectConsoleFailures(page, allowedPatterns = []) {
  const failures = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (allowedPatterns.some((pattern) => pattern.test(text))) return;
    failures.push(text);
  });

  page.on('pageerror', (error) => {
    failures.push(error.message);
  });

  return failures;
}

async function expectNoHorizontalOverflow(page) {
  const layoutIssue = await page.evaluate(() => {
    const horizontalOverflow = document.documentElement.scrollWidth - window.innerWidth;
    return horizontalOverflow > 8 ? `Page has horizontal overflow of ${horizontalOverflow}px.` : '';
  });

  expect(layoutIssue).toBe('');
}

async function mockChatbot(page, handler) {
  await page.route('**/functions/v1/giglink-chatbot', async (route) => {
    const request = route.request();

    if (request.method() === 'OPTIONS') {
      await route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
        body: 'ok',
      });
      return;
    }

    await handler(route);
  });
}

test.describe('floating GigLink chatbot', () => {
  const viewports = [
    { name: 'desktop', width: 1366, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ];

  for (const viewport of viewports) {
    test(`opens, sends, renders response, and closes on ${viewport.name}`, async ({ page }) => {
      const consoleFailures = collectConsoleFailures(page);
      let requestBody = null;

      await mockChatbot(page, async (route) => {
        requestBody = route.request().postDataJSON();
        await new Promise((resolve) => setTimeout(resolve, 250));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'You can browse services, open a provider profile, then continue into booking when ready.',
            model: 'llama-3.1-8b-instant',
          }),
        });
      });

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      const toggle = page.getByRole('button', { name: /open giglink assistant/i });
      await expect(toggle).toBeVisible();
      await toggle.click();

      await expect(page.getByRole('dialog', { name: /giglink assistant/i })).toBeVisible();
      await expect(page.getByText(/marketplace and booking help/i)).toBeVisible();

      await page.getByLabel(/message giglink assistant/i).fill('How do I book a service?');
      await page.getByRole('button', { name: /^send message$/i }).click();

      await expect(page.getByTestId('chatbot-loading')).toBeVisible();
      await expect(page.getByTestId('chatbot-message-user').filter({ hasText: 'How do I book a service?' })).toBeVisible();
      await expect(page.getByTestId('chatbot-message-assistant').filter({ hasText: /open a provider profile/i })).toBeVisible();

      expect(requestBody.context).toMatchObject({
        currentView: 'landing',
        isLoggedIn: false,
        role: 'guest',
      });
      expect(requestBody.messages.at(-1)).toMatchObject({
        role: 'user',
        content: 'How do I book a service?',
      });

      await expectNoHorizontalOverflow(page);

      await page.getByRole('button', { name: /close giglink assistant/i }).first().click();
      await expect(page.getByRole('dialog', { name: /giglink assistant/i })).toHaveCount(0);

      expect(consoleFailures).toEqual([]);
    });
  }

  test('shows a sanitized error state when the Edge Function fails', async ({ page }) => {
    await mockChatbot(page, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'provider detail should not render' }),
      });
    });

    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: /open giglink assistant/i }).click();
    await page.getByLabel(/message giglink assistant/i).fill('Will this fail safely?');
    await page.getByRole('button', { name: /^send message$/i }).click();

    await expect(page.getByRole('alert')).toContainText(/assistant is unavailable/i);
    await expect(page.getByText(/provider detail should not render/i)).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });
});
