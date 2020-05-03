export default function (scene) {
  const config = {
    custom: {
      families: ['biohazard', 'money'],
      urls: ['/assets/css/font_loader.css'],
    },
  };
  scene.load.rexWebFont(config);
  scene.load.on('webfontactive', (fileObj, familyName) => {
    console.log(`Font loaded: ${familyName}`);
  });
}
