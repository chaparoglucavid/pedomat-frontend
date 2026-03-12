// Mock Data - Azərbaycan dilində Admin Dashboard üçün

export interface User {
  id: number;
  ad: string;
  soyad: string;
  email: string;
  telefon: string;
  status: 'active' | 'blocked' | 'deleted';
  wallet_balance: number;
  dogum_tarixi: string;
  created_at: string;
}

export interface Equipment {
  id: number;
  name: string;
  number: string;
  status: 'active' | 'deactive' | 'under_repair' | 'maintenance' | 'offline' | 'broken';
  current_ped_count: number;
  longitude: number;
  latitude: number;
  address: string;
  created_at: string;
}

export interface Brand {
  id: number;
  name: string;
  logo: string;
  status: 'active' | 'inactive';
}

export interface Category {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  main_price_for_unit: number;
}

export interface EquipmentStock {
  id: number;
  equipment_id: number;
  brand_id: number;
  category_id: number;
  quantity: number;
}

export interface TransactionLog {
  id: number;
  user_id: number;
  equipment_id: number | null;
  category_id: number | null;
  brand_id: number | null;
  quantity: number;
  action_type: 'add_ped' | 'remove_ped' | 'refund' | 'balance_topup';
  created_at: string;
  admin_id: number | null;
}

export interface Story {
  id: number;
  title: string;
  content: string;
  image: string;
  expires_at: string;
  created_at: string;
}

export interface Banner {
  id: number;
  title: string;
  content: string;
  image: string;
  expires_at: string;
  created_at: string;
}

export interface ForumPost {
  id: number;
  title: string;
  content: string;
  status: 'active' | 'pending' | 'blocked';
  user_id: number;
  like_count: number;
  share_count: number;
  comment_count: number;
  created_at: string;
}

export interface ForumComment {
  id: number;
  forum_id: number;
  user_id: number;
  content: string;
  status: 'active' | 'blocked';
  created_at: string;
}

// Users
export const users: User[] = [
  { id: 1, ad: 'Aynur', soyad: 'Məmmədova', email: 'aynur@mail.az', telefon: '+994501234567', status: 'active', wallet_balance: 15.50, dogum_tarixi: '1995-03-15', created_at: '2025-01-10' },
  { id: 2, ad: 'Günel', soyad: 'Əliyeva', email: 'gunel@mail.az', telefon: '+994502345678', status: 'active', wallet_balance: 8.00, dogum_tarixi: '1998-07-22', created_at: '2025-01-15' },
  { id: 3, ad: 'Ləman', soyad: 'Hüseynova', email: 'leman@mail.az', telefon: '+994503456789', status: 'blocked', wallet_balance: 0.00, dogum_tarixi: '2000-11-08', created_at: '2025-02-01' },
  { id: 4, ad: 'Nigar', soyad: 'Qasımova', email: 'nigar@mail.az', telefon: '+994504567890', status: 'active', wallet_balance: 22.75, dogum_tarixi: '1997-05-30', created_at: '2025-02-10' },
  { id: 5, ad: 'Sevinc', soyad: 'İsmayılova', email: 'sevinc@mail.az', telefon: '+994505678901', status: 'active', wallet_balance: 5.25, dogum_tarixi: '1999-09-14', created_at: '2025-02-20' },
  { id: 6, ad: 'Fidan', soyad: 'Rzayeva', email: 'fidan@mail.az', telefon: '+994506789012', status: 'active', wallet_balance: 30.00, dogum_tarixi: '1996-01-25', created_at: '2025-03-01' },
  { id: 7, ad: 'Nərmin', soyad: 'Babayeva', email: 'nermin@mail.az', telefon: '+994507890123', status: 'deleted', wallet_balance: 0.00, dogum_tarixi: '2001-04-18', created_at: '2025-03-05' },
  { id: 8, ad: 'Türkan', soyad: 'Nəsirova', email: 'turkan@mail.az', telefon: '+994508901234', status: 'active', wallet_balance: 12.00, dogum_tarixi: '1994-12-03', created_at: '2025-03-10' },
  { id: 9, ad: 'Xəyalə', soyad: 'Səfərova', email: 'xeyale@mail.az', telefon: '+994509012345', status: 'active', wallet_balance: 7.50, dogum_tarixi: '1998-08-27', created_at: '2025-03-15' },
  { id: 10, ad: 'Zəhra', soyad: 'Kərimova', email: 'zehra@mail.az', telefon: '+994500123456', status: 'active', wallet_balance: 18.25, dogum_tarixi: '1997-06-11', created_at: '2025-03-20' },
  { id: 11, ad: 'Aysel', soyad: 'Vəliyeva', email: 'aysel@mail.az', telefon: '+994551234567', status: 'active', wallet_balance: 9.75, dogum_tarixi: '1999-02-14', created_at: '2025-04-01' },
  { id: 12, ad: 'Lalə', soyad: 'Əhmədova', email: 'lale@mail.az', telefon: '+994552345678', status: 'active', wallet_balance: 14.00, dogum_tarixi: '1996-10-05', created_at: '2025-04-10' },
];

