import axios from 'axios';
import https from 'https-browserify';


const agent = new https.Agent({
  rejectUnauthorized: false,
});

const createRelationship = async (
  _realmName,
  _token,
  _tableid,
  _parenttable,
) => {
  console.log("Create Relationship", _tableid, " ", _parenttable);

  const realmName = _realmName;
  const token = _token;
  const tableId = _tableid;
  const parentTable = _parenttable;
  const config = {
    method: "post",
    url: `https://api.quickbase.com/v1/tables/${tableId}/relationship`,
    headers: {
      "QB-Realm-Hostname": realmName,
      Authorization: "QB-USER-TOKEN " + token,
      "Content-Type": "application/json",
    },
    params: {
      tableId: tableId,
    },
    data: {
      parentTableId: parentTable
    },
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export default createRelationship;
