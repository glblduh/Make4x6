import Jimp from "jimp";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

let app = express();
let server = http.createServer(app);
let io = new Server(server, {maxHttpBufferSize: 1e+7});

// User vars
let twobytwosize = 192;
let onebyonesize = 96;


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/vuejs", (req, res) => {
    res.sendFile(__dirname + "/vue.js");
});

io.on("connection", socket => {
    socket.on("make4x6", (img, twoamount: number, oneamount: number, canvasx: number, canvasy: number, papersize: string) => {
        let maxx = 0, maxy = 0, unevenmargin = 0;
        Jimp.read(Buffer.from(img), (err, bimg) => {
            if (err) {
                socket.emit("serverror", err);
                throw err;
            }
            let canvas = new Jimp(canvasx, canvasy, "white", (err, cimg) => {
                if (err) throw err;
                if (papersize == "a4") {
                    canvasx = canvasx-26;
                }
                // Making all of 2x2
                for (let i=0;i<twoamount;i++) {
                    if (maxx <= canvasx) {
                        canvas.blit(bimg.resize(twobytwosize, twobytwosize), maxx, maxy);
                        maxx += twobytwosize;
                        if (twoamount % 2 != 0) {
                            unevenmargin += twobytwosize;
                        }
                    }
                    if (maxx >= canvasx) {
                        unevenmargin = 0;
                        maxx = 0;
                        maxy += twobytwosize;
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