// Equipments
export const equipments: Equipment[] = [
  { id: 1, name: 'Bakı Mərkəz Dispenser', number: 'EQ-001', status: 'active', current_ped_count: 85, longitude: 49.8671, latitude: 40.4093, address: 'Nizami küç. 12, Bakı', created_at: '2025-01-01' },
  { id: 2, name: 'Gənclik Mall Dispenser', number: 'EQ-002', status: 'active', current_ped_count: 42, longitude: 49.8519, latitude: 40.3953, address: 'Gənclik Mall, 2-ci mərtəbə', created_at: '2025-01-05' },
  { id: 3, name: 'Nərimanov Metro Dispenser', number: 'EQ-003', status: 'offline', current_ped_count: 0, longitude: 49.8728, latitude: 40.4128, address: 'Nərimanov metro stansiyası', created_at: '2025-01-10' },
  { id: 4, name: 'Port Baku Dispenser', number: 'EQ-004', status: 'active', current_ped_count: 120, longitude: 49.8456, latitude: 40.3789, address: 'Port Baku Mall, 1-ci mərtəbə', created_at: '2025-01-15' },
  { id: 5, name: 'Sumqayıt Mərkəz Dispenser', number: 'EQ-005', status: 'active', current_ped_count: 65, longitude: 49.6317, latitude: 40.5897, address: 'Sumqayıt, Heydər Əliyev pr. 45', created_at: '2025-01-20' },
  { id: 6, name: '28 May Metro Dispenser', number: 'EQ-006', status: 'broken', current_ped_count: 30, longitude: 49.8312, latitude: 40.3798, address: '28 May metro stansiyası', created_at: '2025-02-01' },
  { id: 7, name: 'Xırdalan Universitet Dispenser', number: 'EQ-007', status: 'active', current_ped_count: 55, longitude: 49.7556, latitude: 40.4478, address: 'Xırdalan, ADU kampusu', created_at: '2025-02-05' },
  { id: 8, name: 'Koroğlu Metro Dispenser', number: 'EQ-008', status: 'active', current_ped_count: 78, longitude: 49.8634, latitude: 40.4201, address: 'Koroğlu metro stansiyası', created_at: '2025-02-10' },
  { id: 9, name: 'Sahil Metro Dispenser', number: 'EQ-009', status: 'active', current_ped_count: 92, longitude: 49.8489, latitude: 40.3712, address: 'Sahil metro stansiyası', created_at: '2025-02-15' },
  { id: 10, name: 'Əhmədli Metro Dispenser', number: 'EQ-010', status: 'offline', current_ped_count: 10, longitude: 49.9523, latitude: 40.3856, address: 'Əhmədli metro stansiyası', created_at: '2025-02-20' },
  { id: 11, name: 'Azadlıq Metro Dispenser', number: 'EQ-011', status: 'active', current_ped_count: 48, longitude: 49.8945, latitude: 40.4312, address: 'Azadlıq pr. metro stansiyası', created_at: '2025-03-01' },
  { id: 12, name: 'Dərnəgül Metro Dispenser', number: 'EQ-012', status: 'active', current_ped_count: 67, longitude: 49.8789, latitude: 40.4089, address: 'Dərnəgül metro stansiyası', created_at: '2025-03-05' },
  { id: 13, name: 'Memar Əcəmi Dispenser', number: 'EQ-013', status: 'active', current_ped_count: 35, longitude: 49.8234, latitude: 40.3945, address: 'Memar Əcəmi metro stansiyası', created_at: '2025-03-10' },
  { id: 14, name: 'İçərişəhər Dispenser', number: 'EQ-014', status: 'active', current_ped_count: 110, longitude: 49.8367, latitude: 40.3667, address: 'İçərişəhər metro stansiyası', created_at: '2025-03-15' },
  { id: 15, name: 'Həzi Aslanov Dispenser', number: 'EQ-015', status: 'offline', current_ped_count: 5, longitude: 49.9678, latitude: 40.3734, address: 'Həzi Aslanov metro stansiyası', created_at: '2025-03-20' },
];

