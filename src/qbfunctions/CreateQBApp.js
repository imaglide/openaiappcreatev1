import createApp from './createApp';
import createTable from './createTable';
import createField from './createField';
import createRelationship from './createRelationship';
//const appDataTest = require("../data/openaiResult");

const createQBApp = async (_realmName, _token, _appData)=> {
  const realmName = _realmName;
  const token = _token;
  const appData = _appData;

  console.log("appData", appData);

  const appName = appData.name;

  console.log("realmName", realmName);
  console.log("token", token);
  // console.log("appData", appData)

  console.log("app name " + appName);
  const apptocreate = await createApp(realmName, token, appName);

  const appId = apptocreate.id;


  const tables = [];

  for (const currentTable of appData.tables) {
    const tableCreated = await createTable(
      realmName,
      token,
      appId,
      currentTable.name,
      currentTable.singular,
      currentTable.plural
    );

    const t = {
      tableid: tableCreated.id,
      tablename: tableCreated.name,
    };
    tables.push(t);


    for (const column of currentTable.columns) {
      const fieldCreated = await createField(
        realmName,
        token,
        tableCreated.id,
        column.name,
        column.data_type
      );
    }
  }

  for (const currentRel of appData.relationships) {
  let    fromTableId = "";
  let  toTableId = "";

    for (const table of tables) {
      if (table.tablename === currentRel.to) {
        fromTableId = table.tableid;
      }
    }
    for (const table of tables) {
      if (table.tablename === currentRel.from) {
        toTableId = table.tableid;
      }
    }
    console.log("from", fromTableId);
    console.log("to", toTableId);

    if (fromTableId !== "" || toTableId !== "") {
      const relationshipCreated = await createRelationship(
        realmName,
        token,
        fromTableId,
        toTableId
      );

    }
  }

    const appURL = `https://${realmName}/db/${appId}`;

    return appURL;
  }

  

  export default createQBApp;