import * as React from "react";
import ReactMde from "react-mde";
import * as Showdown from "showdown";
import "./App.css";
import "react-mde/lib/styles/css/react-mde-all.css";
import axios from "axios";

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});

const saveToS3 = (post, title, prefix, bucketName) => {
  axios.post("http://localhost:3001/blog", {
    post,
    title,
    prefix,
    bucketName
  });
};

const confirmSave = (value, title, prefix, bucketName) => {
  // eslint-disable-next-line no-restricted-globals
  return confirm(
    `Really Save:\n${title}\n${value.slice(
      0,
      Math.max(value.length, 50)
    )}\nin ${bucketName} with prefix ${prefix}`
  );
};

export default function App() {
  const [value, setValue] = React.useState(". . . ");
  const [title, setTitle] = React.useState("More incredible insight");
  const [bucketName, setBucketName] = React.useState("bucket");
  const [prefix, setPrefix] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState("write");
  return (
    <div className="container">
      <h1>Blog Writer</h1>
      <hr />
      <div className="input-blocks">
        <div className="input-block">
          <label className="label">Title</label>
          <input
            className="input"
            type="text"
            label="title"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
      </div>
      <ReactMde
        value={value}
        onChange={setValue}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={markdown =>
          Promise.resolve(converter.makeHtml(markdown))
        }
      />
      <div className="input-block">
        <label className="label">Bucket</label>
        <input
          className="input"
          type="text"
          label="title"
          value={bucketName}
          onChange={({ target }) => setBucketName(target.value)}
        />
      </div>
      <div className="input-block">
        <label className="label">Prefix</label>
        <input
          className="input"
          type="text"
          label="prefix"
          value={prefix}
          onChange={({ target }) => setPrefix(target.value)}
        />
      </div>
      <button
        onClick={() =>
          confirmSave(value, title, prefix, bucketName) &&
          saveToS3(value, title, prefix, bucketName)
        }
      >
        Save to S3
      </button>
    </div>
  );
}