// Brands
export const brands: Brand[] = [
  { id: 1, name: 'Molped', logo: 'https://placehold.co/80x40/0099CC/white?text=Molped', status: 'active' },
  { id: 2, name: 'Kotex', logo: 'https://placehold.co/80x40/E30A17/white?text=Kotex', status: 'active' },
  { id: 3, name: 'Always', logo: 'https://placehold.co/80x40/00B388/white?text=Always', status: 'active' },
  { id: 4, name: 'Naturella', logo: 'https://placehold.co/80x40/9333ea/white?text=Naturella', status: 'active' },
  { id: 5, name: 'Libresse', logo: 'https://placehold.co/80x40/f59e0b/white?text=Libresse', status: 'inactive' },
];

// Categories
export const categories: Category[] = [
  { id: 1, name: 'Normal', status: 'active', main_price_for_unit: 0.50 },
  { id: 2, name: 'Night (Gecə)', status: 'active', main_price_for_unit: 0.75 },
  { id: 3, name: 'Ultra İncə', status: 'active', main_price_for_unit: 0.60 },
  { id: 4, name: 'Günlük', status: 'active', main_price_for_unit: 0.30 },
  { id: 5, name: 'Maxi', status: 'active', main_price_for_unit: 0.80 },
];

// Equipment Stocks
export const equipmentStocks: EquipmentStock[] = [
  { id: 1, equipment_id: 1, brand_id: 1, category_id: 1, quantity: 30 },
  { id: 2, equipment_id: 1, brand_id: 2, category_id: 2, quantity: 25 },
  { id: 3, equipment_id: 1, brand_id: 3, category_id: 1, quantity: 30 },
  { id: 4, equipment_id: 2, brand_id: 1, category_id: 3, quantity: 22 },
  { id: 5, equipment_id: 2, brand_id: 4, category_id: 1, quantity: 20 },
  { id: 6, equipment_id: 4, brand_id: 1, category_id: 1, quantity: 40 },
  { id: 7, equipment_id: 4, brand_id: 2, category_id: 2, quantity: 35 },
  { id: 8, equipment_id: 4, brand_id: 3, category_id: 3, quantity: 25 },
  { id: 9, equipment_id: 4, brand_id: 4, category_id: 4, quantity: 20 },
  { id: 10, equipment_id: 5, brand_id: 1, category_id: 1, quantity: 35 },
  { id: 11, equipment_id: 5, brand_id: 2, category_id: 2, quantity: 30 },
  { id: 12, equipment_id: 7, brand_id: 3, category_id: 1, quantity: 30 },
  { id: 13, equipment_id: 7, brand_id: 1, category_id: 3, quantity: 25 },
  { id: 14, equipment_id: 8, brand_id: 2, category_id: 1, quantity: 40 },
  { id: 15, equipment_id: 8, brand_id: 4, category_id: 2, quantity: 38 },
  { id: 16, equipment_id: 9, brand_id: 1, category_id: 1, quantity: 45 },
  { id: 17, equipment_id: 9, brand_id: 3, category_id: 4, quantity: 47 },
  { id: 18, equipment_id: 11, brand_id: 2, category_id: 1, quantity: 24 },
  { id: 19, equipment_id: 11, brand_id: 1, category_id: 2, quantity: 24 },
  { id: 20, equipment_id: 12, brand_id: 3, category_id: 3, quantity: 35 },
  { id: 21, equipment_id: 12, brand_id: 4, category_id: 1, quantity: 32 },
  { id: 22, equipment_id: 13, brand_id: 1, category_id: 1, quantity: 20 },
  { id: 23, equipment_id: 13, brand_id: 2, category_id: 4, quantity: 15 },
  { id: 24, equipment_id: 14, brand_id: 1, category_id: 1, quantity: 40 },
  { id: 25, equipment_id: 14, brand_id: 2, category_id: 2, quantity: 35 },
  { id: 26, equipment_id: 14, brand_id: 3, category_id: 3, quantity: 35 },
];

