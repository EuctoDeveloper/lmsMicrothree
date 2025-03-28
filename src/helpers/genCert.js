import fs from 'fs';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
const __dirname = path.dirname(new URL(import.meta.url).pathname);
registerFont(path.join(__dirname, 'fonts', 'sans-serif.ttf'), { family: 'sans-serif' });
async function generateCertificate(data) {
    // Load the background image path
    const backgroundPath = path.join(__dirname, '/cert-back.png'); // Path to your background image
    
    // Create the canvas
    const width = 1200; // Width based on image dimensions
    const height = 800; // Height based on image dimensions
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Load background image
    const backgroundImage = await loadImage(backgroundPath);
    ctx.drawImage(backgroundImage, 0, 0, width, height);
    
    // Set text styles and positions based on the model
    ctx.textAlign = 'center';
    
    // Recipient's name
    ctx.font = 'bold 50px sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(data.name, width / 2, 320); // Adjust y-position based on model
    
    // Program name
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#F26529';
    
    // Break the text into multiple lines if it exceeds the max width
    const maxWidth = 650;
    const words = `${data.program}`.split(' ');
    let line = '';
    let y = 405; // Initial y-position

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, width / 2, y);
            line = words[n] + ' ';
            y += 40; // Move to next line
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, width / 2, y);
    
    // Date
    ctx.font = 'italic 28px monospace';
    // ctx.fillText(data.date, width / 2, 640); // Adjust y-position based on model
    
    // Save the certificate as an image
    // const outputPath = path.join(__dirname, 'certificate.png');
    return canvas.toBuffer('image/png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Certificate saved as ${outputPath}`);
    return outputPath;
}

export default generateCertificate;