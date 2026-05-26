export { TOUR_IDS, type TourDefinition, type TourId } from "./tourTypes";

import { tourDefinitions } from "./tours";
import type { TourDefinition, TourId } from "./tourTypes";

export { tourDefinitions };

export const tourRegistry = Object.fromEntries(
	tourDefinitions.map((tour) => [tour.id, tour]),
) as Record<TourId, TourDefinition>;
