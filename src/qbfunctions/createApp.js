import https from 'https-browserify';
import axios from "axios";



const createApp = async (_realmName, _token, _appname) => {
  console.log("Create App" + _realmName + " " + _token + " " + _appname);

  const realmName = _realmName;
  const token = _token;
  const appName = _appname;
  const config = {
    method: "post",
    url: `https://api.quickbase.com/v1/apps`,
    headers: {
      "QB-Realm-Hostname": realmName,
      Authorization: "QB-USER-TOKEN " + token,
      "Content-Type": "application/json",
    },
    data: {
      name: appName,
      assignToken: true,
    },
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export default createApp;
