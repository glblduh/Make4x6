import Jimp from "jimp";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

let app = express();
let server = http.createServer(app);
let io = new Server(server, {maxHttpBufferSize: 1e+7});

// User vars
let canvasx = 384;
let canvasy = 576;
let twobytwosize = 192;
let onebyonesize = 96;


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/vuejs", (req, res) => {
    res.sendFile(__dirname + "/vue.js");
});

io.on("connection", socket => {
    socket.on("make4x6", (img, twoamount, oneamount) => {
        let maxx = 0, maxy = 0, unevenmargin = 0;
        Jimp.read(Buffer.from(img), (err, bimg) => {
            if (err) {
                socket.emit("serverror", err);
                throw err;
            }
            let canvas = new Jimp(canvasx, canvasy, "white", (err, cimg) => {
                if (err) throw err;
                // Making all of 2x2
                for (let i=0;i<twoamount;i++) {
                    if (maxx <= canvasx) {
                        canvas.blit(bimg.resize(twobytwosize, twobytwosize), maxx, maxy);
                        maxx += twobytwosize;
                    }
                    if (maxx >= canvasx) {
                        maxx = 0;
                        maxy += twobytwosize;
                    }
                    if (twoamount % 2 != 0) {
                        unevenmargin = twobytwosize;
                    }
                }
                for (let i=0;i<oneamount;i++) {
                    if (maxx <= canvasx) {
                        canvas.blit(bimg.resize(onebyonesize, onebyonesize), maxx, maxy);
                        maxx += onebyonesize;
                    }
                    if (maxx >= canvasx) {
                        if (unevenmargin != 0) {
                            maxx = unevenmargin;
                            unevenmargin = 0;
                        } else {
                            maxx = 0;
                        }
                        maxy += onebyonesize;
                    }
                }
                /*
                // Make 4 2x2 of the bimg in the canvas 
                canvas.blit(bimg.resize(192, 192), 0, 0)
                canvas.blit(bimg.resize(192, 192), 192, 0)
                canvas.blit(bimg.resize(192, 192), 0, 192)
                canvas.blit(bimg.resize(192, 192), 192, 192)
                // Make the first 1x1 row under the 2x2
                canvas.blit(bimg.resize(96, 96), 0, 384)
                canvas.blit(bimg.resize(96, 96), 96, 384)
                canvas.blit(bimg.resize(96, 96), 192, 384)
                canvas.blit(bimg.resize(96, 96), 288, 384)
                // Make the second 1x1 row under the first 1x1 row
                canvas.blit(bimg.resize(96, 96), 0, 480)
                canvas.blit(bimg.resize(96, 96), 96, 480)
                canvas.blit(bimg.resize(96, 96), 192, 480)
                canvas.blit(bimg.resize(96, 96), 288, 480)
                */
                // Write changes to file
                canvas.getBuffer(Jimp.MIME_JPEG, (err, buf) => {
                    if (err) {
                        socket.emit("serverror", err);
                        throw err;
                    }
                    socket.emit("4x6img", Buffer.from(buf));
                });
            });
        });
    });
});

server.listen(1010, () => {
    console.log("Serving on http://0.0.0.0:1010");
});