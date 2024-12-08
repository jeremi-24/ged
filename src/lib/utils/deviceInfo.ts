// src/lib/utils/deviceInfo.ts
import UAParser from 'ua-parser-js';

// Fonction pour obtenir les informations du device
export const getDeviceInfo = () => {
  const parser = new UAParser();
  const result = parser.getResult();

  const deviceInfo = {
    deviceVendor: result.device.vendor || "Inconnu",
    deviceModel: result.device.model || "Inconnu",
    osName: result.os.name || "Inconnu",
    osVersion: result.os.version || "",
    browserName: result.browser.name || "Inconnu",
    browserVersion: result.browser.version || "",
  };

  // Formatage des informations en une chaîne lisible
  return `Appareil: ${deviceInfo.deviceVendor} ${deviceInfo.deviceModel}, 
          OS: ${deviceInfo.osName} ${deviceInfo.osVersion}, 
          Navigateur: ${deviceInfo.browserName} ${deviceInfo.browserVersion}`;
};
