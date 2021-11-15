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
                        size: 40,
                    }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "World !",
                        bold: true,
                        size: 40,
                    }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "v1",
                        italics: true,
                        bold: true,
                        size: 40,
                    }),
                ],
            }),
        ],
    }],
});

export default doc;
