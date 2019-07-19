"use strict";

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "idea_reaction",
      [
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7",
          ideaId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
          value: "LIKE",
          createdDate: new Date(),
          createdById: "11111111-1111-1111-1111-111111111111",
          modifiedDate: new Date(),
          modifiedById: "11111111-1111-1111-1111-111111111111",
        },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("idea_reaction", null, {});
  },
};
