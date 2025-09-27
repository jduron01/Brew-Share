import { unitVariationMap, canonicalUnitInfo } from "../constants/units.js";
import createHttpError from "http-errors";

export const normalizeUnit = (unit: string) => {
    if (!unit || typeof unit !== "string") {
        throw createHttpError(400, "Unit is invalid");
    }

    const cleanInput = unit.toLowerCase().trim();

    if (unitVariationMap[cleanInput]) {
        const canonicalUnit = unitVariationMap[cleanInput];

        return {
            normalizedUnit: canonicalUnit,
            originalInput: unit,
            wasNormalized: true,
            unitInfo: canonicalUnitInfo[canonicalUnit],
        };
    }

    const singularInput = cleanInput.endsWith("s") ? cleanInput.slice(0, -1) : cleanInput;
    const pluralInput = singularInput + "s";

    if (unitVariationMap[singularInput]) {
        const canonicalUnit = unitVariationMap[singularInput];

        return {
            normalizedUnit: canonicalUnit,
            originalInput: unit,
            wasNormalized: true,
            unitInfo: canonicalUnitInfo[canonicalUnit],
        };
    }

    if (unitVariationMap[pluralInput]) {
        const canonicalUnit = unitVariationMap[pluralInput];

        return {
            normalizedUnit: canonicalUnit,
            originalInput: unit,
            wasNormalized: true,
            unitInfo: canonicalUnitInfo[canonicalUnit],
        };
    }

    return {
        normalizedUnit: unit,
        originalInput: unit,
        wasNormalized: false,
        unitInfo: canonicalUnitInfo[unit],
    };
};
