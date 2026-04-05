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
  await prisma.schematic.deleteMany();
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

  // 2. Devices (Real Data)
  console.log('Seeding Real Devices...');
  const allDevices: any[] = [];

  const deviceData = {
    apple: [
      'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
      'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
      'iPhone 13 Pro Max', 'iPhone 13 Pro'
    ],
    samsung: [
      'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy Z Fold 5',
      'Galaxy Z Flip 5', 'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23',
      'Galaxy A54 5G', 'Galaxy A34 5G', 'Samsung A16e', 'Samsung A16lite'
    ],
    vivo: [
      'X100 Pro', 'X100', 'iQOO 12 Pro', 'iQOO 12', 'V29 Pro', 'V29',
      'Y200', 'T2 Pro 5G', 'X90 Pro+', 'X90 Pro'
    ],
    oppo: [
      'Find N3', 'Find N3 Flip', 'Reno 10 Pro+', 'Reno 10 Pro', 'Reno 10',
      'Find X6 Pro', 'Find X6', 'A98 5G', 'A78 5G', 'A58 4G'
    ],
    poco: [
      'Poco X6 Pro', 'Poco X6', 'Poco M6 Pro', 'Poco C65', 'Poco F5 Pro',
      'Poco F5', 'Poco X5 Pro 5G', 'Poco X5 5G', 'Poco M5s', 'Poco M5'
    ],
    itel: [
      'S23+', 'P40+', 'P40', 'A60s', 'A60', 'S23', 'Vision 3 Plus',
      'Vision 3', 'A58 Pro', 'A58'
    ]
  };

  for (const [brandKey, devicesList] of Object.entries(deviceData)) {
    const brand = brands[brandKey];
    if (!brand) continue;

    for (const devName of devicesList) {
      const device = await prisma.device.create({
        data: { name: devName, deviceType: { connect: { id: brand.id } } }
      });
      allDevices.push({ ...device, deviceTypeId: brand.id });
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

  // Compatibility Mappings: Map random 10 devices to each sub-category to show data
  console.log('Generating Compatibility Mappings...');

  const createBaseTypeCompat = async (type: ComponentType) => {
    const shuffled = allDevices.sort(() => 0.5 - Math.random());
    const selectedDevices = shuffled.slice(0, 15);
    for (const sd of selectedDevices) {
      const sameBrandDevices = allDevices.filter(m => m.deviceTypeId === sd.deviceTypeId);
      const randDevicesForCompat = sameBrandDevices.sort(() => 0.5 - Math.random()).slice(0, 5).map(m => m.name);
      await prisma.compatibility.create({
        data: {
          device: { connect: { id: sd.id } },
          componentType: type,
          compatibleModels: randDevicesForCompat
        }
      });
    }
  };

  await createBaseTypeCompat(ComponentType.SCREEN);
  await createBaseTypeCompat(ComponentType.BATTERY);

  for (const subCat of allSubCats) {
    const shuffled = allDevices.sort(() => 0.5 - Math.random());
    const selectedDevices = shuffled.slice(0, 5);

    for (const sd of selectedDevices) {
      const sameBrandDevices = allDevices.filter(m => m.deviceTypeId === sd.deviceTypeId);
      const randDevicesForCompat = sameBrandDevices.sort(() => 0.5 - Math.random()).slice(0, 5).map(m => m.name);
      await prisma.compatibility.create({
        data: {
          subCategory: { connect: { id: subCat.id } },
          device: { connect: { id: sd.id } },
          componentType: subCat.componentType,
          compatibleModels: randDevicesForCompat
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

    const schemDevices = [...allDevices].sort(() => 0.5 - Math.random()).slice(0, 10);
    for (const sd of schemDevices) {
      await prisma.schematic.create({
        data: {
          device: { connect: { id: sd.id } },
          schematicType: 'Layout Diagram',
          pdfFile: samplePdfName
        }
      });
      await prisma.schematic.create({
        data: {
          device: { connect: { id: sd.id } },
          schematicType: 'Schematic Diagram',
          pdfFile: samplePdfName
        }
      });
    }
  }

  // 4.6 Payment Methods
  console.log('Seeding Payment Methods...');
  await prisma.paymentMethod.create({ data: { title: 'Zain Cash', accountNumber: '07701234567', color: '#FB5507' } });
  await prisma.paymentMethod.create({ data: { title: 'Asia Cell', accountNumber: '07707654321', color: '#FB5507' } });
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
        category: { connect: { id: cat.id } },
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
          user: { connect: { id: testUser.id } },
          service: { connect: { id: randomService.id } },
          paymentMethod: { connect: { id: randomPM.id } },
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
