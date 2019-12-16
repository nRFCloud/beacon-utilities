(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.beacons = {}));
}(this, function (exports) { 'use strict';

	(function (Manufacturer) {
	    Manufacturer[Manufacturer["Apple"] = 76] = "Apple";
	    Manufacturer[Manufacturer["Radius"] = 280] = "Radius";
	})(exports.Manufacturer || (exports.Manufacturer = {}));
	(function (UUIDLength) {
	    UUIDLength[UUIDLength["UUID_BYTES_16_BIT"] = 2] = "UUID_BYTES_16_BIT";
	    UUIDLength[UUIDLength["UUID_BYTES_32_BIT"] = 4] = "UUID_BYTES_32_BIT";
	    UUIDLength[UUIDLength["UUID_BYTES_128_BIT"] = 16] = "UUID_BYTES_128_BIT";
	})(exports.UUIDLength || (exports.UUIDLength = {}));
	(function (AdvertisementDataType) {
	    AdvertisementDataType[AdvertisementDataType["DATA_TYPE_FLAGS"] = 1] = "DATA_TYPE_FLAGS";
	    AdvertisementDataType[AdvertisementDataType["DATA_TYPE_SERVICE_UUIDS_16_BIT_PARTIAL"] = 2] = "DATA_TYPE_SERVICE_UUIDS_16_BIT_PARTIAL";
	    AdvertisementDataType[AdvertisementDataType["DATA_TYPE_SERVICE_UUIDS_16_BIT_COMPLETE"] = 3] = "DATA_TYPE_SERVICE_UUIDS_16_BIT_COMPLETE";
	    AdvertisementDataType[AdvertisementDataType["DATA_TYPE_SERVICE_UUIDS_32_BIT_PARTIAL"] = 4] = "DATA_TYPE_SERVICE_UUIDS_32_BIT_PARTIAL";
	    AdvertisementDataType[AdvertisementDataType["DATA_TYPE_SERVICE_UUIDS_32_BIT_COMPLETE"] = 5] = "DATA_TYPE_SERVICE_UUIDS_32_BIT_COMPLETE";
	    AdvertisementDataType[AdvertisementDataType["DATA_TYPE_SERVICE_UUIDS_128_BIT_PARTIAL"] = 6] = "DATA_TYPE_SERVICE_UUIDS_128_BIT_PARTIAL";
	    AdvertisementDataType[AdvertisementDataType["DATA_TYPE_SERVICE_UUIDS_128_BIT_COMPLETE"] = 7] = "DATA_TYPE_SERVICE_UUIDS_128_BIT_COMPLETE";
	    AdvertisementDataType[AdvertisementDataType["DATA_TYPE_LOCAL_NAME_SHORT"] = 8] = "DATA_TYPE_LOCAL_NAME_SHORT";
	    AdvertisementDataType[AdvertisementDataType["DATA_TYPE_LOCAL_NAME_COMPLETE"] = 9] = "DATA_TYPE_LOCAL_NAME_COMPLETE";
	    AdvertisementDataType[AdvertisementDataType["DATA_TYPE_TX_POWER_LEVEL"] = 10] = "DATA_TYPE_TX_POWER_LEVEL";
	    AdvertisementDataType[AdvertisementDataType["DATA_TYPE_SLAVE_CONNECTION_INTERVAL_RANGE"] = 18] = "DATA_TYPE_SLAVE_CONNECTION_INTERVAL_RANGE";
	    AdvertisementDataType[AdvertisementDataType["DATA_TYPE_SERVICE_DATA"] = 22] = "DATA_TYPE_SERVICE_DATA";
	    AdvertisementDataType[AdvertisementDataType["DATA_TYPE_MANUFACTURER_SPECIFIC_DATA"] = 255] = "DATA_TYPE_MANUFACTURER_SPECIFIC_DATA";
	})(exports.AdvertisementDataType || (exports.AdvertisementDataType = {}));
	(function (BeaconType) {
	    BeaconType[BeaconType["iBeacon"] = 0] = "iBeacon";
	    BeaconType[BeaconType["AltBeacon"] = 1] = "AltBeacon";
	    BeaconType[BeaconType["Eddystone"] = 2] = "Eddystone";
	})(exports.BeaconType || (exports.BeaconType = {}));

	function parseAdvertisementBytes(scanRecord) {
	    if (isRealPacket(scanRecord)) {
	        return scanRecord;
	    }
	    if (!scanRecord) {
	        return null;
	    }
	    scanRecord = scanRecord;
	    var currentPos = 0;
	    var advertiseFlag = -1;
	    var serviceUuids = [];
	    var localName = null;
	    var txPowerLevel = null;
	    var manufacturerData = {};
	    var serviceData = {};
	    while (currentPos < scanRecord.length) {
	        var length = scanRecord[currentPos++] & 0xff;
	        if (length === 0) {
	            break;
	        }
	        var dataLength = length - 1;
	        var fieldType = scanRecord[currentPos++] & 0xff;
	        switch (fieldType) {
	            case exports.AdvertisementDataType.DATA_TYPE_FLAGS:
	                advertiseFlag = scanRecord[currentPos] & 0xff;
	                break;
	            case exports.AdvertisementDataType.DATA_TYPE_SERVICE_UUIDS_16_BIT_COMPLETE:
	            case exports.AdvertisementDataType.DATA_TYPE_SERVICE_UUIDS_16_BIT_PARTIAL:
	                serviceUuids = serviceUuids.concat(parseServiceUuid(scanRecord, currentPos, dataLength, exports.UUIDLength.UUID_BYTES_16_BIT));
	                break;
	            case exports.AdvertisementDataType.DATA_TYPE_SERVICE_UUIDS_32_BIT_COMPLETE:
	            case exports.AdvertisementDataType.DATA_TYPE_SERVICE_UUIDS_32_BIT_PARTIAL:
	                serviceUuids = serviceUuids.concat(parseServiceUuid(scanRecord, currentPos, dataLength, exports.UUIDLength.UUID_BYTES_32_BIT));
	                break;
	            case exports.AdvertisementDataType.DATA_TYPE_SERVICE_UUIDS_128_BIT_COMPLETE:
	            case exports.AdvertisementDataType.DATA_TYPE_SERVICE_UUIDS_128_BIT_PARTIAL:
	                serviceUuids = serviceUuids.concat(parseServiceUuid(scanRecord, currentPos, dataLength, exports.UUIDLength.UUID_BYTES_128_BIT));
	                break;
	            case exports.AdvertisementDataType.DATA_TYPE_LOCAL_NAME_COMPLETE:
	            case exports.AdvertisementDataType.DATA_TYPE_LOCAL_NAME_SHORT:
	                localName = uintArrayToString(extractBytes(scanRecord, currentPos, dataLength));
	                break;
	            case exports.AdvertisementDataType.DATA_TYPE_TX_POWER_LEVEL:
	                txPowerLevel = scanRecord[currentPos];
	                break;
	            case exports.AdvertisementDataType.DATA_TYPE_SERVICE_DATA:
	                var bytes = extractBytes(scanRecord, currentPos, exports.UUIDLength.UUID_BYTES_16_BIT);
	                var serviceDataUuid = '' + ((bytes[1] & 0xFF).toString(16)) + (bytes[0] & 0xFF).toString(16);
	                var serviceDataArray = extractBytes(scanRecord, currentPos + exports.UUIDLength.UUID_BYTES_16_BIT, dataLength - exports.UUIDLength.UUID_BYTES_16_BIT);
	                serviceData[serviceDataUuid] = serviceDataArray;
	                break;
	            case exports.AdvertisementDataType.DATA_TYPE_MANUFACTURER_SPECIFIC_DATA:
	                Object.assign(manufacturerData, parseManufacturerData(scanRecord, currentPos, dataLength));
	                break;
	            case exports.AdvertisementDataType.DATA_TYPE_SLAVE_CONNECTION_INTERVAL_RANGE:
	                // Logger.info('ignoring slave connection interval range');
	                break;
	            default:
	                // Logger.warn('unknown field type', fieldType);
	                break;
	        }
	        currentPos += dataLength;
	    }
	    if (serviceUuids.length < 1) {
	        serviceUuids = null;
	    }
	    return {
	        advertiseFlag: advertiseFlag,
	        serviceUuids: serviceUuids,
	        localName: localName,
	        txPower: txPowerLevel,
	        manufacturerData: manufacturerData,
	        serviceData: serviceData,
	    };
	}
	function isRealPacket(data) {
	    if (typeof data.manufacturerData !== 'undefined' &&
	        typeof data.serviceUuids !== 'undefined') {
	        var manus = Object.keys(data.manufacturerData);
	        return (manus && manus.length > 0) ||
	            (data.serviceUuids && data.serviceUuids.length > 0);
	    }
	    return false;
	}
	function parseServiceUuid(scanRecord, currentPos, dataLength, uuidLength) {
	    var result = [];
	    while (dataLength > 0) {
	        var uuidBytes = extractBytes(scanRecord, currentPos, uuidLength);
	        try {
	            result.push(parseUuidFrom(uuidBytes));
	        }
	        catch (err) {
	            //Squelch the error
	        }
	        dataLength -= uuidLength;
	        currentPos += uuidLength;
	    }
	    return result;
	}
	function extractBytes(scanRecord, start, length) {
	    return scanRecord.slice(start, start + length);
	}
	//For "Short" UUIDs, we are going to turn them into the full-length version
	//BASE_UUID = "00000000-0000-1000-8000-00805F9B34FB";
	//[0, 0, 0, 0, 0, 0, 16, 0, 128, 0, 0, 128, 95, 155, 52, 251]
	//The first 4 bytes are what we're looking for
	var BASE_LOW_BYTES = [0, 0, 16, 0, 128, 0, 0, 128, 95, 155, 52, 251];
	function parseUuidFrom(uuidBytes) {
	    if (!uuidBytes) {
	        throw new Error('uuidBytes cannot be null');
	    }
	    var length = uuidBytes.length;
	    if (length !== exports.UUIDLength.UUID_BYTES_16_BIT &&
	        length !== exports.UUIDLength.UUID_BYTES_32_BIT &&
	        length !== exports.UUIDLength.UUID_BYTES_128_BIT) {
	        throw new Error("uuidBytes length invalid - " + length);
	    }
	    // Construct a 128 bit UUID.
	    if (length === exports.UUIDLength.UUID_BYTES_128_BIT) {
	        return bytesToUUID(uuidBytes);
	    }
	    var bytes;
	    if (length === exports.UUIDLength.UUID_BYTES_16_BIT) {
	        //First two bytes are blank
	        bytes = [0, 0, uuidBytes[1] & 0xFF, uuidBytes[0] & 0xFF];
	    }
	    else {
	        bytes = [uuidBytes[3] & 0xFF, uuidBytes[2] & 0xFF, uuidBytes[1] & 0xFF, uuidBytes[0] & 0xFF];
	    }
	    return bytesToUUID(bytes.concat(BASE_LOW_BYTES));
	}
	/**
	 * Convert byte array to string
	 * @param uintArray Byte array
	 * @returns string Converted string
	 */
	function uintArrayToString(uintArray) {
	    var encodedString = String.fromCharCode.apply(null, uintArray);
	    return decodeURIComponent(encodedString);
	}
	//Given an array of bytes that represent the advertisement data, retreive information from it.
	//This method was copied from the Nordic sample on Github (it was in Java, so not copied verbatim)
	/**
	 * Given the following array of bytes, it will produce the following structure:
	 * let bytes = [2, 1, 6, 26, 255, 76, 0, 2, 21, 181, 177, 130, 199, 234, 177, 73, 136, 170, 153, 181, 193, 81, 112, 8, 217, 220, 59, 100, 26, 197, 12, 9, 97, 98, 116, 101, 109, 112, 95, 51, 66, 68, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	 *
	 * let result = {
	    "advertiseFlag" : 6,
	    "serviceUuids" : null,
	    "localName" : "abtemp_3BDC",
	    "txPower" : -10000,
	    "manufacturerData" : {
	        "76" : [2, 21, 181, 177, 130, 199, 234, 177, 73, 136, 170, 153, 181, 193, 81, 112, 8, 217, 220, 59, 100, 26, 197]
	    },
	    "serviceData" : {}
	}
	 */
	function parseManufacturerData(scanRecord, currentPos, dataLength) {
	    var _a;
	    if (currentPos === void 0) { currentPos = 0; }
	    if (typeof dataLength === 'undefined') {
	        dataLength = scanRecord.length;
	    }
	    var manufacturerId = ((scanRecord[currentPos + 1] & 0xff) << 8) + (scanRecord[currentPos] & 0xff);
	    return _a = {}, _a[manufacturerId] = extractBytes(scanRecord, currentPos + 2, dataLength - 2), _a;
	}
	function bytesToUUID(ints) {
	    if (ints.length < 5) {
	        return null;
	    }
	    var str = '';
	    var pos = 0;
	    var parts = [4, 2, 2, 2, 6];
	    for (var i = 0; i < parts.length; i++) {
	        for (var j = 0; j < parts[i]; j++) {
	            var octet = ints[pos++].toString(16);
	            if (octet.length === 1) {
	                octet = '0' + octet;
	            }
	            str += octet;
	        }
	        if (parts[i] !== 6) {
	            str += '-';
	        }
	    }
	    return str;
	}
	function convertTypeToManufacturer(type) {
	    switch (type) {
	        case exports.BeaconType.iBeacon:
	            return exports.Manufacturer.Apple;
	        case exports.BeaconType.AltBeacon:
	            return exports.Manufacturer.Radius;
	        default:
	            return null;
	    }
	}

	var prefixes = [
		"http://www.",
		"https://www.",
		"http://",
		"https://"
	];

	var prefixes$1 = /*#__PURE__*/Object.freeze({
		'default': prefixes
	});

	var suffixes = [
		".com/",
		".org/",
		".edu/",
		".net/",
		".info/",
		".biz/",
		".gov/",
		".com",
		".org",
		".edu",
		".net",
		".info",
		".biz",
		".gov"
	];

	var suffixes$1 = /*#__PURE__*/Object.freeze({
		'default': suffixes
	});

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getCjsExportFromNamespace (n) {
		return n && n['default'] || n;
	}

	var prefixes$2 = getCjsExportFromNamespace(prefixes$1);

	var suffixes$2 = getCjsExportFromNamespace(suffixes$1);

	var decode_1 = function (data) {
	  if (!Buffer.isBuffer(data)) {
	    throw new TypeError('"data" is expected to be an instance of Buffer');
	  }

	  var prefix = data[0];
	  if (prefix > prefixes$2.length) {
	    throw new Error('"data" does not seem to be an encoded Eddystone URL');
	  }

	  return prefixes$2[prefix] + decode(data.slice(1));
	};

	function decode(data) {
	  var url = '';

	  for (var i = 0; i < data.length; i++) {
	    var s = String.fromCharCode(data[i]);
	    url +=
	      (data[i] < suffixes$2.length)
	        ? suffixes$2[data[i]]
	        : s;
	  }

	  return url;
	}

	/**
	 * Check if we're required to add a port number.
	 *
	 * @see https://url.spec.whatwg.org/#default-port
	 * @param {Number|String} port Port number we need to check
	 * @param {String} protocol Protocol we need to check against.
	 * @returns {Boolean} Is it a default port for the given protocol
	 * @api private
	 */
	var requiresPort = function required(port, protocol) {
	  protocol = protocol.split(':')[0];
	  port = +port;

	  if (!port) return false;

	  switch (protocol) {
	    case 'http':
	    case 'ws':
	    return port !== 80;

	    case 'https':
	    case 'wss':
	    return port !== 443;

	    case 'ftp':
	    return port !== 21;

	    case 'gopher':
	    return port !== 70;

	    case 'file':
	    return false;
	  }

	  return port !== 0;
	};

	var has = Object.prototype.hasOwnProperty
	  , undef;

	/**
	 * Decode a URI encoded string.
	 *
	 * @param {String} input The URI encoded string.
	 * @returns {String} The decoded string.
	 * @api private
	 */
	function decode$1(input) {
	  return decodeURIComponent(input.replace(/\+/g, ' '));
	}

	/**
	 * Simple query string parser.
	 *
	 * @param {String} query The query string that needs to be parsed.
	 * @returns {Object}
	 * @api public
	 */
	function querystring(query) {
	  var parser = /([^=?&]+)=?([^&]*)/g
	    , result = {}
	    , part;

	  while (part = parser.exec(query)) {
	    var key = decode$1(part[1])
	      , value = decode$1(part[2]);

	    //
	    // Prevent overriding of existing properties. This ensures that build-in
	    // methods like `toString` or __proto__ are not overriden by malicious
	    // querystrings.
	    //
	    if (key in result) continue;
	    result[key] = value;
	  }

	  return result;
	}

	/**
	 * Transform a query string to an object.
	 *
	 * @param {Object} obj Object that should be transformed.
	 * @param {String} prefix Optional prefix.
	 * @returns {String}
	 * @api public
	 */
	function querystringify(obj, prefix) {
	  prefix = prefix || '';

	  var pairs = []
	    , value
	    , key;

	  //
	  // Optionally prefix with a '?' if needed
	  //
	  if ('string' !== typeof prefix) prefix = '?';

	  for (key in obj) {
	    if (has.call(obj, key)) {
	      value = obj[key];

	      //
	      // Edge cases where we actually want to encode the value to an empty
	      // string instead of the stringified value.
	      //
	      if (!value && (value === null || value === undef || isNaN(value))) {
	        value = '';
	      }

	      pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(value));
	    }
	  }

	  return pairs.length ? prefix + pairs.join('&') : '';
	}

	//
	// Expose the module.
	//
	var stringify = querystringify;
	var parse = querystring;

	var querystringify_1 = {
		stringify: stringify,
		parse: parse
	};

	var protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i
	  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;

	/**
	 * These are the parse rules for the URL parser, it informs the parser
	 * about:
	 *
	 * 0. The char it Needs to parse, if it's a string it should be done using
	 *    indexOf, RegExp using exec and NaN means set as current value.
	 * 1. The property we should set when parsing this value.
	 * 2. Indication if it's backwards or forward parsing, when set as number it's
	 *    the value of extra chars that should be split off.
	 * 3. Inherit from location if non existing in the parser.
	 * 4. `toLowerCase` the resulting value.
	 */
	var rules = [
	  ['#', 'hash'],                        // Extract from the back.
	  ['?', 'query'],                       // Extract from the back.
	  function sanitize(address) {          // Sanitize what is left of the address
	    return address.replace('\\', '/');
	  },
	  ['/', 'pathname'],                    // Extract from the back.
	  ['@', 'auth', 1],                     // Extract from the front.
	  [NaN, 'host', undefined, 1, 1],       // Set left over value.
	  [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
	  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
	];

	/**
	 * These properties should not be copied or inherited from. This is only needed
	 * for all non blob URL's as a blob URL does not include a hash, only the
	 * origin.
	 *
	 * @type {Object}
	 * @private
	 */
	var ignore = { hash: 1, query: 1 };

	/**
	 * The location object differs when your code is loaded through a normal page,
	 * Worker or through a worker using a blob. And with the blobble begins the
	 * trouble as the location object will contain the URL of the blob, not the
	 * location of the page where our code is loaded in. The actual origin is
	 * encoded in the `pathname` so we can thankfully generate a good "default"
	 * location from it so we can generate proper relative URL's again.
	 *
	 * @param {Object|String} loc Optional default location object.
	 * @returns {Object} lolcation object.
	 * @public
	 */
	function lolcation(loc) {
	  var globalVar;

	  if (typeof window !== 'undefined') globalVar = window;
	  else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;
	  else if (typeof self !== 'undefined') globalVar = self;
	  else globalVar = {};

	  var location = globalVar.location || {};
	  loc = loc || location;

	  var finaldestination = {}
	    , type = typeof loc
	    , key;

	  if ('blob:' === loc.protocol) {
	    finaldestination = new Url(unescape(loc.pathname), {});
	  } else if ('string' === type) {
	    finaldestination = new Url(loc, {});
	    for (key in ignore) delete finaldestination[key];
	  } else if ('object' === type) {
	    for (key in loc) {
	      if (key in ignore) continue;
	      finaldestination[key] = loc[key];
	    }

	    if (finaldestination.slashes === undefined) {
	      finaldestination.slashes = slashes.test(loc.href);
	    }
	  }

	  return finaldestination;
	}

	/**
	 * @typedef ProtocolExtract
	 * @type Object
	 * @property {String} protocol Protocol matched in the URL, in lowercase.
	 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
	 * @property {String} rest Rest of the URL that is not part of the protocol.
	 */

	/**
	 * Extract protocol information from a URL with/without double slash ("//").
	 *
	 * @param {String} address URL we want to extract from.
	 * @return {ProtocolExtract} Extracted information.
	 * @private
	 */
	function extractProtocol(address) {
	  var match = protocolre.exec(address);

	  return {
	    protocol: match[1] ? match[1].toLowerCase() : '',
	    slashes: !!match[2],
	    rest: match[3]
	  };
	}

	/**
	 * Resolve a relative URL pathname against a base URL pathname.
	 *
	 * @param {String} relative Pathname of the relative URL.
	 * @param {String} base Pathname of the base URL.
	 * @return {String} Resolved pathname.
	 * @private
	 */
	function resolve(relative, base) {
	  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
	    , i = path.length
	    , last = path[i - 1]
	    , unshift = false
	    , up = 0;

	  while (i--) {
	    if (path[i] === '.') {
	      path.splice(i, 1);
	    } else if (path[i] === '..') {
	      path.splice(i, 1);
	      up++;
	    } else if (up) {
	      if (i === 0) unshift = true;
	      path.splice(i, 1);
	      up--;
	    }
	  }

	  if (unshift) path.unshift('');
	  if (last === '.' || last === '..') path.push('');

	  return path.join('/');
	}

	/**
	 * The actual URL instance. Instead of returning an object we've opted-in to
	 * create an actual constructor as it's much more memory efficient and
	 * faster and it pleases my OCD.
	 *
	 * It is worth noting that we should not use `URL` as class name to prevent
	 * clashes with the global URL instance that got introduced in browsers.
	 *
	 * @constructor
	 * @param {String} address URL we want to parse.
	 * @param {Object|String} [location] Location defaults for relative paths.
	 * @param {Boolean|Function} [parser] Parser for the query string.
	 * @private
	 */
	function Url(address, location, parser) {
	  if (!(this instanceof Url)) {
	    return new Url(address, location, parser);
	  }

	  var relative, extracted, parse, instruction, index, key
	    , instructions = rules.slice()
	    , type = typeof location
	    , url = this
	    , i = 0;

	  //
	  // The following if statements allows this module two have compatibility with
	  // 2 different API:
	  //
	  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
	  //    where the boolean indicates that the query string should also be parsed.
	  //
	  // 2. The `URL` interface of the browser which accepts a URL, object as
	  //    arguments. The supplied object will be used as default values / fall-back
	  //    for relative paths.
	  //
	  if ('object' !== type && 'string' !== type) {
	    parser = location;
	    location = null;
	  }

	  if (parser && 'function' !== typeof parser) parser = querystringify_1.parse;

	  location = lolcation(location);

	  //
	  // Extract protocol information before running the instructions.
	  //
	  extracted = extractProtocol(address || '');
	  relative = !extracted.protocol && !extracted.slashes;
	  url.slashes = extracted.slashes || relative && location.slashes;
	  url.protocol = extracted.protocol || location.protocol || '';
	  address = extracted.rest;

	  //
	  // When the authority component is absent the URL starts with a path
	  // component.
	  //
	  if (!extracted.slashes) instructions[3] = [/(.*)/, 'pathname'];

	  for (; i < instructions.length; i++) {
	    instruction = instructions[i];

	    if (typeof instruction === 'function') {
	      address = instruction(address);
	      continue;
	    }

	    parse = instruction[0];
	    key = instruction[1];

	    if (parse !== parse) {
	      url[key] = address;
	    } else if ('string' === typeof parse) {
	      if (~(index = address.indexOf(parse))) {
	        if ('number' === typeof instruction[2]) {
	          url[key] = address.slice(0, index);
	          address = address.slice(index + instruction[2]);
	        } else {
	          url[key] = address.slice(index);
	          address = address.slice(0, index);
	        }
	      }
	    } else if ((index = parse.exec(address))) {
	      url[key] = index[1];
	      address = address.slice(0, index.index);
	    }

	    url[key] = url[key] || (
	      relative && instruction[3] ? location[key] || '' : ''
	    );

	    //
	    // Hostname, host and protocol should be lowercased so they can be used to
	    // create a proper `origin`.
	    //
	    if (instruction[4]) url[key] = url[key].toLowerCase();
	  }

	  //
	  // Also parse the supplied query string in to an object. If we're supplied
	  // with a custom parser as function use that instead of the default build-in
	  // parser.
	  //
	  if (parser) url.query = parser(url.query);

	  //
	  // If the URL is relative, resolve the pathname against the base URL.
	  //
	  if (
	      relative
	    && location.slashes
	    && url.pathname.charAt(0) !== '/'
	    && (url.pathname !== '' || location.pathname !== '')
	  ) {
	    url.pathname = resolve(url.pathname, location.pathname);
	  }

	  //
	  // We should not add port numbers if they are already the default port number
	  // for a given protocol. As the host also contains the port number we're going
	  // override it with the hostname which contains no port number.
	  //
	  if (!requiresPort(url.port, url.protocol)) {
	    url.host = url.hostname;
	    url.port = '';
	  }

	  //
	  // Parse down the `auth` for the username and password.
	  //
	  url.username = url.password = '';
	  if (url.auth) {
	    instruction = url.auth.split(':');
	    url.username = instruction[0] || '';
	    url.password = instruction[1] || '';
	  }

	  url.origin = url.protocol && url.host && url.protocol !== 'file:'
	    ? url.protocol +'//'+ url.host
	    : 'null';

	  //
	  // The href is just the compiled result.
	  //
	  url.href = url.toString();
	}

	/**
	 * This is convenience method for changing properties in the URL instance to
	 * insure that they all propagate correctly.
	 *
	 * @param {String} part          Property we need to adjust.
	 * @param {Mixed} value          The newly assigned value.
	 * @param {Boolean|Function} fn  When setting the query, it will be the function
	 *                               used to parse the query.
	 *                               When setting the protocol, double slash will be
	 *                               removed from the final url if it is true.
	 * @returns {URL} URL instance for chaining.
	 * @public
	 */
	function set(part, value, fn) {
	  var url = this;

	  switch (part) {
	    case 'query':
	      if ('string' === typeof value && value.length) {
	        value = (fn || querystringify_1.parse)(value);
	      }

	      url[part] = value;
	      break;

	    case 'port':
	      url[part] = value;

	      if (!requiresPort(value, url.protocol)) {
	        url.host = url.hostname;
	        url[part] = '';
	      } else if (value) {
	        url.host = url.hostname +':'+ value;
	      }

	      break;

	    case 'hostname':
	      url[part] = value;

	      if (url.port) value += ':'+ url.port;
	      url.host = value;
	      break;

	    case 'host':
	      url[part] = value;

	      if (/:\d+$/.test(value)) {
	        value = value.split(':');
	        url.port = value.pop();
	        url.hostname = value.join(':');
	      } else {
	        url.hostname = value;
	        url.port = '';
	      }

	      break;

	    case 'protocol':
	      url.protocol = value.toLowerCase();
	      url.slashes = !fn;
	      break;

	    case 'pathname':
	    case 'hash':
	      if (value) {
	        var char = part === 'pathname' ? '/' : '#';
	        url[part] = value.charAt(0) !== char ? char + value : value;
	      } else {
	        url[part] = value;
	      }
	      break;

	    default:
	      url[part] = value;
	  }

	  for (var i = 0; i < rules.length; i++) {
	    var ins = rules[i];

	    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
	  }

	  url.origin = url.protocol && url.host && url.protocol !== 'file:'
	    ? url.protocol +'//'+ url.host
	    : 'null';

	  url.href = url.toString();

	  return url;
	}

	/**
	 * Transform the properties back in to a valid and full URL string.
	 *
	 * @param {Function} stringify Optional query stringify function.
	 * @returns {String} Compiled version of the URL.
	 * @public
	 */
	function toString(stringify) {
	  if (!stringify || 'function' !== typeof stringify) stringify = querystringify_1.stringify;

	  var query
	    , url = this
	    , protocol = url.protocol;

	  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

	  var result = protocol + (url.slashes ? '//' : '');

	  if (url.username) {
	    result += url.username;
	    if (url.password) result += ':'+ url.password;
	    result += '@';
	  }

	  result += url.host + url.pathname;

	  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
	  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

	  if (url.hash) result += url.hash;

	  return result;
	}

	Url.prototype = { set: set, toString: toString };

	//
	// Expose the URL parser and some additional properties that might be useful for
	// others or testing.
	//
	Url.extractProtocol = extractProtocol;
	Url.location = lolcation;
	Url.qs = querystringify_1;

	var urlParse = Url;

	var encode_1 = function (uri) {
	  var parsedUri = urlParse(uri);
	  if (parsedUri.protocol !== 'http:' && parsedUri.protocol !== 'https:') {
	    throw new Error('Only "http://" and "https://" URLs can be encoded');
	  }

	  var encoded = encode(parsedUri);
	  if (encoded.length > 18) {
	    throw new Error([
	      'Encoded URL (', uri, ') is too long (max 18 bytes): ', encoded.length, ' bytes'
	    ].join(''));
	  }
	  return encoded;
	};

	function encode(parsedURL) {
	  var data = parsedURL.href;

	  data = replace(data, prefixes$2);
	  data = replace(data, suffixes$2);

	  data = data.map(function (token) {
	    return (token instanceof Buffer) ? token : new Buffer(token);
	  });

	  return Buffer.concat(data);
	}

	function replace(data, patterns) {
	  data = Array.isArray(data) ? data : [data];

	  for (var i = 0; i < data.length; i++) {
	    if (data[i] instanceof Buffer) {
	      continue;
	    }

	    for (var j = 0; j < patterns.length; j++) {
	      var at = data[i].indexOf(patterns[j]);
	      if (at < 0) {
	        continue;
	      }

	      var before = data[i].slice(0, at);
	      data[i] = data[i].slice(at + patterns[j].length);
	      data.splice(i, 0, before && new Buffer(before), new Buffer([j]));

	      return replace(data, patterns);
	    }
	  }

	  return data;
	}

	var eddystoneUrlEncoding = {
	  decode: decode_1,
	  encode: encode_1
	};
	var eddystoneUrlEncoding_1 = eddystoneUrlEncoding.decode;

	// @ts-ignore
	var EDDYSTONE_UUID = '0000feaa-0000-1000-8000-00805f9b34fb';
	var EDDYSTONE_SHORT_UUID = 'feaa';
	(function (EddystoneTypes) {
	    EddystoneTypes[EddystoneTypes["UID"] = 0] = "UID";
	    EddystoneTypes[EddystoneTypes["URL"] = 16] = "URL";
	    EddystoneTypes[EddystoneTypes["TLM"] = 32] = "TLM";
	    EddystoneTypes[EddystoneTypes["EID"] = 48] = "EID";
	})(exports.EddystoneTypes || (exports.EddystoneTypes = {}));
	function isEddystone(data) {
	    if (typeof data.manufacturerData === 'undefined') {
	        data = parseAdvertisementBytes(data);
	    }
	    var packet = data;
	    return (packet.serviceUuids && (packet.serviceUuids.indexOf(EDDYSTONE_UUID) > -1 || packet.serviceUuids.indexOf(EDDYSTONE_SHORT_UUID) > -1));
	}
	//I got most of this from https://github.com/sandeepmistry/node-eddystone-beacon-scanner/blob/master/lib/eddystone-beacon-scanner.js
	function bytesToEddystone(bytes) {
	    if (!bytes || bytes.length < 2) {
	        return null;
	    }
	    //First byte is the type
	    var data = Buffer.from(bytes);
	    var returnObj = {
	        type: bytes[0],
	        txPower: data.readInt8(1),
	    };
	    switch (returnObj.type) {
	        case exports.EddystoneTypes.UID:
	            returnObj['namespace'] = data.slice(2, 12).toString('hex');
	            returnObj['instance'] = data.slice(12, 18).toString('hex');
	            break;
	        case exports.EddystoneTypes.URL:
	            returnObj['url'] = parseEddystoneUrl(data.slice(2));
	            break;
	        case exports.EddystoneTypes.TLM:
	            Object.assign(returnObj, parseEddystoneTLM(data));
	            break;
	        case exports.EddystoneTypes.EID:
	            returnObj['eid'] = data.slice(2, 10).toString('hex'); //I don't know if a person would want it in hex or not, oh well
	            break;
	    }
	    return returnObj;
	}
	function getEddystoneData(data) {
	    return data && data.serviceData && data.serviceData[EDDYSTONE_SHORT_UUID];
	}
	function parseEddystoneTLM(data) {
	    return {
	        version: data.readUInt8(1),
	        vbatt: data.readUInt16BE(2),
	        temp: data.readInt16BE(4) / 256,
	        advCnt: data.readUInt32BE(6),
	        secCnt: data.readUInt32BE(10),
	    };
	}
	function parseEddystoneUrl(bytes) {
	    return eddystoneUrlEncoding_1(bytes);
	}

	function isIBeacon(data) {
	    if (typeof data.manufacturerData !== 'undefined') {
	        if (typeof data.manufacturerData[exports.Manufacturer.Apple] !== 'undefined') {
	            data = data.manufacturerData[exports.Manufacturer.Apple];
	        }
	        else {
	            return false;
	        }
	    }
	    var bytes = data;
	    //If byte 0 is 2 and byte 1 is 21, it's an iBeacon
	    return bytes.length > 1 && bytes[0] === 0x02 && bytes[1] === 0x15;
	}
	function bytesToIBeacon(bytes) {
	    if (!isIBeacon(bytes)) {
	        return null;
	    }
	    var rest = bytes.slice(2); //The first 2 bytes are the iBeacon identifiers
	    var uuid = bytesToUUID(rest);
	    rest = rest.slice(16); //16 bytes for the UUID
	    var buffer = new Uint8Array(rest).buffer;
	    var view = new DataView(buffer);
	    return {
	        uuid: uuid,
	        major: view.getUint16(0),
	        majorHigh: view.getUint8(0),
	        majorLow: view.getUint8(1),
	        minor: view.getUint16(2),
	        minorHigh: view.getUint8(2),
	        minorLow: view.getUint8(3),
	        txPower: view.getInt8(4),
	    };
	}

	function isAltBeacon(data) {
	    if (typeof data.manufacturerData !== 'undefined') {
	        if (typeof data.manufacturerData[exports.Manufacturer.Radius] !== 'undefined') {
	            data = data.manufacturerData[exports.Manufacturer.Radius];
	        }
	        else {
	            return false;
	        }
	    }
	    var bytes = data;
	    //If byte 0 is 190 and byte 1 is 172, it's an AltBeacon. Also, this makes it cute 0xBEAC
	    return bytes.length > 1 && bytes[0] === 0xbe && bytes[1] === 0xac;
	}
	function bytesToAltBeacon(bytes) {
	    if (!isAltBeacon(bytes)) {
	        return null;
	    }
	    var rest = bytes.slice(2); //first 2 bytes are the AltBeacon identifiers
	    var id = [];
	    var buffer = new Uint8Array(rest).buffer;
	    var view = new DataView(buffer);
	    var leftovers = [];
	    var x = 0;
	    for (; x < 16; ++x) {
	        id.push(view.getUint8(x).toString(16));
	    }
	    for (; x < 20; ++x) {
	        leftovers.push(view.getUint8(x).toString(16));
	    }
	    return {
	        id: id.join(''),
	        rest: leftovers.join(''),
	        rssi: view.getInt8(20),
	        mfg: view.getUint8(21).toString(16),
	    };
	}

	function getBeaconData(data) {
	    var type = getBeaconType(data);
	    switch (type) {
	        case exports.BeaconType.iBeacon:
	            return (data.manufacturerData && data.manufacturerData[exports.Manufacturer.Apple] && bytesToBeacon(data.manufacturerData[exports.Manufacturer.Apple]));
	        case exports.BeaconType.AltBeacon:
	            return (data.manufacturerData && data.manufacturerData[exports.Manufacturer.Radius] && bytesToBeacon(data.manufacturerData[exports.Manufacturer.Radius]));
	        case exports.BeaconType.Eddystone:
	            return bytesToEddystone(getEddystoneData(data));
	    }
	    return null;
	}
	function isBeacon(data) {
	    var checkdata = data;
	    try {
	        var result = parseAdvertisementBytes(data);
	        if (isEddystone(result)) {
	            return true;
	        }
	        if (result && result.manufacturerData) { //If we successfully parsed the data, then we should have manufacturerData
	            checkdata = result;
	        }
	    }
	    catch (err) {
	    }
	    return isKnownBeacon(checkdata);
	}
	/**
	 * Given a manufacturer Id and the data, determine beacon type
	 * You should probably use getBeaconTypeByManufacturerData with parseManufacturerData
	 * @param manufacturerId
	 * @param data
	 */
	function getBeaconTypeByManufacturerId(manufacturerId, data) {
	    switch (+manufacturerId) {
	        case exports.Manufacturer.Apple:
	            if (isIBeacon(data)) {
	                return exports.BeaconType.iBeacon;
	            }
	            break;
	        case exports.Manufacturer.Radius:
	            if (isAltBeacon(data)) {
	                return exports.BeaconType.AltBeacon;
	            }
	            break;
	    }
	    return null;
	}
	/**
	 * Given manufacturer data (as returned by parseManufacturerData), figure out the beacon type
	 * @param manufacturerData
	 */
	function getBeaconTypeByManufacturerData(manufacturerData) {
	    var manus = Object.keys(manufacturerData);
	    for (var x = 0; x < manus.length; ++x) {
	        var manuId = +manus[x];
	        var detectedType = getBeaconTypeByManufacturerId(manuId, manufacturerData[manuId]);
	        if (detectedType !== null) {
	            return detectedType;
	        }
	    }
	    return null;
	}
	//Find the first beacon type
	function getBeaconType(data) {
	    if (isRealPacket(data)) {
	        //Eddystone is determined from serviceUUIDs
	        if (isEddystone(data)) {
	            return exports.BeaconType.Eddystone;
	        }
	        var manudata = data.manufacturerData;
	        //For Alt and Ibeacon, we check the manufacturer data
	        return getBeaconTypeByManufacturerData(manudata);
	    }
	    //At this point, we need to check the bytes. First check if we are given an advertisement raw sample
	    var bytes = data;
	    var adverdata = parseAdvertisementBytes(bytes);
	    if (isRealPacket(adverdata)) {
	        return getBeaconType(adverdata);
	    }
	    //If it wasn't an advertisement packet, then we're assuming that we got sent a manufacturer data field.
	    //We can only detect Alt and Ibeacon at this point
	    if (bytes.length > 1) {
	        if (isAltBeacon(bytes)) {
	            return exports.BeaconType.AltBeacon;
	        }
	        if (isIBeacon(bytes)) {
	            return exports.BeaconType.iBeacon;
	        }
	    }
	    return null;
	}
	function isKnownBeacon(data) {
	    return getBeaconType(data) !== null;
	}
	function bytesToBeacon(bytes) {
	    if (!isKnownBeacon(bytes)) {
	        return null;
	    }
	    var type = getBeaconType(bytes);
	    switch (type) {
	        case exports.BeaconType.iBeacon:
	            return bytesToIBeacon(bytes);
	        case exports.BeaconType.AltBeacon:
	            return bytesToAltBeacon(bytes);
	        case exports.BeaconType.Eddystone:
	            return bytesToEddystone(getEddystoneData(parseAdvertisementBytes(bytes)));
	    }
	    return null;
	}

	exports.EDDYSTONE_SHORT_UUID = EDDYSTONE_SHORT_UUID;
	exports.EDDYSTONE_UUID = EDDYSTONE_UUID;
	exports.bytesToAltBeacon = bytesToAltBeacon;
	exports.bytesToBeacon = bytesToBeacon;
	exports.bytesToEddystone = bytesToEddystone;
	exports.bytesToIBeacon = bytesToIBeacon;
	exports.bytesToUUID = bytesToUUID;
	exports.convertTypeToManufacturer = convertTypeToManufacturer;
	exports.extractBytes = extractBytes;
	exports.getBeaconData = getBeaconData;
	exports.getBeaconType = getBeaconType;
	exports.getBeaconTypeByManufacturerData = getBeaconTypeByManufacturerData;
	exports.getBeaconTypeByManufacturerId = getBeaconTypeByManufacturerId;
	exports.getEddystoneData = getEddystoneData;
	exports.isAltBeacon = isAltBeacon;
	exports.isBeacon = isBeacon;
	exports.isEddystone = isEddystone;
	exports.isIBeacon = isIBeacon;
	exports.isKnownBeacon = isKnownBeacon;
	exports.isRealPacket = isRealPacket;
	exports.parseAdvertisementBytes = parseAdvertisementBytes;
	exports.parseManufacturerData = parseManufacturerData;
	exports.uintArrayToString = uintArrayToString;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
