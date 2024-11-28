import Message from '../models/Message.js';

export default function setupChatHandlers(io) {
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
    }

    socket.on('private message', async (data) => {
      try {
        const message = new Message({
          sender: socket.userId,
          receiver: data.receiver,
          content: data.content
        });
        await message.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username profilePic')
          .populate('receiver', 'username profilePic');

        // Send to receiver if online
        const receiverSocketId = connectedUsers.get(data.receiver);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('private message', populatedMessage);
        }

        // Send back to sender
        socket.emit('message sent', populatedMessage);
      } catch (error) {
        console.error('Message handling error:', error);
        socket.emit('message error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }
    });
  });
}