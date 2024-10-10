const fs = require("fs");

const { GetUserInfo } = require("./function");

const Main = (chatid, messageid) => {
  const photo =
    "AgACAgIAAxkBAAIJJ2aJP8uraCHDbPOPmjyY3pHsNdG6AAKh3zEbDrJISFUtHOwQZCs8AQADAgADeQADNQQ";
  if (!messageid) {
    bot.sendPhoto(
      chatid, // AgACAgIAAxkBAAIICmaFiufWzGqAnm01y5tNCM7JObROAAJb4jEbmvUoSAPxoK7WnjOEAQADAgADeAADNQQ
      photo,
      {
        caption:
          "Привет, это бот для поиска людей в Калининграде!\nТут ты сможешь найти человека или попытаться помочь найти человека за вознаграждение.",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Профиль",
                callback_data: JSON.stringify({ name: "myform" }),
              },
              {
                text: "Посмотреть анкеты",
                callback_data: JSON.stringify({ name: "getform" }),
              },
            ],

            /*[
              {
                text: "Топ пользователей",
                callback_data: JSON.stringify({ name: "topuser" }),
              },
            ]*/ [
              {
                text: "Телеграмм канал",
                url: "https://t.me/SearchPeople39",
              },
            ],
            [{ text: "Поддержка", url: "tg://user?id=1619511344" }],
          ],
        },
      }
    );
  } else {
    bot.editMessageMedia(
      {
        type: "photo",
        media: photo,
        caption:
          "Привет, это бот для поиска людей в Калининграде!\nТут ты сможешь найти человека или попытаться помочь найти человека за вознаграждение.",
      },
      {
        chat_id: chatid,
        message_id: messageid,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Профиль",
                callback_data: JSON.stringify({ name: "myform" }),
              },
              {
                text: "Посмотреть анкеты",
                callback_data: JSON.stringify({ name: "getform" }),
              },
            ],
            /*[
              {
                text: "Топ пользователей",
                callback_data: JSON.stringify({ name: "topuser" }),
              },
            ]*/
            [
              {
                text: "Телеграмм канал",
                url: "https://t.me/SearchPeople39",
              },
            ],
            [{ text: "Поддержка", url: "tg://user?id=1619511344" }],
          ],
        },
      }
    );
  }
};

const MyForm = (chatid, messageid) => {
  const userinfo = GetUserInfo(chatid);
  const photo =
    "AgACAgIAAxkBAAIJKGaJP-v4FCS-a2x95vrHN5Jqe9vUAAKi3zEbDrJISO8m23QI21dsAQADAgADeQADNQQ";

  /*const form = [
    {
      name: "asd",
      description: "dsa",
      photo: "dfgdfg",
      pay: "0",
      active: false,
    },
    {
      name: "asd",
      description: "dsa",
      photo: "dfgdfg",
      pay: "0",
      active: true,
    },
  ];*/
  const button = [];

  userinfo["form"].map((data, index) => {
    button.push([
      {
        text: `${index + 1}. ${
          data["active"] ? `${data["name"]} ✅` : data["name"]
        }`,
        callback_data: JSON.stringify({
          name: "fromget",
          active: data["active"],
          id: index,
        }),
      },
    ]);
  });

  button.push([
    {
      text:
        userinfo["form"].length < 10
          ? "Создать анкету"
          : "❌ Создать анкету ❌",
      callback_data: JSON.stringify({
        name: userinfo["form"].length < 10 ? "addform" : "notaddform",
      }),
    },
  ]);

  button.push([
    {
      text: "Назад",
      callback_data: JSON.stringify({ name: "exitmain" }),
    },
  ]); // AgACAgIAAxkBAAIICmaFiufWzGqAnm01y5tNCM7JObROAAJb4jEbmvUoSAPxoK7WnjOEAQADAgADeAADNQQ

  bot.editMessageMedia(
    {
      type: "photo",
      media: photo,
      caption: `Дата создания аккаунта: ${
        userinfo["created"]
      }\nКоличество активных анкет: ${
        userinfo.form.filter((data) => data.active).length
      }/5\nКоличество анкет: ${userinfo["form"].length}/10\n\nВаши анкеты:`,
    },
    {
      chat_id: chatid,
      message_id: messageid,
      reply_markup: {
        inline_keyboard: button,
      },
    }
  );
};

