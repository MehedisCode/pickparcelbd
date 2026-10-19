"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Locale = "bn" | "en";

export interface Translations {
  // Brand & Top Header
  brandName: string;
  brandTagline: string;
  announcementText: string;
  announcementHelp: string;
  navMarketplace: string;
  navTracking: string;
  navRideShare: string;
  navHelp: string;
  navDeploymentCheck: string;
  btnMyWorkspace: string;
  btnGetStarted: string;
  shoppingBagAria: string;
  toggleNavAria: string;
  langSwitchAria: string;

  // Footer
  footerTagline: string;
  footerTerms: string;
  footerContact: string;
  footerRights: string;

  // Common UI
  loading: string;
  loadingWorkspace: string;
  emptyTitle: string;
  emptyDescription: string;
  errorTitle: string;
  errorRetry: string;
  savedSuccessfully: string;
  actionFailed: string;
  back: string;
  cancel: string;
  save: string;
  confirm: string;
  search: string;
  viewDetails: string;
  remove: string;
  status: string;
  date: string;
  actions: string;

  // Hero & Marketplace Catalog
  heroEyebrow: string;
  heroHeading1: string;
  heroHeading2: string;
  heroHeading3: string;
  heroSubtitle: string;
  heroExploreBtn: string;
  heroSendParcelBtn: string;
  heroDeliveredTitle: string;
  heroDeliveredSubtitle: string;
  heroOnWayTitle: string;
  heroOnWaySubtitle: string;

  // Trust Badges
  trustDoorTitle: string;
  trustDoorSub: string;
  trustTrustTitle: string;
  trustTrustSub: string;
  trustTrackTitle: string;
  trustTrackSub: string;
  trustBusinessTitle: string;
  trustBusinessSub: string;

  // Marketplace Catalog Sections
  marketHeadingEyebrow: string;
  marketHeadingTitle: string;
  marketHeadingSubtitle: string;
  marketDiscoverEyebrow: string;
  marketDiscoverTitle: string;
  marketDiscoverFromSeller: string;
  marketDiscoverSubtitle: string;
  marketExploreAll: string;
  searchPlaceholder: string;
  sortLatest: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  addedToBag: string;
  offDiscount: string;

  // Categories
  catAll: string;
  catFashion: string;
  catHome: string;
  catElectronics: string;
  catBeauty: string;
  catFood: string;
  catOther: string;

  // Cart Screen
  cartTitle: string;
  cartSubtitle: string;
  cartEmptyTitle: string;
  cartEmptyDesc: string;
  cartEmptyAction: string;
  cartSummaryTitle: string;
  cartItemsSubtotal: string;
  cartDeliveryEstimate: string;
  cartDeliveryNote: string;
  cartPaymentMethod: string;
  cartPaymentCod: string;
  cartPaymentPrepaid: string;
  cartReviewPrices: string;
  cartPricesReviewed: string;
  cartOrderTotal: string;
  cartDeliveryLabel: string;
  cartTermsAgree: string;
  cartPlaceOrder: string;
  cartOrderPlaced: string;
  cartSignInToCheckout: string;

  // Tracking Screen
  trackingEyebrow: string;
  trackingTitle: string;
  trackingSubtitle: string;
  trackingInputLabel: string;
  trackingInputPlaceholder: string;
  trackingButton: string;
  trackingNotFound: string;
  trackingPrivacyNotice: string;
  trackingDestination: string;

  // Help Screen
  helpEyebrow: string;
  helpTitle: string;
  helpSubtitle: string;
  helpOrdersPanelTitle: string;
  helpOrdersHeading: string;
  helpOrdersText: string;
  helpOrdersBtn: string;
  helpContactPanelTitle: string;
  helpWorkingHours: string;
  helpFaqTitle: string;
  helpFaq1Q: string;
  helpFaq1A: string;
  helpFaq2Q: string;
  helpFaq2A: string;
  helpFaq3Q: string;
  helpFaq3A: string;

  // Auth & Login
  loginStoryEyebrow: string;
  loginStoryHeading: string;
  loginStorySubtitle: string;
  loginBenefitParcel: string;
  loginBenefitCustomer: string;
  loginBenefitTrust: string;
  loginFormEyebrow: string;
  loginFormHeading: string;
  loginFormSubtitle: string;
  loginContinueGoogle: string;
  loginTermsNotice: string;
  loginPreviewTitle: string;
  loginPreviewSubtitle: string;
  loginContinueAs: string;

