// https://developer.scrypted.app/#getting-started
import axios from 'axios';
import sdk from "@scrypted/sdk";
const { log, deviceManager, scriptSettings } = sdk;

const api_key = scriptSettings.getString('api_key');

function alertAndThrow(msg) {
  log.a(msg);
  throw new Error(msg);
}

if (!api_key) {
  alertAndThrow('The "api_key" Script Setting values is missing.');
}
log.clearAlerts();

var needsSetup = false;

var voice_name = scriptSettings.getString("voice_name");
if (!voice_name) {
  voice_name = "en-GB-Standard-A";
  needsSetup = true;
  log.i(`Using default voice_name setting: ${voice_name}. See log for more information.`);
}

var voice_gender = scriptSettings.getString("voice_gender");
if (!voice_gender) {
  voice_gender = "FEMALE";
  needsSetup = true;
  log.i(`Using default voice_gender setting: ${voice_gender}. See log for more information.`);
}

var voice_language_code = scriptSettings.getString("voice_language_code");
if (!voice_language_code) {
  voice_language_code = "en-GB";
  needsSetup = true;
  log.i(`Using default voice_language_code setting: ${voice_language_code}. See log for more information.`);
}

if (needsSetup) {
  axios.get(`https://texttospeech.googleapis.com/v1/voices?key=${api_key}`)
  .then(response => {
    log.i(JSON.stringify(response.data, null, 2));
  });
}

class Device {
    constructor() {
        this._state = deviceManager.getDeviceState();
        this._state.fromMimeType = 'text/plain';
        this._state.toMimeType = 'audio/mpeg';
    }
    async convert(from, fromMimeType) {
      from = new Buffer(from);
      var json = {
        "input": {
          "text": from.toString()
        },
        "voice": {
          "languageCode": voice_language_code,
          "name": voice_name,
          "ssmlGender": voice_gender
        },
        "audioConfig": {
          "audioEncoding": "MP3"
        }
      };

      var result = await axios.post(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${api_key}`, json);
      return Buffer.from(result.data.audioContent, 'base64');
    }
}

export default new Device();
