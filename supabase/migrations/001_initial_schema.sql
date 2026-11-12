-- ==============================================================================
-- Migration 001: Initial Schema for AgriAdviser Pro
-- Target: Supabase Cloud PostgreSQL
-- Description: Creates profiles, advisories, RLS policies, triggers, and seed data.
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Profiles table linked to Supabase auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  farm_location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Advisories table for AI-generated multimodal crop diagnoses
create table if not exists public.advisories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  crop_name text not null,
  growth_stage text not null,
  soil_type text not null,
  irrigation_type text not null,
  symptoms_description text not null,
  image_url text,
  ai_diagnosis jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Performance Indexes
create index if not exists idx_advisories_user_id on public.advisories(user_id);
create index if not exists idx_advisories_created_at on public.advisories(created_at desc);
create index if not exists idx_advisories_crop_name on public.advisories(crop_name);
create index if not exists idx_profiles_email on public.profiles(email);

-- 5. Row Level Security (RLS) Activation
alter table public.profiles enable row level security;
alter table public.advisories enable row level security;

-- 6. Profiles RLS Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Service role has full access to profiles" on public.profiles;
create policy "Service role has full access to profiles"
  on public.profiles for all
  using (auth.role() = 'service_role');

-- 7. Advisories RLS Policies
drop policy if exists "Users can view own advisories" on public.advisories;
create policy "Users can view own advisories"
  on public.advisories for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own advisories" on public.advisories;
create policy "Users can insert own advisories"
  on public.advisories for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own advisories" on public.advisories;
create policy "Users can update own advisories"
  on public.advisories for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own advisories" on public.advisories;
create policy "Users can delete own advisories"
  on public.advisories for delete
  using (auth.uid() = user_id);

drop policy if exists "Service role has full access to advisories" on public.advisories;
create policy "Service role has full access to advisories"
  on public.advisories for all
  using (auth.role() = 'service_role');

-- 8. Auto-provision profile on new Supabase Auth User signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, farm_location)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Lead Agronomist'),
    coalesce(new.raw_user_meta_data->>'farm_location', 'Regional Farm Station')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 9. Seed Data (Demo Account & High-Yield Phytopathological Advisories)