  // Workspace Sidebar & Topbar
  wsDistrictControl: string;
  wsDeliveryNetwork: string;
  wsMyBusiness: string;
  wsAdministration: string;
  wsDeliveryOperations: string;
  wsWorkspace: string;
  wsExploreMore: string;
  wsHelpTitle: string;
  wsHelpSubtitle: string;
  wsHelpTalk: string;
  wsSignOut: string;
  wsSearchPlaceholder: string;
  wsFooterNote: string;

  // Customer Nav Items
  navOverview: string;
  navMyParcels: string;
  navOrders: string;
  navMyProducts: string;
  navCashMemos: string;
  navMessages: string;
  navWallet: string;
  navFollowing: string;
  navNews: string;
  navBuyerBlocks: string;
  navSettings: string;

  // Operations Nav Items
  navOpsOverview: string;
  navOpsRequests: string;
  navOpsAssignments: string;
  navOpsCustody: string;
  navOpsTransfers: string;
  navOpsReceive: string;

  // Admin Nav Items
  navAdminOverview: string;
  navAdminUsers: string;
  navAdminRidersAgents: string;
  navAdminParcels: string;
  navAdminFinance: string;
  navAdminAudits: string;
  navAdminRecovery: string;
  navAdminReports: string;

  // Ride Share
  rideEyebrow: string;
  rideTitle: string;
  rideSubtitle: string;
  rideBookTab: string;
  rideActiveTab: string;
  rideDriverMode: string;
  ridePassengerMode: string;
  ridePickupLabel: string;
  rideDestinationLabel: string;
  rideRequestBtn: string;
  rideOnlineDrivers: string;
  rideGpsBtn: string;

  // Statuses
  statusPending: string;
  statusAssigned: string;
  statusPickedUp: string;
  statusInTransit: string;
  statusOutForDelivery: string;
  statusDelivered: string;
  statusReturnPending: string;
  statusReturned: string;
  statusCancelled: string;
  statusPaid: string;
  statusUnpaid: string;
  statusDraft: string;
}

