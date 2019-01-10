import {AdvertisementPacket, BeaconType, Manufacturer} from "./definitions";
import {
	isRealPacket,
	parseAdvertisementBytes
} from "./utilities";
import {bytesToEddystone, EddystoneData, getEddystoneData, isEddystone} from "./Beacon/Eddystone";
import {bytesToIBeacon, IBeaconData, isIBeacon} from "./Beacon/IBeacon";
import {AltBeaconData, bytesToAltBeacon, isAltBeacon} from "./Beacon/AltBeacon";

export * from './Beacon/Eddystone';
export * from './Beacon/AltBeacon';
export * from './Beacon/IBeacon';
export * from './definitions';
export * from './utilities';

export type BeaconData = IBeaconData | AltBeaconData | EddystoneData;

export function getBeaconData(data: AdvertisementPacket): BeaconData {
	const type = getBeaconType(data);
	switch (type) {
		case BeaconType.iBeacon:
			return (data.manufacturerData && data.manufacturerData[Manufacturer.Apple] && bytesToBeacon(data.manufacturerData[Manufacturer.Apple]));
		case BeaconType.AltBeacon:
			return (data.manufacturerData && data.manufacturerData[Manufacturer.Radius] && bytesToBeacon(data.manufacturerData[Manufacturer.Radius]));
		case BeaconType.Eddystone:
			return bytesToEddystone(getEddystoneData(data));
	}

	return null;
}

export function isBeacon(data: number[] | AdvertisementPacket): boolean {
	let checkdata: number[] | AdvertisementPacket = data;
	try {
		let result = parseAdvertisementBytes(data as number[]);
		if (isEddystone(result)) {
			return true;
		}

		if (result && result.manufacturerData) { //If we successfully parsed the data, then we should have manufacturerData
			checkdata = result;
		}

	} catch (err) {
	}

	return isKnownBeacon(checkdata);
}


//Find the first beacon type
export function getBeaconType(data: number[] | AdvertisementPacket): BeaconType {
	if (isRealPacket(data as AdvertisementPacket)) {

		//Eddystone is determined from serviceUUIDs
		if (isEddystone(data)) {
			return BeaconType.Eddystone;
		}
		const manudata = (data as AdvertisementPacket).manufacturerData;
		//For Alt and Ibeacon, we check the manufacturer data
		const manus = Object.keys(manudata);
		for (let x = 0; x < manus.length; ++x) {
			const result = +manus[x];
			switch (result) {
				case Manufacturer.Apple:
					if (isIBeacon(manudata[result])) {
						return BeaconType.iBeacon;
					}
					break;
				case Manufacturer.Radius:
					if (isAltBeacon(manudata[result])) {
						return BeaconType.AltBeacon;
					}
					break;
			}
		}

		return null;
	}

	//At this point, we need to check the bytes. First check if we are given an advertisement raw sample

	const bytes = data as number[];
	const adverdata = parseAdvertisementBytes(bytes);
	if (isRealPacket(adverdata)) {
		return getBeaconType(adverdata);
	}

	//If it wasn't an advertisement packet, then we're assuming that we got sent a manufacturer data field.
	//We can only detect Alt and Ibeacon at this point
	if (bytes.length > 1) {
		if (isAltBeacon(bytes)) {
			return BeaconType.AltBeacon;
		}

		if (isIBeacon(bytes)) {
			return BeaconType.iBeacon;
		}
	}

	return null;
}

export function isKnownBeacon(data: number[] | AdvertisementPacket): boolean {
	return getBeaconType(data) !== null;
}

export function bytesToBeacon(bytes: number[]): BeaconData {
	if (!isKnownBeacon(bytes)) {
		return null;
	}

	const type = getBeaconType(bytes);
	switch (type) {
		case BeaconType.iBeacon:
			return bytesToIBeacon(bytes);
		case BeaconType.AltBeacon:
			return bytesToAltBeacon(bytes);
		case BeaconType.Eddystone:
			return bytesToEddystone(getEddystoneData(parseAdvertisementBytes(bytes)));
	}

	return null;
}






