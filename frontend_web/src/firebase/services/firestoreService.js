// Firestore helper functions
// Sử dụng: import { addDoc, getDoc, ... } from './firestoreService'

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.config";

// ========================
// THÊM document mới (ID tự động)
// ========================
export const addDocument = async (collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// ========================
// THÊM / GHI ĐÈ document (ID tự chỉ định)
// ========================
export const setDocument = async (collectionName, docId, data) => {
  await setDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// ========================
// LẤY một document theo ID
// ========================
export const getDocument = async (collectionName, docId) => {
  const docSnap = await getDoc(doc(db, collectionName, docId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

// ========================
// LẤY tất cả documents trong collection
// ========================
export const getCollection = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ========================
// QUERY có điều kiện
// Ví dụ: queryDocuments("posts", [{ field: "userId", op: "==", value: "abc123" }])
// ========================
export const queryDocuments = async (collectionName, conditions = [], orderField = null, limitCount = null) => {
  let q = collection(db, collectionName);
  const constraints = [];

  conditions.forEach(({ field, op, value }) => {
    constraints.push(where(field, op, value));
  });

  if (orderField) {
    constraints.push(orderBy(orderField));
  }

  if (limitCount) {
    constraints.push(limit(limitCount));
  }

  q = query(q, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ========================
// CẬP NHẬT document
// ========================
export const updateDocument = async (collectionName, docId, data) => {
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// ========================
// XÓA document
// ========================
export const deleteDocument = async (collectionName, docId) => {
  await deleteDoc(doc(db, collectionName, docId));
};

// ========================
// REALTIME LISTENER - lắng nghe thay đổi theo thời gian thực
// Trả về unsubscribe function. Gọi trong useEffect cleanup.
// Ví dụ: const unsub = listenToDocument("users", uid, setUserData);
// ========================
export const listenToDocument = (collectionName, docId, callback) => {
  return onSnapshot(doc(db, collectionName, docId), (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  });
};

export const listenToCollection = (collectionName, callback, conditions = []) => {
  let q = collection(db, collectionName);
  if (conditions.length > 0) {
    const constraints = conditions.map(({ field, op, value }) => where(field, op, value));
    q = query(q, ...constraints);
  }
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(docs);
  });
};

export { db };
