const actual = jest.requireActual("sequelize-typescript");

module.exports = {
  ...actual,
  Sequelize: class {
    transaction () {
      return {
        commit: () => {
        },
        rollback: () => {
        }
      };
    }

    authenticate () {
      return Promise.resolve();
    }
  }
};