export const bn: Translations = {
  brandName: "PickParcelBD",
  brandTagline: "আপনার ব্যবসা, পৌঁছে দেওয়ার দায়িত্বে।",
  announcementText: "বাংলাদেশের জন্য তৈরি · প্রতিটি পদক্ষেপে আপনার পাশে।",
  announcementHelp: "সাহায্য প্রয়োজন? আমরা আছি আপনার পাশে",
  navMarketplace: "মার্কেটপ্লেস",
  navTracking: "পার্সেল ট্র্যাকিং",
  navRideShare: "রাইড শেয়ার",
  navHelp: "সাহায্য ও যোগাযোগ",
  navDeploymentCheck: "সিস্টেম চেক",
  btnMyWorkspace: "আমার ড্যাশবোর্ড",
  btnGetStarted: "শুরু করুন / লগইন",
  shoppingBagAria: "শপিং ব্যাগ",
  toggleNavAria: "মেনু খুলুন/বন্ধ করুন",
  langSwitchAria: "ভাষা পরিবর্তন করুন",

  footerTagline: "ক্ষুদ্র ব্যবসা। অপার সম্ভাবনা।",
  footerTerms: "নিয়ম ও শর্তাবলী",
  footerContact: "যোগাযোগ",
  footerRights: "সর্বস্বত্ব সংরক্ষিত।",

  loading: "লোড হচ্ছে…",
  loadingWorkspace: "আপনার ড্যাশবোর্ড লোড হচ্ছে…",
  emptyTitle: "এখানে এখনও কিছু নেই",
  emptyDescription: "আপনার যাবতীয় কার্যক্রম এখানে প্রদর্শিত হবে।",
  errorTitle: "তথ্য লোড করা সম্ভব হয়নি",
  errorRetry: "পুনরায় চেষ্টা করুন",
  savedSuccessfully: "সফলভাবে সংরক্ষিত হয়েছে।",
  actionFailed: "এই কাজটি সম্পন্ন করা যায়নি।",
  back: "ফিরে যান",
  cancel: "বাতিল",
  save: "সংরক্ষণ করুন",
  confirm: "নিশ্চিত করুন",
  search: "অনুসন্ধান",
  viewDetails: "বিস্তারিত দেখুন",
  remove: "মুছে ফেলুন",
  status: "অবস্থা",
  date: "তারিখ",
  actions: "পদক্ষেপ",

  heroEyebrow: "স্থানীয় শেকড় · অপার সম্ভাবনা",
  heroHeading1: "সেরা পছন্দ।",
  heroHeading2: "বিশ্বস্ত যাত্রা।",
  heroHeading3: "সব এক ঠিকানায়।",
  heroSubtitle:
    "আপনার পছন্দের পণ্য কিনুন, নিজের ব্যবসা গড়ে তুলুন, আর ডেলিভারির দায়িত্ব নিশ্চিন্তে ছেড়ে দিন আমাদের ওপর।",
  heroExploreBtn: "পণ্য দেখুন",
  heroSendParcelBtn: "পার্সেল পাঠান",
  heroDeliveredTitle: "যত্নের সাথে ডেলিভারি সম্পন্ন",
  heroDeliveredSubtitle: "প্রতিটি দুয়ারে হাসিমুখ।",
  heroOnWayTitle: "ডেলিভারির পথে আছে",
  heroOnWaySubtitle: "প্রতি মুহূর্তে আপনার আরও কাছাকাছি।",

  trustDoorTitle: "আপনার দুয়ার থেকে তাদের দুয়ারে",
  trustDoorSub: "সহজ ও নির্ভরযোগ্য পার্সেল ডেলিভারি",
  trustTrustTitle: "একটি বিশ্বস্ত কমিউনিটি",
  trustTrustSub: "সত্যিকারের উদ্যোক্তা ও বিকাশমান ব্যবসা",
  trustTrackTitle: "প্রতিটি পদক্ষেপে স্বচ্ছ ট্র্যাকিং",
  trustTrackSub: "পার্সেলের পুরো যাত্রাপথ পর্যবেক্ষণ করুন",
  trustBusinessTitle: "দেশীয় ব্যবসার বিশ্বস্ত সহযোগী",
  trustBusinessSub: "আপনার ব্যবসার নতুন দিগন্ত শুরু হোক এখানে",

  marketHeadingEyebrow: "পিকপার্সেল মার্কেটপ্লেস",
  marketHeadingTitle: "ঘরের কাছেই সেরা সব পণ্য।",
  marketHeadingSubtitle: "স্বতন্ত্র বিক্রেতাদের অনন্য সব কালেকশন ঘুরে দেখুন।",
  marketDiscoverEyebrow: "নতুন কিছু আবিষ্কার করুন",
  marketDiscoverTitle: "আপনার পছন্দের পণ্য বেছে নিন।",
  marketDiscoverFromSeller: "এই বিক্রেতার পণ্যসমূহ",
  marketDiscoverSubtitle: "আমাদের উদ্যোক্তা কমিউনিটির নির্বাচিত চমৎকার পণ্য।",
  marketExploreAll: "সব পণ্য দেখুন",
  searchPlaceholder: "পণ্য খুঁজুন…",
  sortLatest: "সর্বশেষ",
  sortPriceAsc: "কম দাম",
  sortPriceDesc: "বেশি দাম",
  addedToBag: "ব্যাগে যোগ করা হয়েছে।",
  offDiscount: "% ছাড়",

  catAll: "সকল পণ্য",
  catFashion: "ফ্যাশন ও অনুষঙ্গ",
  catHome: "ঘর ও জীবনযাত্রা",
  catElectronics: "ইলেকট্রনিক্স",
  catBeauty: "সৌন্দর্য ও রূপচর্চা",
  catFood: "খাবার ও মিষ্টান্ন",
  catOther: "অন্যান্য সামগ্রী",

  cartTitle: "আপনার শপিং ব্যাগ",
  cartSubtitle: "অর্ডার নিশ্চিত করতে বিবরণী মিলিয়ে নিন।",
  cartEmptyTitle: "আপনার ব্যাগ একদম খালি",
  cartEmptyDesc: "মার্কেটপ্লেস ঘুরে আপনার পছন্দের পণ্য ব্যাগে যোগ করুন।",
  cartEmptyAction: "মার্কেটপ্লেসে যান",
  cartSummaryTitle: "অর্ডার সারসংক্ষেপ",
  cartItemsSubtotal: "পণ্যের সর্বমোট মূল্য",
  cartDeliveryEstimate: "ডেলিভারি চার্জ",
  cartDeliveryNote:
    "অর্ডারগুলো বিক্রেতা অনুসারে ভাগ করা হয়। অর্ডার নিশ্চিত করার সময় সার্ভার থেকে ডেলিভারি রেট যাচাই করা হয়।",
  cartPaymentMethod: "মূল্য পরিশোধের পদ্ধতি",
  cartPaymentCod: "ক্যাশ অন ডেলিভারি (পণ্য পেয়ে মূল্য দিন)",
  cartPaymentPrepaid: "অগ্রিম পরিশোধ — বিক্রেতার সাথে সমন্বয়",
  cartReviewPrices: "মূল্য ও ডেলিভারি চার্জ যাচাই করুন",
  cartPricesReviewed: "বর্তমান মূল্য যাচাই করা হয়েছে।",
  cartOrderTotal: "মোট প্রদেয়",
  cartDeliveryLabel: "ডেলিভারি",
  cartTermsAgree: "আমি নিয়ম ও শর্তাবলী পড়েছি এবং সম্মত আছি।",
  cartPlaceOrder: "অর্ডার কনফার্ম করুন",
  cartOrderPlaced: "অর্ডার সফলভাবে প্রদান করা হয়েছে।",
  cartSignInToCheckout: "অর্ডার করতে লগইন করুন",

  trackingEyebrow: "প্রতিটি পদক্ষেপে আমরা পাশে আছি",
  trackingTitle: "আপনার পার্সেল এখন কোথায়?",
  trackingSubtitle:
    "পার্সেলের বর্তমান অবস্থান জানতে আপনার RFD ট্র্যাকিং কোডটি লিখুন।",
  trackingInputLabel: "ট্র্যাকিং কোড",
  trackingInputPlaceholder: "যেমন: RFD123456",
  trackingButton: "পার্সেল ট্র্যাক করুন",
  trackingNotFound: "এই ট্র্যাকিং কোডের কোনো পার্সেল পাওয়া যায়নি।",
  trackingPrivacyNotice:
    "নিরাপত্তার স্বার্থে গ্রাহকের সংবেদনশীল তথ্য ও ভেরিফিকেশন কোড কেবল অনুমোদিত সদস্যরাই দেখতে পারেন।",
  trackingDestination: "গন্তব্য",

  helpEyebrow: "সহযোগিতা সবসময় আপনার পাশে",
  helpTitle: "আমরা আছি আপনার সহযোগিতায়।",
  helpSubtitle: "আপনার ব্যবসার প্রতিটি ধাপে সঠিক সমাধান খুঁজে নিন।",
  helpOrdersPanelTitle: "অর্ডার ও ডেলিভারি সংক্রান্ত",
  helpOrdersHeading: "সরাসরি যোগাযোগের সুযোগ।",
  helpOrdersText:
    "অর্ডার সম্পর্কিত যেকোনো প্রশ্নে বিক্রেতাকে সরাসরি মেসেজ দিন। আর পার্সেলের ক্ষেত্রে নিযুক্ত রাইডারের সাথে যোগাযোগ করুন।",
  helpOrdersBtn: "আমার অর্ডারসমূহ দেখুন",
  helpContactPanelTitle: "পিকপার্সেল বিডির সাথে যোগাযোগ",
  helpWorkingHours: "প্রতিদিন সকাল ৯টা থেকে রাত ৯টা",
  helpFaqTitle: "সাধারণ কিছু প্রশ্নোত্তর (FAQ)",
  helpFaq1Q: "কীভাবে পার্সেল বুক করবেন?",
  helpFaq1A:
    "লগইন করে আপনার প্রোফাইল সম্পূর্ণ করুন। এরপর ড্যাশবোর্ড থেকে 'পার্সেল পাঠান' নির্বাচন করে প্রাপকের তথ্য, ডেলিভারি ফি এবং ক্যাশ অন ডেলিভারি (COD) পরিমাণ লিখুন।",
  helpFaq2Q: "ভেরিফিকেশন ও ওটিপি (OTP) কোড কখন দিতে হয়?",
  helpFaq2A:
    "পার্সেল রাইডারের হাতে হস্তান্তরের সময় পিকআপ কোড শেয়ার করুন। প্রাপক পণ্য গ্রহণের সময় ডেলিভারি কোড দিয়ে ডেলিভারি নিশ্চিত করবেন।",
  helpFaq3Q: "ওয়ালেট ব্যালেন্স কীভাবে জমা হয়?",
  helpFaq3A:
    "সফল ডেলিভারি ও টাকা সংগ্রহের পর সংশ্লিষ্ট ক্যাশ অন ডেলিভারি (COD) অর্থ আপনার ওয়ালেটে স্বয়ংক্রিয়ভাবে ক্রেডিট হিসেবে যোগ হয়।",

  loginStoryEyebrow: "আপনার নতুন অধ্যায় শুরু হোক এখানে",
  loginStoryHeading: "ক্ষুদ্র ব্যবসা। বড় স্বপ্ন। প্রতিটি পদক্ষেপে আমাদের সহযোগিতা।",
  loginStorySubtitle:
    "আপনার মার্কেটপ্লেস, পার্সেল ডেলিভারি নেটওয়ার্ক এবং ব্যবসায়িক কাজের স্থান—সব এক সুতোয় গাঁথা।",
  loginBenefitParcel: "সহজে পার্সেল বুকিং ও লাইভ ট্র্যাকিং",
  loginBenefitCustomer: "সারা দেশের নতুন ক্রেতাদের কাছে পৌঁছান",
  loginBenefitTrust: "নিরাপদ ও বিশ্বস্ত ডেলিভারি ব্যবস্থা",
  loginFormEyebrow: "পিকপার্সেল বিডিতে স্বাগতম",
  loginFormHeading: "চলুন শুরু করা যাক।",
  loginFormSubtitle:
    "নতুন উদ্যোক্তা? গুগল দিয়ে এক ক্লিকে অ্যাকাউন্ট তৈরি করুন। আগে থেকেই নিবন্ধিত? একই গুগল অ্যাকাউন্ট দিয়ে সাইন ইন করুন।",
  loginContinueGoogle: "গুগল (Google) দিয়ে প্রবেশ করুন",
  loginTermsNotice:
    "প্রবেশ করার মাধ্যমে আপনি আমাদের নিয়ম ও শর্তাবলীতে সম্মতি জানাচ্ছেন।",
  loginPreviewTitle: "লোকাল ডেভেলপমেন্ট প্রিভিউ",
  loginPreviewSubtitle:
    "লোকাল টেস্টিংয়ের জন্য নির্দিষ্ট ভূমিকা নির্বাচন করে টেস্ট অ্যাকাউন্টে প্রবেশ করতে পারেন।",
  loginContinueAs: "হিসেবে প্রবেশ করুন",

  wsDistrictControl: "জেলা নিয়ন্ত্রণ",
  wsDeliveryNetwork: "ডেলিভারি নেটওয়ার্ক",
  wsMyBusiness: "আমার ব্যবসা",
  wsAdministration: "প্রশাসন",
  wsDeliveryOperations: "ডেলিভারি অপারেশনস",
  wsWorkspace: "ড্যাশবোর্ড",
  wsExploreMore: "আরও দেখুন",
  wsHelpTitle: "সহযোগিতা সবসময় পাশে",
  wsHelpSubtitle: "আমরা আছি আপনার ব্যবসার সাথে।",
  wsHelpTalk: "কথা বলুন",
  wsSignOut: "লগআউট",
  wsSearchPlaceholder: "পার্সেল খুঁজুন…",
  wsFooterNote: "বাংলাদেশের ব্যবসার নিজস্ব প্ল্যাটফর্ম।",

  navOverview: "ড্যাশবোর্ড",
  navMyParcels: "আমার পার্সেলসমূহ",
  navOrders: "অর্ডারসমূহ",
  navMyProducts: "আমার পণ্যসমূহ",
  navCashMemos: "ক্যাশ মেমো",
  navMessages: "বার্তা",
  navWallet: "আমার ওয়ালেট",
  navFollowing: "অনুসরণ করা স্টোর",
  navNews: "আপডেট ও নোটিশ",
  navBuyerBlocks: "গ্রাহক সেটিংস",
  navSettings: "সেটিংস",

  navOpsOverview: "অপারেশনস ওভারভিউ",
  navOpsRequests: "পিকআপের অনুরোধসমূহ",
  navOpsAssignments: "আমার পিকআপ ব্যাচ",
  navOpsCustody: "আমার হেফাজতে থাকা পার্সেল",
  navOpsTransfers: "ট্রান্সফার ও ইতিহাস",
  navOpsReceive: "হস্তান্তর গ্রহণ",

  navAdminOverview: "জেলা ওভারভিউ",
  navAdminUsers: "ব্যবহারকারী ও পদবী",
  navAdminRidersAgents: "রাইডার ও এজেন্ট",
  navAdminParcels: "পার্সেল নিয়ন্ত্রণ",
  navAdminFinance: "আর্থিক লেনদেন ও নিষ্পত্তি",
  navAdminAudits: "অডিট ও সমন্বয়",
  navAdminRecovery: "রিকভারি ও স্ন্যাপশট",
  navAdminReports: "কার্যক্রম ও রিপোর্ট",

  rideEyebrow: "দ্রুত ও সহজে আপনার গন্তব্যে",
  rideTitle: "রাইড শেয়ারিং",
  rideSubtitle: "স্থানীয় রাইডারের সাথে সুবিধাজনক যাতায়াত।",
  rideBookTab: "রাইড বুক করুন",
  rideActiveTab: "চলমান রাইড",
  rideDriverMode: "রাইডার মোড",
  ridePassengerMode: "যাত্রী মোড",
  ridePickupLabel: "পিকআপ লোকেশন",
  rideDestinationLabel: "গন্তব্য",
  rideRequestBtn: "রাইডের অনুরোধ পাঠান",
  rideOnlineDrivers: "নিকটবর্তী সক্রিয় রাইডার",
  rideGpsBtn: "জিপিএস লোকেশন আপডেট করুন",

  statusPending: "পেন্ডিং (অপেক্ষমান)",
  statusAssigned: "রাইডারকে দেওয়া হয়েছে",
  statusPickedUp: "পিকআপ সম্পন্ন",
  statusInTransit: "হাবে স্থানান্তরিত হচ্ছে",
  statusOutForDelivery: "ডেলিভারির পথে",
  statusDelivered: "ডেলিভারি সম্পন্ন",
  statusReturnPending: "রিটার্ন প্রক্রিয়াধীন",
  statusReturned: "রিটার্ন সম্পন্ন",
  statusCancelled: "বাতিল করা হয়েছে",
  statusPaid: "পরিশোধিত",
  statusUnpaid: "অপরিশোধিত",
  statusDraft: "খসড়া",
};

