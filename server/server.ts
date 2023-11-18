// import express, { Express } from 'express';
// import { Server, Socket } from 'socket.io';
// import { createServer, Server as HTTPServer } from 'http';
// import { v4 as uuidV4 } from 'uuid';

// const app: Express = express(); // Initialize Express

// const server: HTTPServer = createServer(app);

// // Set port to value received from environment variable or 8080 if null
// const port: string | number = process.env.PORT || 8080 

// // Upgrade HTTP server to WebSocket server
// const io = new Server(server, {
//   cors: {
//     origin: '*', // Allow connection from any origin
//   },
// });

// interface Player {
//   id: string;
//   username: string | undefined;
// }

// interface Room {
//   roomId: string;
//   players: Player[];
// }

// const rooms = new Map<string, Room>();

// // io.connection
// io.on('connection', (socket: Socket) => {
//   console.log(socket.id, 'connected');

//   socket.on('username', (username: string) => {
//     console.log('username:', username);
//     socket.data.username = username;
//   });

//   socket.on('createRoom', async (callback: (roomId: string) => void) => {
//     const roomId = uuidV4();
//     await socket.join(roomId);
	 
//     rooms.set(roomId, {
//       roomId,
//       players: [{ id: socket.id, username: socket.data.username }]
//     });

//     callback(roomId);
//   });

//   socket.on('joinRoom', async (args: { roomId: string }, callback: (response: Room | { error: boolean; message: string }) => void) => {
//     const room = rooms.get(args.roomId);
//     let error: boolean | undefined, message: string | undefined;
  
//     if (!room) {
//       error = true;
//       message = 'Room does not exist';
//     } else if (room.players.length >= 2) {
//       error = true;
//       message = 'Room is full';
//     }

//     if (error) {
//       if (callback) {
//         callback({ error, message });
//       }
//       return;
//     }

//     await socket.join(args.roomId);

//     const roomUpdate: Room = {
//       ...room,
//       players: [...room.players, { id: socket.id, username: socket.data.username }],
//     };

//     rooms.set(args.roomId, roomUpdate);

//     callback(roomUpdate);

//     socket.to(args.roomId).emit('opponentJoined', roomUpdate);
//   });

//   // ... Rest of the socket events and server listening
// });

// server.listen(port, () => {
//   console.log(`Listening on *:${port}`);
// });
