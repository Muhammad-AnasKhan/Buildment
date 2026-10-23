import { test, expect } from '@playwright/test';
import { courses, courseDetail } from '../fixtures';

test('preview shows public information, signs in for curriculum, and preserves catalog filters', async ({
  page,
}) => {
  await page.addInitScript(
    ({ courses, courseDetail }) => {
      let signedIn = false;
      window.buildment = {
        cancelSignIn: async () => {},
        listCourses: async () => ({ ok: true, courses }),
        courseDetail: async () =>
          signedIn
            ? { ok: true, data: courseDetail }
            : { ok: false, code: 'AUTH_REQUIRED', message: 'Sign in' },
        signIn: async () => {
          signedIn = true;
          return { ok: true, data: { signedIn: true } };
        },
        signOut: async () => {
          signedIn = false;
          return { ok: true, data: { signedIn: false } };
        },
      };
    },
    { courses, courseDetail },
  );
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Search courses' }).fill('systems');
  await page
    .getByRole('button', { name: `Preview ${courses[0].title}`, exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    courses[0].title,
  );
  await expect(page.getByText('Build a process explorer')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Sign in with browser' }),
  ).toBeVisible();
  await page.screenshot({ path: 'test-results/course-preview.png' });
  await page.getByRole('button', { name: 'Sign in with browser' }).click();
  await expect(page.getByText('Your first process')).toBeVisible();
  await page
    .locator('summary')
    .filter({ hasText: 'Resource controls' })
    .click();
  await expect(page.getByText('Working with cgroups')).toBeVisible();
  await page.screenshot({ path: 'test-results/course-curriculum.png' });
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByText('Your first process')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Sign in with browser' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Back to courses' }).click();
  await expect(
    page.getByRole('textbox', { name: 'Search courses' }),
  ).toHaveValue('systems');
  await expect(page.locator('article')).toHaveCount(1);
  await expect(
    page.getByRole('button', {
      name: `Preview ${courses[0].title}`,
      exact: true,
    }),
  ).toBeFocused();
});

test('unverified account can retry the outline and preview fits a small dark window', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.setViewportSize({ width: 760, height: 600 });
  await page.addInitScript(
    ({ courses, courseDetail }) => {
      let calls = 0;
      window.buildment = {
        cancelSignIn: async () => {},
        listCourses: async () => ({ ok: true, courses }),
        courseDetail: async () =>
          ++calls === 1
            ? {
                ok: false,
                code: 'EMAIL_UNVERIFIED',
                message: 'Verify your email.',
              }
            : { ok: true, data: courseDetail },
        signIn: async () => ({ ok: true, data: { signedIn: true } }),
        signOut: async () => ({ ok: true, data: { signedIn: false } }),
      };
    },
    { courses, courseDetail },
  );
  await page.goto('/');
  await page
    .getByRole('button', { name: `Preview ${courses[0].title}`, exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Verify your email to continue' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'I’ve verified my email' }).click();
  await expect(page.getByText('Your first process')).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.querySelector('main')!.scrollWidth <=
        document.querySelector('main')!.clientWidth,
    ),
  ).toBe(true);
});