// Transaction Logs
export const transactionLogs: TransactionLog[] = [
  { id: 1, user_id: 1, equipment_id: 1, category_id: 1, brand_id: 1, quantity: 2, action_type: 'remove_ped', created_at: '2026-02-23T06:30:00', admin_id: null },
  { id: 2, user_id: 2, equipment_id: 4, category_id: 2, brand_id: 2, quantity: 1, action_type: 'remove_ped', created_at: '2026-02-23T06:15:00', admin_id: null },
  { id: 3, user_id: 4, equipment_id: 2, category_id: 1, brand_id: 1, quantity: 3, action_type: 'remove_ped', created_at: '2026-02-23T05:45:00', admin_id: null },
  { id: 4, user_id: 1, equipment_id: null, category_id: null, brand_id: null, quantity: 0, action_type: 'balance_topup', created_at: '2026-02-22T14:00:00', admin_id: 1 },
  { id: 5, user_id: 5, equipment_id: 8, category_id: 1, brand_id: 2, quantity: 1, action_type: 'remove_ped', created_at: '2026-02-22T12:30:00', admin_id: null },
  { id: 6, user_id: 6, equipment_id: 9, category_id: 4, brand_id: 3, quantity: 2, action_type: 'remove_ped', created_at: '2026-02-22T11:00:00', admin_id: null },
  { id: 7, user_id: 3, equipment_id: null, category_id: null, brand_id: null, quantity: 0, action_type: 'refund', created_at: '2026-02-22T10:00:00', admin_id: 1 },
  { id: 8, user_id: 8, equipment_id: 5, category_id: 2, brand_id: 1, quantity: 1, action_type: 'remove_ped', created_at: '2026-02-21T16:00:00', admin_id: null },
  { id: 9, user_id: 9, equipment_id: 12, category_id: 3, brand_id: 3, quantity: 2, action_type: 'remove_ped', created_at: '2026-02-21T14:30:00', admin_id: null },
  { id: 10, user_id: 10, equipment_id: 14, category_id: 1, brand_id: 1, quantity: 1, action_type: 'remove_ped', created_at: '2026-02-21T13:00:00', admin_id: null },
  { id: 11, user_id: 11, equipment_id: 1, category_id: 2, brand_id: 2, quantity: 2, action_type: 'remove_ped', created_at: '2026-02-21T11:30:00', admin_id: null },
  { id: 12, user_id: 12, equipment_id: 7, category_id: 1, brand_id: 3, quantity: 1, action_type: 'remove_ped', created_at: '2026-02-21T10:00:00', admin_id: null },
  { id: 13, user_id: 4, equipment_id: null, category_id: null, brand_id: null, quantity: 0, action_type: 'balance_topup', created_at: '2026-02-20T15:00:00', admin_id: 1 },
  { id: 14, user_id: 2, equipment_id: 11, category_id: 1, brand_id: 2, quantity: 1, action_type: 'remove_ped', created_at: '2026-02-20T12:00:00', admin_id: null },
  { id: 15, user_id: 6, equipment_id: 4, category_id: 1, brand_id: 1, quantity: 2, action_type: 'remove_ped', created_at: '2026-02-20T09:30:00', admin_id: null },
  { id: 16, user_id: 1, equipment_id: 1, category_id: null, brand_id: null, quantity: 50, action_type: 'add_ped', created_at: '2026-02-19T08:00:00', admin_id: 1 },
  { id: 17, user_id: 1, equipment_id: 4, category_id: null, brand_id: null, quantity: 100, action_type: 'add_ped', created_at: '2026-02-18T08:00:00', admin_id: 1 },
  { id: 18, user_id: 5, equipment_id: 9, category_id: 1, brand_id: 1, quantity: 1, action_type: 'remove_ped', created_at: '2026-02-19T15:00:00', admin_id: null },
  { id: 19, user_id: 8, equipment_id: 12, category_id: 1, brand_id: 4, quantity: 2, action_type: 'remove_ped', created_at: '2026-02-19T13:00:00', admin_id: null },
  { id: 20, user_id: 10, equipment_id: 8, category_id: 2, brand_id: 4, quantity: 1, action_type: 'remove_ped', created_at: '2026-02-19T11:00:00', admin_id: null },
];

