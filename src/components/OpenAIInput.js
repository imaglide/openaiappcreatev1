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

import {defaultPageInstructions, defaultJsonTemplate} from "../helpers/helperText";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "row",
  },
  chatColumn: {
    flex: "1 1 50%",
    height: "calc(100vh - 100px)",
    overflowY: "scroll",
    paddingRight: theme.spacing(1),
  },
  inputColumn: {
    flex: "1 1 50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  inputBox: {
    marginBottom: theme.spacing(2),
    width: "100%",
  },
  button: {
    marginTop: theme.spacing(1),
    alignSelf: "flex-end",
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
  const [realmName, setRealmName] = useState("");
  const [userToken, setUserToken] = useState("");
  const [createdAppURL, setCreatedAppURL] = useState("");
  const [message, setMessage] = useState("");

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
    const chatLogString = chatLog
      .slice(-3) // only consider last 3 interactions
      .map((chatItem) => chatItem.content)
      .join("\n");

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              content: chatLogString + inputText,
              role: "user",
            },
          ],
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
      streamOutputText(formattedOutput); // Call streamOutputText to stream the output text
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
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
        { content: "Creating Table " + currentTable.name, role: "bot", type: "message" },
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
        { content: "Table Created " + currentTable.name, role: "bot", type: "message" },
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
          { content: "Creating Field " + column.name, role: "bot", type: "message" },
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
          { content: "Field Created " + column.name, role: "bot", type: "message" },
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
          { content:"Creating Relationship " + currentRel.name, role: "bot", type: "message" },
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
          { content: "Relationship Created " + currentRel.name, role: "bot", type: "message" },
        ]);
      }
    }
    setMessage("App Creation Complete");
    setChatLog((prevChatLog) => [
      ...prevChatLog,
      { content:"App Creation Complete" + `https://${realmName}/db/${appId}`, role: "bot", type: message },
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
          </div>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <div className={classes.inputColumn}>
            <form onSubmit={handleJsonSubmit}>
              <TextField
                id="jsonText"
                label="Enter JSON here..."
                variant="outlined"
                value={jsonText}
                onChange={handleJsonInputChange}
                multiline
                minRows={40}
                fullWidth
                className={classes.inputBox}
              />
              <Button
                variant="contained"
                color="primary"
                type="submit"
                className={classes.button}
                disabled={!jsonText || isLoading}
              >
                Generate Output
              </Button>
              {isLoading && (
                <CircularProgress size={24} className={classes.loader} />
              )}
            </form>
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
              />
              <TextField
                id="userToken"
                label="User Token"
                variant="outlined"
                value={userToken}
                onChange={handleUserTokenChange}
                fullWidth
                className={classes.inputBox}
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
              <TextField
                id="jsonTemplate"
                label="JSON Template"
                variant="outlined"
                value={jsonTemplate}
                multiline
                minRows={5}
                fullWidth
                className={classes.inputBox}
              />
              <TextField
                id="instructions"
                label="Page Instructions"
                variant="outlined"
                value={defaultPageInstructions}
                multiline
                minRows={5}
                fullWidth
                className={classes.inputBox}
              />
            </form>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
