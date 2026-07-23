import { User, Document, Category, Announcement } from '../types';

// ============================================================================
// API Service Layer
// ----------------------------------------------------------------------------
// This module currently uses localStorage to provide a fully functional prototype.
// To connect to Google Apps Script / Google Sheets, you should replace the contents
// of these functions with `fetch()` calls to your deployed Google Apps Script URL.
//
// Example:
// export async function getDocuments() {
//   const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=getDocuments');
//   return await response.json();
// }
// ============================================================================

const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'งานบริหาร' },
  { id: 'c2', name: 'งานบุคลากร' },
  { id: 'c3', name: 'งานงบประมาณ' },
  { id: 'c4', name: 'งานวิชาการ' },
  { id: 'c5', name: 'งานธุรการ' },
  { id: 'c6', name: 'งานอาคารสถานที่' },
  { id: 'c7', name: 'งานกิจการนักเรียน' },
  { id: 'c8', name: 'งานการเงิน' },
  { id: 'c9', name: 'งานอาหารกลางวัน' },
  { id: 'c10', name: 'กฎหมายและระเบียบ' },
  { id: 'c11', name: 'แบบฟอร์ม' },
  { id: 'c12', name: 'หนังสือเวียน' },
  { id: 'c13', name: 'คำสั่ง' },
  { id: 'c14', name: 'อื่น ๆ' },
];

const MOCK_USERS: User[] = [
  { id: 'u1', schoolCode: 'admin', schoolName: 'สช.อำเภอธารโต (ผู้ดูแลระบบ)', role: 'admin' },
  { id: 'u2', schoolCode: '101', schoolName: 'โรงเรียนบ้านธารโต', role: 'user' },
  { id: 'u3', schoolCode: '102', schoolName: 'โรงเรียนคอกช้าง', role: 'user' },
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'แจ้งปรับปรุงระบบประจำเดือน', content: 'จะมีการปิดปรับปรุงระบบในวันที่ 30 นี้ เวลา 22.00-24.00 น.', date: new Date().toISOString(), type: 'alert' },
  { id: 'a2', title: 'ประชุมประจำเดือนผู้อำนวยการ', content: 'ขอเชิญประชุมประจำเดือน ณ ห้องประชุมสำนักงาน', date: new Date(Date.now() - 86400000).toISOString(), type: 'news' },
];

const MOCK_DOCS: Document[] = [
  {
    id: 'd1',
    docNumber: 'สชอ.ธต/2569/001',
    title: 'แบบฟอร์มขออนุมัติเดินทางไปราชการ',
    categoryId: 'c11',
    categoryName: 'แบบฟอร์ม',
    year: '2569',
    description: 'แบบฟอร์มมาตรฐานสำหรับข้าราชการและบุคลากร',
    fileUrl: '#',
    publisher: 'ฝ่ายบุคลากร',
    dateAdded: new Date().toISOString(),
    downloads: 145,
    isStarred: true,
  },
  {
    id: 'd2',
    docNumber: 'สชอ.ธต/2569/002',
    title: 'หนังสือเวียนแจ้งแนวทางการจัดการเรียนการสอน',
    categoryId: 'c12',
    categoryName: 'หนังสือเวียน',
    year: '2569',
    description: 'แนวทางใหม่ประจำปีการศึกษา 2569',
    fileUrl: '#',
    publisher: 'ฝ่ายวิชาการ',
    dateAdded: new Date(Date.now() - 86400000 * 2).toISOString(),
    downloads: 89,
    isStarred: false,
  },
  {
    id: 'd3',
    docNumber: 'สชอ.ธต/2569/003',
    title: 'คู่มือการเบิกจ่ายงบประมาณ',
    categoryId: 'c3',
    categoryName: 'งานงบประมาณ',
    year: '2569',
    description: 'คู่มือการใช้งานระบบงบประมาณใหม่',
    fileUrl: '#',
    publisher: 'ฝ่ายการเงิน',
    dateAdded: new Date(Date.now() - 86400000 * 5).toISOString(),
    downloads: 210,
    isStarred: true,
  }
];

