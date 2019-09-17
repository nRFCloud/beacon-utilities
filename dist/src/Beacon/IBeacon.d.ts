import { AdvertisementPacket } from "../definitions";
export declare function isIBeacon(data: number[] | AdvertisementPacket): boolean;
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
export declare function bytesToIBeacon(bytes: number[]): IBeaconData;
