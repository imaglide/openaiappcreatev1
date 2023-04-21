import React, { useState, useEffect } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, Button, CircularProgress, Grid } from "@material-ui/core";
import SendIcon from "@mui/icons-material/Send";
import ChatItem from "./ChatItem";
import { getType, processOutput } from "../helpers/helperFunction";

import createApp from "../qbfunctions/createApp";
import createTable from "../qbfunctions/createTable";
import createField from "../qbfunctions/createField";
import createRelationship from "../qbfunctions/createRelationship";

import { startingPrompt, defaultJsonTemplate } from "../helpers/helperText";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#196874", // Add background color
    color: "#EE9422", // Add font color
    height: "100vh", // Add this line
  },
  chatColumn: {
    flex: "1 1 50%",
    height: "calc(100vh - 100px)",
    overflowY: "scroll",
    paddingRight: theme.spacing(1),
    minWidth: "100%", // Add this line
  },
  inputColumn: {
    flex: "1 1 50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: "100%", // Add this line
  },
  inputBox: {
    marginBottom: theme.spacing(2),
    width: "100%",
  },
  button: {
    marginTop: theme.spacing(1),
    alignSelf: "flex-end",
    backgroundColor: "#EE9422",
  },
  loader: {
    marginLeft: theme.spacing(1),
  },
}));

