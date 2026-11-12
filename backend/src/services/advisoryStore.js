import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

// Seed sample advisories for immediate evaluation if starting fresh in local/demo mode
const initialLocalAdvisories = [
  {
    id: 'f87a31b2-c049-4702-8dfd-01200b3952a1',
    user_id: 'demo-farmer-01',
    crop_name: 'Tomato (Solanum lycopersicum)',
    growth_stage: 'Flowering',
    soil_type: 'Loamy',
    irrigation_type: 'Drip',
    symptoms_description: 'Dark water-soaked concentric lesions on lower leaves with yellow halos. Stems displaying dark brown cankers.',
    image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    ai_diagnosis: {
      diagnosisTitle: 'Early Blight (Alternaria solani)',
      confidenceScore: 94.5,
      severity: 'Severe',
      primaryCause: 'Fungal pathogen Alternaria solani thriving in high relative humidity (>80%) and warm temperatures (24-29°C).',
      immediateActions: [
        'Prune and destroy infected lower leaves immediately to stop spore splash.',
        'Avoid overhead wetting; switch strictly to root-zone drip irrigation.',
        'Sanitize pruning shears between plants with 70% isopropyl alcohol.'
      ],
      treatments: {
        organic: [
          'Apply Copper Octanoate (liquid copper fungicide) at 15-20ml per 4L of water every 7-10 days.',
          'Spray bio-fungicide containing Bacillus subtilis (Serenade ASO) at 30ml per 5L water.',
          'Apply cold-pressed neem oil (0.5% concentration with emulsifier) to inhibit spore germination.'
        ],
        chemical: [
          'Foliar spray of Chlorothalonil 720 SC at 2.0ml/L of water at first symptom appearance.',
          'Rotate with Azoxystrobin 250 SC (Quadris) at 0.8ml/L to manage fungal resistance.',
          'Observe a strict 7-day Pre-Harvest Interval (PHI) for chlorothalonil.'
        ]
      },
      preventiveMeasures: [
        'Practice a minimum 3-year crop rotation avoiding Solanaceae family members (potatoes, peppers, eggplants).',
        'Apply 5-7cm straw or plastic mulch to create a barrier preventing soil spores splashing onto lower foliage.',
        'Ensure plant spacing of 60cm between plants and 90cm between rows to maximize airflow and canopy drying.'
      ]
    }
  },
  {
    id: 'a12b45c3-d058-4613-9efa-12345c6789b2',
    user_id: 'demo-farmer-01',
    crop_name: 'Wheat (Triticum aestivum)',
    growth_stage: 'Vegetative',
    soil_type: 'Clay',
    irrigation_type: 'Flood',
    symptoms_description: 'Uniform pale yellowing of older leaves, stunted tillering, and light green leaf canopy throughout the plot.',
    image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    ai_diagnosis: {
      diagnosisTitle: 'Nitrogen (N) Deficiency with Soil Waterlogging',
      confidenceScore: 91.0,
      severity: 'Moderate',
      primaryCause: 'Insufficient plant-available nitrates aggravated by denitrification and root asphyxiation under heavy clay flood irrigation.',
      immediateActions: [
        'Drain standing water and allow soil aeration for 48 hours.',
        'Refrain from heavy mechanical cultivation while clay is wet to avoid compaction.',
        'Perform a rapid sap or SPAD chlorophyll reading on the youngest fully expanded leaf.'
      ],
      treatments: {
        organic: [
          'Apply fermented liquid fish hydrolysate or well-rotted poultry compost extract via foliar spray at 20L/ha.',
          'Top-dress with vermicompost enriched with Azotobacter nitrogen-fixing bio-fertilizer (500kg/ha).'
        ],
        chemical: [
          'Immediate emergency foliar spray of 2% Urea solution (20g Urea per 1L water) during cool morning hours.',
          'Broadcast side-dressing of Calcium Ammonium Nitrate (CAN) at 50kg N/ha once soil reaches field moisture capacity.'
        ]
      },
      preventiveMeasures: [
        'Upgrade to raised-bed furrow irrigation to avert standing water and root hypoxia in heavy clay.',
        'Incorporate deep-rooting cover crops (daikon radish or clover) prior to wheat sowing to improve clay aeration.',
        'Conduct pre-plant soil nitrate testing (PSNT) to balance basal vs split top-dress nitrogen applications.'
      ]
    }
  },
  {
    id: 'e33d78f9-90aa-4ef1-8844-334455667788',
    user_id: 'demo-farmer-01',
    crop_name: 'Apple (Malus domestica)',
    growth_stage: 'Fruiting',
    soil_type: 'Loamy',
    irrigation_type: 'Sprinkler',
    symptoms_description: 'Olive-green velvety spots appearing on fruit surfaces and leaves, turning dark brown, scabby, and corky.',
    image_url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    ai_diagnosis: {
      diagnosisTitle: 'Apple Scab (Venturia inaequalis)',
      confidenceScore: 96.0,
      severity: 'Critical',
      primaryCause: 'Ascomycete fungus Venturia inaequalis penetrating fruit epidermis during extended leaf wetness periods (>9 hours at 18-24°C).',
      immediateActions: [
        'Halt sprinkler irrigation immediately; shift to under-canopy micro-sprinklers.',
        'Prune dense water-sprouts to facilitate canopy sunlight penetration and rapid drying.',
        'Inspect surrounding trees within a 50m radius for primary ascosporic lesions.'
      ],
      treatments: {
        organic: [
          'Spray wettable sulfur (80% WP) at 3-5g/L during early infection risk periods.',
          'Apply potassium bicarbonate (Armicarb) at 2.5-3g/L for post-infection eradicant activity.'
        ],
        chemical: [
          'Apply Difenoconazole 250 EC at 0.3ml/L of water for strong curative kickback action (within 72h of infection period).',
          'Combine with protective Mancozeb 75% WP at 2g/L to prevent fungicide resistance buildup.',
          'Adhere strictly to personal protective equipment (PPE) guidelines: chemical-resistant nitrile gloves and respirator mask.'
        ]
      },
      preventiveMeasures: [
        'Mow and shred fallen autumn leaves or spray 5% urea solution onto orchard floor to accelerate leaf decomposition and destroy overwintering pseudothecia.',
        'Adopt scab-resistant apple cultivars (e.g., Liberty, Enterprise, or Pristine) for future orchard expansion.',
        'Deploy in-orchard digital leaf-wetness sensors to precisely time preventative fungicide applications via Mills infection periods.'
      ]
    }
  }
];

