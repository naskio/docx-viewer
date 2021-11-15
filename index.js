import express from 'express';
import path from "path";
import ejs from 'ejs';
import assert from "assert";
import dotenv from 'dotenv';
import * as fs from "fs";
import docx from 'docx';
import * as http from "http";
import {Server} from "socket.io";
import chokidar from 'chokidar';
// import debounce from 'lodash.debounce';

const debounce = (x) => x;

// loading environment variables
dotenv.config();

// constants
const PORT = 3000;
const GENERATED_FILENAME = process.env.GENERATED_FILENAME || "output.docx";
const PUBLIC_URL = process.env.PUBLIC_URL;
const DEBOUNCE_TIME = process.env.DEBOUNCE_TIME || 250;
const NODE_ENV = process.env.NODE_ENV || "development";
const VIEWER = process.env.VIEWER || "MICROSOFT";
const __dirname = path.resolve();
const BUILD_DIR = path.join(__dirname, 'docx-build');
const SRC_DIR = path.join(__dirname, 'docx-src');

if (NODE_ENV === "production") {
    console.log = () => {
    };
}

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

// watching source.js file and generating docx file
const watcher_src = chokidar.watch(`${SRC_DIR}`);
watcher_src.on('change', debounce(async (_path) => {
    try {
        console.log(`File source.js has been changed`);
        const doc_sample = await import(`./docx-src/source.js?version=${new Date()}`);
        // write to file
        const buffer = await Packer.toBuffer(doc_sample.default);
        fs.writeFileSync(path.join(BUILD_DIR, GENERATED_FILENAME), buffer);
        console.log(GENERATED_FILENAME, "has been generated");
    } catch (err) {
        console.error("Error while generating file", GENERATED_FILENAME, err.message);
    }
}, DEBOUNCE_TIME, {
    leading: false,
    trailing: true,
}));


// listening to docx file changes and emit reload event
const watcher_build = chokidar.watch(`${BUILD_DIR}/${GENERATED_FILENAME}`);
watcher_build.on('change', debounce((_path) => {
    console.log(`File ${GENERATED_FILENAME} has been changed`);
    io.sockets.emit('reload'); // emit reload event to clients
    console.log(`reload event sent at`, new Date());
}, DEBOUNCE_TIME, {
    leading: false,
    trailing: true,
}));

// serving index.html to view the generated docx file
app.engine('html', ejs.renderFile);
app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'public', 'index.html'), {
        PUBLIC_URL: PUBLIC_URL,
        GENERATED_FILENAME: GENERATED_FILENAME,
        NODE_ENV: NODE_ENV,
        DEBOUNCE_TIME: DEBOUNCE_TIME,
        VIEWER: VIEWER,
    });
})

// serving docx files
app.use('/static', express.static(BUILD_DIR));
// serving assets
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
// serving socket.io client
app.use('/socket.io.local', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));

// starting server
server.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`)
})
