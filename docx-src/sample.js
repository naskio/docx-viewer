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
        ],
    }],
});

export default doc;
