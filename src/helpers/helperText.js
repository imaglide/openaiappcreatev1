export const defaultPageInstructions =
  "Welcome to the Quick Base App Creator. This app will help you create a new Quick Base App." +
  "with the help of ChatGPT-3. You will be asked a series of questions to help you create your app schema." +
  "Once we have the schema the way we want we want to ask ChatGPT to put our schema into the template above." +
  " Make sure you have it use the correct fields for the data types" +
  "\nQuickbase Field Types:\ntext\ntext-multiple-choice\ntext-multi-line\nrich-text\nnumeric\ncurrency\nrating\npercent\nmultitext\nemail\nurl\nduration\ndate\ndatetime\ntimestamp\ntimeofday\ncheckbox\nuser\nmultiuser\naddress\nphone";


  export const defaultJsonTemplate = {
    name: "name",
    tables: [
      {
        name: "tablename",
        plural: "pluraltablename",
        singular: "sigulartablename",
        columns: [
          {
            name: "Name",
            data_type: "type",
          },
        ],
      },
    ],
    relationships: [
      {
        from: "table",
        to: "table",
      },
    ],
  };
