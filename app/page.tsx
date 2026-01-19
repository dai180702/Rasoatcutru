'use client';

import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import VerificationForm from './components/VerificationForm';
import RecordsList from './components/RecordsList';
import LoginForm from './components/LoginForm';
import { addRecord, getRecords, deleteRecord, subscribeToRecords } from '../lib/firestore';
import { subscribeToAuthState, isAuthorizedUser } from '../lib/auth';

export interface VerificationData {
  hoTen: string;
  ngaySinh: string;
  cccd: string;
  hkttXaPhuong: string;
  hkttTinhTP: string;
  noiOHienTai: string;
  dangKyTamTru: string; // "rồi", "chưa", hoặc "không xác định"
  ngheNghiep: string;
  soDienThoai: string;
  dauThoiGian: string;
  dangKyBauCuTanLap: string; // "Đồng ý" hoặc "Không đồng ý"
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [records, setRecords] = useState<(VerificationData & { id: string; ngayKiemTra: string })[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Theo dõi trạng thái đăng nhập và subscribe real-time cho records
  useEffect(() => {
    let unsubscribeRecords: (() => void) | null = null;

    const unsubscribeAuth = subscribeToAuthState((user) => {
      setCurrentUser(user);

      // Unsubscribe records cũ nếu có
      if (unsubscribeRecords) {
        unsubscribeRecords();
        unsubscribeRecords = null;
      }

      // Nếu đã đăng nhập và được phép, subscribe real-time
      if (user && isAuthorizedUser(user)) {
        setIsLoadingRecords(true);
        unsubscribeRecords = subscribeToRecords(
          (data) => {
            setRecords(data);
            setIsLoadingRecords(false);
          },
          (error) => {
            console.error('Error subscribing to records:', error);
            alert(error.message);
            setRecords([]);
            setIsLoadingRecords(false);
          }
        );
      } else {
        setIsLoadingRecords(false);
        setRecords([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRecords) {
        unsubscribeRecords();
      }
    };
  }, []);

  // Load danh sách khi user đăng nhập thành công (backup, nhưng real-time sẽ tự động cập nhật)
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Real-time listener sẽ tự động cập nhật trong useEffect
  };

  const handleVerification = async (data: VerificationData) => {
    setIsLoading(true);
    
    try {
      await addRecord(data);
      alert('Thêm bản ghi thành công!');
      // Real-time listener sẽ tự động cập nhật danh sách, không cần gọi loadRecords()
    } catch (error) {
      console.error('Error adding record:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi thêm bản ghi. Vui lòng thử lại.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      try {
        await deleteRecord(id);
        // Real-time listener sẽ tự động cập nhật danh sách, không cần gọi loadRecords()
      } catch (error) {
        console.error('Error deleting record:', error);
        const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa bản ghi. Vui lòng thử lại.';
        alert(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 gap-4">
          <div className="text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
              Hệ thống Rà soát Cư trú
            </h1>
            <p className="text-sm md:text-lg text-gray-600 dark:text-gray-300">
              Xác minh và kiểm tra thông tin cư trú của công dân
            </p>
          </div>
          <LoginForm onLoginSuccess={handleLoginSuccess} currentUser={currentUser} variant="inline" />
        </header>

        {/* Form luôn hiển thị - không cần đăng nhập */}
        <div className="mb-6">
          {/* Form Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Nhập thông tin cần rà soát
            </h2>
            <VerificationForm 
              onSubmit={handleVerification} 
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Records List Section - chỉ hiển thị khi đã đăng nhập và được phép */}
        {currentUser && isAuthorizedUser(currentUser) && (
          <>
            {isLoadingRecords ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-4 text-gray-600 dark:text-gray-300">
                    Đang tải dữ liệu...
                  </span>
                </div>
              </div>
            ) : (
              <RecordsList records={records} onDelete={handleDeleteRecord} />
            )}
          </>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2026 Hệ thống Rà soát Cư trú. Bảo mật thông tin được đảm bảo.</p>
        </footer>
      </div>
    </div>
  );
}
