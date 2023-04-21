import axios from 'axios';
import https from 'https-browserify';



const createField = async (
  _realmName,
  _token,
  _tableid,
  _label,
  _fieldtype
) => {
  console.log("Create Field: ", _label, " ", _fieldtype);

  const realmName = _realmName;
  const token = _token;
  const tableId = _tableid;
  const fieldLabel = _label;
  const fieldType = _fieldtype;

  const config = {
    method: "post",
    url: `https://api.quickbase.com/v1/fields`,
    headers: {
      "QB-Realm-Hostname": realmName,
      Authorization: "QB-USER-TOKEN " + token,
      "Content-Type": "application/json",
    },
    params: {
      tableId: tableId,
    },

    data: {
      label: fieldLabel,
      fieldType: fieldType,
      findEnabled: true,
      addToForms: true,
    },
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export default createField;
