import {describe} from 'riteway';
import {
	BeaconType,
	bytesToBeacon,
	bytesToUUID,
	EDDYSTONE_UUID,
	getBeaconType,
	Manufacturer,
	parseAdvertisementBytes,
	isEddystone,
	EDDYSTONE_SHORT_UUID,
	bytesToEddystone,
	EddystoneTypes,
} from '../dist/beacons.umd';

describe('bytesToUUID', async assert => {
	const bytes = [0, 0, 254, 170, 0, 0, 16, 0, 128, 0, 0, 128, 95, 155, 52, 251];
	assert({
		given: 'bytes as array',
		should: 'format as uuid',
		actual: bytesToUUID(bytes),
		expected: '0000feaa-0000-1000-8000-00805f9b34fb'
	});

});

function testParsedData(assert, parsedData, structure) {
	Object.entries(structure).forEach(([key, value]) => {
		assert({
			given: 'parsed beacon bytes',
			should: `have the correct ${key}`,
			actual: parsedData[key],
			expected: value,
		});
	});
}
const altbeaconadData = [2, 1, 6, 27, 255, 24, 1, 190, 172, 63, 187, 171, 76, 250, 183, 64, 135, 148, 131, 169, 35, 28, 1, 197, 38, 2, 188, 64, 81, 180, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const iBeaconData = [2, 1, 6, 26, 255, 76, 0, 2, 21, 181, 177, 130, 199, 234, 177, 73, 136, 170, 153, 181, 193, 81, 112, 8, 217, 220, 59, 100, 23, 197, 12, 9, 97, 98, 116, 101, 109, 112, 95, 51, 66, 68, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


[BeaconType.iBeacon, BeaconType.AltBeacon].forEach((t) => {
	let configObj;
	switch (t) {
		case BeaconType.iBeacon:
			configObj = {
				name: 'iBeacon',
				data: iBeaconData,
				manufacturer: Manufacturer.Apple,
				dataLength: 23,
				testData: {
					major: 56379,
					minor: 25623,
					majorHigh: 220,
					majorLow: 59,
					minorHigh: 100,
					minorLow: 23,
					txPower: -59,
					uuid: 'b5b182c7-eab1-4988-aa99-b5c1517008d9',
				},
			};
			break;
		case BeaconType.AltBeacon:
			configObj = {
				name: 'AltBeacon',
				data: altbeaconadData,
				manufacturer: Manufacturer.Radius,
				dataLength: 24,
				testData: {
					rssi: -76,
					mfg: '50',
					id: '3fbbab4cfab740879483a9231c1c526',
					rest: '2bc4051',
				},
			};
			break;
		default:
			return;
	}

	describe(configObj.name, async assert => {
		const parsed = parseAdvertisementBytes(configObj.data);
		const dataString = `${configObj.name} data`;

		assert({
			given: dataString,
			should: 'have manufacturer data',
			actual: !!parsed.manufacturerData,
			expected: true,
		});

		assert({
			given: dataString,
			should: 'have correct manufacturer data',
			actual: !!parsed.manufacturerData[configObj.manufacturer],
			expected: true,
		});

		const type = getBeaconType(parsed);
		assert({
			given: `parsed ${dataString}`,
			should: 'should have the correct type',
			actual: type,
			expected: t,
		});

		const beaconData = parsed.manufacturerData[configObj.manufacturer];

		assert({
			given: 'manufacturer data',
			should: 'have the correct length',
			actual: beaconData.length,
			expected: configObj.dataLength,
		});

		const parsedBeacon = bytesToBeacon(beaconData);

		assert({
			given: 'parsed beacon bytes',
			should: 'not be null',
			actual: !!parsedBeacon,
			expected: true,
		});

		testParsedData(assert, parsedBeacon, configObj.testData);

	});
});


describe('Eddystone', async assert => {
	const eddystonedata = [2, 1, 6, 3, 3, 170, 254, 19, 22, 170, 254, 16, 235, 3, 103, 111, 111, 46, 103, 108, 47, 80, 72, 78, 83, 100, 109, 14, 22, 240, 255, 26, 1, 245, 2, 220, 13, 48, 0, 21, 102, 62, 10, 9, 70, 83, 67, 95, 66, 80, 49, 48, 51, 0, 0, 0, 0, 0, 0, 0, 0, 0];

	const parsed = parseAdvertisementBytes(eddystonedata);
	assert({
		given: 'eddystone data',
		should: 'have manufacturer data',
		actual: !!parsed.manufacturerData,
		expected: true,
	});

	const type = getBeaconType(parsed);
	assert({
		given: 'eddystone data',
		should: 'should have the type Eddystone',
		actual: type,
		expected: BeaconType.Eddystone,
	});

	assert({
		given: 'eddystone data',
		should: 'should have the service UUIDs',
		actual: !!parsed.serviceUuids,
		expected: true,
	});

	assert({
		given: 'Eddystone service UUIDs data',
		should: 'have at least one service UUIDs',
		actual: parsed.serviceUuids.length > 0,
		expected: true,
	});

	assert({
		given: 'Eddystone service UUIDs data',
		should: 'to contain the Eddystone UUID',
		actual: parsed.serviceUuids.indexOf(EDDYSTONE_UUID) > -1,
		expected: true,
	});

	assert({
		given: 'Eddystone data as bytes',
		should: 'correctly identify as Eddystone data',
		actual: isEddystone(eddystonedata),
		expected: true,
	});

	assert({
		given: 'parsed Eddystone service data',
		should: 'have the Eddystone short UUID',
		actual: !!parsed.serviceData[EDDYSTONE_SHORT_UUID],
		expected: true,
	});

	const urldata = bytesToEddystone(parsed.serviceData[EDDYSTONE_SHORT_UUID]);

	testParsedData(assert, urldata, {
		txPower: -21,
		type: EddystoneTypes.URL,
		url: 'https://goo.gl/PHNSdm',
	});
});



describe('handles weird data', async assert => {
	const bytes = [2, 1, 6, 3, 3, 245, 254, 20, 255, 210, 0, 1, 122, 202, 78, 180, 172, 112, 207, 238, 208, 162, 177, 14, 50, 106, 108, 59, 12, 9, 97, 98, 116, 101, 109, 112, 95, 51, 66, 68, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

	const result = parseAdvertisementBytes(bytes);
	const type = getBeaconType(result);
	assert({
		given: 'parsed beacon bytes',
		should: 'be null',
		actual: type,
		expected: null,
	});
});

describe('handles Apple data that\'s not a beacon', async assert => {
	const bytes = [2, 1, 26, 10, 255, 76, 0, 16, 5, 10, 16, 165, 98, 57, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	const result = parseAdvertisementBytes(bytes);
	const type = getBeaconType(result);
	assert({
		given: 'parsed beacon bytes',
		should: 'be null',
		actual: type,
		expected: null,
	});
});
