import mongoose from 'mongoose';
import config from './src/config';
import Permission from './src/app/modules/permissions/permission.model';

async function check() {
  await mongoose.connect(config.database_url as string);
  console.log('Connected');
  const perms = await Permission.find().lean();
  console.log('Permissions found:', perms.length);
  console.log('Sample permission:', JSON.stringify(perms[0], null, 2));
  const cats = new Set(perms.filter(p => (p as any).category).map(p => (p as any).category));
  console.log('Categories found:', Array.from(cats));
  process.exit(0);
}

check();
