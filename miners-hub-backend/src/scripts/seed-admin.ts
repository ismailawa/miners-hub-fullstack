import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole, VerificationStatus } from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Miner } from '../entities/miner.entity';
import { Investor } from '../entities/investor.entity';
import { Listing, ListingStatus } from '../entities/listing.entity';
import { Event, EventStatus } from '../entities/event.entity';
import { ForumPost } from '../entities/forum-post.entity';
import { ForumReply } from '../entities/forum-reply.entity';
import {
  Document,
  DocumentReviewStatus,
  DocumentType,
} from '../entities/document.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import {
  SellerPayoutAccount,
  SellerPayoutStatus,
} from '../entities/seller-payout-account.entity';
import {
  EscrowStatus,
  EscrowTransaction,
} from '../entities/escrow-transaction.entity';

const defaultPassword = 'password123';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const minerRepository = app.get<Repository<Miner>>(getRepositoryToken(Miner));
  const investorRepository = app.get<Repository<Investor>>(
    getRepositoryToken(Investor),
  );
  const listingRepository = app.get<Repository<Listing>>(
    getRepositoryToken(Listing),
  );
  const eventRepository = app.get<Repository<Event>>(getRepositoryToken(Event));
  const postRepository = app.get<Repository<ForumPost>>(
    getRepositoryToken(ForumPost),
  );
  const replyRepository = app.get<Repository<ForumReply>>(
    getRepositoryToken(ForumReply),
  );
  const documentRepository = app.get<Repository<Document>>(
    getRepositoryToken(Document),
  );
  const orderRepository = app.get<Repository<Order>>(getRepositoryToken(Order));
  const payoutRepository = app.get<Repository<SellerPayoutAccount>>(
    getRepositoryToken(SellerPayoutAccount),
  );
  const escrowRepository = app.get<Repository<EscrowTransaction>>(
    getRepositoryToken(EscrowTransaction),
  );

  const passwordHash = await bcrypt.hash(
    defaultPassword,
    await bcrypt.genSalt(),
  );

  async function upsertUser(
    data: Partial<User> & { email: string; role: UserRole },
  ) {
    const existing = await userRepository.findOne({
      where: { email: data.email },
    });
    if (existing) {
      Object.assign(existing, data, { passwordHash });
      return userRepository.save(existing);
    }

    return userRepository.save(
      userRepository.create({
        ...data,
        passwordHash,
        verificationStatus:
          data.verificationStatus || VerificationStatus.VERIFIED,
        onboardingComplete: data.onboardingComplete ?? true,
      }),
    );
  }

  const admin = await upsertUser({
    name: 'System Admin',
    email: 'admin@minershub.com',
    role: UserRole.ADMIN,
    verificationStatus: VerificationStatus.VERIFIED,
    onboardingComplete: true,
  });

  const miners = await Promise.all([
    upsertUser({
      name: 'Amina Bello',
      email: 'amina@tinridge.ng',
      role: UserRole.MINER,
      phoneNumber: '+2348010001001',
      address: 'Jos, Plateau State',
      nationality: 'Nigerian',
      verificationStatus: VerificationStatus.VERIFIED,
    }),
    upsertUser({
      name: 'Chinedu Okafor',
      email: 'chinedu@goldline.ng',
      role: UserRole.MINER,
      phoneNumber: '+2348010001002',
      address: 'Ilesha, Osun State',
      nationality: 'Nigerian',
      verificationStatus: VerificationStatus.VERIFIED,
    }),
    upsertUser({
      name: 'Fatima Idris',
      email: 'fatima@lithiumnorth.ng',
      role: UserRole.MINER,
      phoneNumber: '+2348010001003',
      address: 'Kafanchan, Kaduna State',
      nationality: 'Nigerian',
      verificationStatus: VerificationStatus.VERIFIED,
    }),
  ]);

  const investor = await upsertUser({
    name: 'Kemi Adeyemi',
    email: 'kemi@solidcapital.ng',
    role: UserRole.INVESTOR,
    phoneNumber: '+2348010002001',
    address: 'Victoria Island, Lagos',
    nationality: 'Nigerian',
    verificationStatus: VerificationStatus.VERIFIED,
  });

  const minerProfiles = await Promise.all([
    upsertMiner(minerRepository, miners[0], {
      companyName: 'Tin Ridge Minerals Ltd',
      miningLicence: 'ML-PL-2026-014',
      location: 'Plateau',
      companyRegNumber: 'RC-1849201',
      businessAddress: 'Rayfield Road, Jos',
      businessWebsite: 'https://tinridge.example.com',
      industry: 'Tin and columbite mining',
      yearsInOperation: '8',
      miningEquipment: ['Excavators', 'Wash plants', 'Ore sorters'],
      certifications: ['MCO Verified', 'NESREA Compliant'],
    }),
    upsertMiner(minerRepository, miners[1], {
      companyName: 'Goldline Aggregates Nigeria',
      miningLicence: 'ML-OS-2026-032',
      location: 'Osun',
      companyRegNumber: 'RC-1984220',
      businessAddress: 'Ilesha Mining Corridor, Osun',
      businessWebsite: 'https://goldline.example.com',
      industry: 'Gold mining',
      yearsInOperation: '5',
      miningEquipment: ['Crushers', 'Gravity concentrators'],
      certifications: ['MCO Verified'],
    }),
    upsertMiner(minerRepository, miners[2], {
      companyName: 'Lithium North Resources',
      miningLicence: 'ML-KD-2026-021',
      location: 'Kaduna',
      companyRegNumber: 'RC-2011558',
      businessAddress: 'Kafanchan Industrial Layout, Kaduna',
      businessWebsite: 'https://lithiumnorth.example.com',
      industry: 'Lithium exploration',
      yearsInOperation: '3',
      miningEquipment: ['Core drills', 'XRF analyzers'],
      certifications: ['MCO Verified', 'ISO 14001'],
    }),
  ]);

  await upsertInvestor(investorRepository, investor, {
    companyName: 'Solid Capital Partners',
    investmentFocus: ['Tin', 'Gold', 'Lithium'],
    companyRegNumber: 'RC-1729000',
    businessAddress: 'Ozumba Mbadiwe Avenue, Lagos',
    businessWebsite: 'https://solidcapital.example.com',
    industry: 'Commodities investment',
    yearsInOperation: '6',
  });

  await Promise.all([
    upsertListing(listingRepository, minerProfiles[0], {
      mineralType: 'Tin Ore',
      quantity: 125,
      price: 420000,
      gradePurity: 'Sn 68%',
      location: 'Jos, Plateau',
      moisturePercentage: 2.4,
      status: ListingStatus.PUBLISHED,
      listingType: 'buy_now',
    }),
    upsertListing(listingRepository, minerProfiles[1], {
      mineralType: 'Gold Concentrate',
      quantity: 18,
      price: 1850000,
      gradePurity: 'Au 22 g/t',
      location: 'Ilesha, Osun',
      moisturePercentage: 1.8,
      status: ListingStatus.PUBLISHED,
      listingType: 'buy_now',
    }),
    upsertListing(listingRepository, minerProfiles[2], {
      mineralType: 'Lithium Spodumene',
      quantity: 80,
      price: 760000,
      gradePurity: 'Li2O 5.6%',
      location: 'Kafanchan, Kaduna',
      moisturePercentage: 3.1,
      status: ListingStatus.PUBLISHED,
      listingType: 'auction',
    }),
  ]);
  const [tinListing, goldListing, lithiumListing] = await Promise.all([
    listingRepository.findOneOrFail({
      where: { minerId: minerProfiles[0].id, mineralType: 'Tin Ore' },
    }),
    listingRepository.findOneOrFail({
      where: { minerId: minerProfiles[1].id, mineralType: 'Gold Concentrate' },
    }),
    listingRepository.findOneOrFail({
      where: { minerId: minerProfiles[2].id, mineralType: 'Lithium Spodumene' },
    }),
  ]);

  await Promise.all([
    upsertEvent(eventRepository, {
      title: 'Nigeria Mining Week 2026',
      description:
        'Policy, financing, and mineral trade sessions for verified operators.',
      date: '2026-10-12',
      location: 'Abuja International Conference Centre',
      imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
      registrationUrl:
        'https://minershub.example.com/events/nigeria-mining-week-2026',
      featured: true,
      status: EventStatus.PUBLISHED,
    }),
    upsertEvent(eventRepository, {
      title: 'Critical Minerals Investment Forum',
      description:
        'A focused forum for lithium, tin, gold, and battery mineral opportunities.',
      date: '2026-08-18',
      location: 'Eko Convention Centre, Lagos',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      registrationUrl:
        'https://minershub.example.com/events/critical-minerals-forum',
      featured: true,
      status: EventStatus.PUBLISHED,
    }),
    upsertEvent(eventRepository, {
      title: 'Mine Safety & Compliance Clinic',
      description:
        'Hands-on compliance review for documents, licences, and site readiness.',
      date: '2026-07-24',
      location: 'Jos, Plateau',
      imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
      registrationUrl:
        'https://minershub.example.com/events/safety-compliance-clinic',
      featured: false,
      status: EventStatus.PUBLISHED,
    }),
  ]);

  const post = await upsertForumPost(postRepository, {
    authorId: miners[0].id,
    authorName: miners[0].name || 'Verified Miner',
    title: 'Best practices for publishing assay-backed listings',
    content:
      'We have seen stronger buyer response when listings include recent assay reports, mine location context, and realistic delivery timelines.',
    category: 'marketplace',
    tags: ['assay', 'listings', 'buyers'],
  });

  await upsertForumReply(replyRepository, post, {
    authorId: investor.id,
    authorName: investor.name || 'Investor',
    content:
      'From the buyer side, assay date and independent lab name are the first fields we check before opening a negotiation.',
  });

  await Promise.all([
    upsertDocument(documentRepository, miners[0], tinListing, {
      type: DocumentType.KYC,
      fileName: 'tin-ridge-kyc.pdf',
      fileUrl: 'https://example.com/documents/tin-ridge-kyc.pdf',
      fileSize: 840000,
      mimeType: 'application/pdf',
      reviewStatus: DocumentReviewStatus.APPROVED,
      reviewNotes: 'Seeded verified miner document.',
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    }),
    upsertDocument(documentRepository, miners[1], goldListing, {
      type: DocumentType.MINING_LICENCE,
      fileName: 'goldline-mining-licence.pdf',
      fileUrl: 'https://example.com/documents/goldline-mining-licence.pdf',
      fileSize: 1240000,
      mimeType: 'application/pdf',
      reviewStatus: DocumentReviewStatus.PENDING,
    }),
  ]);

  const aminaPayout = await upsertPayoutAccount(payoutRepository, miners[0], {
    bankName: 'Access Bank',
    bankCode: '044',
    accountNumber: '0123456789',
    accountName: 'Tin Ridge Minerals Ltd',
    currency: 'NGN',
    status: SellerPayoutStatus.ACTIVE,
    flutterwaveSubaccountId: 'seed-subaccount-tin-ridge',
    flutterwaveSubaccountReference: `seed-seller-${miners[0].id}`,
  });

  const goldlinePayout = await upsertPayoutAccount(
    payoutRepository,
    miners[1],
    {
      bankName: 'Zenith Bank',
      bankCode: '057',
      accountNumber: '9876543210',
      accountName: 'Goldline Aggregates Nigeria',
      currency: 'NGN',
      status: SellerPayoutStatus.ACTIVE,
      flutterwaveSubaccountId: 'seed-subaccount-goldline',
      flutterwaveSubaccountReference: `seed-seller-${miners[1].id}`,
    },
  );

  await upsertPayoutAccount(payoutRepository, miners[2], {
    bankName: 'GTBank',
    bankCode: '058',
    accountNumber: '1029384756',
    accountName: 'Lithium North Resources',
    currency: 'NGN',
    status: SellerPayoutStatus.ACTIVE,
    flutterwaveSubaccountId: 'seed-subaccount-lithium-north',
    flutterwaveSubaccountReference: `seed-seller-${miners[2].id}`,
  });

  const fundedOrder = await upsertOrder(
    orderRepository,
    investor,
    miners[0],
    tinListing,
    {
      quantity: 10,
      totalAmount: 4200000,
      status: OrderStatus.CONFIRMED,
      paymentStatus: 'paid',
      deliveryAddress: 'Solid Capital Warehouse, Apapa, Lagos',
    },
  );

  await upsertEscrow(escrowRepository, fundedOrder, aminaPayout, {
    status: EscrowStatus.FUNDED,
    grossAmount: 4200000,
    commissionAmount: 210000,
    sellerNetAmount: 3990000,
    flutterwaveTxRef: `seed-funded-${fundedOrder.id}`,
    flutterwaveTransactionId: 'seed-flw-funded-001',
    flutterwavePaymentStatus: 'successful',
    fundedAt: new Date(),
  });

  const awaitingReleaseOrder = await upsertOrder(
    orderRepository,
    investor,
    miners[1],
    goldListing,
    {
      quantity: 2,
      totalAmount: 3700000,
      status: OrderStatus.DELIVERED,
      paymentStatus: 'paid',
      deliveryAddress: 'Solid Capital Warehouse, Apapa, Lagos',
    },
  );

  await upsertEscrow(escrowRepository, awaitingReleaseOrder, goldlinePayout, {
    status: EscrowStatus.AWAITING_RELEASE,
    grossAmount: 3700000,
    commissionAmount: 185000,
    sellerNetAmount: 3515000,
    flutterwaveTxRef: `seed-awaiting-release-${awaitingReleaseOrder.id}`,
    flutterwaveTransactionId: 'seed-flw-awaiting-001',
    flutterwavePaymentStatus: 'successful',
    fundedAt: new Date(),
  });

  console.log('MVP seed data is ready.');
  console.log(`Admin: admin@minershub.com / ${defaultPassword}`);
  console.log(`Investor: ${investor.email} / ${defaultPassword}`);
  console.log(`Miner: ${miners[0].email} / ${defaultPassword}`);

  await app.close();
}

