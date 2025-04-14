import { useEffect } from "react";
import { io } from "socket.io-client";

// Tạo kết nối tới server Socket.IO
const socket = io("http://localhost:8080");

const useSocket = (roomId) => {
  useEffect(() => {
    socket.on("playerJoined", (room) => {
      console.log(`Player joined room: ${roomId}`, room);
      // Cập nhật UI với trạng thái người chơi mới
    });

    socket.on("gameStarted", (room) => {
      console.log(`Game started in room: ${roomId}`, room);
      // Cập nhật UI khi trò chơi bắt đầu
    });

    socket.on("playerLeft", (room) => {
      console.log(`Player left room: ${roomId}`, room);
      // Cập nhật UI khi có người chơi rời phòng
    });

    socket.on("roomDeleted", (roomId) => {
      console.log(`Room ${roomId} has been deleted.`);
      // Xử lý khi phòng bị xóa
    });

    socket.on("error", (message) => {
      console.error(message);
      alert(message); // Hiển thị thông báo lỗi
    });

    return () => {
      socket.off("playerJoined");
      socket.off("gameStarted");
      socket.off("playerLeft");
      socket.off("roomDeleted");
      socket.off("error");
    };
  }, [roomId]);
};

export default useSocket;
