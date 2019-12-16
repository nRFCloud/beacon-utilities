import { AdvertisementPacket, BeaconType, Manufacturer } from "./definitions";
export declare function parseAdvertisementBytes(scanRecord: number[] | AdvertisementPacket): AdvertisementPacket;
export declare function isRealPacket(data: AdvertisementPacket): boolean;
export declare function extractBytes(scanRecord: number[], start: number, length: number): number[];
/**
 * Convert byte array to string
 * @param uintArray Byte array
 * @returns string Converted string
 */
export declare function uintArrayToString(uintArray: number[]): string;
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
export declare function parseManufacturerData(scanRecord: number[], currentPos?: number, dataLength?: number): {
    [key: string]: number[];
};
export declare function bytesToUUID(ints: number[]): string;
export declare function convertTypeToManufacturer(type: BeaconType): Manufacturer;