// Initialize local storage if empty
function initDb() {
  if (!localStorage.getItem('doc_users')) localStorage.setItem('doc_users', JSON.stringify(MOCK_USERS));
  if (!localStorage.getItem('doc_categories')) localStorage.setItem('doc_categories', JSON.stringify(MOCK_CATEGORIES));
  if (!localStorage.getItem('doc_announcements')) localStorage.setItem('doc_announcements', JSON.stringify(MOCK_ANNOUNCEMENTS));
  if (!localStorage.getItem('doc_documents')) localStorage.setItem('doc_documents', JSON.stringify(MOCK_DOCS));
}

// Ensure DB is initialized
if (typeof window !== 'undefined') {
  initDb();
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function login(schoolCode: string, password?: string): Promise<User> {
  await delay(500); // simulate network
  const users: User[] = JSON.parse(localStorage.getItem('doc_users') || '[]');
  
  // In a real app, you would verify the password via the backend.
  // For this prototype, if schoolCode exists, we let them in.
  const user = users.find(u => u.schoolCode === schoolCode);
  if (!user) throw new Error('รหัสสถานศึกษาไม่ถูกต้อง');
  
  return user;
}

export async function getDashboardStats() {
  await delay(300);
  const docs: Document[] = JSON.parse(localStorage.getItem('doc_documents') || '[]');
  const cats: Category[] = JSON.parse(localStorage.getItem('doc_categories') || '[]');
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const newDocsCount = docs.filter(d => new Date(d.dateAdded) >= thirtyDaysAgo).length;
  const topDownloads = docs.filter(d => d.downloads > 50).length;

  return {
    totalDocs: docs.length,
    newDocs: newDocsCount,
    topDownloads: topDownloads,
    totalCategories: cats.length
  };
}

export async function getAnnouncements(): Promise<Announcement[]> {
  await delay(200);
  return JSON.parse(localStorage.getItem('doc_announcements') || '[]');
}

export async function getCategories(): Promise<Category[]> {
  await delay(200);
  return JSON.parse(localStorage.getItem('doc_categories') || '[]');
}

export async function getDocuments(): Promise<Document[]> {
  await delay(300);
  return JSON.parse(localStorage.getItem('doc_documents') || '[]');
}

export async function addDocument(docData: Partial<Document>): Promise<Document> {
  await delay(500);
  const docs: Document[] = JSON.parse(localStorage.getItem('doc_documents') || '[]');
  const cats: Category[] = JSON.parse(localStorage.getItem('doc_categories') || '[]');
  
  const category = cats.find(c => c.id === docData.categoryId);
  
  const newDoc: Document = {
    id: 'd' + Date.now(),
    docNumber: docData.docNumber || `สชอ.ธต/${new Date().getFullYear() + 543}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    title: docData.title || '',
    categoryId: docData.categoryId || '',
    categoryName: category?.name || '',
    year: docData.year || (new Date().getFullYear() + 543).toString(),
    description: docData.description || '',
    fileUrl: docData.fileUrl || '#',
    publisher: docData.publisher || 'Admin',
    dateAdded: new Date().toISOString(),
    downloads: 0,
    isStarred: false,
  };
  
  docs.push(newDoc);
  localStorage.setItem('doc_documents', JSON.stringify(docs));
  return newDoc;
}

export async function toggleStar(docId: string): Promise<void> {
  const docs: Document[] = JSON.parse(localStorage.getItem('doc_documents') || '[]');
  const index = docs.findIndex(d => d.id === docId);
  if (index !== -1) {
    docs[index].isStarred = !docs[index].isStarred;
    localStorage.setItem('doc_documents', JSON.stringify(docs));
  }
}

export async function incrementDownload(docId: string): Promise<void> {
  const docs: Document[] = JSON.parse(localStorage.getItem('doc_documents') || '[]');
  const index = docs.findIndex(d => d.id === docId);
  if (index !== -1) {
    docs[index].downloads += 1;
    localStorage.setItem('doc_documents', JSON.stringify(docs));
  }
}
