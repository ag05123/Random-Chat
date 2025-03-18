const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Listening on port ${PORT}`));

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});
let users = {}; 

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    
    socket.on('register', (username) => {
        users[username] = socket.id;
        socket.username = username;
        io.emit('userList', Object.keys(users)); 
    });

 
    socket.on('message', (msg) => {
        if (msg.recipient === "all") {
          
            socket.broadcast.emit('message', msg);
        } else {
            let recipientSocketId = users[msg.recipient];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('message', msg); 
                io.to(socket.id).emit('message', msg); 
            }
        }
    });

  
    socket.on('disconnect', () => {
        delete users[socket.username];
        io.emit('userList', Object.keys(users)); 
        console.log('User disconnected:', socket.username);
    });
});
