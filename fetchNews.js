const Parser = require('rss-parser');
const cheerio = require('cheerio');
const db = require('./db');

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure']
  }
});

const feeds = [
  { url: 'https://www.theguardian.com/football/rss', source: 'The Guardian' },
  { url: 'https://www.skysports.com/rss/12040', source: 'Sky Sports Football' },
  { url: 'https://www.espn.com/espn/rss/soccer/news', source: 'ESPN Football' },
  { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml?edition=uk', source: 'BBC Football' },
  { url: 'https://www.transfermarkt.com/rss/news', source: 'Transfermarkt' },
  { url: 'https://www.football-italia.net/rss.xml', source: 'Football Italia' },
  { url: 'https://www.caughtoffside.com/feed/', source: 'CaughtOffside (Rumours & Opinions)' },

  // New replacements:
  { url: 'https://www.fourfourtwo.com/rss', source: 'FourFourTwo' },           // Features, analysis, transfers
  { url: 'https://talksport.com/football/feed/', source: 'TalkSport Football' } // News and rumors
];




async function fetchAllFeeds() {
  for (const feed of feeds) {
    try {
      const data = await parser.parseURL(feed.url);
      for (const item of data.items) {
        // Load content HTML to parse description images
        const $ = cheerio.load(item.content || item['content:encoded'] || '');
        
        // Try to get image URL from RSS media tags or description
        let imageUrl = null;

        if (item.enclosure && item.enclosure.url) {
          imageUrl = item.enclosure.url;
        } else if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
          imageUrl = item['media:content']['$'].url;
        } else if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
          imageUrl = item['media:thumbnail']['$'].url;
        } else {
          // Fallback: get first image from content HTML
          const firstImg = $('img').first();
          if (firstImg) imageUrl = firstImg.attr('src');
        }
        
if (!imageUrl) {
  console.log(`⛔ Skipping: "${item.title}" — No image found.`);
  continue;
}


        console.log(`Title: ${item.title}`);
  console.log(`Image URL: ${imageUrl || 'No image found'}`);



        // Extract plain text content snippet
        const contentText = $('p').text().slice(0, 500);

        db.prepare(`
          INSERT OR IGNORE INTO articles (title, link, source, pubDate, content, imageUrl)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          item.title,
          item.link,
          feed.source,
          item.pubDate,
          contentText,
          imageUrl
        );
      }
      console.log(`✅ Fetched and saved from ${feed.source}`);
    } catch (err) {
      console.error(`❌ Error fetching ${feed.source}:`, err.message);
    }
  }
}

module.exports = fetchAllFeeds;