// Stories
export const stories: Story[] = [
  { id: 1, title: 'Yeni dispenser əlavə olundu!', content: 'Memar Əcəmi metro stansiyasında yeni dispenser quraşdırıldı.', image: 'https://placehold.co/400x600/0099CC/white?text=Yeni+Dispenser', expires_at: '2026-03-15', created_at: '2026-02-20' },
  { id: 2, title: 'Endirim kampaniyası', content: 'Bu ay bütün pedlərə 20% endirim!', image: 'https://placehold.co/400x600/E30A17/white?text=Endirim+20%25', expires_at: '2026-03-01', created_at: '2026-02-18' },
  { id: 3, title: 'Yeni brend: Naturella', content: 'Artıq dispenserlərdə Naturella brendini tapa bilərsiniz.', image: 'https://placehold.co/400x600/00B388/white?text=Naturella', expires_at: '2026-03-10', created_at: '2026-02-15' },
  { id: 4, title: 'Sağlamlıq məsləhətləri', content: 'Qadın gigiyenası haqqında bilməli olduğunuz 5 şey.', image: 'https://placehold.co/400x600/9333ea/white?text=Saglamliq', expires_at: '2026-04-01', created_at: '2026-02-22' },
];

// Banners
export const banners: Banner[] = [
  { id: 1, title: 'Xoş gəldiniz!', content: 'Ped dispenser tətbiqinə xoş gəldiniz. QR kodu oxudun, pedinizi alın!', image: 'https://placehold.co/800x300/0099CC/white?text=Xos+Geldiniz', expires_at: '2026-06-01', created_at: '2026-01-01' },
  { id: 2, title: 'Pulsuz ilk istifadə', content: 'Yeni qeydiyyatdan keçən istifadəçilər üçün ilk ped pulsuz!', image: 'https://placehold.co/800x300/E30A17/white?text=Pulsuz+Ped', expires_at: '2026-04-01', created_at: '2026-02-01' },
  { id: 3, title: 'Dostunu dəvət et', content: 'Dostunu dəvət et, hər ikiniz 5 AZN bonus qazanın!', image: 'https://placehold.co/800x300/00B388/white?text=Dostunu+Devet+Et', expires_at: '2026-05-01', created_at: '2026-02-10' },
];

// Forum Posts
export const forumPosts: ForumPost[] = [
  { id: 1, title: 'Ən yaxşı gecə pedləri hansılardır?', content: 'Salam, gecə pedləri haqqında tövsiyələriniz varmı?', status: 'active', user_id: 1, like_count: 24, share_count: 5, comment_count: 8, created_at: '2026-02-20' },
  { id: 2, title: 'Dispenser işləmir - Nərimanov', content: 'Nərimanov metro stansiyasındakı dispenser 2 gündür işləmir.', status: 'active', user_id: 2, like_count: 15, share_count: 3, comment_count: 12, created_at: '2026-02-19' },
  { id: 3, title: 'Yeni brend təklifləri', content: 'Hansı brendləri görmək istərdiniz dispenserlərdə?', status: 'active', user_id: 4, like_count: 32, share_count: 8, comment_count: 15, created_at: '2026-02-18' },
  { id: 4, title: 'Qiymətlər haqqında', content: 'Qiymətlər bir az yüksəkdir, endirim olacaqmı?', status: 'pending', user_id: 5, like_count: 45, share_count: 12, comment_count: 20, created_at: '2026-02-17' },
  { id: 5, title: 'Tətbiq çox yaxşıdır!', content: 'Bu tətbiq həqiqətən çox faydalıdır, təşəkkürlər!', status: 'active', user_id: 6, like_count: 56, share_count: 15, comment_count: 7, created_at: '2026-02-16' },
  { id: 6, title: 'Balans artırma problemi', content: 'Balansımı artıra bilmirəm, kömək edin.', status: 'active', user_id: 8, like_count: 8, share_count: 1, comment_count: 4, created_at: '2026-02-15' },
  { id: 7, title: 'Spam mesaj', content: 'Bu spam məzmundur.', status: 'blocked', user_id: 3, like_count: 0, share_count: 0, comment_count: 0, created_at: '2026-02-14' },
  { id: 8, title: 'Sumqayıtda dispenser lazımdır', content: 'Sumqayıtın mərkəzində daha çox dispenser quraşdırılsa yaxşı olar.', status: 'active', user_id: 9, like_count: 28, share_count: 6, comment_count: 9, created_at: '2026-02-13' },
];

