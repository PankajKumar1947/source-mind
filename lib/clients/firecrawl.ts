import { envConfig } from '@/config/env';
import { Firecrawl } from 'firecrawl';

const firecrawl = new Firecrawl({
  apiKey: envConfig.FIRECRAWL_API_KEY
});

export type ScrapFormatType = "markdown" | "html" | "json";

export async function scrapWebLink(link: string, formatType: ScrapFormatType = "markdown") {
  try {
    const result = await firecrawl.scrape(link, {
      formats: [formatType]
    });
    return result;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to scrap web link");
  }
}