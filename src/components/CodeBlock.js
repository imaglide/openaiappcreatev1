import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography, Box } from '@material-ui/core';
import FileCopyIcon from '@mui/icons-material/FileCopy';

const useStyles = makeStyles((theme) => ({
  codeContainer: {
    backgroundColor: '#282c34',
    color: '#ffffff',
    padding: theme.spacing(2),
    borderRadius: 4,
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    fontFamily: 'monospace',
    border: '1px solid #ccc',
    position: 'relative',
  },
  title: {
    position: 'absolute',
    top: -theme.spacing(2),
    left: theme.spacing(2),
    backgroundColor: '#f5f5f5',
    color: '#000',
    padding: '0 4px',
  },
  copyButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
}));

const CodeBlock = ({ code, title }) => {
  const classes = useStyles();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <Box className={classes.codeContainer}>
      <Typography variant="subtitle2" className={classes.title}>
        {title}
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        size="small"
        className={classes.copyButton}
        onClick={copyToClipboard}
      >
        <FileCopyIcon fontSize="small" />
      </Button>
      <pre>{code}</pre>
    </Box>
  );
};

export default CodeBlock;
