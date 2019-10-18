const Sequelize = require(`sequelize`);
const dao = require(`../database_access_object`);
const logger = require(`../../logger`);

class Task extends Sequelize.Model{}

Task.init({
    uid: {
        type: Sequelize.STRING(1000),
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM([`queued`, `running`, `terminated`, `aborted`, `successful`]),
        allowNull: false,
        defaultValue: `queued`
    },
    task: {
        type: Sequelize.STRING("2000"),
        allowNull: false
    },
    data: {
        type: Sequelize.JSON,
        allowNull: false
    },
    webhook:{
        type: Sequelize.STRING(5000),
        allowNull: true
    }
}, {
    sequelize: dao,
    modelName: "tasks"
});

module.exports = Task;