import {DateTime} from "luxon";
import {ioc} from "@nicolawealth/ioc";

// wrap ioc.get call so ctor injected usage can be stubbed via the ioc system.

const nowMs = (): number => DateTime.now().toUTC().toMillis();

export const iocNowMs = ioc.setDefault({nowMs});