export const en: Translations = {
  brandName: "PickParcelBD",
  brandTagline: "YOUR BUSINESS, DELIVERED.",
  announcementText: "Built for Bangladesh. Connected by possibility.",
  announcementHelp: "Need a hand? We’re here",
  navMarketplace: "Marketplace",
  navTracking: "Track a parcel",
  navRideShare: "Ride share",
  navHelp: "Help & support",
  navDeploymentCheck: "Deployment check",
  btnMyWorkspace: "My workspace",
  btnGetStarted: "Get started",
  shoppingBagAria: "Shopping bag",
  toggleNavAria: "Toggle navigation",
  langSwitchAria: "Switch language",

  footerTagline: "Small businesses. Big possibilities.",
  footerTerms: "Terms & conditions",
  footerContact: "Contact us",
  footerRights: "All rights reserved.",

  loading: "Loading…",
  loadingWorkspace: "Loading your workspace…",
  emptyTitle: "Nothing here yet",
  emptyDescription: "Your activity will appear here.",
  errorTitle: "We couldn’t load this",
  errorRetry: "Try again",
  savedSuccessfully: "Saved successfully.",
  actionFailed: "Unable to complete this action.",
  back: "Back",
  cancel: "Cancel",
  save: "Save",
  confirm: "Confirm",
  search: "Search",
  viewDetails: "View details",
  remove: "Remove",
  status: "Status",
  date: "Date",
  actions: "Actions",

  heroEyebrow: "LOCAL ROOTS. LIMITLESS POSSIBILITIES.",
  heroHeading1: "Good finds.",
  heroHeading2: "Great journeys.",
  heroHeading3: "All connected.",
  heroSubtitle:
    "Discover something you love, grow a business you believe in, and let us take care of the journey.",
  heroExploreBtn: "Find your next favorite",
  heroSendParcelBtn: "Send a parcel",
  heroDeliveredTitle: "Delivered with care",
  heroDeliveredSubtitle: "Another happy doorstep.",
  heroOnWayTitle: "On its way to you",
  heroOnWaySubtitle: "A little closer, every day.",

  trustDoorTitle: "From your door to theirs",
  trustDoorSub: "Parcel delivery made personal",
  trustTrustTitle: "A community you can trust",
  trustTrustSub: "Real people. Growing businesses.",
  trustTrackTitle: "Every step, accounted for",
  trustTrackSub: "Track your parcel’s whole journey",
  trustBusinessTitle: "Made for local businesses",
  trustBusinessSub: "Your next chapter starts here",

  marketHeadingEyebrow: "THE PICKPARCEL MARKETPLACE",
  marketHeadingTitle: "Good things, closer to home.",
  marketHeadingSubtitle:
    "Discover independent sellers and something a little unexpected.",
  marketDiscoverEyebrow: "A LITTLE DISCOVERY GOES A LONG WAY",
  marketDiscoverTitle: "Meet your next favorite.",
  marketDiscoverFromSeller: "From this seller",
  marketDiscoverSubtitle: "Thoughtful finds from our growing community.",
  marketExploreAll: "Explore everything",
  searchPlaceholder: "Search products…",
  sortLatest: "Latest",
  sortPriceAsc: "Price: low to high",
  sortPriceDesc: "Price: high to low",
  addedToBag: "Added to your bag.",
  offDiscount: "% OFF",

  catAll: "All discoveries",
  catFashion: "Fashion & accessories",
  catHome: "Home & living",
  catElectronics: "Electronics",
  catBeauty: "Beauty & care",
  catFood: "Food & treats",
  catOther: "A little of everything",

  cartTitle: "Your order, at a glance",
  cartSubtitle: "Review your selected items before placing your order.",
  cartEmptyTitle: "A little room for something lovely.",
  cartEmptyDesc:
    "Your bag is empty. Explore the marketplace and find your next favorite.",
  cartEmptyAction: "Explore the marketplace",
  cartSummaryTitle: "Your order, at a glance",
  cartItemsSubtotal: "Items subtotal",
  cartDeliveryEstimate: "Delivery estimate",
  cartDeliveryNote:
    "Orders are grouped by seller. Prices and current delivery rates are verified by the server when you place your order.",
  cartPaymentMethod: "Payment method",
  cartPaymentCod: "Cash on delivery",
  cartPaymentPrepaid: "Prepaid — arrange with seller",
  cartReviewPrices: "Review current prices & delivery",
  cartPricesReviewed: "Current prices reviewed.",
  cartOrderTotal: "Order total",
  cartDeliveryLabel: "Delivery",
  cartTermsAgree: "I have read and agree to the Terms & conditions.",
  cartPlaceOrder: "Place order",
  cartOrderPlaced: "Order placed.",
  cartSignInToCheckout: "Sign in to checkout",

  trackingEyebrow: "EVERY STEP, A LITTLE CLOSER.",
  trackingTitle: "Where’s your parcel?",
  trackingSubtitle: "Enter your RFD tracking code to follow its journey.",
  trackingInputLabel: "Tracking code",
  trackingInputPlaceholder: "RFD123456",
  trackingButton: "Track parcel",
  trackingNotFound: "Parcel not found.",
  trackingPrivacyNotice:
    "Contact information and verification codes are available only to authorized delivery participants.",
  trackingDestination: "Destination",

  helpEyebrow: "A LITTLE HELP GOES A LONG WAY.",
  helpTitle: "We’re here for your next step.",
  helpSubtitle: "Find the right place to get your business moving again.",
  helpOrdersPanelTitle: "Orders & deliveries",
  helpOrdersHeading: "A conversation can help.",
  helpOrdersText:
    "For an order question, open the order and message the seller. For a delivery, open the parcel to contact its assigned member.",
  helpOrdersBtn: "Open my orders",
  helpContactPanelTitle: "Contact PickParcelBD",
  helpWorkingHours: "Every day from 9:00 AM to 9:00 PM",
  helpFaqTitle: "Useful answers",
  helpFaq1Q: "How do I book a parcel?",
  helpFaq1A:
    "Sign in, complete your profile, then choose “Book a parcel” in your workspace. Review the recipient details, delivery fee, and any COD amount.",
  helpFaq2Q: "When do I share a verification code?",
  helpFaq2A:
    "Share the pickup code with the assigned member when handing over your parcel. The recipient shares the delivery code when receiving it.",
  helpFaq3Q: "How are wallet credits confirmed?",
  helpFaq3A:
    "COD credits follow delivery and confirmation that the company received the collection. Your wallet records each confirmed credit.",

  loginStoryEyebrow: "YOUR NEXT CHAPTER STARTS HERE",
  loginStoryHeading:
    "A small business. A big dream. A little help along the way.",
  loginStorySubtitle:
    "Your marketplace, delivery network, and business workspace. All connected.",
  loginBenefitParcel: "Book and track every parcel",
  loginBenefitCustomer: "Reach your next customer",
  loginBenefitTrust: "Keep your business in good hands",
  loginFormEyebrow: "WELCOME TO PICKPARCELBD",
  loginFormHeading: "Let’s get you moving.",
  loginFormSubtitle:
    "New here? Continue with Google to create your account. Already registered? Use the same Google account to sign in.",
  loginContinueGoogle: "Continue with Google",
  loginTermsNotice:
    "By continuing, you agree to our terms & conditions. Your account keeps your business connected.",
  loginPreviewTitle: "Local development preview",
  loginPreviewSubtitle:
    "These are fictional accounts in an isolated local database. Preview sign-in is disabled in production.",
  loginContinueAs: "Continue as",

  wsDistrictControl: "District control",
  wsDeliveryNetwork: "Delivery network",
  wsMyBusiness: "My business",
  wsAdministration: "ADMINISTRATION",
  wsDeliveryOperations: "DELIVERY OPERATIONS",
  wsWorkspace: "WORKSPACE",
  wsExploreMore: "EXPLORE MORE",
  wsHelpTitle: "A little help goes a long way.",
  wsHelpSubtitle: "We’re here for you and your business.",
  wsHelpTalk: "Let’s talk",
  wsSignOut: "Sign out",
  wsSearchPlaceholder: "Find a parcel…",
  wsFooterNote: "Made for the way Bangladesh does business.",

  navOverview: "Overview",
  navMyParcels: "My parcels",
  navOrders: "Orders",
  navMyProducts: "My products",
  navCashMemos: "Cash memos",
  navMessages: "Messages",
  navWallet: "My wallet",
  navFollowing: "Following",
  navNews: "My news",
  navBuyerBlocks: "Buyer preferences",
  navSettings: "Settings",

  navOpsOverview: "Operations overview",
  navOpsRequests: "Available pickups",
  navOpsAssignments: "My pickup batches",
  navOpsCustody: "My custody",
  navOpsTransfers: "Transfers & history",
  navOpsReceive: "Receive a handover",

  navAdminOverview: "District overview",
  navAdminUsers: "People & roles",
  navAdminRidersAgents: "Riders & agents",
  navAdminParcels: "Parcel control",
  navAdminFinance: "Finance & settlements",
  navAdminAudits: "Audits & reconciliation",
  navAdminRecovery: "Recovery & snapshots",
  navAdminReports: "Activity & reports",

  rideEyebrow: "A LITTLE CLOSER TO WHERE YOU’RE GOING",
  rideTitle: "Ride share",
  rideSubtitle: "Local, flexible trips across Bangladesh.",
  rideBookTab: "Book a trip",
  rideActiveTab: "Your trips",
  rideDriverMode: "Driver mode",
  ridePassengerMode: "Passenger mode",
  ridePickupLabel: "Pickup location",
  rideDestinationLabel: "Where are you heading?",
  rideRequestBtn: "Request trip",
  rideOnlineDrivers: "Online riders nearby",
  rideGpsBtn: "Update GPS location",

  statusPending: "Pending",
  statusAssigned: "Assigned",
  statusPickedUp: "Picked up",
  statusInTransit: "In transit",
  statusOutForDelivery: "Out for delivery",
  statusDelivered: "Delivered",
  statusReturnPending: "Return pending",
  statusReturned: "Returned",
  statusCancelled: "Cancelled",
  statusPaid: "Paid",
  statusUnpaid: "Unpaid",
  statusDraft: "Draft",
};

