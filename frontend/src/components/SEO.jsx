import { Helmet } from "react-helmet-async";

const SITE_NAME = "Rubato Garden Lounge";
const SITE_URL = "https://yourdomain.com";
const DEFAULT_IMAGE = `${SITE_URL}/og-cover.jpg`;
const DEFAULT_DESCRIPTION =
  "Rubato Garden Lounge — a garden lounge menu featuring soups, pasta, risotto, wood-fired pizza, and more.";

export function SEO({ title, description, image, path = "", type = "website", jsonLd }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const metaImage = image || DEFAULT_IMAGE;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}

export default SEO;