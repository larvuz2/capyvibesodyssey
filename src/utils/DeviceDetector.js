/**
 * DeviceDetector.js
 * Utility functions for detecting mobile devices and their capabilities
 */

/**
 * Check if the current device is a mobile device
 * This uses multiple detection methods for higher accuracy
 * 
 * @returns {boolean} True if the current device is mobile
 */
export function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Debug the user agent
  console.log('DEBUG: DeviceDetector - User agent:', userAgent);
  
  // Mobile detection regex patterns
  const mobileRegex1 = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
  const mobileRegex2 = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
  
  const isMobileByRegex = mobileRegex1.test(userAgent) || mobileRegex2.test(userAgent.substr(0, 4));
  
  // Alternative detection via touch points
  const hasTouchScreen = !!('ontouchstart' in window || navigator.maxTouchPoints > 0);
  
  // Additional screen size check (heuristic)
  const isSmallScreen = window.innerWidth <= 1024;
  
  const isTablet = /ipad|tablet|playbook|silk/i.test(userAgent) && !(/mobile/i.test(userAgent));
  
  // Combine detection methods
  // Consider tablet as mobile for our joystick
  const result = isMobileByRegex || (hasTouchScreen && isSmallScreen) || isTablet;
  
  console.log('DEBUG: DeviceDetector - Detection results:', {
    isMobileByRegex, 
    hasTouchScreen, 
    isSmallScreen, 
    isTablet,
    finalResult: result
  });
  
  return result;
}

/**
 * Get the current device orientation
 * 
 * @returns {string} 'portrait' or 'landscape'
 */
