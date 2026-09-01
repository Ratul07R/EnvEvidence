import { importWhoAirQuality } from '../src/lib/ingestion/who-air-quality-importer';

async function main() {
  const result = await importWhoAirQuality({
    dryRun: false,
    limit: 1000,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});