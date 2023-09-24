module.exports = {
  poweredByHeader: false,
  webpack: (config) => {
    config.resolve.alias.v8 = false;
    return config;
  },
  env: {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN
  }
};
