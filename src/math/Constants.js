import {
	sampleFn
} from '../Util';

export const PI = Math.PI;
export const TAU = PI * 2;
export const PHI = 1.6180339887498948482;
export const e = 2.71828182845904523536;

export const SIN = sampleFn( Math.sin, TAU, 1000 );
export const COS = sampleFn( Math.cos, TAU, 1000 );
export const TAN = sampleFn( Math.tan, TAU, 1000 );
