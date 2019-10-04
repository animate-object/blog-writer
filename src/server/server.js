const express = require("express");
const AWS = require("aws-sdk");
const bodyparser = require("body-parser");

const app = express();
const port = 3001;
const s3 = new AWS.S3();

const saveToS3 = ({ bucketName, prefix, title, post }) => {
  const transformedTitle = title.split(" ").join("_");
  try {
    return s3.putObject(
      {
        Bucket: bucketName,
        Key: `${prefix}${transformedTitle}.md`.toLocaleLowerCase(),
        Body: post
      },
      (err, data) => {
        if (err) {
          console.log(err);
          return false;
        } else {
          console.log(data);
          return true;
        }
      }
    );
  } catch (e) {
    console.log(e);
    return false;
  }
};

app.use(bodyparser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => res.send("Hello World!"));
app.post("/blog", (req, res) => {
  console.log(req.body);
  res.send(saveToS3(req.body) ? "ok" : "bad");
});

app.listen(port, () => console.log(`Fly as shit on ${port}!`));
