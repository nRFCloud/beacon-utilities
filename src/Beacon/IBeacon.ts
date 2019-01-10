import {AdvertisementPacket, Manufacturer} from "../definitions";
import {bytesToUUID} from "../utilities";

export function isIBeacon(data: number[] | AdvertisementPacket): boolean {
	if (typeof (data as AdvertisementPacket).manufacturerData !== 'undefined') {
		if (typeof (data as AdvertisementPacket).manufacturerData[Manufacturer.Apple] !== 'undefined') {
			data = (data as AdvertisementPacket).manufacturerData[Manufacturer.Apple];
		} else {
			return false;
		}
	}
	const bytes: number[] = data as number[];
	//If byte 0 is 2 and byte 1 is 21, it's an iBeacon
	return bytes.length > 1 && bytes[0] === 0x02 && bytes[1] === 0x15;
}

/**
 * Using the example from above, we can get the iBeacon data.
 * It's in the manufacturerData structure:
 * "manufacturerData" : {
		"76" : [2, 21, 181, 177, 130, 199, 234, 177, 73, 136, 170, 153, 181, 193, 81, 112, 8, 217, 220, 59, 100, 26, 197]
	},

 * iBeacon is manufacturer 0x004C == 76
 *
 * result = {
	"uuid" : "b5b182c7-eab1-4988-aa99-b5c1517008d9",
	"major" : 56379,
	"majorHigh" : 220, // the first byte of major
	"majorLow" : 59, // the second byte of major
	"minor" : 25626,
	"minorHigh" : 256,
	"minorLow" : 26,
	"txPower" : -59
}
 *
 * If it's not an iBeacon, null is returned
 */

export interface IBeaconData {
	uuid: string;
	major: number;
	majorHigh: number;
	majorLow: number;
	minor: number;
	minorHigh: number;
	minorLow: number;
	txPower: number;
}

export function bytesToIBeacon(bytes: number[]): IBeaconData {

	if (!isIBeacon(bytes)) {
		return null;
	}

	let rest = bytes.slice(2); //The first 2 bytes are the iBeacon identifiers
	const uuid = bytesToUUID(rest);
	rest = rest.slice(16); //16 bytes for the UUID
	const buffer = new Uint8Array(rest).buffer;
	const view = new DataView(buffer);
	return {
		uuid,
		major: view.getUint16(0),
		majorHigh: view.getUint8(0),
		majorLow: view.getUint8(1),
		minor: view.getUint16(2),
		minorHigh: view.getUint8(2),
		minorLow: view.getUint8(3),
		txPower: view.getInt8(4),
	};
}
