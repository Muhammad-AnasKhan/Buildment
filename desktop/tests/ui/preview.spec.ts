import { test, expect } from '@playwright/test';
import { courses, courseDetail } from '../fixtures';

test('preview shows public curriculum before login and after logout', async ({
  page,
}) => {
  await page.addInitScript(
    ({ courses, courseDetail }) => {
      let signedIn = false;
      window.buildment = {
        ...window.buildment,
        startLearning: async () => ({ ok: true, data: { href: null } }),
        enroll: async () => {
          throw new Error('Unexpected enrollment');
        },
        cancelSignIn: async () => {},
        listCourses: async () => ({ ok: true, courses }),
        courseDetail: async () => ({
          ok: true,
          data: {
            ...courseDetail,
            signedIn,
            access: signedIn ? 'active' : 'none',
          },
        }),
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
  await expect(page.getByText('Your first process')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Enroll/ })).toHaveCount(0);
  await page.screenshot({ path: 'test-results/course-preview.png' });
  await page.getByRole('button', { name: 'Sign in with browser' }).click();
  await expect(page.getByText('Your first process')).toBeVisible();
  await page
    .locator('summary')
    .filter({ hasText: 'Resource controls' })
    .click();
  await expect(page.getByText('Working with cgroups')).toBeVisible();
  await page.screenshot({ path: 'test-results/course-curriculum.png' });
  await page.locator('summary').filter({ hasText: 'Profile' }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByText('Your first process')).toBeVisible();
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
        ...window.buildment,
        startLearning: async () => ({ ok: true, data: { href: null } }),
        enroll: async () => {
          throw new Error('Unexpected enrollment');
        },
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

test('catalog login carries into preview and back remains visible while scrolling', async ({
  page,
}) => {
  await page.addInitScript(
    ({ courses, courseDetail }) => {
      let signedIn = false;
      window.buildment = {
        ...window.buildment,
        startLearning: async () => ({ ok: true, data: { href: null } }),
        enroll: async () => {
          throw new Error('Unexpected enrollment');
        },
        listCourses: async () => ({ ok: true, courses }),
        courseDetail: async () => ({
          ok: true,
          data: { ...courseDetail, signedIn },
        }),
        signIn: async () => {
          signedIn = true;
          return { ok: true, data: { signedIn: true } };
        },
        signOut: async () => {
          signedIn = false;
          return { ok: true, data: { signedIn: false } };
        },
        cancelSignIn: async () => {},
      };
    },
    { courses, courseDetail },
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    page.locator('summary').filter({ hasText: 'Profile' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Preview ' + courses[0].title, exact: true })
    .click();
  await expect(page.getByText('Your first process')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Ready to start learning?' }),
  ).toHaveCount(0);
  await page.locator('main').evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  const back = page.getByRole('button', { name: 'Back to courses' });
  await expect(back).toBeInViewport();
  await expect(page.locator('header')).toBeInViewport();
  await page.screenshot({ path: 'test-results/sticky-profile-header.png' });
  await back.click();
  await expect(
    page.getByRole('heading', { name: 'Explore courses' }),
  ).toBeVisible();
});

for (const paid of [false, true]) {
  test(
    paid
      ? 'paid enrollment shows payment required'
      : 'free enrollment confirms access',
    async ({ page }) => {
      await page.addInitScript(
        ({ courses, courseDetail, paid }) => {
          let signedIn = false;
          let enrolled = false;
          window.buildment = {
            ...window.buildment,
            startLearning: async () => ({ ok: true, data: { href: null } }),
            listCourses: async () => ({ ok: true, courses }),
            courseDetail: async () => ({
              ok: true,
              data: {
                ...courseDetail,
                signedIn,
                access: enrolled
                  ? paid
                    ? 'payment_required'
                    : 'active'
                  : 'none',
              },
            }),
            signIn: async () => {
              signedIn = true;
              return { ok: true, data: { signedIn: true } };
            },
            signOut: async () => ({ ok: true, data: { signedIn: false } }),
            cancelSignIn: async () => {},
            enroll: async (courseId) => {
              if (courseId !== courses[0].id) throw new Error('Wrong course');
              enrolled = true;
              return {
                ok: true,
                data: { lifecycle: paid ? 'PAYMENT_REQUIRED' : 'ACTIVE' },
              };
            },
          };
        },
        { courses, courseDetail, paid },
      );
      await page.goto('/');
      await page
        .getByRole('button', {
          name: 'Preview ' + courses[0].title,
          exact: true,
        })
        .click();
      await expect(
        page.getByRole('button', { name: 'Enroll in course' }),
      ).toHaveCount(0);
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      await page
        .getByRole('button', { name: 'Enroll in course', exact: true })
        .click();
      await expect(
        page.getByText(
          paid ? /Enrollment started/ : 'You’re enrolled in this course',
        ),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Enroll in course' }),
      ).toHaveCount(0);

      if (paid) {
        await expect(
          page.getByRole('button', { name: 'Start learning', exact: true }),
        ).toHaveCount(0);
      } else {
        await expect(
          page.getByRole('button', { name: 'Start learning', exact: true }),
        ).toBeEnabled();
      }
    },
  );
}
