import {ioc} from "@nicolawealth/ioc";

export type setTimeoutType = <R>(f: () => void, ms: number) => R;
export const iocSetTimeout = () => ioc.get<setTimeoutType>('setTimeout');

export type clearTimeoutType = <R>(r: R) => void;
export const iocCancelTimeout = () => ioc.get<clearTimeoutType>('clearTimeout');

export type setIntervalType = <R>(f: () => void, ms: number) => R;
export const iocSetInterval = () => ioc.get<setIntervalType>('setInterval');
export type clearIntervalType = <R>(r: R) => void;
export const iocCancelInterval = () => ioc.get<clearIntervalType>('clearInterval');
