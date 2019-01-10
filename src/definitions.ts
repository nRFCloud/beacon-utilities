export enum Manufacturer {
	Apple = 0x4c,
	Radius = 0x0118,
}

export interface AdvertisementPacket {
	advertiseFlag: number;
	serviceUuids: string[];
	localName: string;
	txPower: number;
	manufacturerData: {[key: number]: number[]};
	serviceData: {[key: string]: number[]};
}

export enum UUIDLength {
	UUID_BYTES_16_BIT = 2,
	UUID_BYTES_32_BIT = 4,
	UUID_BYTES_128_BIT = 16,
}

export enum AdvertisementDataType {
	DATA_TYPE_FLAGS = 0x01,
	DATA_TYPE_SERVICE_UUIDS_16_BIT_PARTIAL = 0x02,
	DATA_TYPE_SERVICE_UUIDS_16_BIT_COMPLETE = 0x03,
	DATA_TYPE_SERVICE_UUIDS_32_BIT_PARTIAL = 0x04,
	DATA_TYPE_SERVICE_UUIDS_32_BIT_COMPLETE = 0x05,
	DATA_TYPE_SERVICE_UUIDS_128_BIT_PARTIAL = 0x06,
	DATA_TYPE_SERVICE_UUIDS_128_BIT_COMPLETE = 0x07,
	DATA_TYPE_LOCAL_NAME_SHORT = 0x08,
	DATA_TYPE_LOCAL_NAME_COMPLETE = 0x09,
	DATA_TYPE_TX_POWER_LEVEL = 0x0A,
	DATA_TYPE_SLAVE_CONNECTION_INTERVAL_RANGE = 0x12,
	DATA_TYPE_SERVICE_DATA = 0x16,
	DATA_TYPE_MANUFACTURER_SPECIFIC_DATA = 0xFF,
}

export enum BeaconType {
	iBeacon,
	AltBeacon,
	Eddystone,
}
