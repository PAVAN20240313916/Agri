import { z } from 'zod';

export const advisoryInputSchema = z.object({
  cropName: z.string().min(2, "Crop name is required"),
  growthStage: z.enum(["Germination", "Vegetative", "Flowering", "Fruiting", "Maturity"]),
  soilType: z.enum(["Sandy", "Clay", "Loamy", "Silt", "Peat"]),
  irrigationType: z.enum(["Drip", "Sprinkler", "Flood", "Rainfed"]),
  symptomsDescription: z.string().min(10, "Please provide a detailed description of symptoms (at least 10 characters)")
});

export const cropAdvisorySchema = {
  type: "OBJECT",
  properties: {
    diagnosisTitle: { type: "STRING", description: "Clear title of the disease, pest, or deficiency." },
    confidenceScore: { type: "NUMBER", description: "Confidence percentage between 0 and 100." },
    severity: { type: "STRING", enum: ["Low", "Moderate", "Severe", "Critical"] },
    primaryCause: { type: "STRING", description: "Underlying cause or pathogen." },
    immediateActions: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Immediate steps to contain or treat the issue."
    },
    treatments: {
      type: "OBJECT",
      properties: {
        organic: { type: "ARRAY", items: { type: "STRING" } },
        chemical: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["organic", "chemical"]
    },
    preventiveMeasures: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Long-term prevention strategies for future crop cycles."
    }
  },
  required: [
    "diagnosisTitle",
    "confidenceScore",
    "severity",
    "primaryCause",
    "immediateActions",
    "treatments",
    "preventiveMeasures"
  ]
};

