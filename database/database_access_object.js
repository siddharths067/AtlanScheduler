const Sequelize = require(`sequelize`);
const logger = require(`../logger`);

const DAO = new Sequelize(`atlan`, `root`, `password`, {
    host: `db`,
    dialect: `postgres`,
    port: 5432
});

DAO.authenticate().then(() => {
    logger.info(`Connection established to MySQL Server Correctly`);
}).catch(err => {
    logger.error(`Cannot connect to SQL Server`);
    logger.error(err);
});


module.exports = DAO;