import * as React from "react";
import ReactMde from "react-mde";
import * as Showdown from "showdown";
import "./App.css";
import "react-mde/lib/styles/css/react-mde-all.css";
import axios from "axios";

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = value => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

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

const ConfigInput = props => {
  const { value, onChange, label } = props;
  const ref = React.useRef();
  return (
    <div className="input-block" onClick={() => ref && ref.current.focus()}>
      <label className="label">{label}</label>
      <input
        ref={ref}
        className="input"
        type="text"
        value={value}
        onChange={({ target }) => onChange(target.value)}
      />
    </div>
  );
};

export default function App() {
  const [value, setValue] = React.useState(". . . ");
  const [title, setTitle] = React.useState("More incredible insight");
  const [bucketName, setBucketName] = useLocalStorage("bucket-name");
  const [prefix, setPrefix] = useLocalStorage("prefix");
  const [selectedTab, setSelectedTab] = React.useState("write");
  return (
    <div className="container">
      <h1>Blog Writer</h1>
      <hr />
      <div className="input-blocks">
        <ConfigInput onChange={setTitle} label="Title" value={title} />
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
      <ConfigInput label="Bucket" value={bucketName} onChange={setBucketName} />
      <ConfigInput label="Prefix" value={prefix} onChange={setPrefix} />
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
