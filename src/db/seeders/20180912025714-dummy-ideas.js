"use strict";

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "idea",
      [
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
          challengeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          title: "Idea A.1 (dummy)",
          description: "Idea A.1 description",
          imageUrl: "https://storage.googleapis.com/ideasource.appspot.com/image/idea-default.png",
          createdDate: new Date(),
          createdById: "11111111-1111-1111-1111-111111111111",
          modifiedDate: new Date(),
          modifiedById: "11111111-1111-1111-1111-111111111111",
        },
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
          challengeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          title: "Idea A.2 (dummy)",
          description: "Idea A.2 description",
          imageUrl: "https://storage.googleapis.com/ideasource.appspot.com/image/idea-default.png",
          createdDate: new Date(),
          createdById: "11111111-1111-1111-1111-111111111111",
          modifiedDate: new Date(),
          modifiedById: "11111111-1111-1111-1111-111111111111",
        },
        {
          id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1",
          challengeId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          title: "Idea B.1 (dummy)",
          description: "Idea B.1 description",
          imageUrl: "https://storage.googleapis.com/ideasource.appspot.com/image/idea-default.png",
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
      "idea",
      {
        title: {[Op.like]: "%(dummy)"},
      },
      {}
    );
  },
};
