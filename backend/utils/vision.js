const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient({
  keyFilename: 'google-vision.json'
});

async function detectLabels(base64Image) {
  const [result] = await client.labelDetection({
    image: { content: base64Image }
  });
  return result.labelAnnotations.map(label => label.description);
}

module.exports = detectLabels;