do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
begin
  -- 9.1 Seed demo user in auth.users if not already existing
  if not exists (select 1 from auth.users where id = demo_user_id) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      demo_user_id,
      'authenticated',
      'authenticated',
      'agronomist@agriadviser.com',
      crypt('AgriPass123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Dr. Elena Rostova, Lead Agronomist","farm_location":"Green Valley Organic Research Farm, OR"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  end if;

  -- 9.2 Seed corresponding profile
  insert into public.profiles (id, email, full_name, farm_location)
  values (
    demo_user_id,
    'agronomist@agriadviser.com',
    'Dr. Elena Rostova, Lead Agronomist',
    'Green Valley Organic Research Farm, OR'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    farm_location = excluded.farm_location;

  -- 9.3 Seed Advisory 1: Tomato Early Blight
  if not exists (select 1 from public.advisories where id = 'f87a31b2-c049-4702-8dfd-01200b3952a1'::uuid) then
    insert into public.advisories (
      id,
      user_id,
      crop_name,
      growth_stage,
      soil_type,
      irrigation_type,
      symptoms_description,
      image_url,
      ai_diagnosis,
      created_at
    ) values (
      'f87a31b2-c049-4702-8dfd-01200b3952a1'::uuid,
      demo_user_id,
      'Tomato (Solanum lycopersicum)',
      'Flowering',
      'Loamy',
      'Drip',
      'Dark water-soaked concentric lesions on lower leaves with yellow chlorotic halos. Stems displaying dark brown cankers.',
      'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=800&q=80',
      '{
        "diagnosisTitle": "Early Blight (Alternaria solani)",
        "confidenceScore": 94.5,
        "severity": "Severe",
        "primaryCause": "Fungal pathogen Alternaria solani thriving in high relative humidity (>80%) and warm temperatures (24-29°C).",
        "immediateActions": [
          "Prune and destroy infected lower leaves immediately to stop spore splash.",
          "Avoid overhead wetting; switch strictly to root-zone drip irrigation.",
          "Sanitize pruning shears between plants with 70% isopropyl alcohol."
        ],
        "treatments": {
          "organic": [
            "Apply Copper Octanoate (liquid copper fungicide) at 15-20ml per 4L of water every 7-10 days.",
            "Spray bio-fungicide containing Bacillus subtilis (Serenade ASO) at 30ml per 5L water.",
            "Apply cold-pressed neem oil (0.5% concentration with emulsifier) to inhibit spore germination."
          ],
          "chemical": [
            "Foliar spray of Chlorothalonil 720 SC at 2.0ml/L of water at first symptom appearance.",
            "Rotate with Azoxystrobin 250 SC (Quadris) at 0.8ml/L to manage fungal resistance.",
            "Observe a strict 7-day Pre-Harvest Interval (PHI) for chlorothalonil."
          ]
        },
        "preventiveMeasures": [
          "Practice a minimum 3-year crop rotation avoiding Solanaceae family members (potatoes, peppers, eggplants).",
          "Apply 5-7cm straw or plastic mulch to create a barrier preventing soil spores splashing onto lower foliage.",
          "Ensure plant spacing of 60cm between plants and 90cm between rows to maximize airflow and canopy drying."
        ]
      }'::jsonb,
      now() - interval '2 days'
    );
  end if;

  -- 9.4 Seed Advisory 2: Wheat Nitrogen Deficiency
  if not exists (select 1 from public.advisories where id = 'a12b45c3-d058-4613-9efa-12345c6789b2'::uuid) then
    insert into public.advisories (
      id,
      user_id,
      crop_name,
      growth_stage,
      soil_type,
      irrigation_type,
      symptoms_description,
      image_url,
      ai_diagnosis,
      created_at
    ) values (
      'a12b45c3-d058-4613-9efa-12345c6789b2'::uuid,
      demo_user_id,
      'Wheat (Triticum aestivum)',
      'Vegetative',
      'Clay',
      'Flood',
      'Uniform pale yellowing of older leaves, stunted tillering, and light green leaf canopy throughout the plot.',
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
      '{
        "diagnosisTitle": "Nitrogen (N) Deficiency with Soil Waterlogging",
        "confidenceScore": 91.0,
        "severity": "Moderate",
        "primaryCause": "Insufficient plant-available nitrates aggravated by denitrification and root asphyxiation under heavy clay flood irrigation.",
        "immediateActions": [
          "Drain standing water and allow soil aeration for 48 hours.",
          "Refrain from heavy mechanical cultivation while clay is wet to avoid compaction.",
          "Perform a rapid sap or SPAD chlorophyll reading on the youngest fully expanded leaf."
        ],
        "treatments": {
          "organic": [
            "Apply fermented liquid fish hydrolysate or well-rotted poultry compost extract via foliar spray at 20L/ha.",
            "Top-dress with vermicompost enriched with Azotobacter nitrogen-fixing bio-fertilizer (500kg/ha)."
          ],
          "chemical": [
            "Immediate emergency foliar spray of 2% Urea solution (20g Urea per 1L water) during cool morning hours.",
            "Broadcast side-dressing of Calcium Ammonium Nitrate (CAN) at 50kg N/ha once soil reaches field moisture capacity."
          ]
        },
        "preventiveMeasures": [
          "Upgrade to raised-bed furrow irrigation to avert standing water and root hypoxia in heavy clay.",
          "Incorporate deep-rooting cover crops (daikon radish or clover) prior to wheat sowing to improve clay aeration.",
          "Conduct pre-plant soil nitrate testing (PSNT) to balance basal vs split top-dress nitrogen applications."
        ]
      }'::jsonb,
      now() - interval '4 days'
    );
  end if;

  -- 9.5 Seed Advisory 3: Apple Scab
  if not exists (select 1 from public.advisories where id = 'e33d78f9-90aa-4ef1-8844-334455667788'::uuid) then
    insert into public.advisories (
      id,
      user_id,
      crop_name,
      growth_stage,
      soil_type,
      irrigation_type,
      symptoms_description,
      image_url,
      ai_diagnosis,
      created_at
    ) values (
      'e33d78f9-90aa-4ef1-8844-334455667788'::uuid,
      demo_user_id,
      'Apple (Malus domestica)',
      'Fruiting',
      'Loamy',
      'Sprinkler',
      'Olive-green velvety spots appearing on fruit surfaces and leaves, turning dark brown, scabby, and corky.',
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80',
      '{
        "diagnosisTitle": "Apple Scab (Venturia inaequalis)",
        "confidenceScore": 96.0,
        "severity": "Critical",
        "primaryCause": "Ascomycete fungus Venturia inaequalis penetrating fruit epidermis during extended leaf wetness periods (>9 hours at 18-24°C).",
        "immediateActions": [
          "Halt sprinkler irrigation immediately; shift to under-canopy micro-sprinklers.",
          "Prune dense water-sprouts to facilitate canopy sunlight penetration and rapid drying.",
          "Inspect surrounding trees within a 50m radius for primary ascosporic lesions."
        ],
        "treatments": {
          "organic": [
            "Spray wettable sulfur (80% WP) at 3-5g/L during early infection risk periods.",
            "Apply potassium bicarbonate (Armicarb) at 2.5-3g/L for post-infection eradicant activity."
          ],
          "chemical": [
            "Apply Difenoconazole 250 EC at 0.3ml/L of water for strong curative kickback action (within 72h of infection period).",
            "Combine with protective Mancozeb 75% WP at 2g/L to prevent fungicide resistance buildup.",
            "Adhere strictly to personal protective equipment (PPE) guidelines: chemical-resistant nitrile gloves and respirator mask."
          ]
        },
        "preventiveMeasures": [
          "Mow and shred fallen autumn leaves or spray 5% urea solution onto orchard floor to accelerate leaf decomposition and destroy overwintering pseudothecia.",
          "Adopt scab-resistant apple cultivars (e.g., Liberty, Enterprise, or Pristine) for future orchard expansion.",
          "Deploy in-orchard digital leaf-wetness sensors to precisely time preventative fungicide applications via Mills infection periods."
        ]
      }'::jsonb,
      now() - interval '6 days'
    );
  end if;

exception when others then
  raise notice 'Seed data insertion notice: %', sqlerrm;
end $$;

