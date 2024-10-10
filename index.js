const dotenv = require("dotenv");
dotenv.config();

const TelegramBot = require("node-telegram-bot-api");

const fs = require("fs");
const cron = require("node-cron");

const { Main, MyForm, Form, TopUser, AddButton } = require("./button");
const { GetUserInfo, GetUserSelection, GetAllform } = require("./function");

const token = process.env.TELEGRAM_BOT_TOKEN;
process.env.TELEGRAM_BOT_TOKEN;
cron.schedule(
  "0 0 * * *",
  () => {
    onlineuser = [];
  },
  {
    scheduled: true,
    timezone: "Europe/Moscow",
  }
);

bot = new TelegramBot(token, { polling: true });
senddata = [];
onlineuser = [];

bot.on("message", (msg) => {
  const typechat = msg.chat.type;
  const text = msg.text;
  const chatid = msg.from.id;
  const messageid = msg.message_id;
  if (typechat == "private") {
    if (!onlineuser.find((data) => data == chatid)) {
      onlineuser.push(chatid);
    }

    const setmessage = senddata.findIndex((data) => data.id == chatid);

    if (setmessage == -1) {
      if (text == "/start") {
        Main(chatid);
      } else if (text == "/stats") {
        const photo =
          "AgACAgIAAxkBAAIJQ2aK0vxOIWaBFslW8DBGWZ10lwmtAAKN4zEbDrJYSMwmi20EMQ7EAQADAgADeQADNQQ";
        const alluser = fs.readdirSync("./data");
        const [allforminfo, allactiveforminfo] = GetAllform();

        bot.sendPhoto(chatid, photo, {
          caption: `Статистика:\nАктивных пользователей за сегодня: ${onlineuser.length}\nВсего пользователей: ${alluser.length}\nВсего анкет: ${allforminfo}\nВсего активных анкет: ${allactiveforminfo}`,
        });
      }
    } else {
      if (text == "/start") {
        bot.deleteMessage(chatid, senddata[setmessage].messageid);
        senddata.splice(setmessage, 1);
        Main(chatid);
      } else {
        /*
          0 - name
          1 - description
          2 - pay
          3 - photo
          4 - xz
        */

        const array = senddata[setmessage].data;
        const type = senddata[setmessage].idtype;

        if (
          array[type] != text &&
          ((type == 0 && text.length < 50) ||
            (type == 1 && text.length < 800) ||
            (type == 2 && Number(text) && text.length < 50))
        ) {
          array[type] = text;

          AddButton(setmessage);
        }

        bot.deleteMessage(chatid, messageid);
      }
    }
  }
});

