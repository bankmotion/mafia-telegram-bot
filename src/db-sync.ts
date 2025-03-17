import sequelize from "./config/database";

const syncDB = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log(`DB synced successfully`);
  } catch (err) {
    console.error(`Error syncing database: `, err);
  }
};

syncDB();
