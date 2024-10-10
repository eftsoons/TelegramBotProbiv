const fs = require("fs");
const { format } = require("date-fns");

const GetUserInfo = (userid) => {
  if (fs.existsSync(`./data/${userid}/info.json`)) {
    return JSON.parse(fs.readFileSync(`./data/${userid}/info.json`));
  } else {
    const date = format(new Date(), "HH:mm dd.MM.yyyy");

    if (!fs.existsSync(`./data/${userid}`)) {
      fs.mkdirSync(`./data/${userid}`);
    }

    fs.writeFileSync(
      `./data/${userid}/info.json`,
      JSON.stringify({ form: [], created: date })
    );

    return { form: [], created: date };
  }
};

const GetUserSelection = (oldusernumber, oldrandomformnumber) => {
  const alluser = fs.readdirSync("./data");
  const [_, allactiveforminfo] = GetAllform();

  while (allactiveforminfo > 1) {
    const usernumber = Math.floor(Math.random() * alluser.length);
    const user = alluser[usernumber];
    const userinfo = GetUserInfo(user);

    if (userinfo.form.length > 0) {
      const randomformnumber = Math.floor(Math.random() * userinfo.form.length);
      if (
        usernumber != oldusernumber ||
        randomformnumber != oldrandomformnumber
      ) {
        const randomform = userinfo.form[randomformnumber];

        if (randomform.active) {
          return [randomform, usernumber, randomformnumber, user];
        }
      }
    }
  }

  if (allactiveforminfo <= 1) {
    return "error";
  }
};

const GetAllform = () => {
  const alluser = fs.readdirSync("./data");

  let allforminfo = 0;
  let allactiveforminfo = 0;

  for (const user of alluser) {
    const info = JSON.parse(
      fs.readFileSync(`./data/${user}/info.json`, "utf-8")
    );

    allforminfo += info.form.length;
    allactiveforminfo += info.form.filter((info) => info.active).length;
  }

  return [allforminfo, allactiveforminfo];
};

exports.GetUserInfo = GetUserInfo;
exports.GetUserSelection = GetUserSelection;
exports.GetAllform = GetAllform;
