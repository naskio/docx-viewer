import express from 'express';
import path from "path";
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';
import ejs from 'ejs';
import assert from "assert";
import dotenv from 'dotenv';
import fs from "fs";

// loading environment variables
dotenv.config();

// constants
const PORT = 3000;
const GENERATED_FILENAME = process.env.GENERATED_FILENAME || "sample.docx";
const PUBLIC_URL = process.env.PUBLIC_URL;
const RELOAD_INTERVAL = process.env.RELOAD_INTERVAL;
const __dirname = path.resolve();


assert(PUBLIC_URL, "PUBLIC_URL is not defined, please configure the .env file");

// live reload server, listening to docx file changes
const liveReloadServer = livereload.createServer({
    exts: ['doc', 'docx'],
});
if (!RELOAD_INTERVAL) {
    liveReloadServer.watch(path.join(__dirname, 'docx-build', GENERATED_FILENAME));
}

const app = express()
// injecting LiveReload client snippet
if (!RELOAD_INTERVAL) {
    app.use(connectLivereload({
        disableCompression: true,
    }));
}

// serving index.html to view the generated docx file
app.engine('html', ejs.renderFile);
app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'public', 'index.html'), {
        PUBLIC_URL: PUBLIC_URL,
        GENERATED_FILENAME: GENERATED_FILENAME,
        RELOAD_INTERVAL: RELOAD_INTERVAL
    });
})

// create build folder if not exists
const BUILD_DIR = path.join(__dirname, 'docx-build');
if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR);
}
// serving docx files
app.use('/static', express.static(BUILD_DIR));

// starting server
app.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`)
})
