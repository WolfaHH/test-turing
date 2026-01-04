export const SiteConfig = {
  title: "Cod'Hash Saas",
  description: "Modern SaaS template for building your next product",
  prodUrl: "https://saas.codhash.com",
  appId: "codhash-saas",
  domain: "saas.codhash.com",
  appIcon: "/images/logo.png",
  company: {
    name: "Cod'Hash Studio",
    address: "Paris, France",
  },
  brand: {
    primary: "#1a1a1a",
  },
  team: {
    image: "https://codhash.com/images/team.jpg",
    website: "https://codhash.com",
    twitter: "https://twitter.com/codhash",
    name: "Cod'Hash",
  },
  features: {
    /**
     * If enable, you need to specify the logic of upload here : src/features/images/uploadImageAction.tsx
     * You can use Vercel Blob Storage : https://vercel.com/docs/storage/vercel-blob
     * Or you can use Cloudflare R2 : https://mlv.sh/cloudflare-r2-tutorial
     * Or you can use AWS S3 : https://mlv.sh/aws-s3-tutorial
     */
    enableImageUpload: false as boolean,
    /**
     * If enable, the user will be redirected to `/orgs` when he visits the landing page at `/`
     * The logic is located in middleware.ts
     */
    enableLandingRedirection: true as boolean,
  },
};