async function upsertMiner(
  repository: Repository<Miner>,
  user: User,
  data: Partial<Miner> & { companyName: string; location: string },
) {
  const existing = await repository.findOne({ where: { userId: user.id } });
  const miner = existing || repository.create({ userId: user.id });
  Object.assign(miner, data);
  return repository.save(miner);
}

async function upsertInvestor(
  repository: Repository<Investor>,
  user: User,
  data: Partial<Investor> & { companyName: string; investmentFocus: string[] },
) {
  const existing = await repository.findOne({ where: { userId: user.id } });
  const investor = existing || repository.create({ userId: user.id });
  Object.assign(investor, data);
  return repository.save(investor);
}

async function upsertListing(
  repository: Repository<Listing>,
  miner: Miner,
  data: Partial<Listing> & { mineralType: string },
) {
  const existing = await repository.findOne({
    where: { minerId: miner.id, mineralType: data.mineralType },
  });
  const listing = existing || repository.create({ minerId: miner.id });
  Object.assign(listing, data);
  return repository.save(listing);
}

async function upsertEvent(
  repository: Repository<Event>,
  data: Partial<Event> & { title: string },
) {
  const existing = await repository.findOne({ where: { title: data.title } });
  const event = existing || repository.create();
  Object.assign(event, data);
  return repository.save(event);
}

