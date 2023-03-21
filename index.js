const express = require('express');
const app = express();
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="files" multiple />
            <button type="submit">Upload</button>
        </form>
      </body>
    </html>
  `);
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './transfer');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

app.post('/upload', upload.array('files', 10), (req, res) => {
  const files = req.files;

  const sheet1 = xlsx.readFile(files[0].path); //.Sheets['Sheet1'];
  const sheet2 = xlsx.readFile(files[1].path); //.Sheets['Sheet2'];
  const data1 = xlsx.utils.sheet_to_json(sheet1.Sheets.Sheet1);
  const data2 = xlsx.utils.sheet_to_json(sheet2.Sheets.Sheet1);

  const joinedData = data1.map((datum1) => {
    const datum2 = data2.find((d) => d.phone === datum1.phone);
    return { ...datum1, ...datum2 };
  });
  res.setHeader('Content-disposition', 'attachment; filename=joinedData.csv');
  res.setHeader('Content-type', 'text/csv');
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(joinedData);

  xlsx.utils.book_append_sheet(workbook, worksheet, 'Data');

  const csv = xlsx.utils.sheet_to_csv(worksheet);
  res.send(csv);
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
