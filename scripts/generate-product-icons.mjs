import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const products = [
  {
    name: "ag1-powder",
    prompt:
      "A minimalist flat icon of a green powder jar/canister, simple geometric design, sober shadcn-style, monochrome dark gray (#374151), transparent background, 64x64 pixels, no text, no shadows, clean lines",
  },
  {
    name: "ag1-travel-packs",
    prompt:
      "A minimalist flat icon of sachets/packets for travel, simple geometric design, sober shadcn-style, monochrome dark gray (#374151), transparent background, 64x64 pixels, no text, no shadows, clean lines",
  },
  {
    name: "subscription",
    prompt:
      "A minimalist flat icon of a subscription/recurring symbol with circular arrows, simple geometric design, sober shadcn-style, monochrome dark gray (#374151), transparent background, 64x64 pixels, no text, no shadows, clean lines",
  },
  {
    name: "bundle",
    prompt:
      "A minimalist flat icon of a gift box or package bundle with bow, simple geometric design, sober shadcn-style, monochrome dark gray (#374151), transparent background, 64x64 pixels, no text, no shadows, clean lines",
  },
  {
    name: "omega3",
    prompt:
      "A minimalist flat icon of fish oil capsules/pills, simple geometric design, sober shadcn-style, monochrome dark gray (#374151), transparent background, 64x64 pixels, no text, no shadows, clean lines",
  },
  {
    name: "shaker",
    prompt:
      "A minimalist flat icon of a protein shaker bottle with lid, simple geometric design, sober shadcn-style, monochrome dark gray (#374151), transparent background, 64x64 pixels, no text, no shadows, clean lines",
  },
  {
    name: "vitamin-d3k2",
    prompt:
      "A minimalist flat icon of vitamin drops bottle or vitamin pills, simple geometric design, sober shadcn-style, monochrome dark gray (#374151), transparent background, 64x64 pixels, no text, no shadows, clean lines",
  },
];

const outputDir = path.join(
  process.cwd(),
  "public",
  "images",
  "products"
);

async function generateIcon(product) {
  console.log(`Generating icon for ${product.name}...`);

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: product.prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageData = response.data[0].b64_json;
    const buffer = Buffer.from(imageData, "base64");
    const outputPath = path.join(outputDir, `${product.name}.png`);
    fs.writeFileSync(outputPath, buffer);
    console.log(`Saved: ${outputPath}`);
  } catch (error) {
    console.error(`Error generating ${product.name}:`, error.message);
  }
}

async function main() {
  console.log("Starting icon generation...");
  console.log(`Output directory: ${outputDir}`);

  for (const product of products) {
    await generateIcon(product);
  }

  console.log("Done!");
}

main();
