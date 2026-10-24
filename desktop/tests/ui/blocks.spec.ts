import { test, expect } from '@playwright/test';
import { courses, courseDetail } from '../fixtures';
import { parseLesson } from '../../src/learning/parse-lesson';

const document = parseLesson(`
This is a **guided build**. Learn one idea, try it in your project, and check the result.

<BigWordAlert term="Idempotency" plainEnglish="Repeating a request has the same effect as doing it once." whyItMatters="Retries must not create duplicate orders." />

## Follow the request

<Callout type="tip" title="Start small" content="Change one thing at a time." />
<FileTree title="Project files"><FileTreeItem path="src/api/orders.ts" highlight /></FileTree>
<FaqGroup title="Common questions"><FaqItem question="Why use a request ID?">It helps trace the same request across services.</FaqItem></FaqGroup>
<MermaidDiagram title="Request flow" chart={'flowchart LR; Browser-->API; API-->Database'} />
<Roadmap title="Your build" milestones={[{id: 'first', title: 'Build the API', description: 'Validate the request.'}]} />
<InteractiveCanvas slug="freshmarket-order-status" />
`);

test('native content renders shared blocks, diagrams and working canvas controls', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
    console.error(error.message);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') console.error(message.text());
  });
  await page.addInitScript(
    ({ courses, courseDetail, document }) => {
      window.buildment = {
        listCourses: async () => ({ ok: true, courses }),
        courseDetail: async () => ({
          ok: true,
          data: { ...courseDetail, signedIn: true, access: 'active' },
        }),
        signIn: async () => ({ ok: true, data: { signedIn: true } }),
        cancelSignIn: async () => {},
        startLearning: async () => ({
          ok: true,
          data: { href: '/courses/' + courses[0].slug + '/intro' },
        }),
        learning: {
          lesson: async () => ({
            ok: true,
            data: {
              course: { title: courses[0].title },
              chapter: {
                id: 'intro',
                slug: 'intro',
                title: 'How to use this course',
                readerMode: 'DEFAULT',
                lessonLabel: '01.02',
                estimatedMinutes: 20,
              },
              modules: [
                {
                  id: 'module',
                  title: 'Introduction',
                  chapters: [
                    {
                      id: 'intro',
                      slug: 'intro',
                      title: 'How to use this course',
                    },
                  ],
                },
              ],
              content: {
                checklistState: {},
                learningLogAnswers: {},
                checkpointsCompleted: 0,
                checkpointsTotal: 0,
                canMarkComplete: true,
              },
              document,
            },
          }),
        },
      } as any;
    },
    { courses, courseDetail, document },
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page
    .getByRole('button', { name: 'Preview ' + courses[0].title, exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Start learning', exact: true })
    .click();
  await expect(page.getByText('Idempotency', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Retries must not create duplicate orders.'),
  ).toBeVisible();
  await expect(page.getByText('orders.ts', { exact: true })).toBeVisible();
  await page.getByText('Why use a request ID?', { exact: true }).click();
  await expect(
    page.getByText('It helps trace the same request across services.'),
  ).toBeVisible();
  await expect(page.locator('.mermaid-svg svg')).toBeVisible({
    timeout: 30000,
  });
  await expect(page.getByText('Build the API', { exact: true })).toBeVisible();
  const next = page.getByRole('button', { name: 'Next', exact: true }).first();
  await next.scrollIntoViewIfNeeded();
  await next.click();
  await expect(page.getByText('Step 2 of 5', { exact: true })).toBeVisible();
  await expect(
    page.getByText(/not yet supported in the desktop reader/),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
  await page.getByRole('heading', { level: 1 }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/lesson-blocks-light.png' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.screenshot({ path: 'test-results/lesson-blocks-dark.png' });
});
