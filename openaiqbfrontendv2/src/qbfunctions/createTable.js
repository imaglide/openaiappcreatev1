import axios from 'axios';




const createTable = async (
  _realmName,
  _token,
  _appid,
  _tablename,
  _singlerecordname,
  _pluralrecordname
) => {
  console.log("Create Table");

  const realmName = _realmName;
  const token = _token;
  const appID = _appid;
  const tableName = _tablename;
  const single = _singlerecordname;
  const plural = _pluralrecordname;
  const config = {
    method: "post",
    url: `https://api.quickbase.com/v1/tables`,
    headers: {
      "QB-Realm-Hostname": realmName,
      Authorization: "QB-USER-TOKEN " + token,
      "Content-Type": "application/json",
    },
    params: {
      appId: appID
    },
    data: {
      name: tableName,
      singleRecordName: single,
      pluralRecordName: plural
    },
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export default createTable;
