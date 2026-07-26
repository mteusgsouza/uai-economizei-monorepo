import { getPayload, type Payload } from "payload";
import config from "@payload-config";

/**
 * Cliente do Payload Local API para uso em server components.
 * `getPayload` já memoiza a instância por config — sem custo extra por chamada.
 */
export function getPayloadClient(): Promise<Payload> {
  return getPayload({ config });
}
