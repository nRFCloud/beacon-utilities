import {AdvertisementDataType, AdvertisementPacket, BeaconType, Manufacturer, UUIDLength} from "./definitions";

export function parseAdvertisementBytes(scanRecord: number[] | AdvertisementPacket): AdvertisementPacket {
	if (isRealPacket(scanRecord as AdvertisementPacket)) {
		return (scanRecord as AdvertisementPacket);
	}

	if (!scanRecord) {
		return null;
	}

	scanRecord = (scanRecord as number[]);

	let currentPos = 0;
	let advertiseFlag = -1;
	let serviceUuids: string[] = [];
	let localName = null;
	let txPowerLevel = null;
	let manufacturerData = {};
	let serviceData: {[key: string]: number[]} = {};

	while (currentPos < scanRecord.length) {
		let length = scanRecord[currentPos++] & 0xff;
		if (length === 0) {
			break;
		}

		let dataLength = length - 1;
		let fieldType = scanRecord[currentPos++] & 0xff;
		switch (fieldType as AdvertisementDataType) {
			case AdvertisementDataType.DATA_TYPE_FLAGS:
				advertiseFlag = scanRecord[currentPos] & 0xff;
				break;
			case AdvertisementDataType.DATA_TYPE_SERVICE_UUIDS_16_BIT_COMPLETE:
			case AdvertisementDataType.DATA_TYPE_SERVICE_UUIDS_16_BIT_PARTIAL:
				serviceUuids = serviceUuids.concat(parseServiceUuid(scanRecord, currentPos, dataLength, UUIDLength.UUID_BYTES_16_BIT));
				break;
			case AdvertisementDataType.DATA_TYPE_SERVICE_UUIDS_32_BIT_COMPLETE:
			case AdvertisementDataType.DATA_TYPE_SERVICE_UUIDS_32_BIT_PARTIAL:
				serviceUuids = serviceUuids.concat(parseServiceUuid(scanRecord, currentPos, dataLength, UUIDLength.UUID_BYTES_32_BIT));
				break;
			case AdvertisementDataType.DATA_TYPE_SERVICE_UUIDS_128_BIT_COMPLETE:
			case AdvertisementDataType.DATA_TYPE_SERVICE_UUIDS_128_BIT_PARTIAL:
				serviceUuids = serviceUuids.concat(parseServiceUuid(scanRecord, currentPos, dataLength, UUIDLength.UUID_BYTES_128_BIT));
				break;
			case AdvertisementDataType.DATA_TYPE_LOCAL_NAME_COMPLETE:
			case AdvertisementDataType.DATA_TYPE_LOCAL_NAME_SHORT:
				localName = uintArrayToString(extractBytes(scanRecord, currentPos, dataLength));
				break;
			case AdvertisementDataType.DATA_TYPE_TX_POWER_LEVEL:
				txPowerLevel = scanRecord[currentPos];
				break;
			case AdvertisementDataType.DATA_TYPE_SERVICE_DATA:
				const bytes = extractBytes(scanRecord, currentPos, UUIDLength.UUID_BYTES_16_BIT);
				const serviceDataUuid = '' + ((bytes[1] & 0xFF).toString(16)) + (bytes[0] & 0xFF).toString(16);
				const serviceDataArray = extractBytes(scanRecord, currentPos + UUIDLength.UUID_BYTES_16_BIT, dataLength - UUIDLength.UUID_BYTES_16_BIT);
				serviceData[serviceDataUuid] = serviceDataArray;
				break;
			case AdvertisementDataType.DATA_TYPE_MANUFACTURER_SPECIFIC_DATA:
				Object.assign(manufacturerData, parseManufacturerData(scanRecord, currentPos, dataLength));
				break;
			case AdvertisementDataType.DATA_TYPE_SLAVE_CONNECTION_INTERVAL_RANGE:
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
		advertiseFlag,
		serviceUuids,
		localName,
		txPower: txPowerLevel,
		manufacturerData,
		serviceData,
	};
}

export function isRealPacket(data: AdvertisementPacket) {
	if (
		typeof (data as AdvertisementPacket).manufacturerData !== 'undefined' &&
		typeof (data as AdvertisementPacket).serviceUuids !== 'undefined'
	) {
		const manus = Object.keys((data as AdvertisementPacket).manufacturerData);
		return (manus && manus.length > 0) ||
			((data as AdvertisementPacket).serviceUuids && (data as AdvertisementPacket).serviceUuids.length > 0);
	}
	return false;
}

function parseServiceUuid(
	scanRecord: number[],
	currentPos: number,
	dataLength: number,
	uuidLength: UUIDLength,
): string[] {
	const result = [];
	while (dataLength > 0) {
		const uuidBytes = extractBytes(scanRecord, currentPos, uuidLength);
		try {
			result.push(parseUuidFrom(uuidBytes));
		} catch (err) {
			//Squelch the error
		}
		dataLength -= uuidLength;
		currentPos += uuidLength;
	}
	return result;
}

export function extractBytes(scanRecord: number[], start: number, length: number): number[] {
	return scanRecord.slice(start, start + length);
}

//For "Short" UUIDs, we are going to turn them into the full-length version
//BASE_UUID = "00000000-0000-1000-8000-00805F9B34FB";
//[0, 0, 0, 0, 0, 0, 16, 0, 128, 0, 0, 128, 95, 155, 52, 251]
//The first 4 bytes are what we're looking for
const BASE_LOW_BYTES = [0, 0, 16, 0, 128, 0, 0, 128, 95, 155, 52, 251];

function parseUuidFrom(uuidBytes: number[]): string {
	if (!uuidBytes) {
		throw new Error('uuidBytes cannot be null');
	}
	const length: number = uuidBytes.length;
	if (
		length !== UUIDLength.UUID_BYTES_16_BIT &&
		length !== UUIDLength.UUID_BYTES_32_BIT &&
		length !== UUIDLength.UUID_BYTES_128_BIT
	) {
		throw new Error(`uuidBytes length invalid - ${length}`);
	}
	// Construct a 128 bit UUID.
	if (length === UUIDLength.UUID_BYTES_128_BIT) {
		return bytesToUUID(uuidBytes);
	}

	let bytes: number[];
	if (length === UUIDLength.UUID_BYTES_16_BIT) {
		//First two bytes are blank
		bytes = [0, 0, uuidBytes[1] & 0xFF, uuidBytes[0] & 0xFF];
	} else {
		bytes = [uuidBytes[3] & 0xFF, uuidBytes[2] & 0xFF, uuidBytes[1] & 0xFF, uuidBytes[0] & 0xFF];
	}

	return bytesToUUID(bytes.concat(BASE_LOW_BYTES));
}

/**
 * Convert byte array to string
 * @param uintArray Byte array
 * @returns string Converted string
 */
export function uintArrayToString(uintArray: number[]): string {
	const encodedString = String.fromCharCode.apply(null, uintArray);
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

export function parseManufacturerData(scanRecord: number[], currentPos: number, dataLength: number): {[key: string]: number[]} {
	const manufacturerId = ((scanRecord[currentPos + 1] & 0xff) << 8) + (scanRecord[currentPos] & 0xff);
	return {[manufacturerId]: extractBytes(scanRecord, currentPos + 2, dataLength - 2)};
}

export function bytesToUUID(ints: number[]): string {
	if (ints.length < 5) {
		return null;
	}
	let str = '';
	let pos = 0;
	let parts = [4, 2, 2, 2, 6];
	for (let i = 0; i < parts.length; i++) {
		for (let j = 0; j < parts[i]; j++) {
			let octet = ints[pos++].toString(16);
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

export function convertTypeToManufacturer(type: BeaconType): Manufacturer {
	switch (type) {
		case BeaconType.iBeacon:
			return Manufacturer.Apple;
		case BeaconType.AltBeacon:
			return Manufacturer.Radius;
		default:
			return null;
	}
}

// noinspection JSUnusedLocalSymbols
function convertManufacturerToType(manu: Manufacturer): BeaconType {
	switch (manu) {
		case Manufacturer.Radius:
			return BeaconType.AltBeacon;
		case Manufacturer.Apple:
			return BeaconType.iBeacon;
		default:
			return null;
	}
}
