// Firestore Service cho Flutter
// Cung cấp các phương thức CRUD cho Cloud Firestore

import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreService {
  static final FirebaseFirestore _db = FirebaseFirestore.instance;

  // ========================
  // THÊM document mới (ID tự động)
  // ========================
  static Future<DocumentReference> addDocument(
    String collection,
    Map<String, dynamic> data,
  ) async {
    return await _db.collection(collection).add({
      ...data,
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  // ========================
  // THÊM / GHI ĐÈ document (ID tự chỉ định)
  // ========================
  static Future<void> setDocument(
    String collection,
    String docId,
    Map<String, dynamic> data, {
    bool merge = true,
  }) async {
    await _db.collection(collection).doc(docId).set(
      {...data, 'updatedAt': FieldValue.serverTimestamp()},
      SetOptions(merge: merge),
    );
  }

  // ========================
  // LẤY một document theo ID
  // ========================
  static Future<Map<String, dynamic>?> getDocument(
    String collection,
    String docId,
  ) async {
    final doc = await _db.collection(collection).doc(docId).get();
    if (doc.exists) {
      return {'id': doc.id, ...?doc.data()};
    }
    return null;
  }

  // ========================
  // LẤY tất cả documents trong collection
  // ========================
  static Future<List<Map<String, dynamic>>> getCollection(
    String collection,
  ) async {
    final snapshot = await _db.collection(collection).get();
    return snapshot.docs
        .map((doc) => {'id': doc.id, ...doc.data()})
        .toList();
  }

  // ========================
  // CẬP NHẬT document
  // ========================
  static Future<void> updateDocument(
    String collection,
    String docId,
    Map<String, dynamic> data,
  ) async {
    await _db.collection(collection).doc(docId).update({
      ...data,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  // ========================
  // XÓA document
  // ========================
  static Future<void> deleteDocument(
    String collection,
    String docId,
  ) async {
    await _db.collection(collection).doc(docId).delete();
  }

  // ========================
  // REALTIME LISTENER - Stream một document
  // Dùng trong StreamBuilder
  // ========================
  static Stream<DocumentSnapshot<Map<String, dynamic>>> listenToDocument(
    String collection,
    String docId,
  ) {
    return _db.collection(collection).doc(docId).snapshots();
  }

  // ========================
  // REALTIME LISTENER - Stream toàn bộ collection
  // ========================
  static Stream<QuerySnapshot<Map<String, dynamic>>> listenToCollection(
    String collection,
  ) {
    return _db.collection(collection).snapshots();
  }
}