const Form = (chatid, messageid, id) => {
  const infouser = GetUserInfo(chatid);
  const forminfo = infouser["form"][id];

  bot.editMessageMedia(
    {
      type: "photo",
      media: forminfo.photo,
      caption: `Имя анкеты: ${forminfo.name}\nОписание анкеты: ${
        forminfo.description
      }\n${
        forminfo.pay
          ? `Оплата за нахождение: ${forminfo.pay} рублей`
          : "Оплата за нахождение: Нет"
      }`,
    },
    {
      chat_id: chatid,
      message_id: messageid,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Изменить данные",
              callback_data: JSON.stringify({
                name: "setform",
                set: "set",
                id: id,
              }),
            },
          ],
          [
            {
              text: forminfo.active
                ? "Деактивировать"
                : infouser.form.filter((info) => info.active).length < 5
                ? "Активировать"
                : "❌ Активировать ❌",
              callback_data: JSON.stringify({
                name: !forminfo.active
                  ? infouser.form.filter((info) => info.active).length < 5
                    ? "setform"
                    : "notsetform"
                  : "setform",
                set: "active",
                id: id,
              }),
            },
          ],
          [
            {
              text: "Удалить",
              callback_data: JSON.stringify({
                name: "setform",
                set: "dell",
                id: id,
              }),
            },
          ],
          [
            {
              text: "Назад",
              callback_data: JSON.stringify({
                name: "myform",
              }),
            },
          ],
        ],
      },
    }
  );
};

const TopUser = (chatid, messageid) => {
  const alluser = fs.readdirSync("./data");
  const alluserinfo = [];
  const button = [];

  alluser.map((data) => {
    const infouser = GetUserInfo(data);
    alluserinfo.push({ id: data, searchpeople: infouser["searchpeople"] });
  });

  bot.editMessageText(
    `Всего пользователей: ${
      alluser.length
    }\nАктивных пользователей за этот день: ${
      onlineuser.length
    }\n\n${alluserinfo
      .map((data, index) => {
        return `${index + 1}. <a href="tg://user?id=${
          data["id"]
        }">Ссылка</a> | Найденые пользователи: ${data["searchpeople"]}`;
      })
      .join("\n")}`,
    {
      chat_id: chatid,
      message_id: messageid,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Обновить",
              callback_data: JSON.stringify({ name: "topuser" }),
            },
          ],
          [
            {
              text: "Назад",
              callback_data: JSON.stringify({ name: "exitmain" }),
            },
          ],
        ],
      },
      parse_mode: "HTML",
    }
  );
};

const AddButton = async (setmessage) => {
  const data = senddata[setmessage];
  const type = data.idtype;
  const chatid = data.id;
  const messageid = data.messageid;
  const text = data.data;
  const photo = text[3]
    ? text[3]
    : "AgACAgIAAxkBAAIJKWaJP_0Dcm_7UgfAeKEi0tBLdtsBAAKj3zEbDrJISP7RhhL0duQjAQADAgADeQADNQQ";

  bot.editMessageMedia(
    {
      type: "photo",
      media: photo,
      caption: `Имя анкеты: ${text[0]}${
        text[1] ? `\nОписание анкеты: ${text[1]}` : ""
      }${text[2] ? `\nПлата в рублях: ${text[2]}` : ""}\n\n${
        type == 0
          ? "Введите новое имя или нажмите далее:"
          : type == 1
          ? text[1]
            ? "Введите новое описание или нажмите далее:"
            : "Введите описание анкеты:"
          : type == 2
          ? text[2]
            ? "Введите новую плату в рублях или нажмите далее:"
            : "Введите плату в рублях за нахождение:"
          : type == 3
          ? text[3]
            ? "Отправьте новое фото для анкеты или нажмите закончить"
            : "Отправьте фото для анкеты"
          : ""
      }`,
    },
    {
      chat_id: chatid,
      message_id: messageid,
      reply_markup: {
        inline_keyboard: [
          text[type]
            ? [
                {
                  text: type == 3 ? "Закончить" : "Далее",
                  callback_data: JSON.stringify({
                    name: "addform",
                    id: setmessage,
                  }),
                },
              ]
            : [],
          type == 2
            ? [
                {
                  text: "Пропустить",
                  callback_data: JSON.stringify({
                    name: "addpass",
                    id: setmessage,
                  }),
                },
              ]
            : [],
          [
            {
              text: `${type == 0 ? "Отмена" : "Назад"}`,
              callback_data: JSON.stringify({
                name: "exitdataadd",
                id: setmessage,
              }),
            },
          ],
        ],
      },
    }
  );
};

exports.TopUser = TopUser;
exports.Main = Main;
exports.MyForm = MyForm;
exports.Form = Form;
exports.AddButton = AddButton;