export function getDeviceOrientation() {
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

/**
 * Add an event listener for orientation changes
 * 
 * @param {Function} callback - Function to call when orientation changes
 * @returns {Function} Function to remove the event listener
 */
export function addOrientationChangeListener(callback) {
  // The event we listen for depends on the browser
  const orientationEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
  
  // Function to handle orientation change
  const handleOrientationChange = () => {
    callback(getDeviceOrientation());
  };
  
  // Add the event listener
  window.addEventListener(orientationEvent, handleOrientationChange, false);
  
  // Return a function to remove the listener
  return () => {
    window.removeEventListener(orientationEvent, handleOrientationChange, false);
  };
}

/**
 * Get detailed information about the mobile device
 * 
 * @returns {Object} Object with device information
 */
export function getMobileDeviceInfo() {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const vendor = navigator.vendor || '';
  
  // Get battery status if available
  let batteryPromise = null;
  if (navigator.getBattery) {
    batteryPromise = navigator.getBattery();
  }
  
  // Basic device info
  const info = {
    userAgent: ua,
    platform: platform,
    vendor: vendor,
    isMobile: isMobileDevice(),
    orientation: getDeviceOrientation(),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio || 1,
    isLowEndDevice: false,
    isHighEndDevice: false,
    memoryInfo: navigator.deviceMemory || 'unknown',
    connectionType: 'unknown',
    batteryInfo: null,
    supportsTouchEvents: 'ontouchstart' in window,
    supportsOrientationEvents: 'onorientationchange' in window,
    osInfo: getOSInfo(ua),
    browserInfo: getBrowserInfo(ua, vendor),
    hardwareInfo: getHardwareInfo(ua),
    gpuInfo: getGPUInfo(),
    capabilities: getDeviceCapabilities()
  };
  
  // Get network information if available
  if (navigator.connection) {
    info.connectionType = navigator.connection.effectiveType || navigator.connection.type || 'unknown';
    info.downlink = navigator.connection.downlink;
    info.saveData = navigator.connection.saveData;
  }
  
  // Check for low-end or high-end device
  if (info.devicePixelRatio <= 1 || (info.memoryInfo !== 'unknown' && info.memoryInfo <= 2)) {
    info.isLowEndDevice = true;
  } else if (info.devicePixelRatio >= 2.5 || (info.memoryInfo !== 'unknown' && info.memoryInfo >= 6)) {
    info.isHighEndDevice = true;
  }
  
  // Return the promise that will resolve with the full device info
  return batteryPromise ? 
    batteryPromise.then(battery => {
      info.batteryInfo = {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
      return info;
    }).catch(() => info) : 
    Promise.resolve(info);
}

/**
 * Get information about the operating system
 * 
 * @param {string} ua - User agent string
 * @returns {Object} OS information
 */
function getOSInfo(ua) {
  const lowercaseUA = ua.toLowerCase();
  let os = 'unknown';
  let version = 'unknown';
  
  // Detect OS type
  if (lowercaseUA.indexOf('win') >= 0) {
    os = 'Windows';
    if (lowercaseUA.indexOf('windows nt 10.0') >= 0) version = '10';
    else if (lowercaseUA.indexOf('windows nt 6.3') >= 0) version = '8.1';
    else if (lowercaseUA.indexOf('windows nt 6.2') >= 0) version = '8';
    else if (lowercaseUA.indexOf('windows nt 6.1') >= 0) version = '7';
  } else if (lowercaseUA.indexOf('iphone') >= 0 || lowercaseUA.indexOf('ipad') >= 0 || lowercaseUA.indexOf('ipod') >= 0) {
    os = 'iOS';
    const match = lowercaseUA.match(/os (\d+)_(\d+)_?(\d+)?/);
    if (match) version = `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ''}`;
  } else if (lowercaseUA.indexOf('android') >= 0) {
    os = 'Android';
    const match = lowercaseUA.match(/android (\d+(?:\.\d+)*)/);
    if (match) version = match[1];
  } else if (lowercaseUA.indexOf('mac') >= 0) {
    os = 'macOS';
    const match = lowercaseUA.match(/mac os x (\d+)_(\d+)_?(\d+)?/);
    if (match) version = `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ''}`;
  } else if (lowercaseUA.indexOf('linux') >= 0) {
    os = 'Linux';
  }
  
  return { name: os, version: version };
}

/**
 * Get information about the browser
 * 
 * @param {string} ua - User agent string
 * @param {string} vendor - Browser vendor string
 * @returns {Object} Browser information
 */
function getBrowserInfo(ua, vendor) {
  const lowercaseUA = ua.toLowerCase();
  const lowercaseVendor = vendor.toLowerCase();
  let browser = 'unknown';
  let version = 'unknown';
  
  // Chrome detection
  if (lowercaseUA.indexOf('chrome') > -1 && lowercaseVendor.indexOf('google') > -1) {
    browser = 'Chrome';
    const match = lowercaseUA.match(/chrome\/(\d+\.\d+)/);
    if (match) version = match[1];
  } 
  // Firefox detection
  else if (lowercaseUA.indexOf('firefox') > -1) {
    browser = 'Firefox';
    const match = lowercaseUA.match(/firefox\/(\d+\.\d+)/);
    if (match) version = match[1];
  } 
  // Safari detection
  else if (lowercaseUA.indexOf('safari') > -1 && lowercaseUA.indexOf('chrome') === -1) {
    browser = 'Safari';
    const match = lowercaseUA.match(/version\/(\d+\.\d+)/);
    if (match) version = match[1];
  } 
  // Edge detection
  else if (lowercaseUA.indexOf('edge') > -1 || lowercaseUA.indexOf('edg/') > -1) {
    browser = 'Edge';
    const match = lowercaseUA.match(/edge\/(\d+\.\d+)/) || lowercaseUA.match(/edg\/(\d+\.\d+)/);
    if (match) version = match[1];
  } 
  // IE detection
  else if (lowercaseUA.indexOf('trident') > -1) {
    browser = 'Internet Explorer';
    const match = lowercaseUA.match(/rv:(\d+\.\d+)/);
    if (match) version = match[1];
  }
  
  return { name: browser, version: version };
}

/**
 * Get information about the device hardware
 * 
 * @param {string} ua - User agent string
 * @returns {Object} Hardware information
 */
function getHardwareInfo(ua) {
  const lowercaseUA = ua.toLowerCase();
  const info = {
    model: 'unknown',
    manufacturer: 'unknown',
    cores: navigator.hardwareConcurrency || 'unknown'
  };
  
  // Try to detect iPhone/iPad models
  if (lowercaseUA.indexOf('iphone') >= 0) {
    info.manufacturer = 'Apple';
    info.model = 'iPhone';
  } else if (lowercaseUA.indexOf('ipad') >= 0) {
    info.manufacturer = 'Apple';
    info.model = 'iPad';
  } else if (lowercaseUA.indexOf('macintosh') >= 0) {
    info.manufacturer = 'Apple';
    info.model = 'Mac';
  }
  // Try to detect Android manufacturer/model
  else if (lowercaseUA.indexOf('android') >= 0) {
    info.manufacturer = 'Android Device';
    
    // Extract model from user agent (if available)
    const modelMatch = ua.match(/;\s*([^;]+)\s+Build\//) || ua.match(/;\s*([^;]+);\s+wv\)/);
    if (modelMatch) {
      info.model = modelMatch[1].trim();
      
      // Try to extract manufacturer from model
      const possibleManufacturers = [
        'Samsung', 'Sony', 'LG', 'Huawei', 'Xiaomi', 'OnePlus', 'Motorola', 
        'Lenovo', 'Asus', 'HTC', 'Nokia', 'Google', 'Oppo', 'Vivo'
      ];
      
      for (const manufacturer of possibleManufacturers) {
        if (info.model.toLowerCase().indexOf(manufacturer.toLowerCase()) === 0) {
          info.manufacturer = manufacturer;
          break;
        }
      }
    }
  }
  
  return info;
}

/**
 * Try to get some GPU information
 * 
 * @returns {Object} GPU information
 */
function getGPUInfo() {
  const info = {
    renderer: 'unknown',
    vendor: 'unknown'
  };
  
  // Try to get GPU info from WebGL context
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        info.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        info.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch (e) {
    console.log('Failed to get GPU info:', e);
  }
  
  return info;
}

/**
 * Get device capabilities for graphics
 * 
 * @returns {Object} Capabilities information
 */
function getDeviceCapabilities() {
  const capabilities = {
    webgl: false,
    webgl2: false,
    webgpu: false,
    canvas2d: false,
    maxTextureSize: 0,
    antialiasing: false,
    floatTextures: false,
    shaderPrecision: 'unknown'
  };
  
  // Check for Canvas2D support
  try {
    const canvas = document.createElement('canvas');
    capabilities.canvas2d = !!canvas.getContext('2d');
  } catch (e) {}
  
  // Check for WebGL 1.0 support and features
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    capabilities.webgl = !!gl;
    
    if (gl) {
      capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      capabilities.antialiasing = gl.getContextAttributes().antialias;
      capabilities.floatTextures = !!gl.getExtension('OES_texture_float');
      
      // Check shader precision
      const highpSupported = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0;
      capabilities.shaderPrecision = highpSupported ? 'high' : 'medium';
    }
  } catch (e) {}
  
  // Check for WebGL 2.0 support
  try {
    const canvas = document.createElement('canvas');
    capabilities.webgl2 = !!canvas.getContext('webgl2');
  } catch (e) {}
  
  // Check for WebGPU support
  capabilities.webgpu = 'gpu' in navigator;
  
  return capabilities;
}

/**
 * Get the current battery status if available
 * 
 * @returns {Promise<Object|null>} Battery information or null if not available
 */
export function getBatteryStatus() {
  if (navigator.getBattery) {
    return navigator.getBattery()
      .then(battery => ({
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      }))
      .catch(() => null);
  }
  return Promise.resolve(null);
}

/**
 * Determine if battery saving mode should be used
 * 
 * @returns {Promise<boolean>} True if battery saving is recommended
 */
export async function shouldUseBatterySaving() {
  // Get battery info if available
  const batteryInfo = await getBatteryStatus();
  
  // Check for low battery situation
  if (batteryInfo && !batteryInfo.charging) {
    // Low battery threshold (20%)
    if (batteryInfo.level < 0.2) {
      return true;
    }
    
    // Medium battery but discharging quickly
    if (batteryInfo.level < 0.5 && batteryInfo.dischargingTime < 3600) {
      return true;
    }
  }
  
  // Check for low-end device
  const deviceInfo = await getMobileDeviceInfo();
  if (deviceInfo.isLowEndDevice) {
    return true;
  }
  
  // Check for slow connection
  if (navigator.connection && 
      (navigator.connection.saveData || 
       navigator.connection.effectiveType === 'slow-2g' || 
       navigator.connection.effectiveType === '2g')) {
    return true;
  }
  
  return false;
}

/**
 * Add a listener for battery status changes
 * 
 * @param {Function} callback - Function to call when battery status changes
 * @returns {Promise<Function|null>} Function to remove listener or null if not supported
 */
export async function addBatteryStatusListener(callback) {
  if (!navigator.getBattery) return Promise.resolve(null);
  
  try {
    const battery = await navigator.getBattery();
    
    const handleChange = () => {
      callback({
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      });
    };
    
    // Add event listeners
    battery.addEventListener('levelchange', handleChange);
    battery.addEventListener('chargingchange', handleChange);
    battery.addEventListener('chargingtimechange', handleChange);
    battery.addEventListener('dischargingtimechange', handleChange);
    
    // Return function to remove listeners
    return () => {
      battery.removeEventListener('levelchange', handleChange);
      battery.removeEventListener('chargingchange', handleChange);
      battery.removeEventListener('chargingtimechange', handleChange);
      battery.removeEventListener('dischargingtimechange', handleChange);
    };
  } catch (err) {
    console.error('Error setting up battery listener:', err);
    return null;
  }
}