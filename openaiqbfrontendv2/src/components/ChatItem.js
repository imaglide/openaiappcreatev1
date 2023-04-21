import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Typography } from "@material-ui/core";
import CodeBlock from "./CodeBlock";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start", // Align elements to the left
  },
  paper: {
    padding: theme.spacing(2),
    backgroundColor: "#f0f0f0",
  },
  content: {
    textAlign: "left", // Left justify the text
  },
}));

export default function ChatItem(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="caption">{props.role}</Typography>
      {props.type === "json" ? (
        <CodeBlock code={props.content} />
      ) : props.type === "code" ? (
        <CodeBlock code={props.content} />
      ) : (
        <Paper className={classes.paper} elevation={0}>
          <Typography
            variant="body1"
            className={classes.content}
            dangerouslySetInnerHTML={{ __html: props.content }}
          ></Typography>
        </Paper>
      )}
    </div>
  );
}