export default function OpenAIInput() {
  const classes = useStyles();
  const [inputText, setInputText] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [realmName, setRealmName] = useState(
    "builderprogram-rspence6256.quickbase.com"
  );
  const [userToken, setUserToken] = useState(
    "b3swp5_qe2d_0_7xk4jydndq55qbvz7hau67nt86"
  );
  const [createdAppURL, setCreatedAppURL] = useState("");
  const [message, setMessage] = useState("");
  const [startClicked, setStartClicked] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true);
  const [lastBotResponse, setLastBotResponse] = useState(""); // add state for last bot response
  const [appBuildTime, setAppBuildTime] = useState(false); // add state for app build time

  useEffect(() => {
    if (createdAppURL) {
      alert(`Your Quick Base app has been created at ${createdAppURL}`);
    }
  }, [createdAppURL]);

  const [jsonTemplate, setJsonTemplate] = useState(
    JSON.stringify(defaultJsonTemplate, null, 2)
  ); // Use JSON.stringify to convert the JSON object to a string

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const streamOutputText = async (text) => {
    console.log("streamOutputText", text);
    const lines = text.includes("\n") ? text.split("\n") : [text];

    for (const line of lines) {
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { content: line, role: "bot", type: getType(line) },
      ]);
      await sleep(100); // Adjust the delay here
    }
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleJsonInputChange = (event) => {
    setJsonText(event.target.value);
    console.log("jsonText", jsonText);
  };

  const generateText = async () => {
    setIsLoading(true);
    console.log("input Text ", inputText);
    console.log("startClicked ", startClicked);
    console.log("appBuild Time ", appBuildTime);

    let chatLogString = "";

    chatLogString = chatLog
      .slice(-5) // only consider last 3 interactions
      .map((chatItem) => chatItem.content)
      .join("\n");

    let messages = [
      {
        content: chatLogString + inputText,
        role: "user",
      },
    ];

    if (!startClicked) {
      messages = [
        {
          content: startingPrompt,
          role: "user",
        },
      ];
    }

    console.log("messages ", JSON.stringify(messages));
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        },
        {
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response", response);
      const formattedOutput = processOutput(
        response.data.choices[0].message.content
      );

      if(!appBuildTime){
        streamOutputText(formattedOutput); // Call streamOutputText to stream the output text
        setLastBotResponse(formattedOutput); // set last bot response

      }else{
        setJsonText(formattedOutput);
        validateJSON(formattedOutput);

      }


    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  const validateJSON = async (jsonText) => {
    try {
      JSON.parse(jsonText);
      // If the JSON is valid, create the Quick Base app
      createQBApp();
    } catch (error) {
      console.error("Invalid JSON", error);
  
      setIsLoading(true);
  
      let messages = [
        {
          content:'Correct this JSON'+ jsonText,
          role: "user",
        },
      ];
  
      // If the JSON is invalid, send it to the OpenAI API to get a valid JSON
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          prompt: `Correct this JSON: ${jsonText}`,
          messages: messages,
          max_tokens: 1024,
          n: 1,
          stop: ".",
          temperature: 0.5,
        },
        {
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
        }
      );
      // Get the corrected JSON from the OpenAI API
      const correctedJson = response.data.choices[0].text.trim();
      console.log("Corrected JSON", correctedJson);
      setJsonText(correctedJson);
      // Call handleJsonSubmit recursively until the JSON is valid
      await handleJsonSubmit(correctedJson);
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (inputText) {
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { content: inputText, role: "user", type: "text" },
      ]);

      setIsLoading(true);

      const formattedOutput = await generateText(chatLog, inputText);

      //streamOutputText(formattedOutput, setChatLog);

      setInputText("");
      setIsLoading(false);
    }
  };
  const createQBApp = async () => {
    const appData = JSON.parse(jsonText);

    const appName = appData.name;

    console.log("realmName", realmName);
    console.log("token", userToken);
    // console.log("appData", appData)

    console.log("app name " + appName);
    setMessage("Creating App " + appName);
    setChatLog((prevChatLog) => [
      ...prevChatLog,
      { content: "Creating App " + appName, role: "bot", type: "message" },
    ]);
    const apptocreate = await createApp(realmName, userToken, appName);
    setMessage("App Created " + appName);
    setChatLog((prevChatLog) => [
      ...prevChatLog,
      { content: "App Created " + appName, role: "bot", type: "message" },
    ]);

    const appId = apptocreate.id;

    const tables = [];

    for (const currentTable of appData.tables) {
      setMessage("Creating Table " + currentTable.name);
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        {
          content: "Creating Table " + currentTable.name,
          role: "bot",
          type: "message",
        },
      ]);
      const tableCreated = await createTable(
        realmName,
        userToken,
        appId,
        currentTable.name,
        currentTable.singular,
        currentTable.plural
      );
      setMessage("Table Created " + currentTable.name);
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        {
          content: "Table Created " + currentTable.name,
          role: "bot",
          type: "message",
        },
      ]);

      const t = {
        tableid: tableCreated.id,
        tablename: tableCreated.name,
      };
      tables.push(t);

      for (const column of currentTable.columns) {
        setMessage("Creating Field " + column.name);
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          {
            content: "Creating Field " + column.name,
            role: "bot",
            type: "message",
          },
        ]);
        const fieldCreated = await createField(
          realmName,
          userToken,
          tableCreated.id,
          column.name,
          column.data_type
        );
        setMessage("Field Created " + column.name);
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          {
            content: "Field Created " + column.name,
            role: "bot",
            type: "message",
          },
        ]);
      }
    }

    for (const currentRel of appData.relationships) {
      let fromTableId = "";
      let toTableId = "";

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
        setMessage("Creating Relationship " + currentRel.name);
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          {
            content: "Creating Relationship " + currentRel.name,
            role: "bot",
            type: "message",
          },
        ]);
        const relationshipCreated = await createRelationship(
          realmName,
          userToken,
          fromTableId,
          toTableId
        );
        setMessage("Relationship Created " + currentRel.name);
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          {
            content: "Relationship Created " + currentRel.name,
            role: "bot",
            type: "message",
          },
        ]);
      }
    }
    setMessage("App Creation Complete");
    setChatLog((prevChatLog) => [
      ...prevChatLog,
      {
        content: "App Creation Complete" + `https://${realmName}/db/${appId}`,
        role: "bot",
        type: message,
      },
    ]);

    const appURL = `https://${realmName}/db/${appId}`;
    setCreatedAppURL(appURL);
  };

  const handleJsonSubmit = async (event) => {
    event.preventDefault();
  };

  const handleCreateAppSubmit = async (event) => {
    event.preventDefault();
    createQBApp();
  };

  const handleRealmNameChange = async (event) => {
    event.preventDefault();
    setRealmName(event.target.value);
  };

  const handleUserTokenChange = async (event) => {
    event.preventDefault();
    setUserToken(event.target.value);
  };

  const handleStartButtonClick = () => {
    setShowStartButton(false);
    setStartClicked(true);
    generateText(true);
  };

  const getLastBotResponse = () => {
   return lastBotResponse;
  }

  const handleCreateAppButtonClick = async () => {
    const lastBotResponse = getLastBotResponse();
  
    if (!lastBotResponse) {
      console.log("No bot response found!");
      return;
    }
  
    const prompt = `Take this ERD and put it into this JSON Format: 
      {
        name: "name",
        tables: [
          {
            name: "tablename",
            plural: "pluraltablename",
            singular: "singulartablename",
            columns: [
              {
                name: "Name",
                data_type: "type"
              }
            ]
          }
        ],
        relationships: [
          {
            from: "table",
            to: "table"
          }
        ]
      }
      and use these data types: text, text-multiple-choice, text-multi-line, rich-text, numeric, currency, rating, percent, multitext, email, url, duration, date, datetime, timestamp, timeofday, checkbox, user, multiuser, address, phone.`;
  
      setInputText(prompt + lastBotResponse);
      setAppBuildTime(true);
    const generatedText = await generateText();
  
    console.log(generatedText);
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <div className={classes.chatColumn}>
            {chatLog.map((chatItem, index) => (
              <ChatItem
                key={index}
                content={chatItem.content}
                role={chatItem.role}
                type={chatItem.type}
              />
            ))}
            {showStartButton && (
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={handleStartButtonClick}
              >
                Start Conversation
              </Button>
            )}
            {showStartButton === false && (
              <form onSubmit={handleSubmit} className={classes.form}>
                <TextField
                  id="inputText"
                  label="Type your message here..."
                  variant="outlined"
                  value={inputText}
                  onChange={handleInputChange}
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  disabled={!inputText || isLoading}
                  endIcon={<SendIcon />}
                >
                  Send
                </Button>
                {isLoading && (
                  <CircularProgress size={24} className={classes.loader} />
                )}
              </form>
            )}
            {chatLog.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={handleCreateAppButtonClick}
              >
                I like it - Create It
              </Button>
            )}
          </div>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <div className={classes.inputColumn}>
            <form onSubmit={handleCreateAppSubmit}>
              <TextField
                id="realmName"
                label="Realm Name"
                variant="outlined"
                value={realmName}
                onChange={handleRealmNameChange}
                fullWidth
                className={classes.inputBox}
                InputLabelProps={{ style: { color: "#FFFFFF" } }} // Add this line
                // InputProps={{ style: { backgroundColor: "#FFFFFF" } }} // Add this line
              />
              <TextField
                id="userToken"
                label="User Token"
                variant="outlined"
                value={userToken}
                onChange={handleUserTokenChange}
                fullWidth
                className={classes.inputBox}
                InputLabelProps={{ style: { color: "#FFFFFF" } }} // Add this line
                //InputProps={{ style: { backgroundColor: "#FFFFFF" } }} // Add this line
              />
              <Button
                variant="contained"
                color="primary"
                type="submit"
                className={classes.button}
                disabled={!realmName || !userToken || isLoading}
              >
                Create App
              </Button>
              {isLoading && (
                <CircularProgress size={24} className={classes.loader} />
              )}
            </form>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
