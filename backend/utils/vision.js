const vision = require('@google-cloud/vision');
let client;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  // Render environment (JSON string)
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  client = new vision.ImageAnnotatorClient({ credentials });
} else {
  // Local environment (file on disk)
  client = new vision.ImageAnnotatorClient({ keyFilename: 'google-vision.json' });
}

module.exports = async function detectLabels(base64Image) {
  const [result] = await client.labelDetection({
    image: { content: base64Image }
  });
  return result.labelAnnotations.map(label => label.description);
};