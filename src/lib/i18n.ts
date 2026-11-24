import type { Lang, Product } from './types';

export const T: Record<string, [string, string]> = {
  nav_all: ['সব পণ্য', 'All'],
  nav_lungi: ['লুঙ্গি', 'Lungi'],
  nav_gamcha: ['গামছা', 'Gamcha'],
  nav_tshirt: ['টি-শার্ট', 'T-Shirts'],
  nav_story: ['আমাদের গল্প', 'Our Story'],
  search_ph: ['লুঙ্গি, গামছা খুঁজুন…', 'Search lungi, gamcha…'],
  login: ['লগইন', 'Login'],
  my_orders: ['আমার অর্ডার', 'My orders'],
  ftr_about: [
    'বাংলার দক্ষ তাঁতিদের হাতে বোনা খাঁটি লুঙ্গি, গামছা ও হেরিটেজ টি-শার্ট — সরাসরি আপনার দরজায়।',
    "Authentic handloom lungi, gamcha and heritage tees — woven by Bengal's master weavers, delivered to your door.",
  ],
  ftr_shop: ['কেনাকাটা', 'Shop'],
  ftr_best: ['বেস্ট সেলার', 'Best sellers'],
  ftr_help: ['সহায়তা', 'Help'],
  ftr_pay1: ['ক্যাশ অন ডেলিভারি', 'Cash on delivery'],
  ftr_pay2: ['বিকাশ · রকেট · নগদ · বাংলা কিউআর', 'bKash · Rocket · Nagad · Bangla QR'],
  ftr_contact: ['যোগাযোগ', 'Contact'],
  ftr_city: ['ঢাকা, বাংলাদেশ', 'Dhaka, Bangladesh'],
  ftr_deliv: ['ডেলিভারি: ঢাকায় ২–৪ দিন · ঢাকার বাইরে ৩–৬ দিন', 'Delivery: 2–4 days Dhaka · 3–6 days outside'],
  ftr_copy: ['তন্ত্রী · বুননে বাংলার ঐতিহ্য।', 'Tantri · Woven in Bengal. Worn with pride.'],
  top_free: ['৳{0}-এর বেশি অর্ডারে ফ্রি ডেলিভারি · ক্যাশ অন ডেলিভারি আছে', 'Free delivery on orders over ৳{0} · Cash on Delivery available'],
  top_use: ['কোড', 'use'],
  hero_bn: ['বুননে বাংলার ঐতিহ্য', 'Woven in Bengal'],
  hero_eye: ['খাঁটি বাংলাদেশি তাঁতজাত', 'Authentic Bangladeshi Handloom'],
  hero_h1a: ['বুননে বাংলা,', 'Woven in Bengal.'],
  hero_h1b: ['গর্বে পরিধান।', 'Worn with pride.'],
  hero_p: [
    'দক্ষ তাঁতিদের হাতে তৈরি প্রিমিয়াম লুঙ্গি, গামছা ও হেরিটেজ টি-শার্ট — সারা বাংলাদেশে ডেলিভারি।',
    'Premium lungi, gamcha and heritage tees — made by master weavers, delivered across Bangladesh.',
  ],
  shop_coll: ['কালেকশন দেখুন', 'Shop the collection'],
  explore_lungi: ['লুঙ্গি দেখুন', 'Explore lungi'],
  tr1: ['১০০% তাঁতের কাপড়', '100% Handloom'],
  tr1s: ['খাঁটি বাংলার বুনন', 'Authentic Bengal weave'],
  tr2: ['৬৪ জেলায় ডেলিভারি', 'Delivery in all 64 districts'],
  tr2s: ['৳{0}-এর উপরে ফ্রি', 'Free over ৳{0}'],
  tr3: ['ক্যাশ অন ডেলিভারি', 'Cash on Delivery'],
  tr3s: ['বিকাশ, রকেট, নগদ, কিউআর', 'bKash, Rocket, Nagad, QR'],
  tr4: ['তাৎক্ষণিক ই-ইনভয়েস', 'Instant e-invoice'],
  tr4s: ['প্রতি অর্ডারে ইমেইলে', 'Emailed after every order'],
  by_cat: ['ক্যাটাগরি অনুযায়ী', 'Shop by Category'],
  products_n: ['{0}টি পণ্য', '{0} products'],
  fav: ['ক্রেতাদের প্রিয়', 'Customer Favourites'],
  fav_s: ['আমাদের বাছাই করা সেরা কিছু পণ্য', 'Hand-picked pieces our community loves'],
  view_all: ['সব পণ্য দেখুন', 'View all products'],
  story_eye: ['আমাদের গল্প', 'Our Story'],
  story_h: ['ঐতিহ্য, যা প্রতিদিন পরা যায়।', 'Heritage you can wear, every single day.'],
  story_p1: [
    'শত শত বছর ধরে রাজশাহী, টাঙ্গাইল, পাবনা ও রংপুরের তাঁতিরা সাধারণ সুতাকে বাঙালির জীবনের অংশ করে তুলেছেন — ঘরে লুঙ্গি, কাঁধে গামছা, বুননে গর্ব।',
    'For centuries, the weavers of Rajshahi, Tangail, Pabna and Rangpur have turned humble cotton into cloth that is part of Bengali life — the lungi at home, the gamcha on the shoulder, the pride in the weave.',
  ],
  story_p2: [
    'তন্ত্রী সেই কারুশিল্প পৌঁছে দেয় আপনার কাছে — ন্যায্য দামে, প্রিমিয়াম ফিনিশিংয়ে, দরজায় ডেলিভারিসহ।',
    'Tantri brings that craft to you with honest pricing, premium finishing and delivery to your door.',
  ],
  st1: ['বিশ্বস্ত মিল থেকে সংগৃহীত সুতা', 'Cotton sourced from trusted mills'],
  st2: ['ঐতিহ্যবাহী তাঁতে বোনা', 'Woven on traditional handlooms'],
  st3: ['মান যাচাই করে ডেলিভারি', 'Quality checked & delivered'],
  offers: ['অফার ও কুপন', 'Offers & Coupons'],
  off: ['ছাড়', 'OFF'],
  copied: ['কোড {0} কপি হয়েছে', 'Code {0} copied'],
  home: ['হোম', 'Home'],
  shop: ['শপ', 'Shop'],
  all_products: ['সব পণ্য', 'All Products'],
  results_for: ['“{0}” এর ফলাফল', 'Results for “{0}”'],
  tagline_all: ['খাঁটি তাঁতজাত ও হেরিটেজ পোশাক', 'Authentic handloom & heritage wear'],
  s_new: ['নতুন', 'Newest'],
  s_pop: ['সবচেয়ে বেশি বিক্রি', 'Best selling'],
  s_lo: ['দাম: কম থেকে বেশি', 'Price: low to high'],
  s_hi: ['দাম: বেশি থেকে কম', 'Price: high to low'],
  none: ['কোনো পণ্য পাওয়া যায়নি', 'No products found'],
  none_s: ['অন্য ক্যাটাগরি বা শব্দ দিয়ে চেষ্টা করুন।', 'Try a different category or search term.'],
  sold_out: ['স্টক শেষ', 'Sold out'],
  in_stock: ['স্টকে আছে', 'In stock'],
  only_left: ['মাত্র {0}টি বাকি', 'Only {0} left'],
  out_stock: ['স্টকে নেই', 'Out of stock'],
  save: ['{0}% সাশ্রয়', 'Save {0}%'],
  size: ['সাইজ', 'Size'],
  length: ['দৈর্ঘ্য', 'Length'],
  colour: ['রং', 'Colour'],
  qty: ['পরিমাণ', 'Quantity'],
  add: ['কার্টে যোগ করুন', 'Add to cart'],
  buy_now: ['এখনই কিনুন', 'Buy now'],
  material: ['কাপড়', 'Material'],
  origin: ['উৎপত্তি', 'Origin'],
  delivery: ['ডেলিভারি', 'Delivery'],
  payment: ['পেমেন্ট', 'Payment'],
  deliv_t: ['ঢাকায় ২–৪ দিন · বাইরে ৩–৬ দিন', '2–4 days Dhaka · 3–6 days outside'],
  pay_t: ['COD · বিকাশ · রকেট · নগদ · কিউআর', 'COD · bKash · Rocket · Nagad · QR'],
  made_bd: ['বাংলাদেশে তৈরি', 'Made in Bangladesh'],
  like: ['আপনার আরও পছন্দ হতে পারে', 'You may also like'],
  nf: ['পণ্য পাওয়া যায়নি', 'Product not found'],
  back_shop: ['শপে ফিরুন', 'Back to shop'],
  added: ['কার্টে যোগ হয়েছে', 'Added to cart'],
  no_stock: ['আর স্টক নেই', 'No more stock available'],
  cart: ['আপনার কার্ট', 'Your Cart'],
  cart_empty: ['আপনার কার্ট খালি', 'Your cart is empty'],
  cart_empty_s: ['আমাদের তাঁতের কালেকশন দেখুন।', 'Discover our handloom collection.'],
  remove: ['সরান', 'Remove'],
  add_more: ['ফ্রি ডেলিভারির জন্য আরও ৳{0} যোগ করুন', 'Add ৳{0} more for FREE delivery'],
  free_unlocked: ['আপনি ফ্রি ডেলিভারি পাচ্ছেন', "You've unlocked FREE delivery"],
  subtotal: ['সাবটোটাল', 'Subtotal'],
  checkout: ['চেকআউট', 'Checkout'],
  wlc: ['তন্ত্রীতে স্বাগতম', 'Welcome to Tantri'],
  wlc_s: ['আপনার ইমেইল দিন — আমরা ৬ সংখ্যার লগইন কোড পাঠাব। পাসওয়ার্ড লাগবে না।', "Enter your email — we'll send a 6-digit login code. No password needed."],
  email: ['ইমেইল ঠিকানা', 'Email address'],
  send_code: ['কোড পাঠান', 'Send code'],
  sending: ['পাঠানো হচ্ছে…', 'Sending…'],
  chk_mail: ['আপনার ইমেইল দেখুন', 'Check your email'],
  sent_to: ['{0} ঠিকানায় ৬ সংখ্যার কোড পাঠানো হয়েছে। ১০ মিনিট পর্যন্ত কার্যকর।', 'We sent a 6-digit code to {0}. It expires in 10 minutes.'],
  verify: ['যাচাই করে এগিয়ে যান', 'Verify & continue'],
  resend: ['আবার কোড পাঠান', 'Resend code'],
  change_email: ['ইমেইল পরিবর্তন', 'Change email'],
  new_code: ['নতুন কোড পাঠানো হয়েছে', 'New code sent'],
  logged_as: ['{0} হিসেবে লগইন হয়েছে', 'Logged in as {0}'],
  logged_out: ['লগআউট হয়েছে', 'Logged out'],
  need_login: ['চেকআউটের জন্য লগইন করুন', 'Please log in to checkout'],
  need_login_s: [
    'আমরা ইনভয়েস ও অর্ডারের আপডেট ইমেইলে পাঠাই, তাই দ্রুত একটি কোডে আপনার ইমেইল যাচাই করা হয়।',
    'We email your invoice and order updates, so we verify your email with a quick code.',
  ],
  login_email: ['ইমেইল দিয়ে লগইন', 'Login with email'],
  continue_shop: ['কেনাকাটা চালিয়ে যান', 'Continue shopping'],
  del_details: ['ডেলিভারির তথ্য', 'Delivery details'],
  full_name: ['পুরো নাম', 'Full name'],
  mobile: ['মোবাইল নম্বর', 'Mobile number'],
  email_inv: ['ইমেইল (ইনভয়েস এখানে যাবে)', 'Email (invoice will be sent here)'],
  district: ['জেলা', 'District'],
  note: ['অর্ডার নোট (ঐচ্ছিক)', 'Order note (optional)'],
  note_ph: ['কোনো নির্দেশনা', 'Any instruction'],
  address: ['পূর্ণ ঠিকানা', 'Full address'],
  address_ph: ['বাসা, রোড, এলাকা, থানা', 'House, road, area, thana'],
  pay_h: ['পেমেন্ট পদ্ধতি', 'Payment method'],
  cod_s: ['পণ্য হাতে পেয়ে টাকা দিন', 'Pay when you receive your order'],
  pay_amt: ['পরিশোধযোগ্য: ৳{0}', 'Amount to pay: ৳{0}'],
  trx: ['ট্রানজ্যাকশন আইডি (TrxID)', 'Transaction ID (TrxID)'],
  sender: ['যে নম্বর থেকে পাঠিয়েছেন (ঐচ্ছিক)', 'Number you paid from (optional)'],
  copy: ['কপি', 'Copy'],
  copied2: ['নম্বর কপি হয়েছে', 'Number copied'],
  verify_note: ['পেমেন্ট আমাদের টিম যাচাই করে অর্ডার নিশ্চিত করবে।', 'Our team will verify your payment and confirm the order.'],
  steps_bkash: [
    'বিকাশ অ্যাপ খুলে “পেমেন্ট” সিলেক্ট করুন|মার্চেন্ট নম্বর দিন: {0}|টাকার পরিমাণ ৳{1} দিয়ে পেমেন্ট সম্পন্ন করুন|প্রাপ্ত TrxID নিচের ঘরে লিখুন',
    'Open the bKash app and choose “Payment”|Enter merchant number: {0}|Pay the amount ৳{1}|Enter the TrxID you receive below',
  ],
  steps_rocket: [
    'রকেট অ্যাপ খুলে “মার্চেন্ট পেমেন্ট” সিলেক্ট করুন|মার্চেন্ট নম্বর দিন: {0}|টাকার পরিমাণ ৳{1} দিয়ে পেমেন্ট সম্পন্ন করুন|প্রাপ্ত TrxID নিচের ঘরে লিখুন',
    'Open the Rocket app and choose “Merchant Payment”|Enter merchant number: {0}|Pay the amount ৳{1}|Enter the TrxID you receive below',
  ],
  steps_nagad: [
    'নগদ অ্যাপ খুলে “পেমেন্ট” সিলেক্ট করুন|মার্চেন্ট নম্বর দিন: {0}|টাকার পরিমাণ ৳{1} দিয়ে পেমেন্ট সম্পন্ন করুন|প্রাপ্ত TrxID নিচের ঘরে লিখুন',
    'Open the Nagad app and choose “Payment”|Enter merchant number: {0}|Pay the amount ৳{1}|Enter the TrxID you receive below',
  ],
  steps_bangla_qr: [
    'যেকোনো ব্যাংক বা MFS অ্যাপে “QR স্ক্যান” খুলুন|নিচের বাংলা কিউআর স্ক্যান করুন|টাকার পরিমাণ ৳{1} দিয়ে পেমেন্ট করুন|প্রাপ্ত ট্রানজ্যাকশন আইডি নিচের ঘরে লিখুন',
    'Open “Scan QR” in any bank or MFS app|Scan the Bangla QR below|Pay the amount ৳{1}|Enter the transaction ID you receive below',
  ],
  order_sum: ['অর্ডার সামারি', 'Order summary'],
  coupon_ph: ['কুপন কোড', 'COUPON CODE'],
  apply: ['প্রয়োগ', 'Apply'],
  coupon_ok: ['কুপন প্রয়োগ হয়েছে', 'Coupon applied'],
  discount: ['ছাড়', 'Discount'],
  delivery_fee: ['ডেলিভারি', 'Delivery'],
  free: ['ফ্রি', 'FREE'],
  total: ['সর্বমোট', 'Total'],
  place: ['অর্ডার করুন', 'Place order'],
  placing: ['অর্ডার হচ্ছে…', 'Placing order…'],
  inv_auto: ['ইনভয়েস স্বয়ংক্রিয়ভাবে ইমেইলে যাবে', 'Your invoice is emailed automatically'],
  thanks: ['ধন্যবাদ! অর্ডার সম্পন্ন হয়েছে।', 'Thank you! Order placed.'],
  order_lbl: ['অর্ডার', 'Order'],
  inv_sent: [
    'আপনার ইনভয়েস {0} ঠিকানায় পাঠানো হচ্ছে। ইনবক্স (ও স্প্যাম ফোল্ডার) দেখুন।',
    'Your invoice is on its way to {0}. Check your inbox (and spam folder).',
  ],
  dl_inv: ['ইনভয়েস ডাউনলোড (PDF)', 'Download invoice (PDF)'],
  your_email: ['আপনার ইমেইল', 'your email'],
  pay_wait: ['আপনার পেমেন্ট যাচাই করে আমরা অর্ডার নিশ্চিত করব।', 'We will verify your payment and confirm your order.'],
  my_acc: ['আমার অ্যাকাউন্ট', 'My Account'],
  admin_panel: ['অ্যাডমিন প্যানেল', 'Admin panel'],
  logout: ['লগআউট', 'Log out'],
  profile: ['প্রোফাইল', 'Profile'],
  name: ['নাম', 'Name'],
  save_prof: ['প্রোফাইল সেভ করুন', 'Save profile'],
  saved: ['সেভ হয়েছে', 'Profile saved'],
  no_orders: ['এখনো কোনো অর্ডার নেই', 'No orders yet'],
  start_shop: ['কেনাকাটা শুরু করুন', 'Start shopping'],
  dl_inv2: ['ইনভয়েস ডাউনলোড', 'Download invoice'],
  login_see: ['অর্ডার দেখতে লগইন করুন', 'Login to see your orders'],
  st_pending: ['অপেক্ষমান', 'pending'],
  st_confirmed: ['নিশ্চিত', 'confirmed'],
  st_shipped: ['পথে আছে', 'shipped'],
  st_delivered: ['ডেলিভারি হয়েছে', 'delivered'],
  st_cancelled: ['বাতিল', 'cancelled'],
  ps_unpaid: ['পেমেন্ট বাকি', 'Unpaid'],
  ps_pending: ['যাচাই চলছে', 'Verifying'],
  ps_paid: ['পরিশোধিত', 'Paid'],
  ps_failed: ['পেমেন্ট ব্যর্থ', 'Failed'],
  about_h: ['আমাদের গল্প', 'Our Story'],
  about_p1: [
    'তন্ত্রী শব্দটি এসেছে “তাঁত” থেকে — সুতা, তাঁতযন্ত্র ও বাংলার বস্ত্রঐতিহ্যের স্পন্দন। খাঁটি বাংলাদেশি লুঙ্গি, গামছা ও হেরিটেজ-প্রিন্ট টি-শার্ট ন্যায্য দামে আপনার হাতে পৌঁছে দেওয়াই আমাদের লক্ষ্য — যে মানের জন্য আমাদের তাঁতিরা পরিচিত হওয়ার যোগ্য।',
    "Tantri (তন্ত্রী) comes from tant — the thread, the loom, the heartbeat of Bengal's textile heritage. We exist to put authentic Bangladeshi lungi, gamcha and heritage-print tees in your hands, at honest prices, with the quality our weavers deserve to be known for.",
  ],
  about_p2: [
    'প্রতিটি পণ্য রাজশাহী, টাঙ্গাইল, পাবনা, সিরাজগঞ্জ, রংপুর ও কুষ্টিয়ার তাঁতি সম্প্রদায় থেকে সংগৃহীত। আমরা ন্যায্য মূল্য দিই, প্রতিটি পণ্য যাচাই করি এবং ৬৪ জেলায় ক্যাশ অন ডেলিভারিসহ পৌঁছে দিই — সন্তুষ্ট হলেই টাকা দিন।',
    'Every product is sourced from weaving communities across Rajshahi, Tangail, Pabna, Sirajganj, Rangpur and Kushtia. We pay fairly, check every piece, and deliver to all 64 districts — with Cash on Delivery so you only pay when you are happy.',
  ],
  shop_now: ['এখনই কিনুন', 'Shop now'],
  err_generic: ['কিছু একটা ভুল হয়েছে', 'Something went wrong'],
  cat_lungi: ['বাংলার দক্ষ তাঁতিদের হাতে বোনা লুঙ্গি', "Handloom lungis woven by Bengal's master weavers"],
  cat_gamcha: ['বাঙালির ঐতিহ্যবাহী চেক গামছা', 'The iconic checkered Bengali towel'],
  cat_tshirt: ['হেরিটেজ প্রিন্টের প্রিমিয়াম কটন টি-শার্ট', 'Heritage-print premium cotton tees'],
};