async function upsertForumPost(
  repository: Repository<ForumPost>,
  data: Partial<ForumPost> & { title: string },
) {
  const existing = await repository.findOne({ where: { title: data.title } });
  const post = existing || repository.create();
  Object.assign(post, data);
  return repository.save(post);
}

async function upsertForumReply(
  repository: Repository<ForumReply>,
  post: ForumPost,
  data: Partial<ForumReply> & { content: string },
) {
  const existing = await repository.findOne({
    where: { postId: post.id, content: data.content },
  });
  const reply = existing || repository.create({ postId: post.id });
  Object.assign(reply, data);
  return repository.save(reply);
}

async function upsertDocument(
  repository: Repository<Document>,
  user: User,
  listing: Listing | null,
  data: Partial<Document> & { fileName: string; type: DocumentType },
) {
  const existing = await repository.findOne({
    where: { userId: user.id, fileName: data.fileName },
  });
  const document = existing || repository.create({ userId: user.id });
  Object.assign(document, {
    ...data,
    listingId: listing?.id || null,
  });
  return repository.save(document);
}

async function upsertOrder(
  repository: Repository<Order>,
  buyer: User,
  seller: User,
  listing: Listing,
  data: Partial<Order> & {
    quantity: number;
    totalAmount: number;
    status: OrderStatus;
  },
) {
  const existing = await repository.findOne({
    where: { buyerId: buyer.id, listingId: listing.id },
  });
  const order =
    existing ||
    repository.create({
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: listing.id,
    });
  Object.assign(order, {
    ...data,
    statusHistory: [
      {
        status: OrderStatus.PENDING,
        date: new Date().toISOString(),
        notes: 'Seed order created.',
      },
      {
        status: data.status,
        date: new Date().toISOString(),
        notes: 'Seed order status.',
      },
    ],
  });
  return repository.save(order);
}

async function upsertPayoutAccount(
  repository: Repository<SellerPayoutAccount>,
  user: User,
  data: Partial<SellerPayoutAccount> & {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
  },
) {
  const existing = await repository.findOne({ where: { userId: user.id } });
  const payout = existing || repository.create({ userId: user.id });
  Object.assign(payout, data);
  return repository.save(payout);
}

async function upsertEscrow(
  repository: Repository<EscrowTransaction>,
  order: Order,
  payout: SellerPayoutAccount,
  data: Partial<EscrowTransaction> & {
    status: EscrowStatus;
    grossAmount: number;
    commissionAmount: number;
    sellerNetAmount: number;
    flutterwaveTxRef: string;
  },
) {
  const existing = await repository.findOne({ where: { orderId: order.id } });
  const escrow = existing || repository.create({ orderId: order.id });
  Object.assign(escrow, {
    ...data,
    buyerId: order.buyerId,
    sellerId: order.sellerId,
    sellerPayoutAccountId: payout.id,
    currency: data.currency || payout.currency || 'NGN',
  });
  return repository.save(escrow);
}

bootstrap();
