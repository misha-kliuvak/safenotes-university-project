import * as dotenv from 'dotenv';
import { QueryTypes, Sequelize } from 'sequelize';

dotenv.config();

export default async () => {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  const prefix = '__internal__testing__%';

  try {
    await Promise.all([
      sequelize.query(`DELETE FROM "user" WHERE "user"."email" LIKE :prefix`, {
        replacements: { prefix },
        type: QueryTypes.DELETE,
        raw: true,
      }),
      sequelize.query(
        `DELETE FROM "company" WHERE "company"."name" LIKE :prefix`,
        {
          replacements: { prefix },
          type: QueryTypes.DELETE,
          raw: true,
        },
      ),
    ]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Cannot cleanup the database');
  } finally {
    await sequelize.close();
  }
};