bot.on("callback_query", (msg) => {
  const data = JSON.parse(msg.data);
  const chatid = msg.message.chat.id;
  const messageid = msg.message.message_id;
  const typechat = msg.message.chat.type;

  if (!onlineuser.find((data) => data == chatid)) {
    onlineuser.push(chatid);
  }

  if (typechat == "private") {
    //const userinfo = fs.readFileSync(`./data/${chatid}/info.json`, "utf-8");
    if (data["name"] == "myform") {
      MyForm(chatid, messageid);
    } else if (data["name"] == "exitmain") {
      Main(chatid, messageid);
    } else if (data["name"] == "addform") {
      if (senddata.findIndex((data) => data.id == chatid) == -1) {
        const photo =
          "AgACAgIAAxkBAAIJKWaJP_0Dcm_7UgfAeKEi0tBLdtsBAAKj3zEbDrJISP7RhhL0duQjAQADAgADeQADNQQ";

        senddata.push({
          id: chatid,
          messageid: messageid,
          idtype: 0,
          data: [],
        });

        bot.editMessageMedia(
          {
            type: "photo",
            media: photo,
            caption: "Введите имя анкеты:",
          },
          {
            chat_id: chatid,
            message_id: messageid,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Отмена",
                    callback_data: JSON.stringify({
                      name: "exitdataadd",
                      id: senddata.length - 1,
                    }),
                  },
                ],
              ],
            },
          }
        );
      } else {
        const type = senddata[data.id].idtype;

        if (type != 3) {
          senddata[data.id].idtype++;

          AddButton(data.id);
        } else {
          const userdata = GetUserInfo(chatid);
          const info = senddata[data.id].data;

          if (senddata[data.id].idset == null) {
            userdata["form"].push({
              name: info[0],
              description: info[1],
              photo: info[3],
              pay: info[2],
              active: false,
            });

            senddata.splice(data.id, 1);

            fs.writeFileSync(
              `./data/${chatid}/info.json`,
              JSON.stringify(userdata)
            );

            Form(chatid, messageid, userdata["form"].length - 1);
          } else {
            const idform = senddata[data.id].idset;
            userdata["form"][idform] = {
              name: info[0],
              description: info[1],
              photo: info[3],
              pay: info[2],
              active: false,
            };

            senddata.splice(data.id, 1);

            fs.writeFileSync(
              `./data/${chatid}/info.json`,
              JSON.stringify(userdata)
            );

            Form(chatid, messageid, idform);
          }
        }
      }

      /*const userdata = GetUserInfo(chatid);

      if (userdata["form"].length < 10) {
        userdata["form"].push({
          name: "Анкета",
          description: "Пусто",
          photo: null,
          pay: null,
          active: false,
        });

        fs.writeFileSync(
          `./data/${chatid}/info.json`,
          JSON.stringify(userdata)
        );

        MyForm(chatid, messageid);
      }*/
    } else if (data["name"] == "exitdataadd") {
      //senddata.push({ id: chatid, messageid: messageid });
      if (!(senddata.findIndex((data) => data.id == chatid) == -1)) {
        senddata[data.id].idtype--;
        const type = senddata[data.id].idtype;
        if (type == -1) {
          senddata.splice(data.id, 1);
          MyForm(chatid, messageid);
        } else {
          AddButton(data.id);
        }
      }
    } else if (data["name"] == "fromget") {
      Form(chatid, messageid, data["id"]);
    } else if (data["name"] == "setform") {
      if (data["set"] == "active") {
        const userdata = GetUserInfo(chatid);
        if (userdata["form"][data["id"]]) {
          userdata["form"][data["id"]]["active"] =
            !userdata["form"][data["id"]]["active"];

          fs.writeFileSync(
            `./data/${chatid}/info.json`,
            JSON.stringify(userdata)
          );

          Form(chatid, messageid, data["id"], true);
        }
      } else if (data["set"] == "dell") {
        const userdata = GetUserInfo(chatid);
        if (userdata["form"][data["id"]]) {
          userdata["form"].splice(data["id"], 1);

          fs.writeFileSync(
            `./data/${chatid}/info.json`,
            JSON.stringify(userdata)
          );

          MyForm(chatid, messageid);
        }
      } else {
        const userdata = GetUserInfo(chatid);
        const info = userdata["form"][data.id];
        if (info) {
          senddata.push({
            id: chatid,
            messageid: messageid,
            idtype: 0,
            data: [info.name, info.description, info.pay, info.photo],
            idset: data.id,
          });

          AddButton(senddata.length - 1);
        }
      }
    } else if (data["name"] == "topuser") {
      TopUser(chatid, messageid);
    } else if (data["name"] == "addpass") {
      if (!(senddata.findIndex((data) => data.id == chatid) == -1)) {
        senddata[data.id].data[senddata[data.id].idtype] = null;
        senddata[data.id].idtype++;
        AddButton(data.id);
      }
    } else if (data["name"] == "getform") {
      const userselection = GetUserSelection(
        data.oldusernumber,
        data.oldrandomformnumber
      );

      if (userselection != "error") {
        const userinfo = userselection[3];
        const userinfoform = userselection[0];

        bot.editMessageMedia(
          {
            type: "photo",
            media: userinfoform.photo,
            caption: `Имя: ${userinfoform.name}\nОписание: ${
              userinfoform.description
            }\nПлата за нахождение: ${
              userinfoform.pay ? `${userinfoform.pay} рублей` : "Нет"
            }`,
            parse_mode: "HTML",
          },
          {
            chat_id: chatid,
            message_id: messageid,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Далее",
                    callback_data: JSON.stringify({
                      name: "getform",
                      oldusernumber: userselection[1],
                      oldrandomformnumber: userselection[2],
                    }),
                  },
                ],
                [
                  {
                    text: "Контакты ищущего",
                    url: `tg://user?id=${userinfo}`,
                  },
                ],
                [
                  {
                    text: "Назад",
                    callback_data: JSON.stringify({
                      name: "exitmain",
                    }),
                  },
                ],
              ],
            },
          }
        );
      } else {
        const photo =
          "AgACAgIAAxkBAAIJm2aK3DHqhZF8yViMFrBAt1ot_pWSAALA4zEbDrJYSKBD_7wkNrvjAQADAgADeQADNQQ";
        bot.editMessageMedia(
          {
            type: "photo",
            media: photo,
            caption: "Слишком мало активированных анкет для работы 😢",
            parse_mode: "HTML",
          },
          {
            chat_id: chatid,
            message_id: messageid,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Назад",
                    callback_data: JSON.stringify({
                      name: "exitmain",
                    }),
                  },
                ],
              ],
            },
          }
        );
      }
    }
  }
});

bot.on("photo", (msg) => {
  const chatid = msg.chat.id;
  const typechat = msg.chat.type;

  if (typechat == "private") {
    const setmessage = senddata.findIndex((data) => data.id == chatid);
    if (setmessage != -1) {
      const type = senddata[setmessage].idtype;
      if (type == 3) {
        const array = senddata[setmessage].data;
        const photoid = msg.photo[msg.photo.length - 1].file_id;

        array[type] = photoid;

        AddButton(setmessage);
      }
    }
  }
});
