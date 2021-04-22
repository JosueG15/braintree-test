const config = {
    production: {
      public_url: process.env.PUBLIC_URL,
      database: process.env.DB_PRODUCTION,
    },
    development: {
      public_url: 'http://localhost:3000',
      database: process.env.DB,
    },
    test: {
      public_url: 'http://localhost:3000',
      database: process.env.DB_TEST,
    },
    default: {
      public_url: 'http://localhost:3000',
      database: process.env.DB_TEST,
    },
  };
  
  function get(env) {
    return config[env] || config.default;
  }
  
  module.exports = get;
  