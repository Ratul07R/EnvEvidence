import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Categories
  const water = await prisma.environmentalCategory.create({
    data: { slug: 'water', name: 'Water Intelligence', nameBn: 'পানি গোয়েন্দা তথ্য', icon: '💧', color: '#3b82f6', order: 1 },
  });
  const air = await prisma.environmentalCategory.create({
    data: { slug: 'air', name: 'Air Intelligence', nameBn: 'বায়ু গোয়েন্দা তথ্য', icon: '🌬️', color: '#6366f1', order: 2 },
  });
  const carbon = await prisma.environmentalCategory.create({
    data: { slug: 'carbon-climate', name: 'Carbon & Climate', nameBn: 'কার্বন ও জলবায়ু', icon: '🌍', color: '#10b981', order: 3 },
  });
  const plastic = await prisma.environmentalCategory.create({
    data: { slug: 'plastic', name: 'Plastic Pollution', nameBn: 'প্লাস্টিক দূষণ', icon: '♻️', color: '#f59e0b', order: 4 },
  });
  const chemical = await prisma.environmentalCategory.create({
    data: { slug: 'chemical', name: 'Chemical Pollution', nameBn: 'রাসায়নিক দূষণ', icon: '⚗️', color: '#ef4444', order: 5 },
  });
  const industrial = await prisma.environmentalCategory.create({
    data: { slug: 'industrial', name: 'Industrial Environment', nameBn: 'শিল্প পরিবেশ', icon: '🏭', color: '#8b5cf6', order: 6 },
  });
  const research = await prisma.environmentalCategory.create({
    data: { slug: 'research', name: 'Research Intelligence', nameBn: 'গবেষণা গোয়েন্দা তথ্য', icon: '🔬', color: '#06b6d4', order: 7 },
  });

  // 2. Parameters
  const pm25 = await prisma.parameter.create({ data: { slug: 'pm25', name: 'PM2.5', nameBn: 'PM2.5', unit: 'μg/m³', categoryId: air.id, description: 'Fine particulate matter ≤2.5μm' } });
  const pm10 = await prisma.parameter.create({ data: { slug: 'pm10', name: 'PM10', nameBn: 'PM10', unit: 'μg/m³', categoryId: air.id, description: 'Particulate matter ≤10μm' } });
  const do_param = await prisma.parameter.create({ data: { slug: 'dissolved-oxygen', name: 'Dissolved Oxygen', nameBn: 'দ্রবীভূত অক্সিজেন', unit: 'mg/L', categoryId: water.id, description: 'Amount of oxygen dissolved in water' } });
  const ph = await prisma.parameter.create({ data: { slug: 'ph', name: 'pH', nameBn: 'pH', unit: '', categoryId: water.id, description: 'Acidity or alkalinity of water' } });
  const turbidity = await prisma.parameter.create({ data: { slug: 'turbidity', name: 'Turbidity', nameBn: 'বিক্ষেপ্যতা', unit: 'NTU', categoryId: water.id, description: 'Water clarity measurement' } });
  const co2 = await prisma.parameter.create({ data: { slug: 'co2', name: 'CO₂ Concentration', nameBn: 'CO₂ ঘনমাত্রা', unit: 'ppm', categoryId: carbon.id, description: 'Carbon dioxide concentration' } });

  // 3. Sources
  const who = await prisma.source.create({
    data: {
      name: 'WHO Global Air Quality Database',
      provider: 'World Health Organization',
      url: 'https://www.who.int/air-pollution/data-and-statistics',
      license: 'CC BY-NC-SA 3.0 IGO',
      commercialUse: 'REQUIRES PERMISSION',
      attributionReq: 'World Health Organization',
      updateFrequency: 'Annual',
      geographicCoverage: 'Global',
      reliabilityNotes: 'Official government-reported data compiled by WHO',
      status: 'active',
    },
  });
  const doeBd = await prisma.source.create({
    data: {
      name: 'Bangladesh DOE Water Quality',
      provider: 'Department of Environment, Bangladesh',
      url: 'https://www.doe.gov.bd',
      license: 'Government Open Data',
      commercialUse: 'ALLOWED WITH ATTRIBUTION',
      attributionReq: 'Department of Environment, Bangladesh',
      updateFrequency: 'Quarterly',
      geographicCoverage: 'Bangladesh',
      reliabilityNotes: 'Official government monitoring data',
      status: 'active',
    },
  });
  const unep = await prisma.source.create({
    data: {
      name: 'UNEP Plastic Pollution Data',
      provider: 'United Nations Environment Programme',
      url: 'https://www.unep.org/explore-topics/plastic-pollution',
      license: 'CC BY-NC-SA 3.0 IGO',
      commercialUse: 'REQUIRES PERMISSION',
      attributionReq: 'UNEP',
      updateFrequency: 'Irregular',
      geographicCoverage: 'Global',
      reliabilityNotes: 'Compiled from various research publications',
      status: 'active',
    },
  });

  // 4. Locations
  const dhaka = await prisma.location.create({
    data: { slug: 'dhaka', name: 'Dhaka', nameBn: 'ঢাকা', country: 'Bangladesh', region: 'Dhaka Division', city: 'Dhaka', latitude: 23.8103, longitude: 90.4125, type: 'city', description: 'Capital city of Bangladesh, one of the most densely populated cities in the world.' },
  });
  const buriganga = await prisma.location.create({
    data: { slug: 'buriganga-river', name: 'Buriganga River', nameBn: 'বুড়িগঙ্গা নদী', country: 'Bangladesh', region: 'Dhaka Division', latitude: 23.7041, longitude: 90.3817, type: 'waterbody', description: 'Major river flowing by Dhaka, severely polluted from industrial and domestic waste.' },
  });
  const chittagong = await prisma.location.create({
    data: { slug: 'chittagong', name: 'Chattogram', nameBn: 'চট্টগ্রাম', country: 'Bangladesh', region: 'Chattogram Division', city: 'Chattogram', latitude: 22.3569, longitude: 91.7832, type: 'city', description: 'Major port city and commercial capital of Bangladesh.' },
  });
  const sundarbans = await prisma.location.create({
    data: { slug: 'sundarbans', name: 'Sundarbans', nameBn: 'সুন্দরবন', country: 'Bangladesh', region: 'Khulna Division', latitude: 22.0250, longitude: 89.0000, type: 'region', description: 'World Heritage mangrove forest, largest in the world.' },
  });

  // 5. Evidence Records
  await prisma.evidenceRecord.createMany({
    data: [
      {
        value: '78.5', numericValue: 78.5, unit: 'μg/m³', parameterId: pm25.id, categoryId: air.id, locationId: dhaka.id, sourceId: who.id,
        sourceTitle: 'WHO Air Quality Database 2024', sourceUrl: 'https://www.who.int/air-pollution/data-and-statistics',
        observationDate: new Date('2024-06-15'), methodology: 'Ground-based monitoring station measurement',
        confidence: 'HIGH', evidenceType: 'measured', verificationStatus: 'verified',
        claim: 'Annual mean PM2.5 concentration in Dhaka is 78.5 μg/m³, significantly exceeding WHO guideline of 15 μg/m³.',
        qualityStatus: 'valid',
      },
      {
        value: '145.2', numericValue: 145.2, unit: 'μg/m³', parameterId: pm10.id, categoryId: air.id, locationId: dhaka.id, sourceId: who.id,
        sourceTitle: 'WHO Air Quality Database 2024', sourceUrl: 'https://www.who.int/air-pollution/data-and-statistics',
        observationDate: new Date('2024-06-15'), methodology: 'Ground-based monitoring station measurement',
        confidence: 'HIGH', evidenceType: 'measured', verificationStatus: 'verified',
        claim: 'Annual mean PM10 concentration in Dhaka is 145.2 μg/m³.',
        qualityStatus: 'valid',
      },
      {
        value: '1.2', numericValue: 1.2, unit: 'mg/L', parameterId: do_param.id, categoryId: water.id, locationId: buriganga.id, sourceId: doeBd.id,
        sourceTitle: 'DOE Water Quality Report 2024', sourceUrl: 'https://www.doe.gov.bd',
        observationDate: new Date('2024-03-20'), methodology: 'Winkler method field measurement',
        confidence: 'HIGH', evidenceType: 'measured', verificationStatus: 'verified',
        claim: 'Dissolved oxygen in Buriganga River is 1.2 mg/L, far below the standard of 5 mg/L for aquatic life.',
        qualityStatus: 'valid',
      },
      {
        value: '7.8', numericValue: 7.8, unit: '', parameterId: ph.id, categoryId: water.id, locationId: buriganga.id, sourceId: doeBd.id,
        sourceTitle: 'DOE Water Quality Report 2024', sourceUrl: 'https://www.doe.gov.bd',
        observationDate: new Date('2024-03-20'), methodology: 'Digital pH meter field measurement',
        confidence: 'HIGH', evidenceType: 'measured', verificationStatus: 'verified',
        claim: 'pH of Buriganga River water is 7.8, within acceptable range.',
        qualityStatus: 'valid',
      },
      {
        value: '85.3', numericValue: 85.3, unit: 'NTU', parameterId: turbidity.id, categoryId: water.id, locationId: buriganga.id, sourceId: doeBd.id,
        sourceTitle: 'DOE Water Quality Report 2024', sourceUrl: 'https://www.doe.gov.bd',
        observationDate: new Date('2024-03-20'), methodology: 'Nephelometric turbidity measurement',
        confidence: 'MEDIUM', evidenceType: 'measured', verificationStatus: 'verified',
        claim: 'Turbidity of Buriganga River is 85.3 NTU, indicating highly turbid water.',
        qualityStatus: 'valid',
      },
      {
        value: '62.1', numericValue: 62.1, unit: 'μg/m³', parameterId: pm25.id, categoryId: air.id, locationId: chittagong.id, sourceId: who.id,
        sourceTitle: 'WHO Air Quality Database 2024', sourceUrl: 'https://www.who.int/air-pollution/data-and-statistics',
        observationDate: new Date('2024-06-15'), methodology: 'Ground-based monitoring station measurement',
        confidence: 'HIGH', evidenceType: 'measured', verificationStatus: 'verified',
        claim: 'Annual mean PM2.5 in Chattogram is 62.1 μg/m³.',
        qualityStatus: 'valid',
      },
    ],
  });

  // 6. Data Gaps
  await prisma.dataGap.createMany({
    data: [
      { locationId: buriganga.id, categorySlug: 'chemical', categoryName: 'Chemical Pollution', gapLevel: 'insufficient', description: 'Limited data on heavy metal concentrations (lead, mercury, cadmium) in Buriganga River sediment.', availability: false, recency: 'outdated' },
      { locationId: sundarbans.id, categorySlug: 'water', categoryName: 'Water Intelligence', gapLevel: 'limited', description: 'Insufficient regular water quality monitoring stations in Sundarbans mangrove area.', availability: false, recency: 'limited' },
      { locationId: dhaka.id, categorySlug: 'carbon-climate', categoryName: 'Carbon & Climate', gapLevel: 'moderate', description: 'No direct CO₂ measurement stations in Dhaka. Data is estimated from regional models.', availability: false, recency: 'no_direct_data' },
    ],
  });

  // 7. Research Items
  await prisma.researchItem.createMany({
    data: [
      {
        title: 'Assessment of Water Quality of Buriganga River: A Review',
        authors: 'Hossain, M., Rahman, S., Ahmed, K.',
        publicationDate: new Date('2023-08-15'), journal: 'Journal of Environmental Science and Health',
        doi: '10.1080/10934529.2023.2200000', topic: 'Water Pollution',
        geographicRelevance: 'Bangladesh', sourceId: doeBd.id, locationId: buriganga.id,
        abstract: 'This review assesses the water quality parameters of Buriganga River including physicochemical properties, heavy metals, and microbial contamination over the past decade.',
      },
      {
        title: 'Air Pollution and Health Impacts in Dhaka City: Systematic Review',
        authors: 'Khan, A., Islam, M., Begum, R.',
        publicationDate: new Date('2024-01-20'), journal: 'Environmental Research Letters',
        doi: '10.1088/1748-9326/ad1500', topic: 'Air Pollution',
        geographicRelevance: 'Bangladesh', sourceId: who.id, locationId: dhaka.id,
        abstract: 'Systematic review of air pollution levels in Dhaka and associated respiratory health impacts on vulnerable populations.',
      },
      {
        title: 'Microplastic Contamination in Coastal Waters of Bangladesh',
        authors: 'Rahman, M., Hasan, M., Ali, M.',
        publicationDate: new Date('2024-05-10'), journal: 'Marine Pollution Bulletin',
        doi: '10.1016/j.marpolbul.2024.116000', topic: 'Plastic Pollution',
        geographicRelevance: 'Bangladesh', sourceId: unep.id, locationId: chittagong.id,
        abstract: 'Study quantifying microplastic abundance and polymer types in coastal waters near Chattogram port area.',
      },
    ],
  });

  // 8. Timeline Events
  await prisma.timelineEvent.createMany({
    data: [
      { locationId: buriganga.id, date: new Date('2024-03-20'), year: 2024, title: 'DOE Water Quality Assessment', description: 'Department of Environment conducted water quality sampling at 5 points along Buriganga River.', categorySlug: 'water', evidenceType: 'measured', sourceName: 'DOE Bangladesh' },
      { locationId: dhaka.id, date: new Date('2024-06-15'), year: 2024, title: 'WHO Air Quality Data Release', description: 'WHO released updated air quality database including 2024 readings for Dhaka monitoring stations.', categorySlug: 'air', evidenceType: 'reported', sourceName: 'WHO' },
      { locationId: sundarbans.id, date: new Date('2023-11-15'), year: 2023, title: 'Sundarbans Oil Spill Report', description: 'Reported oil spill near Chandpai range affecting mangrove biodiversity.', categorySlug: 'industrial', evidenceType: 'reported', sourceName: 'Forest Department' },
    ],
  });

  // 9. Intelligence Summaries
  await prisma.intelligenceSummary.createMany({
    data: [
      {
        locationId: dhaka.id,
        whatWeKnow: 'Dhaka has consistently high PM2.5 levels (75-85 μg/m³ annual mean), well above WHO guideline of 15 μg/m³. Air quality worsens during winter months (Nov-Feb).',
        whatChanged: 'PM2.5 levels decreased slightly from 82 μg/m³ (2022) to 78.5 μg/m³ (2024) due to brick kiln regulations.',
        whatMatters: 'Over 20 million residents are exposed to unhealthy air quality year-round. Winter pollution episodes reach 200+ μg/m³.',
        whatWeDontKnow: 'Real-time pollution source apportionment data is lacking. Chemical composition of PM2.5 is not regularly monitored.',
        evidenceStrength: 'Strong for concentration data; weak for source attribution and health impact quantification.',
        sourcesSummary: 'WHO Global Air Quality Database, DOE Bangladesh monitoring stations',
      },
      {
        locationId: buriganga.id,
        whatWeKnow: 'Buriganga River is severely polluted with very low dissolved oxygen (1-2 mg/L), high turbidity, and presence of heavy metals.',
        whatChanged: 'Water quality has deteriorated further compared to 2020 baseline. DO levels dropped from 2.1 mg/L to 1.2 mg/L.',
        whatMatters: 'The river is biologically dead in many stretches. Millions depend on it for irrigation and daily use.',
        whatWeDontKnow: 'Comprehensive heavy metal profiling, emerging contaminant data, and groundwater interaction effects.',
        evidenceStrength: 'Moderate for basic parameters; insufficient for contaminants and ecological impact.',
        sourcesSummary: 'DOE Bangladesh water quality reports, academic research publications',
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log(`  - ${7} categories`);
  console.log(`  - ${6} parameters`);
  console.log(`  - ${3} sources`);
  console.log(`  - ${4} locations`);
  console.log(`  - ${6} evidence records`);
  console.log(`  - ${3} data gaps`);
  console.log(`  - ${3} research items`);
  console.log(`  - ${3} timeline events`);
  console.log(`  - ${2} intelligence summaries`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });