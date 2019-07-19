"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "user",
      [
        {
          id: "11111111-1111-1111-1111-111111111111",
          name: "John Doe",
          email: "user@dummy.com",
          password: "$2b$10$nmL5/x6kPttxyPcjqZecrextMwvIcK2JzK/bN8AiR4Zp5EpIzWFg2",
          imageUrl: "https://storage.googleapis.com/ideasource.appspot.com/image/user-default.png",
          status: 1,
          customData: '{"activation": {"code": "KLvSbYahPsqC6SqnwpzSv", "codeDate": "2019-07-19T23:48:03.723Z"}}',
          createdDate: new Date(),
          modifiedDate: new Date(),
        },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("user", null, {});
  },
};
