import { AdvertisementPacket, BeaconType } from "./definitions";
import { EddystoneData } from "./Beacon/Eddystone";
import { IBeaconData } from "./Beacon/IBeacon";
import { AltBeaconData } from "./Beacon/AltBeacon";
export * from './Beacon/Eddystone';
export * from './Beacon/AltBeacon';
export * from './Beacon/IBeacon';
export * from './definitions';
export * from './utilities';
export declare type BeaconData = IBeaconData | AltBeaconData | EddystoneData;
export declare function getBeaconData(data: AdvertisementPacket): BeaconData;
export declare function isBeacon(data: number[] | AdvertisementPacket): boolean;
/**
 * Given a manufacturer Id and the data, determine beacon type
 * You should probably use getBeaconTypeByManufacturerData with parseManufacturerData
 * @param manufacturerId
 * @param data
 */
export declare function getBeaconTypeByManufacturerId(manufacturerId: number, data: number[]): BeaconType;
/**
 * Given manufacturer data (as returned by parseManufacturerData), figure out the beacon type
 * @param manufacturerData
 */
export declare function getBeaconTypeByManufacturerData(manufacturerData: {
    [key: number]: number[];
}): BeaconType;
export declare function getBeaconType(data: number[] | AdvertisementPacket): BeaconType;
export declare function isKnownBeacon(data: number[] | AdvertisementPacket): boolean;
export declare function bytesToBeacon(bytes: number[]): BeaconData;
