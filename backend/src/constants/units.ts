interface Unit {
    canonical: string,
    variations: string[],
    category: "weight" | "volume" | "ratio" | "descriptive",
    description?: string,
};

const supportedUnits: Unit[] = [
    {
        canonical: "g",
        variations: ["g", "gram", "grams", "gr"],
        category: "weight",
        description: "Grams (recommended for precision)",
    },
    {
        canonical: "oz",
        variations: ["oz", "ounce", "ounces"],
        category: "weight",
        description: "Ounces (weight)",
    },
    {
        canonical: "ml",
        variations: ["ml", "milliliter", "milliliters"],
        category: "volume",
    },
    {
        canonical: "fl oz",
        variations: ["fl oz", "fluid ounce", "fluid ounces"],
        category: "volume",
    },
    {
        canonical: "tbsp",
        variations: ["tbsp", "tablespoon", "tablespoons", "T", "Tbs"],
        category: "volume",
        description: "Tablespoon (~15ml)",
    },
    {
        canonical: "tsp",
        variations: ["tsp", "teaspoon", "teaspoons", "t"],
        category: "volume",
        description: "Teaspoon (~5ml)",
    },
    {
        canonical: 'shot',
        variations: ['shot', 'shots'],
        category: 'descriptive',
        description: 'Espresso shot (~30ml)'
    },
    {
        canonical: 'scoop',
        variations: ['scoop', 'scoops'],
        category: 'descriptive',
        description: 'Coffee scoop (~10g)'
    },
    {
        canonical: 'part',
        variations: ['part', 'parts'],
        category: 'ratio',
        description: 'For ratios (e.g., 1:16)'
    },
    {
        canonical: 'cup',
        variations: ['cup', 'cups', 'C'],
        category: 'volume',
        description: 'Cup (varies by region - specify size if possible)'
    },
];

export const unitVariationMap: Record<string, string> = {};

supportedUnits.forEach(unit => {
    unit.variations.forEach(variation => {
        unitVariationMap[variation.toLowerCase()] = unit.canonical;
    });
});

export const canonicalUnitInfo: Record<string, Unit> = {};

supportedUnits.forEach(unit => {
    canonicalUnitInfo[unit.canonical] = unit;
});
