import { logger } from '../shared/logger';
import { MenuCategory } from '../app/modules/menu_category/menu_category.model';

export const seedMenuCategory = async () => {
  const count = await MenuCategory.countDocuments();
  if (count > 0) return;

  logger.info('Seeding default menu categories...');

  const defaults = ['Matcha', 'Hot Coffee', 'Cold Coffee'].map(name => ({ name }));

  await MenuCategory.insertMany(defaults);

  logger.info('Default menu categories seeded');
};