export const dictionaries: Record<Locale, Translations> = {
  bn,
  en,
};

interface LanguageContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  formatMoney: (value: unknown) => string;
  formatStatus: (status: string) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  locale: "bn",
  t: bn,
  setLocale: () => {},
  formatMoney: (v) => `৳ ${Number(v || 0).toLocaleString("en-BD")}`,
  formatStatus: (s) => s,
});

export function useI18n() {
  return useContext(LanguageContext);
}

export function formatTaka(value: unknown): string {
  const num = Number(value || 0);
  return `৳ ${num.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function translateStatus(status: string, locale: Locale): string {
  const key = String(status).toLowerCase().trim();
  const dict = dictionaries[locale] || dictionaries.bn;
  switch (key) {
    case "pending":
      return dict.statusPending;
    case "assigned":
      return dict.statusAssigned;
    case "picked_up":
      return dict.statusPickedUp;
    case "in_transit":
      return dict.statusInTransit;
    case "out_for_delivery":
      return dict.statusOutForDelivery;
    case "delivered":
      return dict.statusDelivered;
    case "return_pending":
      return dict.statusReturnPending;
    case "returned":
      return dict.statusReturned;
    case "cancelled":
    case "canceled":
      return dict.statusCancelled;
    case "paid":
      return dict.statusPaid;
    case "unpaid":
      return dict.statusUnpaid;
    case "draft":
      return dict.statusDraft;
    default:
      return String(status).replaceAll("_", " ");
  }
}
