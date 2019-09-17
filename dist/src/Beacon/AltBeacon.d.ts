import { AdvertisementPacket } from "../definitions";
export declare function isAltBeacon(data: number[] | AdvertisementPacket): boolean;
export interface AltBeaconData {
    id: string;
    rest: string;
    rssi: number;
    mfg: string;
}
export declare function bytesToAltBeacon(bytes: number[]): AltBeaconData;
