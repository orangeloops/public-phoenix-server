"use strict";

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "challenge",
      [
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          title: "Challenge A (dummy)",
          description: "Challenge A description",
          imageUrl: "https://storage.googleapis.com/ideasource.appspot.com/image/challenge-default.png",
          createdDate: new Date(),
          createdById: "11111111-1111-1111-1111-111111111111",
          modifiedDate: new Date(),
          modifiedById: "11111111-1111-1111-1111-111111111111",
        },
        {
          id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          title: "Challenge B (dummy)",
          description: "Challenge B description",
          imageUrl: "https://storage.googleapis.com/ideasource.appspot.com/image/challenge-default.png",
          createdDate: new Date(),
          createdById: "11111111-1111-1111-1111-111111111111",
          modifiedDate: new Date(),
          modifiedById: "11111111-1111-1111-1111-111111111111",
        },
        {
          id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
          title: "Challenge C (dummy)",
          description: "Challenge C description",
          imageUrl: "https://storage.googleapis.com/ideasource.appspot.com/image/challenge-default.png",
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
    return queryInterface.bulkDelete(
      "challenge",
      {
        title: {[Op.like]: "%(dummy)"},
      },
      {}
    );
  },
};
