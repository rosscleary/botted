import React, { useEffect, useState } from "react";
import axios from "axios";
import useToken from "../../useToken";
import { Version } from "../../../../backend/src/models/version.model";
import "./SubmitBot.css";
import {
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

interface leaderboardProps {
  name: string;
}

const SubmitBot = ({ name }: leaderboardProps) => {
  const [code, setCode] = useState("");
  const [botName, setBotName] = useState("");
  const [botCode, setBotCode] = useState<Version[]>();
  const { getToken } = useToken();

  useEffect(() => {
    const setBotCodeValue = async () => {
      await axios
        .post("http://localhost:3001/api/game/getGameBotVersionsByUserId", {
          gameName: name,
          userId: getToken(),
        })
        .then(function (response) {
          setBotCode(response.data.versions);
          setCode(response.data.versions[0].sourceCode);
        })
        .catch(function () {
          return "Failed get leaderboard";
        });
    };

    setBotCodeValue();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("Submitted");
    e.preventDefault();

    let botId = "";
    if (!botCode) {
      await axios
        .post("http://localhost:3001/api/game/createGameBot", {
          botName: botName,
          userId: getToken(),
          gameName: name,
        })
        .then(function (response) {
          botId = response.data.bot._id;
        })
        .catch(function () {
          return "Failed new bot";
        });
    } else {
      await axios
        .post("http://localhost:3001/api/game/getGameBotByUserId", {
          gameName: name,
          userId: getToken(),
        })
        .then(function (response) {
          botId = response.data.bot._id;
        })
        .catch(function () {
          return "Failed to find bot";
        });
    }

    console.log("Id is " + botId);
    await axios
      .post("http://localhost:3001/api/game/updateGameBot/tictactoe", {
        botId: botId,
        language: "c++",
        sourceCode: code,
      })
      .catch(function () {
        return "Failed to update bot";
      });
  };

  const [version, setVersion] = useState("1");

  const handleChange = (event: SelectChangeEvent) => {
    setVersion(event.target.value as string);
    //setCode(botCode[0].sourceCode);
  };

  return (
    <form id="submitForm" onSubmit={handleSubmit}>
        <FormControl size="small" sx={{ minWidth: 100 }} id="versionSelect">
          <InputLabel>Version</InputLabel>
          <Select labelId="versionLabel" label="Version" value={version} onChange={handleChange}>
            <MenuItem value={"1"}>{botName} 1.0</MenuItem>
            <MenuItem value={"2"}>{botName} 2.0</MenuItem>
            <MenuItem value={"3"}>{botName} 3.0</MenuItem>
          </Select>
        </FormControl>
      <div id="textArea">
        <textarea
          id="textField"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Type code here..."
        ></textarea>
        {!botCode && (
          <textarea
            id="textField"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            placeholder="This is you first submission, give your bot a name."
          ></textarea>
        )}
      </div>
      <Button id="submitButton" variant="contained" type="submit">
        {botCode ? "Update Bot" : "Submit Bot"}
      </Button>
    </form>
  );
};

export default SubmitBot;
