const express = require('express');
const fileUpload = require('express-fileupload');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(fileUpload());
app.use(express.static('public'));

app.post('/upload', (req, res) => {
    let videoFile = req.files.video;
    let uploadPath = path.join(__dirname, 'uploads', videoFile.name);
    
    videoFile.mv(uploadPath, (err) => {
        if (err) return res.status(500).send(err);
        
        let outputDir = path.join(__dirname, 'uploads');
        splitVideo(uploadPath, outputDir, (err) => {
            if (err) return res.status(500).send(err);
            res.send('Video uploaded and processed successfully!');
        });
    });
});

function splitVideo(filePath, outputDir, callback) {
    exec(`ffmpeg -i ${filePath} -t 00:01:00 -c copy ${path.join(outputDir, 'video_part1.mp4')}`, (err, stdout, stderr) => {
        if (err) return callback(err);
        exec(`ffmpeg -i ${filePath} -ss 00:01:00 -c copy ${path.join(outputDir, 'video_part2.mp4')}`, (err, stdout, stderr) => {
            if (err) return callback(err);
            callback(null);
        });
    });
}

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