const BNDIG = '০১২৩৪৫৬৭৮৯';

export function t(lang: Lang, key: string, ...args: (string | number)[]): string {
  const entry = T[key];
  const raw = entry ? entry[lang === 'bn' ? 0 : 1] : key;
  return raw.replace(/\{(\d)\}/g, (_, i) => String(args[+i] ?? ''));
}

export function num(lang: Lang, v: string | number): string {
  return lang === 'bn' ? String(v).replace(/\d/g, (d) => BNDIG[+d]) : String(v);
}

export function money(lang: Lang, n: number): string {
  return Number(n).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-IN', {
    maximumFractionDigits: 0,
  });
}

export function tk(lang: Lang, n: number): string {
  return '৳' + money(lang, n);
}

export function priceOf(p: Pick<Product, 'price' | 'sale_price'>): number {
  return p.sale_price && p.sale_price < p.price ? p.sale_price : p.price;
}

export function pct(p: Pick<Product, 'price' | 'sale_price'>): number {
  return p.sale_price && p.sale_price < p.price ? Math.round((1 - p.sale_price / p.price) * 100) : 0;
}

export const DISTRICTS =
  "Dhaka,Gazipur,Narayanganj,Narsingdi,Munshiganj,Manikganj,Tangail,Kishoreganj,Faridpur,Gopalganj,Madaripur,Rajbari,Shariatpur,Chattogram,Cox's Bazar,Cumilla,Feni,Noakhali,Lakshmipur,Chandpur,Brahmanbaria,Khagrachari,Rangamati,Bandarban,Sylhet,Moulvibazar,Habiganj,Sunamganj,Rajshahi,Natore,Naogaon,Chapainawabganj,Pabna,Sirajganj,Bogura,Joypurhat,Khulna,Jashore,Satkhira,Bagerhat,Narail,Magura,Jhenaidah,Kushtia,Meherpur,Chuadanga,Barishal,Bhola,Patuakhali,Pirojpur,Jhalokathi,Barguna,Rangpur,Dinajpur,Thakurgaon,Panchagarh,Nilphamari,Lalmonirhat,Kurigram,Gaibandha,Mymensingh,Jamalpur,Sherpur,Netrokona".split(
    ','
  );

