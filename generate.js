import path from "path";
import dotenv from "dotenv";
import * as fs from "fs";
import docx from 'docx';
import doc_sample from './docx-src/sample.js';

const {Packer} = docx;


const __dirname = path.resolve();


// loading environment variables
dotenv.config();

const GENERATED_FILENAME = process.env.GENERATED_FILENAME || "sample.docx";
const BUILD_DIR = path.join(__dirname, 'docx-build');

// generating docx file
Packer.toBuffer(doc_sample).then((buffer) => {
    // create build folder if not exists
    if (!fs.existsSync(BUILD_DIR)) {
        fs.mkdirSync(BUILD_DIR);
    }
    // write to file
    fs.writeFileSync(path.join(BUILD_DIR, GENERATED_FILENAME), buffer);
}).then(() => {
    console.log("Generated file: " + GENERATED_FILENAME);
    process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
