const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080;
const path = require('path')

const multer = require('multer')
const bodyparser = require('body-parser')


const allowedMimeTypes = require('./utils/fileType')
const fileroutes = require('./routes/FileRoutes')

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Converted')
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, fileExtension);
        const timestamp = new Date().toISOString().replace(/:/g, "-");
        cb(null, `${timestamp}-${baseName}${fileExtension}`);
    }
})

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}



app.use(multer({ storage: storage, fileFilter: fileFilter }).single('file'))

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        res.status(500).json({ message: 'A Multer error occurred', error: err.message });
    } else {
        // An unknown error occurred.
        res.status(500).json({ message: 'An unknown error occurred', error: err.message });
    }
});


app.use(fileroutes)


app.listen(PORT, () => console.log(` app listening on port ${PORT}!`))