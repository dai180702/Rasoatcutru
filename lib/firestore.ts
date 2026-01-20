import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
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

const COLLECTION_TAM_TRU = 'tam_tru_records';
const COLLECTION_THUONG_TRU = 'thuong_tru_records';
const COLLECTION_OLD = 'verification_records'; // Collection cũ để tương thích

// Lấy tên collection dựa trên loại cư trú
const getCollectionName = (loaiCuTru: 'tamTru' | 'thuongTru'): string => {
  return loaiCuTru === 'tamTru' ? COLLECTION_TAM_TRU : COLLECTION_THUONG_TRU;
};

// Thêm bản ghi mới vào collection tương ứng
export const addRecord = async (data: VerificationData): Promise<string> => {
  try {
    if (!data.loaiCuTru) {
      throw new Error('Loại cư trú không được xác định. Vui lòng chọn loại cư trú trước.');
    }

    const ngayKiemTra = new Date().toLocaleDateString('vi-VN');
    const recordData = {
      ...data,
      ngayKiemTra,
      createdAt: Timestamp.now(),
    };
    
    // Lưu vào collection tương ứng với loại cư trú
    const collectionName = getCollectionName(data.loaiCuTru);
    const docRef = await addDoc(collection(db, collectionName), recordData);
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

// Lấy tất cả bản ghi (có thể filter theo loại) - không còn sử dụng, chỉ để tương thích
export const getRecords = async (loaiCuTru?: 'tamTru' | 'thuongTru'): Promise<Record[]> => {
  try {
    if (!loaiCuTru) {
      // Nếu không có loại, trả về mảng rỗng (nên sử dụng subscribeToRecords thay vì hàm này)
      return [];
    }
    
    const collectionName = getCollectionName(loaiCuTru);
    
    // Thử query với orderBy trước
    try {
      const q = query(
        collection(db, collectionName),
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
        const querySnapshot = await getDocs(collection(db, collectionName));
        
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

// Xóa bản ghi - cần biết loại cư trú để xóa đúng collection
export const deleteRecord = async (id: string, loaiCuTru: 'tamTru' | 'thuongTru'): Promise<void> => {
  try {
    const collectionName = getCollectionName(loaiCuTru);
    await deleteDoc(doc(db, collectionName, id));
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
  loaiCuTru: 'tamTru' | 'thuongTru',
  callback: (records: Record[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    const collectionName = getCollectionName(loaiCuTru);
    let q;
    
    // Query collection tương ứng với loại cư trú
    try {
      q = query(
        collection(db, collectionName),
        orderBy('createdAt', 'asc')
      );
    } catch (orderByError) {
      // Nếu lỗi do thiếu index, query không có orderBy
      const firestoreError = orderByError as { code?: string; message?: string };
      if (firestoreError.code === 'failed-precondition') {
        console.warn('OrderBy failed, querying without orderBy');
        q = query(collection(db, collectionName));
      } else {
        throw orderByError;
      }
    }

    // Nếu là tamTru, cần subscribe cả collection cũ để lấy bản ghi cũ
    let unsubscribeOld: Unsubscribe | null = null;
    let newRecords: Record[] = [];
    let oldRecords: Record[] = [];
    let newRecordsReady = false;
    let oldRecordsReady = false;
    
    const processAndCallback = () => {
      // Chỉ callback khi cả 2 đã sẵn sàng (hoặc không cần collection cũ)
      if (loaiCuTru === 'tamTru') {
        if (!newRecordsReady || !oldRecordsReady) {
          return; // Chờ cả 2 sẵn sàng
        }
      } else {
        if (!newRecordsReady) {
          return; // Chờ collection mới sẵn sàng
        }
      }
      
      const allRecords = [...newRecords, ...oldRecords];
      const sortedRecords = allRecords.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return a.createdAt.toMillis() - b.createdAt.toMillis();
        }
        return 0;
      });
      callback(sortedRecords);
    };
    
    if (loaiCuTru === 'tamTru') {
      // Subscribe collection cũ để lấy bản ghi cũ
      try {
        const qOld = query(collection(db, COLLECTION_OLD));
        unsubscribeOld = onSnapshot(
          qOld,
          (oldSnapshot) => {
            oldRecords = [];
            oldSnapshot.forEach((doc) => {
              const data = doc.data();
              // Chỉ lấy bản ghi không có loaiCuTru hoặc có loaiCuTru === 'tamTru'
              if (!data.loaiCuTru || data.loaiCuTru === 'tamTru') {
                oldRecords.push({
                  id: doc.id,
                  ...data,
                  loaiCuTru: 'tamTru',
                } as Record);
              }
            });
            oldRecordsReady = true;
            processAndCallback();
          },
          (error) => {
            // Ignore errors from old collection
            console.warn('Error subscribing to old collection:', error);
            oldRecords = [];
            oldRecordsReady = true; // Đánh dấu đã sẵn sàng (dù không có dữ liệu)
            processAndCallback();
          }
        );
      } catch (e) {
        // Ignore nếu collection cũ không tồn tại
        console.warn('Old collection not accessible:', e);
        oldRecords = [];
        oldRecordsReady = true; // Đánh dấu đã sẵn sàng
      }
    } else {
      // ThuongTru không cần collection cũ
      oldRecordsReady = true;
    }
    
    const unsubscribeNew = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          newRecords = [];
          
          // Lấy bản ghi từ collection mới
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            newRecords.push({
              id: doc.id,
              ...data,
              loaiCuTru: loaiCuTru, // Đảm bảo loaiCuTru được set
            } as Record);
          });

          newRecordsReady = true;
          processAndCallback();
        } catch (processingError) {
          console.error('Error processing query snapshot:', processingError);
          onError?.(new Error('Lỗi xử lý dữ liệu từ Firestore.'));
        }
      },
      (error) => {
        console.error('Error in onSnapshot callback:', error);
        const firestoreError = error as { code?: string; message?: string };
        
        let errorMessage = 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.';
        
        if (firestoreError.code === 'permission-denied') {
          errorMessage = 'Không có quyền truy cập Firestore. Vui lòng kiểm tra Firestore Rules.';
        } else if (firestoreError.code === 'unavailable') {
          errorMessage = 'Firestore không khả dụng. Vui lòng kiểm tra kết nối internet.';
        } else if (firestoreError.code === 'failed-precondition') {
          errorMessage = 'Thiếu composite index trong Firestore. Vui lòng tạo index cho loaiCuTru và createdAt.';
        } else if (firestoreError.code) {
          errorMessage = `Lỗi Firestore (${firestoreError.code}): ${firestoreError.message || 'Vui lòng thử lại.'}`;
        }
        
        console.error('Firestore error details:', {
          code: firestoreError.code,
          message: firestoreError.message,
          stack: (error as Error).stack,
        });
        
        onError?.(new Error(errorMessage));
      }
    );
    
    // Return unsubscribe function để cleanup cả 2 subscriptions
    return () => {
      unsubscribeNew();
      if (unsubscribeOld) {
        unsubscribeOld();
      }
    };
  } catch (error) {
    console.error('Error setting up subscription:', error);
    const setupError = error as { code?: string; message?: string };
    const errorMessage = `Lỗi thiết lập kết nối: ${setupError.code || 'unknown'}. ${setupError.message || 'Vui lòng thử lại.'}`;
    onError?.(new Error(errorMessage));
    // Return no-op unsubscribe
    return () => {};
  }
};
