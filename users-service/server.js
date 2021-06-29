const app = require("./src/index");
// APP PORT
const PORT = process.env.PORT;

// START RUNNING SERVER
app.listen(PORT, () => {
    console.log(`Server start runing on port ${PORT}`.yellow);
  });