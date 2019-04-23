// @ts-ignore
import {
	bytesToBeacon,
	bytesToUUID,
	getBeaconType,
	Manufacturer,
	parseAdvertisementBytes,
	bytesToEddystone,
	EDDYSTONE_SHORT_UUID,
	EDDYSTONE_UUID,
	EddystoneTypes,
	isEddystone,
	BeaconType,
	AltBeaconData,
	EddystoneUrlData,
	IBeaconData,
} from '..';

describe('tests beacon support', () => {

	test('formats as uuid', () => {
		const bytes = [0, 0, 254, 170, 0, 0, 16, 0, 128, 0, 0, 128, 95, 155, 52, 251];
		expect(bytesToUUID(bytes)).toBe('0000feaa-0000-1000-8000-00805f9b34fb');
	});


	test('handles altbeacon data', () => {
		const altbeaconadData = [2, 1, 6, 27, 255, 24, 1, 190, 172, 63, 187, 171, 76, 250, 183, 64, 135, 148, 131, 169, 35, 28, 1, 197, 38, 2, 188, 64, 81, 180, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		const parsed = parseAdvertisementBytes(altbeaconadData);
		expect(parsed.manufacturerData).not.toBeNull();
		expect(parsed.manufacturerData[Manufacturer.Radius]).not.toBeNull();
		const type: BeaconType = getBeaconType(parsed);
		expect(type).toBe(BeaconType.AltBeacon);
		const beacondata = parsed.manufacturerData[Manufacturer.Radius];
		expect(beacondata.length).toBe(24);
		const parsedBeacon = bytesToBeacon(beacondata) as AltBeaconData;
		expect(parsedBeacon).not.toBeNull();
		expect(parsedBeacon.rssi).toBe(-76);
		expect(parsedBeacon.mfg).toBe('50');
		expect(parsedBeacon.id).toBe('3fbbab4cfab740879483a9231c1c526');
		expect(parsedBeacon.rest).toEqual('2bc4051');
	});

	test('handles eddystone data', () => {
		const eddystonedata = [2, 1, 6, 3, 3, 170, 254, 19, 22, 170, 254, 16, 235, 3, 103, 111, 111, 46, 103, 108, 47, 80, 72, 78, 83, 100, 109, 14, 22, 240, 255, 26, 1, 245, 2, 220, 13, 48, 0, 21, 102, 62, 10, 9, 70, 83, 67, 95, 66, 80, 49, 48, 51, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		const parsed = parseAdvertisementBytes(eddystonedata);
		expect(parsed.manufacturerData).not.toBeNull();
		const type: BeaconType = getBeaconType(parsed);
		expect(type).toBe(BeaconType.Eddystone);
		expect(parsed.serviceUuids).not.toBeNull();
		expect(parsed.serviceUuids.length).toBeGreaterThan(0);
		expect(parsed.serviceUuids).toContain(EDDYSTONE_UUID);
		const result = isEddystone(eddystonedata);
		expect(result).toBe(true);
		expect(parsed.serviceData[EDDYSTONE_SHORT_UUID]).toBeDefined();
		const urldata = bytesToEddystone(parsed.serviceData[EDDYSTONE_SHORT_UUID]) as EddystoneUrlData;
		expect(urldata.txPower).toBe(-21);
		expect(urldata.type).toBe(EddystoneTypes.URL);
		expect(urldata.url).toBe('https://goo.gl/PHNSdm');
	});

	test('handles iBeacon data', () => {
		const data = [2, 1, 6, 26, 255, 76, 0, 2, 21, 181, 177, 130, 199, 234, 177, 73, 136, 170, 153, 181, 193, 81, 112, 8, 217, 220, 59, 100, 23, 197, 12, 9, 97, 98, 116, 101, 109, 112, 95, 51, 66, 68, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		const parsed = parseAdvertisementBytes(data);
		expect(parsed.manufacturerData).toBeDefined();
		const type = getBeaconType(parsed);
		expect(type).toBe(BeaconType.iBeacon);
		expect(parsed.manufacturerData[Manufacturer.Apple]).not.toBeNull();
		const beacondata = parsed.manufacturerData[Manufacturer.Apple];
		expect(beacondata.length).toBe(23);
		const parsedBeacon = bytesToBeacon(beacondata);
		expect(parsedBeacon).not.toBeNull();
		const result = (parsedBeacon as IBeaconData);
		expect(result.major).toBe(56379);
		expect(result.minor).toBe(25623);
		expect(result.majorHigh).toBe(220);
		expect(result.majorLow).toBe(59);
		expect(result.minorHigh).toBe(100);
		expect(result.minorLow).toBe(23);
		expect(result.txPower).toBe(-59);
		expect(result.uuid).toBe('b5b182c7-eab1-4988-aa99-b5c1517008d9');
	});

	test('handles weird data', () => {
		//One of the advertisement packets from the temperature sensor is occasionally this
		const bytes = [2, 1, 6, 3, 3, 245, 254, 20, 255, 210, 0, 1, 122, 202, 78, 180, 172, 112, 207, 238, 208, 162, 177, 14, 50, 106, 108, 59, 12, 9, 97, 98, 116, 101, 109, 112, 95, 51, 66, 68, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

		const result = parseAdvertisementBytes(bytes);
		const type = getBeaconType(result);
		expect(type).toBeNull();

	});

	test('handles apple data thats not a beacon', () => {
		const bytes = [2, 1, 26, 10, 255, 76, 0, 16, 5, 10, 16, 165, 98, 57, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		const result = parseAdvertisementBytes(bytes);
		const type = getBeaconType(result);
		expect(type).toBeNull();
	});

});
