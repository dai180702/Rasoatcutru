import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  Timestamp,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { VerificationData } from '../app/page';

export interface Record extends VerificationData {
  id: string;
  ngayKiemTra: string;
  createdAt?: Timestamp;
}

const COLLECTION_NAME = 'verification_records';

// Thêm bản ghi mới
export const addRecord = async (data: VerificationData): Promise<string> => {
  try {
    const ngayKiemTra = new Date().toLocaleDateString('vi-VN');
    const recordData = {
      ...data,
      ngayKiemTra,
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), recordData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding record:', error);
    const firestoreError = error as { code?: string; message?: string };
    
    if (firestoreError.code === 'permission-denied') {
      throw new Error('Không có quyền thêm dữ liệu. Vui lòng kiểm tra Firestore Rules.');
    } else if (firestoreError.code === 'unavailable') {
      throw new Error('Firestore không khả dụng. Vui lòng kiểm tra kết nối internet.');
    }
    
    throw error;
  }
};

// Lấy tất cả bản ghi
export const getRecords = async (): Promise<Record[]> => {
  try {
    // Thử query với orderBy trước
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const records: Record[] = [];
      
      querySnapshot.forEach((doc) => {
        records.push({
          id: doc.id,
          ...doc.data(),
        } as Record);
      });
      
      return records;
    } catch (orderByError) {
      // Nếu lỗi do thiếu index hoặc collection rỗng, thử query không có orderBy
      const firestoreError = orderByError as { code?: string; message?: string };
      if (firestoreError.code === 'failed-precondition' || firestoreError.code === 'not-found') {
        console.warn('OrderBy failed, trying without orderBy:', firestoreError.message);
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const records: Record[] = [];
        
        querySnapshot.forEach((doc) => {
          records.push({
            id: doc.id,
            ...doc.data(),
          } as Record);
        });
        
        // Sort manually nếu có createdAt (cũ nhất lên đầu, mới nhất xuống dưới)
        return records.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return a.createdAt.toMillis() - b.createdAt.toMillis();
          }
          return 0;
        });
      }
      throw orderByError;
    }
  } catch (error) {
    console.error('Error getting records:', error);
    const firestoreError = error as { code?: string; message?: string };
    
    // Hiển thị lỗi cụ thể hơn
    if (firestoreError.code === 'permission-denied') {
      throw new Error('Không có quyền truy cập Firestore. Vui lòng kiểm tra Firestore Rules.');
    } else if (firestoreError.code === 'unavailable') {
      throw new Error('Firestore không khả dụng. Vui lòng kiểm tra kết nối internet và Firebase config.');
    } else if (firestoreError.code === 'not-found') {
      // Collection chưa tồn tại - trả về mảng rỗng thay vì throw error
      console.warn('Collection chưa tồn tại, trả về mảng rỗng');
      return [];
    }
    
    throw error;
  }
};

// Xóa bản ghi
export const deleteRecord = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting record:', error);
    const firestoreError = error as { code?: string; message?: string };
    
    if (firestoreError.code === 'permission-denied') {
      throw new Error('Không có quyền xóa dữ liệu. Vui lòng kiểm tra Firestore Rules.');
    } else if (firestoreError.code === 'not-found') {
      throw new Error('Bản ghi không tồn tại.');
    } else if (firestoreError.code === 'unavailable') {
      throw new Error('Firestore không khả dụng. Vui lòng kiểm tra kết nối internet.');
    }
    
    throw error;
  }
};

// Subscribe real-time để tự động cập nhật khi có thay đổi
export const subscribeToRecords = (
  callback: (records: Record[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(
      q,
      (querySnapshot) => {
        const records: Record[] = [];
        querySnapshot.forEach((doc) => {
          records.push({
            id: doc.id,
            ...doc.data(),
          } as Record);
        });
        
        // Sort manually nếu cần (fallback)
        const sortedRecords = records.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return a.createdAt.toMillis() - b.createdAt.toMillis();
          }
          return 0;
        });
        
        callback(sortedRecords);
      },
      (error) => {
        console.error('Error subscribing to records:', error);
        const firestoreError = error as { code?: string; message?: string };
        
        if (firestoreError.code === 'permission-denied') {
          onError?.(new Error('Không có quyền truy cập Firestore. Vui lòng kiểm tra Firestore Rules.'));
        } else if (firestoreError.code === 'unavailable') {
          onError?.(new Error('Firestore không khả dụng. Vui lòng kiểm tra kết nối internet.'));
        } else {
          onError?.(new Error('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.'));
        }
      }
    );
  } catch (error) {
    console.error('Error setting up subscription:', error);
    onError?.(new Error('Có lỗi xảy ra khi thiết lập kết nối. Vui lòng thử lại.'));
    // Return no-op unsubscribe
    return () => {};
  }
};
