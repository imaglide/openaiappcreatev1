export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getType = (content) => {
  if (typeof content === "string") {
    if (content.trim().startsWith("{") && content.trim().endsWith("}")) {
      try {
        JSON.parse(content);
        console.log("json");
        return "json";
      } catch (error) {
        // Not valid JSON, continue with other checks
      }
    }

    if (content.includes("<")) {
      console.log("html");
      return "html";
    }

    if (content.includes("function")) {
      console.log( "javascript");
      return "javascript";
    }

    if (content.includes("#include") || content.includes("main()")) {
      console.log("c++");
      return "c++";
    }

    if (content.includes("def ") || content.includes("import")) {
      console.lof("python");
      return "python";
    }
  }
  console.log("text");
  return "text";
};

export const processOutput = (output) => {
  const formattedOutput = output
    .replace(/\n/g, "<br>") // Replace newlines with <br> tags for formatting
    .replace(/\s\s+/g, " "); // Replace consecutive whitespace characters with a single space

  return formattedOutput;
};
