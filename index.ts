import Jimp from "Jimp";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

let app = express();
let server = http.createServer(app);
let io = new Server(server);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/vuejs", (req, res) => {
    res.sendFile(__dirname + "/vue.js");
});

io.on("connection", socket => {
    socket.on("make4x6", img => {
        Jimp.read(Buffer.from(img), (err, bimg) => {
            if (err) {
                socket.emit("serverror", err);
                throw err;
            }
            let canvas = new Jimp(384, 576, "white", (err, cimg) => {
                if (err) throw err;
                // Make 4 2x2 of the bimg in the canvas 
                canvas.blit(bimg.resize(192, 192), 0, 0)
                .blit(bimg.resize(192, 192), 192, 0)
                .blit(bimg.resize(192, 192), 0, 192)
                .blit(bimg.resize(192, 192), 192, 192)
                // Make the first 1x1 row under the 2x2
                .blit(bimg.resize(96, 96), 0, 384)
                .blit(bimg.resize(96, 96), 96, 384)
                .blit(bimg.resize(96, 96), 192, 384)
                .blit(bimg.resize(96, 96), 288, 384)
                // Make the second 1x1 row under the first 1x1 row
                .blit(bimg.resize(96, 96), 0, 480)
                .blit(bimg.resize(96, 96), 96, 480)
                .blit(bimg.resize(96, 96), 192, 480)
                .blit(bimg.resize(96, 96), 288, 480)
                // Write changes to file
                canvas.getBuffer(Jimp.MIME_JPEG, (err, buf) => {
                    if (err) {
                        socket.emit("serverror", err);
                        throw err;
                    }
                    socket.emit("4x6img", Uint8Array.from(buf));
                });
            });
        });
    });
});

server.listen(1010);