import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import CustomDialog from "./components/CustomDialog";
import socket from "./socket";


// Define types for the props
interface GameProps {
  players: { id: string; username: string }[]; // Assuming this structure for players
  room: string;
  orientation: 'white' | 'black';
  cleanup: () => void;
}

const Game: React.FC<GameProps> = ({ players, room, orientation, cleanup }) => {

  /*  useMemo хук позволяет нам кэшировать экземпляр шахмат между повторными
      рендерингами, чтобы экземпляр не создавался при каждом повторном
      рендеринге. Этот Chess экземпляр будет использоваться для проверки и
      генерации перемещения.
   */
  const chess = useMemo(() => new Chess(), []);

  /*
      устанавливаем начальное fen состояние в FEN (нотация Форсайта-
      Эдвардса), возвращаемое из Chess экземпляра. FEN — это стандартная
      система обозначений для описания позиций в шахматной игре.
   */
  const [fen, setFen] = useState<string>(chess.fen());


  const [over, setOver] = useState<string>('');

  /*
      Мы создали makeAMove функцию, используя useCallback перехватчик chess в
      качестве зависимости, чтобы кэшировать определение функции между
      повторными рендерингами и избежать создания функции при каждом
      повторном рендеринге.
      Функция makeAMove принимает перемещение и вызывает chess.move объект
      move с аргументом. Этот метод ( .move ) проверяет перемещение и обновляет
      Chess внутреннее состояние экземпляра. Затем мы устанавливаем состояние
      Game компонента fen , отражающее состояние экземпляра Chess . Это
      запускает повторный рендеринг и обновляет шахматную доску.
      После того, как ход сделан, мы проверяем, привел ли он к окончанию игры.
      Если это правда, мы определяем, произошло ли это из-за мата или ничьей, и
      соответствующим образом обновляем состояние игры соответствующим
      сообщением.
      Тело makeAMove функции заключено в блок try…catch, поскольку вызов
      chess.move с недопустимым объектом перемещения приводит к ошибке. Когда
      возникает ошибка, мы просто возвращаем null . Возвращаемое значение null
      обрабатывается в onDrop функции, как обсуждалось ранее.
  
   */

  const makeAMove = useCallback(
    (move: any) => {
      try {
        const result = chess.move(move); // update Chess instance
        setFen(chess.fen()); // update fen state to trigger a re-render

        console.log("over, checkmate", chess.isGameOver(), chess.isCheckmate());

        if (chess.isGameOver()) { // check if move led to "game over"
          if (chess.isCheckmate()) { // if reason for game over is a checkmate
            // Set message to checkmate. 
            setOver(
              `Checkmate! ${chess.turn() === "w" ? "black" : "white"} wins!`
            );
            // The winner is determined by checking for which side made the last move
          } else if (chess.isDraw()) { // if it is a draw
            setOver("Draw"); // set message to "Draw"
          } else {
            setOver("Game over");
          }
        }

        return result;
      } catch (e) {
        return null;
      } // null if the move was illegal, the move object if the move was legal
    },
    [chess]
  );

  // onDrop function

  /*
    В приведенном выше коде мы создали функцию onDrop , которая получает два
    параметра функции sourceSquare (начальное положение фигуры) и
    targetSquare (целевое положение). Внутри функции мы создали moveData объект,
    используя sourceSquare , targetSquare и color , которому присвоено значение
    chess.turn() ( chess.turn() возвращает цвет текущей стороны, установленной для
    воспроизведения, либо , 'b' либо 'w' ). Затем мы вызываем makeAMove (пока не
    определено). Эта функция передаст moveData экземпляру Chess для проверки и
    генерации. Мы возвращаем true или false в зависимости от возвращаемого
    значения makeAMove .
  */
  function onDrop(sourceSquare: string, targetSquare: string) {
    // orientation is either 'white' or 'black'. game.turn() returns 'w' or 'b'
    if (chess.turn() !== orientation[0]) return false; // <- 1 prohibit player from moving piece of other player

    if (players.length < 2) return false; // <- 2 disallow a move if the opponent has not joined

    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      promotion: "q", // promote to queen where possible
    };

    const move = makeAMove(moveData);

    // illegal move
    if (move === null) return false;

    socket.emit("move", { // <- 3 emit a move event.
      move,
      room,
    }); // this event will be transmitted to the opponent via the server

    return true;
  }

  useEffect(() => {
    socket.on("move", (move) => {
      makeAMove(move); //
    });
  }, [makeAMove]);


  useEffect(() => {
    socket.on('playerDisconnected', (player) => {
      setOver(`${player.username} has disconnected`); // set game over
    });
  }, []);

  useEffect(() => {
    socket.on('closeRoom', ({ roomId }) => {
      console.log('closeRoom', roomId, room)
      if (roomId === room) {
        cleanup();
      }
    });
  }, [room, cleanup]);

  // Game component returned jsx
  return (
    <Stack>
      <Card>
        <CardContent>
          <Typography variant="h5">Room ID: {room}</Typography>
        </CardContent>
      </Card>
      <Stack flexDirection="row" sx={{ pt: 2 }}>
        <div className="board" style={{
          maxWidth: 600,
          maxHeight: 600,
          flexGrow: 1,
        }}>
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            boardOrientation={orientation}
          />
        </div>
        {players.length > 0 && (
          <Box>
            <List>
              <ListSubheader>Players</ListSubheader>
              {players.map((p) => (
                <ListItem key={p.id}>
                  <ListItemText primary={p.username} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Stack>
      <CustomDialog // Game Over CustomDialog
        open={Boolean(over)}
        title={over}
        contentText={over}
        handleContinue={() => {
          socket.emit("closeRoom", { roomId: room });
          cleanup();
        }}
      />
    </Stack>
  );
}

export default Game;

/*
4. Мы настроили шахматную доску, используя Chessboard компонент from, react-
chessboard и передали обозначение FEN ( fen ) в position свойство, а также
передали onDrop функцию в onPieceDrop prop . Функция onPieceDrop prop
вызывается каждый раз, когда перемещается фигура.
5. Мы создали компонент диалога, который будет отображаться, когда
состояние over истинно. over будет содержать текст, описывающий причину
окончания игры. Это может быть мат или пат/ничья
*/