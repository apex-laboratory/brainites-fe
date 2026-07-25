import { z } from "zod";

/**
 * Primitive schemas shared by every feature's boundary schemas.
 */

/**
 * An ISO-8601 timestamp, as loosely as the backend might emit one.
 *
 * Pydantic serializes a `datetime` as `…Z`, `…+00:00`, or with no offset at all
 * depending on whether the column is timezone-aware. Zod's default
 * `.datetime()` accepts **only** the `Z` form, so a naive or offset timestamp
 * would fail validation and blank the screen over a timezone suffix. Accept all
 * three; strictness here buys nothing.
 */
export const IsoDateTimeSchema = z.string().datetime({ offset: true, local: true });
