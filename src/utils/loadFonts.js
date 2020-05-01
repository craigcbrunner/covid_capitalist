export default function (scene) {
    var config = {
        custom: {
            families: ['biohazard', 'money'],
            urls: ['/assets/css/font_loader.css']
        }
    };
    scene.load.rexWebFont(config);
    scene.load.on('webfontactive', function (fileObj, familyName) {
        console.log('Font loaded: ' + familyName)
    });

};