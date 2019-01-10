// @ts-ignore
import { decode } from 'eddystone-url-encoding';

import {AdvertisementPacket} from "../definitions";
import {parseAdvertisementBytes} from "../utilities";

export const EDDYSTONE_UUID = '0000feaa-0000-1000-8000-00805f9b34fb';
export const EDDYSTONE_SHORT_UUID = 'feaa';

export enum EddystoneTypes {
	UID = 0x00,
	URL = 0x10,
	TLM = 0x20,
	EID = 0x30,
}

export function isEddystone(data: number[] | AdvertisementPacket): boolean {
	if (typeof (data as AdvertisementPacket).manufacturerData === 'undefined') {
		data = parseAdvertisementBytes(data as number[]);
	}

	const packet = data as AdvertisementPacket;
	return (packet.serviceUuids && (packet.serviceUuids.indexOf(EDDYSTONE_UUID) > -1 || packet.serviceUuids.indexOf(EDDYSTONE_SHORT_UUID) > -1));
}

interface EddystoneDataBase {
	type: number;
	txPower: number;
}

export interface EddystoneUrlData extends EddystoneDataBase {
	url: string;
}

export interface EddystoneUidData extends EddystoneDataBase {
	namespace: string;
	instance: string;
}

export interface EddystoneTlmData extends EddystoneDataBase {
	version: number;
	vbatt: number;
	temp: number;
	advCnt: number;
	secCnt: number;
}

export interface EddystoneEidData extends EddystoneDataBase {
	eid: string;
}

export type EddystoneData = EddystoneDataBase | EddystoneUrlData | EddystoneUidData | EddystoneTlmData | EddystoneEidData;

//I got most of this from https://github.com/sandeepmistry/node-eddystone-beacon-scanner/blob/master/lib/eddystone-beacon-scanner.js
export function bytesToEddystone(bytes: number[]): EddystoneData {
	if (!bytes || bytes.length < 2) {
		return null;
	}

	//First byte is the type
	const data = Buffer.from(bytes);
	const returnObj: {
		type: EddystoneTypes,
		txPower: number,
		namespace?: string,
		instance?: string,
		url?: string,
		eid?: string,
	} = {
		type: (bytes[0] as EddystoneTypes),
		txPower: data.readInt8(1),
	};

	switch (returnObj.type) {
		case EddystoneTypes.UID:
			returnObj['namespace'] = data.slice(2, 12).toString('hex');
			returnObj['instance'] = data.slice(12, 18).toString('hex');
			break;
		case EddystoneTypes.URL:
			returnObj['url'] = parseEddystoneUrl(data.slice(2));
			break;
		case EddystoneTypes.TLM:
			Object.assign(returnObj, parseEddystoneTLM(data));
			break;
		case EddystoneTypes.EID:
			returnObj['eid'] = data.slice(2, 10).toString('hex'); //I don't know if a person would want it in hex or not, oh well
			break;
	}

	return returnObj;
}

export function getEddystoneData(data: AdvertisementPacket): number[] {
	return data && data.serviceData && data.serviceData[EDDYSTONE_SHORT_UUID];
}

function parseEddystoneTLM(data: Buffer): any {
	return {
		version: data.readUInt8(1),
		vbatt: data.readUInt16BE(2),
		temp: data.readInt16BE(4) / 256,
		advCnt: data.readUInt32BE(6),
		secCnt: data.readUInt32BE(10),
	};
}

function parseEddystoneUrl(bytes: Buffer): string {
	return decode(bytes);
}
