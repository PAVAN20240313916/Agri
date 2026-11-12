import { advisoryInputSchema } from '../schemas/advisorySchema.js';
import { analyzeCropIssue } from '../services/geminiService.js';
import { advisoryStore } from '../services/advisoryStore.js';

export async function createAdvisory(req, res) {
  try {
    const rawData = {
      cropName: req.body.cropName,
      growthStage: req.body.growthStage,
      soilType: req.body.soilType,
      irrigationType: req.body.irrigationType,
      symptomsDescription: req.body.symptomsDescription
    };

    // Zod Validation
    const validationResult = advisoryInputSchema.safeParse(rawData);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      return res.status(400).json({
        error: 'Validation Failed',
        message: 'Invalid crop parameters provided',
        details: formattedErrors
      });
    }

    const { cropName, growthStage, soilType, irrigationType, symptomsDescription } = validationResult.data;

    let imageBuffer = null;
    let mimeType = null;
    let imageUrl = null;

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
      // Encode as data URL for persistent display in local mode / database
      imageUrl = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    // Compose rich agronomic prompt
    const promptText = `Please analyze the following agricultural issue and provide a structured advisory:
Crop: ${cropName}
Growth Stage: ${growthStage}
Soil Type: ${soilType}
Irrigation System: ${irrigationType}
Reported Symptoms / Field Observations:
"${symptomsDescription}"

${imageBuffer ? 'An image of the affected plant or foliage is attached for visual diagnostic examination.' : 'No photograph provided; analyze based on the symptomatic and environmental parameters provided.'}

Provide a definitive diagnosis title, confidence score between 0 and 100, severity rating (Low, Moderate, Severe, or Critical), primary pathogen or physiological cause, immediate containment actions, organic treatments, chemical treatments (with active ingredient & dilution rate/PPE warning), and long-term preventive measures.`;

    // Execute Gemini multimodal analysis
    const aiDiagnosis = await analyzeCropIssue({
      imageBuffer,
      mimeType,
      promptText,
      cropName,
      growthStage,
      soilType,
      irrigationType
    });

    const userId = req.user?.id || 'demo-farmer-01';

    // Persist to Supabase / store
    const savedRecord = await advisoryStore.saveAdvisory({
      userId,
      cropName,
      growthStage,
      soilType,
      irrigationType,
      symptomsDescription,
      imageUrl,
      aiDiagnosis
    });

    return res.status(201).json({
      success: true,
      data: savedRecord
    });
  } catch (error) {
    console.error('[AdvisoryController] Error creating advisory:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to process crop advisory diagnostic.'
    });
  }
}

export async function getUserAdvisories(req, res) {
  try {
    const userId = req.user?.id || 'demo-farmer-01';
    const advisories = await advisoryStore.getUserAdvisories(userId);

    return res.status(200).json({
      success: true,
      count: advisories.length,
      data: advisories
    });
  } catch (error) {
    console.error('[AdvisoryController] Error fetching advisories:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve advisory records.'
    });
  }
}

export async function getAdvisoryById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'demo-farmer-01';

    const advisory = await advisoryStore.getAdvisoryById(id, userId);

    if (!advisory) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No advisory found with id: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: advisory
    });
  } catch (error) {
    console.error('[AdvisoryController] Error fetching advisory by id:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve the advisory record.'
    });
  }
}

export async function deleteAdvisory(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'demo-farmer-01';

    const deleted = await advisoryStore.deleteAdvisory(id, userId);

    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Advisory with id: ${id} could not be found or has already been removed.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Advisory successfully deleted.'
    });
  } catch (error) {
    console.error('[AdvisoryController] Error deleting advisory:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete the advisory record.'
    });
  }
}