// Chart data for last 30 days
export const dailyUsageData = [
  { gun: '24 Yan', istifade: 45 }, { gun: '25 Yan', istifade: 52 }, { gun: '26 Yan', istifade: 38 },
  { gun: '27 Yan', istifade: 61 }, { gun: '28 Yan', istifade: 55 }, { gun: '29 Yan', istifade: 48 },
  { gun: '30 Yan', istifade: 42 }, { gun: '31 Yan', istifade: 67 }, { gun: '1 Fev', istifade: 72 },
  { gun: '2 Fev', istifade: 58 }, { gun: '3 Fev', istifade: 63 }, { gun: '4 Fev', istifade: 49 },
  { gun: '5 Fev', istifade: 71 }, { gun: '6 Fev', istifade: 65 }, { gun: '7 Fev', istifade: 53 },
  { gun: '8 Fev', istifade: 78 }, { gun: '9 Fev', istifade: 82 }, { gun: '10 Fev', istifade: 69 },
  { gun: '11 Fev', istifade: 74 }, { gun: '12 Fev', istifade: 56 }, { gun: '13 Fev', istifade: 88 },
  { gun: '14 Fev', istifade: 91 }, { gun: '15 Fev', istifade: 76 }, { gun: '16 Fev', istifade: 83 },
  { gun: '17 Fev', istifade: 68 }, { gun: '18 Fev', istifade: 79 }, { gun: '19 Fev', istifade: 85 },
  { gun: '20 Fev', istifade: 92 }, { gun: '21 Fev', istifade: 87 }, { gun: '22 Fev', istifade: 95 },
];

export const brandUsageData = [
  { name: 'Molped', deger: 340 },
  { name: 'Kotex', deger: 280 },
  { name: 'Always', deger: 220 },
  { name: 'Naturella', deger: 160 },
  { name: 'Libresse', deger: 45 },
];

export const categoryUsageData = [
  { name: 'Normal', deger: 420 },
  { name: 'Night (Gecə)', deger: 280 },
  { name: 'Ultra İncə', deger: 190 },
  { name: 'Günlük', deger: 310 },
  { name: 'Maxi', deger: 95 },
];

// Helper functions
export const getUserById = (id: number) => users.find(u => u.id === id);
export const getEquipmentById = (id: number) => equipments.find(e => e.id === id);
export const getBrandById = (id: number) => brands.find(b => b.id === id);
export const getCategoryById = (id: number) => categories.find(c => c.id === id);

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emerald-100 text-emerald-700';
    case 'offline': return 'bg-red-100 text-red-700';
    case 'broken': return 'bg-amber-100 text-amber-700';
    case 'deactive': return 'bg-red-100 text-red-700';
    case 'under_repair': return 'bg-amber-100 text-amber-700';
    case 'maintenance': return 'bg-indigo-100 text-indigo-700';
    case 'blocked': return 'bg-red-100 text-red-700';
    case 'deleted': return 'bg-gray-100 text-gray-700';
    case 'pending': return 'bg-amber-100 text-amber-700';
    case 'inactive': return 'bg-gray-100 text-gray-700';
    case 'verified': return 'bg-emerald-100 text-emerald-700';
    case 'unverified': return 'bg-amber-100 text-amber-700';
    case 'banned': return 'bg-red-100 text-red-700';
    case 'deactivated': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Aktiv';
    case 'offline': return 'Oflayn';
    case 'broken': return 'Xarab';
    case 'deactive': return 'Deaktiv';
    case 'under_repair': return 'Təmirdə';
    case 'maintenance': return 'Baxımda';
    case 'blocked': return 'Bloklanmış';
    case 'deleted': return 'Silinmiş';
    case 'pending': return 'Gözləyir';
    case 'inactive': return 'Deaktiv';
    case 'verified': return 'Təsdiqlənmiş';
    case 'unverified': return 'Təsdiqlənməmiş';
    case 'banned': return 'Ban edilib';
    case 'deactivated': return 'Dondurulub';
    default: return status;
  }
};

export const normalizeEquipmentStatus = (status: string) => status;

export const getActionTypeLabel = (type: string) => {
  switch (type) {
    case 'add_ped': return 'Ped əlavə';
    case 'remove_ped': return 'Ped çıxarma';
    case 'refund': return 'Geri ödəniş';
    case 'balance_topup': return 'Balans artırma';
    default: return type;
  }
};

export const getActionTypeColor = (type: string) => {
  switch (type) {
    case 'add_ped': return 'bg-blue-100 text-blue-700';
    case 'remove_ped': return 'bg-purple-100 text-purple-700';
    case 'refund': return 'bg-amber-100 text-amber-700';
    case 'balance_topup': return 'bg-emerald-100 text-emerald-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};
