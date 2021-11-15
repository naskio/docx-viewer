import docx from 'docx';

const {TextRun, Paragraph, Document} = docx;

const doc = new Document({
    sections: [{
        properties: {},
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Hello",
                        italics: true,
                    }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "World !",
                        bold: true,
                    }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "1",
                        italics: true,
                        bold: true,
                        size: 32,
                    }),
                ],
            }),
        ],
    }],
});

export default doc;
