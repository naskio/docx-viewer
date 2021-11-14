const express = require('express')
const path = require('path')
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const ejs = require('ejs');
const assert = require("assert");

// loading environment variables
require('dotenv').config()

// constants
const PORT = 3000;
const GENERATED_FILENAME = process.env.NODE_ENV || "sample.docx";
const PUBLIC_URL = process.env.PUBLIC_URL;
const RELOAD_INTERVAL = process.env.RELOAD_INTERVAL || 2500;

assert(PUBLIC_URL, "PUBLIC_URL is not defined, please configure the .env file");

// live reload server, listening to docx file changes
const liveReloadServer = livereload.createServer({
    exts: ['doc', 'docx']
});
liveReloadServer.watch(path.join(__dirname, 'dont_listen_to_build', GENERATED_FILENAME));

const app = express()
// injecting LiveReload client snippet
app.use(connectLivereload());

// serving index.html to view the generated docx file
app.engine('html', ejs.renderFile);
app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'public', 'index.html'), {
        PUBLIC_URL: PUBLIC_URL,
        GENERATED_FILENAME: GENERATED_FILENAME,
        RELOAD_INTERVAL: RELOAD_INTERVAL
    });
})

// serving docx files
app.use('/static', express.static(path.join(__dirname, 'build')))

// starting server
app.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`)
})