// In-memory fallback repository
let localAdvisoriesStore = [...initialLocalAdvisories];

export const advisoryStore = {
  async saveAdvisory({ userId, cropName, growthStage, soilType, irrigationType, symptomsDescription, imageUrl, aiDiagnosis }) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('advisories')
          .insert([
            {
              user_id: userId,
              crop_name: cropName,
              growth_stage: growthStage,
              soil_type: soilType,
              irrigation_type: irrigationType,
              symptoms_description: symptomsDescription,
              image_url: imageUrl || null,
              ai_diagnosis: aiDiagnosis
            }
          ])
          .select()
          .single();

        if (error) {
          console.warn('[AdvisoryStore] Supabase insert error, falling back to local memory store:', error.message);
        } else if (data) {
          return data;
        }
      } catch (err) {
        console.warn('[AdvisoryStore] Supabase insert exception, using fallback store:', err.message);
      }
    }

    // Local / fallback store
    const newRecord = {
      id: uuidv4(),
      user_id: userId || 'demo-farmer-01',
      crop_name: cropName,
      growth_stage: growthStage,
      soil_type: soilType,
      irrigation_type: irrigationType,
      symptoms_description: symptomsDescription,
      image_url: imageUrl || null,
      ai_diagnosis: aiDiagnosis,
      created_at: new Date().toISOString()
    };

    localAdvisoriesStore.unshift(newRecord);
    return newRecord;
  },

  async getUserAdvisories(userId) {
    if (isSupabaseConfigured && supabase) {
      try {
        const query = supabase
          .from('advisories')
          .select('*')
          .order('created_at', { ascending: false });

        if (userId && userId !== 'all') {
          query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data;
        }
        console.warn('[AdvisoryStore] Supabase query error, falling back to local store:', error?.message);
      } catch (err) {
        console.warn('[AdvisoryStore] Supabase query exception, using fallback store:', err.message);
      }
    }

    if (!userId || userId === 'all' || userId === 'demo-farmer-01') {
      return [...localAdvisoriesStore];
    }
    return localAdvisoriesStore.filter(a => a.user_id === userId);
  },

  async getAdvisoryById(id, userId) {
    if (isSupabaseConfigured && supabase) {
      try {
        const query = supabase
          .from('advisories')
          .select('*')
          .eq('id', id);

        if (userId && userId !== 'demo-farmer-01') {
          query.eq('user_id', userId);
        }

        const { data, error } = await query.single();
        if (!error && data) {
          return data;
        }
        console.warn('[AdvisoryStore] Supabase getById error:', error?.message);
      } catch (err) {
        console.warn('[AdvisoryStore] Supabase getById exception:', err.message);
      }
    }

    const found = localAdvisoriesStore.find(a => a.id === id);
    return found || null;
  },

  async deleteAdvisory(id, userId) {
    if (isSupabaseConfigured && supabase) {
      try {
        const query = supabase.from('advisories').delete().eq('id', id);
        if (userId && userId !== 'demo-farmer-01') {
          query.eq('user_id', userId);
        }
        const { error } = await query;
        if (!error) return true;
        console.warn('[AdvisoryStore] Supabase delete error:', error?.message);
      } catch (err) {
        console.warn('[AdvisoryStore] Supabase delete exception:', err.message);
      }
    }

    const index = localAdvisoriesStore.findIndex(a => a.id === id);
    if (index !== -1) {
      localAdvisoriesStore.splice(index, 1);
      return true;
    }
    return false;
  }
};

