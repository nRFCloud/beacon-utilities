export declare enum Manufacturer {
    Apple = 76,
    Radius = 280
}
export interface AdvertisementPacket {
    advertiseFlag: number;
    serviceUuids: string[];
    localName: string;
    txPower: number;
    manufacturerData: {
        [key: number]: number[];
    };
    serviceData: {
        [key: string]: number[];
    };
}
export declare enum UUIDLength {
    UUID_BYTES_16_BIT = 2,
    UUID_BYTES_32_BIT = 4,
    UUID_BYTES_128_BIT = 16
}
export declare enum AdvertisementDataType {
    DATA_TYPE_FLAGS = 1,
    DATA_TYPE_SERVICE_UUIDS_16_BIT_PARTIAL = 2,
    DATA_TYPE_SERVICE_UUIDS_16_BIT_COMPLETE = 3,
    DATA_TYPE_SERVICE_UUIDS_32_BIT_PARTIAL = 4,
    DATA_TYPE_SERVICE_UUIDS_32_BIT_COMPLETE = 5,
    DATA_TYPE_SERVICE_UUIDS_128_BIT_PARTIAL = 6,
    DATA_TYPE_SERVICE_UUIDS_128_BIT_COMPLETE = 7,
    DATA_TYPE_LOCAL_NAME_SHORT = 8,
    DATA_TYPE_LOCAL_NAME_COMPLETE = 9,
    DATA_TYPE_TX_POWER_LEVEL = 10,
    DATA_TYPE_SLAVE_CONNECTION_INTERVAL_RANGE = 18,
    DATA_TYPE_SERVICE_DATA = 22,
    DATA_TYPE_MANUFACTURER_SPECIFIC_DATA = 255
}
export declare enum BeaconType {
    iBeacon = 0,
    AltBeacon = 1,
    Eddystone = 2
}
