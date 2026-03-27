import { PrismaClient, ComponentType, OrderStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting exact real-device database seeding...');

  // --- CLEANUP ---
  console.log('Cleaning up existing data...');
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.compatibility.deleteMany();
  await prisma.componentSubCategory.deleteMany();
  await prisma.deviceModel.deleteMany();
  await prisma.device.deleteMany();
  await prisma.deviceType.deleteMany();
  await prisma.conversionRule.deleteMany();
  await prisma.errorLog.deleteMany();
  console.log('Cleanup complete.');

  // 0. Admin User
  console.log('Seeding Admin...');
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    }
  });

  const uploadsRoot = path.join(__dirname, '../uploads');
  // Look for seeder images first inside backend/prisma/seeder image (VPS),
  // then fall back to admin/assets/seeder image (local dev)
  const localSeederDir = path.join(__dirname, 'seeder image');
  const seederAssetsDir = fs.existsSync(localSeederDir)
    ? localSeederDir
    : path.join(__dirname, '../../admin/assets/seeder image');
  console.log(`Using seeder assets from: ${seederAssetsDir}`);

  const ensureDir = (dir: string) => {
    const fullPath = path.join(uploadsRoot, dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    return fullPath;
  };

  // 1. Device Types (Brands)
  console.log('Seeding Brands...');
  const brandFolder = path.join(seederAssetsDir, 'deviceType');
  const brandNames = ['apple', 'itel', 'oppo', 'poco', 'samsung', 'vivo'];
  const brands: any = {};
  const brandUploadDir = ensureDir('brands');

  for (const b of brandNames) {
    const imgName = `${b}.png`;
    const src = path.join(brandFolder, imgName);
    const destName = `brand-${Date.now()}-${imgName}`;
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(brandUploadDir, destName));
    }

    brands[b] = await prisma.deviceType.create({
      data: { name: b.charAt(0).toUpperCase() + b.slice(1), imageUrl: `brands/${destName}` }
    });
  }

  // 2. Devices & Models (Real Data)
  console.log('Seeding Real Devices and Models...');
  const deviceUploadDir = ensureDir('devices');
  const allModels: any[] = [];

  const deviceData = {
    apple: [
      { name: 'iPhone 15 Pro Max', models: ['A2849', 'A3105', 'A3108', 'A3106'] },
      { name: 'iPhone 15 Pro', models: ['A2848', 'A3101', 'A3104', 'A3102'] },
      { name: 'iPhone 15 Plus', models: ['A2847', 'A3093', 'A3096', 'A3094'] },
      { name: 'iPhone 15', models: ['A2846', 'A3089', 'A3092', 'A3090'] },
      { name: 'iPhone 14 Pro Max', models: ['A2651', 'A2893', 'A2896', 'A2894'] },
      { name: 'iPhone 14 Pro', models: ['A2650', 'A2889', 'A2892', 'A2890'] },
      { name: 'iPhone 14 Plus', models: ['A2632', 'A2885', 'A2888', 'A2886'] },
      { name: 'iPhone 14', models: ['A2649', 'A2881', 'A2884', 'A2882'] },
      { name: 'iPhone 13 Pro Max', models: ['A2484', 'A2641', 'A2644', 'A2645'] },
      { name: 'iPhone 13 Pro', models: ['A2483', 'A2636', 'A2639', 'A2640'] }
    ],
    samsung: [
      { name: 'Galaxy S24 Ultra', models: ['SM-S928B', 'SM-S928U', 'SM-S9280', 'SM-S928N'] },
      { name: 'Galaxy S24+', models: ['SM-S926B', 'SM-S926U', 'SM-S9260', 'SM-S926N'] },
      { name: 'Galaxy S24', models: ['SM-S921B', 'SM-S921U', 'SM-S9210', 'SM-S921N'] },
      { name: 'Galaxy Z Fold 5', models: ['SM-F946B', 'SM-F946U', 'SM-F9460', 'SM-F946N'] },
      { name: 'Galaxy Z Flip 5', models: ['SM-F731B', 'SM-F731U', 'SM-F7310', 'SM-F731N'] },
      { name: 'Galaxy S23 Ultra', models: ['SM-S918B', 'SM-S918U', 'SM-S9180', 'SM-S918N'] },
      { name: 'Galaxy S23+', models: ['SM-S916B', 'SM-S916U', 'SM-S9160', 'SM-S916N'] },
      { name: 'Galaxy S23', models: ['SM-S911B', 'SM-S911U', 'SM-S9110', 'SM-S911N'] },
      { name: 'Galaxy A54 5G', models: ['SM-A546B', 'SM-A546U', 'SM-A5460', 'SM-A546E'] },
      { name: 'Galaxy A34 5G', models: ['SM-A346B', 'SM-A346U', 'SM-A3460', 'SM-A346E'] }
    ],
    vivo: [
      { name: 'X100 Pro', models: ['V2309A', 'V2324A'] },
      { name: 'X100', models: ['V2308A', 'V2323A'] },
      { name: 'iQOO 12 Pro', models: ['V2302A'] },
      { name: 'iQOO 12', models: ['V2301A'] },
      { name: 'V29 Pro', models: ['V2251'] },
      { name: 'V29', models: ['V2250'] },
      { name: 'Y200', models: ['V2307'] },
      { name: 'T2 Pro 5G', models: ['V2322'] },
      { name: 'X90 Pro+', models: ['V2227A'] },
      { name: 'X90 Pro', models: ['V2242A', 'V2243A'] }
    ],
    oppo: [
      { name: 'Find N3', models: ['CPH2499', 'PHN110'] },
      { name: 'Find N3 Flip', models: ['CPH2519', 'PHT110'] },
      { name: 'Reno 10 Pro+', models: ['CPH2521', 'PHU110'] },
      { name: 'Reno 10 Pro', models: ['CPH2525', 'PHW110'] },
      { name: 'Reno 10', models: ['CPH2531', 'PHV110'] },
      { name: 'Find X6 Pro', models: ['PGEM10'] },
      { name: 'Find X6', models: ['PGFM10'] },
      { name: 'A98 5G', models: ['CPH2529'] },
      { name: 'A78 5G', models: ['CPH2483'] },
      { name: 'A58 4G', models: ['CPH2577'] }
    ],
    poco: [
      { name: 'Poco X6 Pro', models: ['2311DRK48G', '2311DRK48I'] },
      { name: 'Poco X6', models: ['23122PCD1G', '23122PCD1I'] },
      { name: 'Poco M6 Pro', models: ['2312FPCA6G'] },
      { name: 'Poco C65', models: ['2310FPCA4G', '2310FPCA4I'] },
      { name: 'Poco F5 Pro', models: ['23013PC75G'] },
      { name: 'Poco F5', models: ['23049PCD8G', '23049PCD8I'] },
      { name: 'Poco X5 Pro 5G', models: ['22101320G', '22101320I'] },
      { name: 'Poco X5 5G', models: ['22111317PG', '22111317PI'] },
      { name: 'Poco M5s', models: ['2207117BPG'] },
      { name: 'Poco M5', models: ['22071219CG', '22071219CI'] }
    ],
    itel: [
      { name: 'S23+', models: ['S681LN'] },
      { name: 'P40+', models: ['P683L'] },
      { name: 'P40', models: ['P662L'] },
      { name: 'A60s', models: ['A662LM'] },
      { name: 'A60', models: ['A662L'] },
      { name: 'S23', models: ['S681L'] },
      { name: 'Vision 3 Plus', models: ['P682L'] },
      { name: 'Vision 3', models: ['S661LP'] },
      { name: 'A58 Pro', models: ['A661W'] },
      { name: 'A58', models: ['A661L'] }
    ]
  };

  for (const [brandKey, devicesList] of Object.entries(deviceData)) {
    const brand = brands[brandKey];
    if (!brand) continue;

    for (const dev of devicesList) {
      const device = await prisma.device.create({
        data: { name: dev.name, deviceTypeId: brand.id }
      });

      for (const modelNum of dev.models) {
        const m = await prisma.deviceModel.create({
          data: { name: modelNum, deviceId: device.id }
        });
        allModels.push({ ...m, deviceTypeId: brand.id });
      }
    }
  }

  // 3. Component Sub-Categories & Compatibility
  console.log('Seeding Component Sub-Categories and Compatibilities...');
  const compUploadDir = ensureDir('components');
  const allSubCats: any[] = [];

  const seedSubCats = async (folder: string, type: ComponentType, prefix: string) => {
    const dir = path.join(seederAssetsDir, folder);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const destName = `comp-${Date.now()}-${f}`;
        fs.copyFileSync(path.join(dir, f), path.join(compUploadDir, destName));
        const subCat = await prisma.componentSubCategory.create({
          data: { componentType: type, name: f.replace('.png', '').replace('.jpg', ''), imageUrl: `components/${destName}` }
        });
        allSubCats.push(subCat);
      }
    }
  };

  await seedSubCats('ic', ComponentType.IC, 'ic');
  await seedSubCats('connector', ComponentType.CONNECTOR, 'conn');
  await seedSubCats('screen adhesive', ComponentType.SCREEN, 'scr');
  await seedSubCats('screen adhesive', ComponentType.ADHESIVE, 'adh');

  // Compatibility Mappings: Map random 10 models to each sub-category to show data
  console.log('Generating Compatibility Mappings...');

  // Create base category parent mappings for BATTERY AND SCREEN overall to have base data to search
  const createBaseTypeCompat = async (type: ComponentType) => {
    const shuffled = allModels.sort(() => 0.5 - Math.random());
    const selectedModels = shuffled.slice(0, 15); // seed to 15 models
    for (const sm of selectedModels) {
      const sameBrandModels = allModels.filter(m => m.deviceTypeId === sm.deviceTypeId);
      const randModelsForCompat = sameBrandModels.sort(() => 0.5 - Math.random()).slice(0, 5).map(m => m.name);
      await prisma.compatibility.create({
        data: {
          deviceModelId: sm.id,
          componentType: type,
          compatibleModels: randModelsForCompat
        }
      });
    }
  };

  await createBaseTypeCompat(ComponentType.SCREEN);
  await createBaseTypeCompat(ComponentType.BATTERY);

  for (const subCat of allSubCats) {
    // Pick random 5 models
    const shuffled = allModels.sort(() => 0.5 - Math.random());
    const selectedModels = shuffled.slice(0, 5);

    for (const sm of selectedModels) {
      const sameBrandModels = allModels.filter(m => m.deviceTypeId === sm.deviceTypeId);
      const randModelsForCompat = sameBrandModels.sort(() => 0.5 - Math.random()).slice(0, 5).map(m => m.name);
      await prisma.compatibility.create({
        data: {
          subCategoryId: subCat.id,
          deviceModelId: sm.id,
          componentType: subCat.componentType,
          compatibleModels: randModelsForCompat
        }
      });
    }
  }

  // 4. Tools
  console.log('Seeding Tools...');
  const arabicRules = [
    { arabicLetter: 'أ', symbol: 'A' }, { arabicLetter: 'ا', symbol: 'A' }, { arabicLetter: 'ب', symbol: 'B' },
    { arabicLetter: 'ت', symbol: 'T' }, { arabicLetter: 'ث', symbol: 'TH' }, { arabicLetter: 'ج', symbol: 'J' },
    { arabicLetter: 'ح', symbol: 'H' }, { arabicLetter: 'خ', symbol: 'KH' }, { arabicLetter: 'د', symbol: 'D' },
    { arabicLetter: 'ذ', symbol: 'DH' }, { arabicLetter: 'ر', symbol: 'R' }, { arabicLetter: 'ز', symbol: 'Z' },
    { arabicLetter: 'س', symbol: 'S' }, { arabicLetter: 'ش', symbol: 'SH' }, { arabicLetter: 'ص', symbol: 'SS' },
    { arabicLetter: 'ض', symbol: 'DD' }, { arabicLetter: 'ط', symbol: 'TT' }, { arabicLetter: 'ظ', symbol: 'ZZ' },
    { arabicLetter: 'ع', symbol: 'E' }, { arabicLetter: 'غ', symbol: 'GH' }, { arabicLetter: 'ف', symbol: 'F' },
    { arabicLetter: 'ق', symbol: 'Q' }, { arabicLetter: 'ك', symbol: 'K' }, { arabicLetter: 'ل', symbol: 'L' },
    { arabicLetter: 'م', symbol: 'M' }, { arabicLetter: 'ن', symbol: 'N' }, { arabicLetter: 'ه', symbol: 'H' },
    { arabicLetter: 'و', symbol: 'W' }, { arabicLetter: 'ي', symbol: 'Y' }, { arabicLetter: 'ة', symbol: 'H' },
  ];
  for (const rule of arabicRules) await prisma.conversionRule.create({ data: rule });

  const errorLogs = [
    { errorCode: '4013', description: 'NAND Flash error or CPU connection issue', solution: 'Check NAND voltage or reball CPU' },
    { errorCode: 'ID-001', description: 'FaceID Fail', solution: 'Check dot projector' },
    ...Array.from({ length: 8 }).map((_, i) => ({
      errorCode: `ERR-${100 + i}`, description: `Sample Error ${i}`, solution: `Fix ${i}`
    }))
  ];
  for (const log of errorLogs) await prisma.errorLog.create({ data: log });

  // 4.5 Schematics
  console.log('Seeding Schematics...');
  const schemUploadDir = ensureDir('schematics');
  const samplePdf = path.join(__dirname, 'file-sample_150kB.pdf');
  const samplePdfName = `schematic-${Date.now()}-sample.pdf`;

  if (fs.existsSync(samplePdf)) {
    fs.copyFileSync(samplePdf, path.join(schemUploadDir, samplePdfName));

    // Pick 10 random models to have schematics
    const schemModels = [...allModels].sort(() => 0.5 - Math.random()).slice(0, 10);
    for (const sm of schemModels) {
      await prisma.schematic.create({
        data: {
          deviceModelId: sm.id,
          schematicType: 'Layout Diagram',
          pdfFile: samplePdfName
        }
      });
      await prisma.schematic.create({
        data: {
          deviceModelId: sm.id,
          schematicType: 'Schematic Diagram',
          pdfFile: samplePdfName
        }
      });
    }
  }

  // 4.6 Payment Methods
  console.log('Seeding Payment Methods...');
  await prisma.paymentMethod.create({ data: { title: 'Zain Cash', accountNumber: '07701234567', color: '#E8632B' } });
  await prisma.paymentMethod.create({ data: { title: 'Asia Cell', accountNumber: '07707654321', color: '#EF4444' } });
  await prisma.paymentMethod.create({ data: { title: 'Mastercard', accountNumber: '5544 3322 1100', color: '#1E293B' } });

  // 5. Services
  console.log('Seeding Services...');
  const serviceUploadDir = ensureDir('services');
  const serviceCats = ['Rent Tool', 'Window', 'Activate Tools', 'Programming'];

  for (const catName of serviceCats) {
    const catImg = 'services.png';
    const src = path.join(seederAssetsDir, catImg);
    const destName = `cat-${Date.now()}-${catImg}`;
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(serviceUploadDir, destName));

    const cat = await prisma.serviceCategory.create({
      data: { name: catName, imageUrl: `services/${destName}` }
    });

    await prisma.service.create({
      data: {
        categoryId: cat.id,
        title: `${catName} Item`,
        description: `Professional ${catName} service.`,
        price: 50,
        duration: '1 Month',
        deliveryTime: 'Instant',
        image: `services/${destName}`
      }
    });
  }

  // 6. App Settings
  console.log('Seeding App Settings...');
  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      contactEmail: 'support@sameit.com',
      telegramLink: 'https://t.me/sameit_support',
      whatsappLink: 'https://wa.me/123456789',
      aboutUs: 'Same IT is your one-stop solution for mobile repair schematics, components, and professional services. We aim to provide technicians with the best tools and information to excel in their work.',
      intellectualProperty: 'All schematics, diagrams, and content provided in this application are the intellectual property of Same IT or its respective partners. Unauthorized distribution or reverse engineering is strictly prohibited.'
    }
  });

  // 7. Test User with Order History
  console.log('Seeding Test User with Order History...');
  const testUser = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      username: 'testuser',
      password: await bcrypt.hash('password123', 10),
      role: 'USER',
    }
  });

  const allServices = await prisma.service.findMany();
  const allPMs = await prisma.paymentMethod.findMany();

  if (allServices.length > 0 && allPMs.length > 0) {
    for (let i = 0; i < 15; i++) {
      const randomService = allServices[Math.floor(Math.random() * allServices.length)];
      const randomPM = allPMs[Math.floor(Math.random() * allPMs.length)];
      const statuses = [OrderStatus.PROCESSING, OrderStatus.SUCCESSFUL, OrderStatus.FAILED];

      await prisma.order.create({
        data: {
          userId: testUser.id,
          serviceId: randomService.id,
          paymentMethodId: randomPM.id,
          quantity: Math.floor(Math.random() * 3) + 1,
          totalPrice: randomService.price * (Math.floor(Math.random() * 3) + 1),
          phone1: '07701234567',
          status: statuses[Math.floor(Math.random() * statuses.length)],
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
        }
      });
    }
  }

  console.log('Data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
