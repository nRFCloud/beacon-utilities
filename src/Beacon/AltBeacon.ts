import {AdvertisementPacket, Manufacturer} from "../definitions";

export function isAltBeacon(data: number[] | AdvertisementPacket): boolean {
	if (typeof (data as AdvertisementPacket).manufacturerData !== 'undefined') {
		if (typeof (data as AdvertisementPacket).manufacturerData[Manufacturer.Radius] !== 'undefined') {
			data = (data as AdvertisementPacket).manufacturerData[Manufacturer.Radius];
		} else {
			return false;
		}
	}

	const bytes = data as number[];

	//If byte 0 is 190 and byte 1 is 172, it's an AltBeacon. Also, this makes it cute 0xBEAC
	return bytes.length > 1 && bytes[0] === 0xbe && bytes[1] === 0xac;
}

export interface AltBeaconData {
	id: string;
	rest: string;
	rssi: number;
	mfg: string;
}

export function bytesToAltBeacon(bytes: number[]): AltBeaconData {
	if (!isAltBeacon(bytes)) {
		return null;
	}

	let rest = bytes.slice(2); //first 2 bytes are the AltBeacon identifiers
	const id = [];
	const buffer = new Uint8Array(rest).buffer;
	const view = new DataView(buffer);
	const leftovers = [];
	let x = 0;
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