export const DIST_BN =
  'ঢাকা,গাজীপুর,নারায়ণগঞ্জ,নরসিংদী,মুন্সিগঞ্জ,মানিকগঞ্জ,টাঙ্গাইল,কিশোরগঞ্জ,ফরিদপুর,গোপালগঞ্জ,মাদারীপুর,রাজবাড়ী,শরীয়তপুর,চট্টগ্রাম,কক্সবাজার,কুমিল্লা,ফেনী,নোয়াখালী,লক্ষ্মীপুর,চাঁদপুর,ব্রাহ্মণবাড়িয়া,খাগড়াছড়ি,রাঙামাটি,বান্দরবান,সিলেট,মৌলভীবাজার,হবিগঞ্জ,সুনামগঞ্জ,রাজশাহী,নাটোর,নওগাঁ,চাঁপাইনবাবগঞ্জ,পাবনা,সিরাজগঞ্জ,বগুড়া,জয়পুরহাট,খুলনা,যশোর,সাতক্ষীরা,বাগেরহাট,নড়াইল,মাগুরা,ঝিনাইদহ,কুষ্টিয়া,মেহেরপুর,চুয়াডাঙ্গা,বরিশাল,ভোলা,পটুয়াখালী,পিরোজপুর,ঝালকাঠি,বরগুনা,রংপুর,দিনাজপুর,ঠাকুরগাঁও,পঞ্চগড়,নীলফামারী,লালমনিরহাট,কুড়িগ্রাম,গাইবান্ধা,ময়মনসিংহ,জামালপুর,শেরপুর,নেত্রকোণা'.split(
    ','
  );
