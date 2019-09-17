import { AdvertisementPacket } from "../definitions";
export declare const EDDYSTONE_UUID = "0000feaa-0000-1000-8000-00805f9b34fb";
export declare const EDDYSTONE_SHORT_UUID = "feaa";
export declare enum EddystoneTypes {
    UID = 0,
    URL = 16,
    TLM = 32,
    EID = 48
}
export declare function isEddystone(data: number[] | AdvertisementPacket): boolean;
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
export declare type EddystoneData = EddystoneDataBase | EddystoneUrlData | EddystoneUidData | EddystoneTlmData | EddystoneEidData;
export declare function bytesToEddystone(bytes: number[]): EddystoneData;
export declare function getEddystoneData(data: AdvertisementPacket): number[];
export {};
