import { useEffect, useState, useCallback } from "react";
import Container from "@mui/material/Container";
import Game from "./Game";
import InitGame from "./InitGame";
import CustomDialog from "./components/CustomDialog";
import socket from "./socket";
import { TextField } from "@mui/material";

interface Player {
  id: string;
  username: string
}

const App: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [usernameSubmitted, setUsernameSubmitted] = useState<boolean>(false);

  const [room, setRoom] = useState<string>("");
  //const [orientation, setOrientation] = useState("");
  const [orientation, setOrientation] = useState<"black" | "white">("white");
  const [players, setPlayers] = useState<Player[]>([]);

  // resets the states responsible for initializing a game
  const cleanup = useCallback(() => {
    setRoom("");
    setOrientation("white");
    setPlayers([]); // clear
  }, []);

  useEffect(() => {
    // const username = prompt("Username");
    // setUsername(username);
    // socket.emit("username", username);

    socket.on("opponentJoined", (roomData) => {
      console.log("roomData", roomData)
      setPlayers(roomData.players);
    });
  }, []);

  return (
    <Container>
      <CustomDialog
        open={!usernameSubmitted}

        //handleClose={() => setUsernameSubmitted(true)}
        title="Pick a username"
        contentText="Please select a username"
        handleContinue={() => {
          if (!username) return;
          socket.emit("username", username);
          setUsernameSubmitted(true);
        }}
      >
        <TextField
          autoFocus
          margin="dense"
          id="username"
          label="Username"
          name="username"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          fullWidth
          variant="standard"
        />
      </CustomDialog>
      {room ? (
        <Game
          room={room}
          orientation={orientation}
          // username={username}
          players={players}
          // the cleanup function will be used by Game to reset the state when a game is over
          cleanup={cleanup}
        />
      ) : (
        <InitGame
          setRoom={setRoom}
          setOrientation={setOrientation}
          setPlayers={setPlayers}
        />
      )}
    </Container>
  );
}

export default App;