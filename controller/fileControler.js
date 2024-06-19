const docxConverter = require('docx-pdf');
const path = require('path')
const fs = require('fs')
const PDFDocument = require('pdfkit');
const convert = require('heic-convert');
const sharp = require('sharp');
const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');
let csvToJson = require('convert-csv-to-json');
let JsontoCsv = require('json-2-csv');
const XLSX = require('xlsx')
const { convertCsvToXlsx } = require('@aternus/csv-to-xlsx');
const sizeOf = require('image-size');



exports.ConverterFile = async (req, res, next) => {
    console.log("resq", req.file)
    if (!req.file) {
        return res.status(500).json({ message: 'File is not provided' });
    }
    const supportedFormats = {
        pdf: 'pdf',
        docx: 'docx',
        odt: 'odt',
        txt: 'txt',
        jpg: 'jpg',
        jpeg: 'jpeg',
        png: 'png',
        heic: 'heic',
        heif: 'heif',
        webp: 'webp',
        gif: 'gif',
        csv: 'csv',
        json: 'json',
        xlsx: 'xlsx'

        // Add more supported formats here as needed
    };

    const format = req.body.format
    console.log("format is ", format)
    // for libre office use only format here

    if (!format) {
        return res.status(400).json({ message: 'No target format specified' });
    }


    const filePath = req.file.path
    const fileExtension = path.extname(req.file.originalname).toLowerCase().slice(1);
    const outputDirectory = path.join(__dirname, '..', 'uploads');
    console.log("outputDirectory is ", outputDirectory)
    const outputFilePath = path.join(outputDirectory, `${path.parse(filePath).name}.${format}`);
    console.log("outputFilePath", outputFilePath)

    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    if (!supportedFormats[fileExtension]) {
        return res.status(400).json({ message: 'Unsupported file format' });

        // word to pdf 
    } else if (fileExtension === 'docx' && format === 'pdf') {

        docxConverter(filePath, outputFilePath, function (err, result) {
            if (err) {
                res.status(500).json({
                    message: 'file is not converted'
                })
            }
            res.status(201).json({
                message: 'file converted successfully'
            })
        });

        // image to pdf 

    } else if ((fileExtension === 'jpeg' || 'jpg' || 'png') && format === 'pdf') {
        try {
            console.log("image to pdf")

            const dimensions = sizeOf(filePath);

            const doc = new PDFDocument({ size: 'A4' });
            const writeStream = fs.createWriteStream(outputFilePath);
            doc.pipe(writeStream);

            doc.image(filePath, { fit: [dimensions.height, dimensions.width], align: 'center', valign: 'center' })

            doc.end()

            writeStream.on('finish', () => {
                res.status(200).json({
                    message: 'converted done'
                })
                // Serve the file for download
                // res.download(outputFilePath, 'output.pdf', (err) => {
                //     if (err) {
                //         console.error('Error downloading file:', err);
                //         return;
                //     }
                //     console.log('File downloaded successfully');
                //     // Uncomment the line below if you want to delete the file after download
                //     // fs.unlinkSync(outputFilePath);
                // });
            });

        } catch (error) {
            res.status(500).json({
                message: 'An error occured to convert '
            })
        }

        // heic to jpeg or png 
    } else if ((fileExtension === 'heic') && (format === 'png' || 'jpeg')) {
        console.log("heic  to png ")
        try {
            const inputBuffer = fs.readFileSync(filePath);
            // Convert the HEIC data to JPEG
            if (format === 'jpeg') {
                const outputBuffer = await convert({
                    buffer: inputBuffer, // the HEIC file buffer
                    format: 'JPEG',      // output format
                    quality: 1           // the jpeg compression quality, between 0 and 1
                });
                // Save the converted data to a JPEG file
                fs.writeFileSync(outputFilePath, outputBuffer);
                res.status(200).json({
                    message: 'converted done'
                })
            } else {
                const outputBuffer = await convert({
                    buffer: inputBuffer, // the HEIC file buffer
                    format: 'PNG'        // output format
                });
                // Save the converted data to a JPEG file
                fs.writeFileSync(outputFilePath, outputBuffer);
                res.status(200).json({
                    message: 'converted done'
                })
            }
        } catch (error) {
            console.error('Error converting file:', error);
        }

        // png to jpeg or vice versa
    } else if ((fileExtension === 'jpeg' || fileExtension === 'jpg' || fileExtension === 'png' || fileExtension === 'webp') && (format === 'png' || format === 'jpeg' || format === 'gif' || format === 'webp')) {
        try {
            console.log('images convert')
            if (format === 'gif') {
                try {
                    const image = await loadImage(filePath);
                    const width = image.width;
                    const height = image.height;
                    const canvas = createCanvas(width, height);
                    const ctx = canvas.getContext('2d');

                    const encoder = new GIFEncoder(width, height);
                    const outputFilePath = path.join('uploads', 'result.gif');
                    encoder.createReadStream().pipe(fs.createWriteStream(outputFilePath));

                    encoder.start();
                    encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
                    encoder.setDelay(1000); // frame delay in ms
                    encoder.setQuality(10); // image quality, 10 is default

                    // Draw the image onto the canvas
                    ctx.drawImage(image, 0, 0, width, height);
                    encoder.addFrame(ctx);
                    encoder.finish();

                    res.status(200).json({
                        message: 'GIF Generated!',
                        convertedFilePath: outputFilePath
                    });
                } catch (error) {
                    console.error('Error converting file:', error);
                    res.status(500).json({ message: 'Error converting file', error: error.message });
                }
            }

            else {
                await sharp(filePath)
                    .toFormat(format)
                    .toFile(outputFilePath);

                res.status(200).json({
                    message: 'File converted successfully',
                    convertedFilePath: outputFilePath
                });

            }

        } catch (error) {
            console.error('Error converting file:', error);
            res.status(500).json({ message: 'Error converting file', error: error.message });
        }
    }

    // csv to json
    else if ((fileExtension === 'csv' && format === 'json')) {
        try {
            if (filePath) {
                let result = csvToJson.fieldDelimiter(',')
                    .formatValueByType()
                    .parseSubArray("*", ',')
                    .supportQuotedField(true)
                    .getJsonFromCsv(filePath);
                if (result) {
                    // Stringify the JSON result
                    const jsonString = JSON.stringify(result, null, 2); // Pretty print with 2 spaces indentation

                    // Write the JSON string to a file
                    fs.writeFileSync(outputFilePath, jsonString);

                    // Respond with the success message and the path to the converted file
                    res.status(200).json({
                        message: 'File converted successfully',
                        convertedFilePath: outputFilePath
                    });
                } else {
                    res.status(500).json({
                        message: 'File don not converted successfully',
                        convertedFilePath: outputFilePath
                    });
                }
            }
        } catch (error) {
            console.log("error in generate csv ", error)
            res.status(500).json({
                message: 'Not converted '
            })
        }
    } else if ((fileExtension === 'json' && format === 'csv')) {
        ;
        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading JSON file:', err);
                return;
            }
            try {

                const jsonData = JSON.parse(data);

                // Convert JSON to CSV
                const csv = JsontoCsv.json2csv(jsonData);

                // Save the CSV to a file
                fs.writeFile(outputFilePath, csv, (err) => {
                    if (err) {
                        console.error('Error saving CSV file:', err);
                        return;
                    }
                    console.log('CSV file saved successfully');
                });
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        });
    } else if (fileExtension === 'xlsx' && format === 'csv') {
        try {
            const workbook = XLSX.readFile(filePath);
            // Iterate over each sheet
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const csv = XLSX.utils.sheet_to_csv(worksheet);

                // Write the CSV to a file
                fs.writeFileSync(outputFilePath, csv);
            });

            res.status(200).json({
                message: 'convertion done '
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: ' Error in converting '
            })
        }
    } else if (fileExtension === 'csv' && format === 'xlsx') {
        try {
            convertCsvToXlsx(filePath, outputFilePath);
            res.status(200).json({
                message: 'Converted done'
            })
        } catch (e) {
            console.error(e.toString());
            res.status(500).json({
                message: 'csv to excel is not converted'
            })
        }
    }

}
