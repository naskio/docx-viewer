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


// generating docx file
Packer.toBuffer(doc_sample).then((buffer) => {
    fs.writeFileSync(path.join(__dirname, 'docx-build', GENERATED_FILENAME), buffer);
}).then(() => {
    console.log("Generated file: " + GENERATED_FILENAME);
    process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
