// Excerpts come from content/transformed/multi-vendor-marketplace/01-introduction/01.06-course-outline.mdx.
// Keep quoted course material separate from the page's editorial copy.
export const COURSE_EXCERPT = {
  source: "FreshMarket / 01.06 / Course outline",
  quote: "For the week demo, buy from two stores. Show two orders in the database, then change a product price and show that the old receipt stays the same.",
  explanation: "Each order stores the product name, unit, and price at purchase time.",
};

export const BUILD_OUTLINE = [
  { title: "Get the app running", text: "Connect the React client to your API and database." },
  { title: "Open the shops", text: "Let vendors add products. Keep each shop's data separate." },
  { title: "Make checkout work", text: "Buy from different shops in one cart. Keep the price on each receipt." },
  { title: "Put it on the web", text: "Deploy the marketplace and test stock holds and promotions." },
] as const;

export const STUDY_NOTES = [
  { title: "Pick a piece of work.", text: "Choose a course for what you want to make or practise. Sign in to see its chapters and enrolment options." },
  { title: "Give the chapter your attention.", text: "Read, try the exercise and check your understanding. If something does not work, bring the question to your mentor." },
  { title: "Keep evidence of what you did.", text: "Save the working code or your written response. Use the feedback to improve it before moving on." },
] as const;
