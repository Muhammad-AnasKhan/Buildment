// The public address search engines and share previews should use. edorax.com redirects to www,
// so canonical links point at www directly.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.edorax.com").replace(/\/$/, "");

export const SITE_NAME = "Edorax";

export const SITE_DESCRIPTION =
  "Short lessons you can read, play with, listen to and prove. Built for phones, slow connections and second-language learners.";

/** The 1200x630 share image (public/og/edorax.png). */
export const SITE_SHARE_IMAGE = "/og/edorax.png";
