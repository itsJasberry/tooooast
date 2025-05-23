// next-sitemap.config.js
module.exports = {
  siteUrl: process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'https://webtoast.dev',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/*?_rsc=*'],
      },
    ],
  },
};