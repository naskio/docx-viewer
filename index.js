import express from 'express';
import path from "path";
import ejs from 'ejs';
import assert from "assert";
import dotenv from 'dotenv';
import * as fs from "fs";
import docx from 'docx';
import chokidar from 'chokidar';
import * as http from "http";
import {Server} from "socket.io";


// loading environment variables
dotenv.config();

// constants
const PORT = 3000;
const GENERATED_FILENAME = process.env.GENERATED_FILENAME || "output.docx";
const PUBLIC_URL = process.env.PUBLIC_URL;
const __dirname = path.resolve();
const BUILD_DIR = path.join(__dirname, 'docx-build');

assert(PUBLIC_URL, "PUBLIC_URL is not defined, please configure the .env file");
// create build folder if not exists
if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR);
    console.log("Created build folder /docx-build");
}

// create server and socket.io
const app = express()
const server = http.createServer(app);
const io = new Server(server);
const {Packer} = docx;

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// live reload server, listening to docx file changes
// const watcher = chokidar.watch(`${BUILD_DIR}/*.(doc|docx)`);
const watcher_build = chokidar.watch(`${BUILD_DIR}/${GENERATED_FILENAME}`, {
    persistent: true,
    awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
    },
});
watcher_build.on('change', (_path) => {
    console.log(`File ${_path} has been changed`);
    io.sockets.emit('reload'); // emit reload event to clients
    console.log(`reload event sent`);
});

// serving index.html to view the generated docx file
app.engine('html', ejs.renderFile);
app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'public', 'index.html'), {
        PUBLIC_URL: PUBLIC_URL,
        GENERATED_FILENAME: GENERATED_FILENAME,
    });
})

// watching source.js file and generating docx file
const watcher_src = chokidar.watch(`${path.join(__dirname, 'docx-src')}/source.js`, {
    awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
    },
    persistent: true,
});
watcher_src.on('change', async (_path) => {
    console.log(`File ${_path} has been changed`);
    const doc_sample = await import('./docx-src/source.js');
    // write to file
    Packer.toBuffer(doc_sample.default).then((buffer) => {
        fs.writeFileSync(path.join(BUILD_DIR, GENERATED_FILENAME), buffer);
    }).then(() => {
        console.log("Generated file:", GENERATED_FILENAME);
    }).catch((err) => {
        console.error("Error while generating file:", err);
    });
});


// serving docx files
app.use('/static', express.static(BUILD_DIR));
// serving socket.io client
app.use('/socket.io.local', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));

// starting server
server.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`)
})
