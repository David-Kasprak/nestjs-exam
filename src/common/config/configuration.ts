import * as process from 'process';

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    password: 'postgres',
    user: 'postgres',
    database: 'postgres',
  },
});
