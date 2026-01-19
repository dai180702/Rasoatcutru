'use client';

import { useState, FormEvent, useEffect } from 'react';
import { VerificationData } from '../page';
import { getAllProvinces, getDistrictsByProvince } from '../../data/vietnam-provinces';
import SearchableSelect from './SearchableSelect';

interface VerificationFormProps {
  onSubmit: (data: VerificationData) => void;
  isLoading: boolean;
  onSuccess?: () => void;
}

export default function VerificationForm({ onSubmit, isLoading, onSuccess }: VerificationFormProps) {
  const [formData, setFormData] = useState<VerificationData>({
    hoTen: '',
    ngaySinh: '',
    cccd: '',
    hkttXaPhuong: '',
    hkttTinhTP: '',
    noiOHienTai: '',
    dangKyTamTru: '',
    ngheNghiep: '',
    soDienThoai: '',
    dauThoiGian: new Date().toISOString(),
    dangKyBauCuTanLap: '',
  });

  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const provinces = getAllProvinces();

  // Cập nhật danh sách quận/huyện/phường khi chọn tỉnh/thành phố
  useEffect(() => {
    if (formData.hkttTinhTP) {
      const districts = getDistrictsByProvince(formData.hkttTinhTP);
      setAvailableDistricts(districts);
      // Reset xã/phường nếu tỉnh/thành phố thay đổi
      if (!districts.includes(formData.hkttXaPhuong)) {
        setFormData(prev => ({ ...prev, hkttXaPhuong: '' }));
      }
    } else {
      setAvailableDistricts([]);
      setFormData(prev => ({ ...prev, hkttXaPhuong: '' }));
    }
  }, [formData.hkttTinhTP]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const digitsOnly = (s: string) => s.replace(/\D/g, '');

  const handleDigitsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const digits = digitsOnly(value);
    const maxLen = name === 'cccd' ? 12 : name === 'soDienThoai' ? 10 : undefined;
    const next = typeof maxLen === 'number' ? digits.slice(0, maxLen) : digits;
    setFormData(prev => ({
      ...prev,
      [name]: next,
    }));
  };

  const resetForm = () => {
    setFormData({
      hoTen: '',
      ngaySinh: '',
      cccd: '',
      hkttXaPhuong: '',
      hkttTinhTP: '',
      noiOHienTai: '',
      dangKyTamTru: '',
      ngheNghiep: '',
      soDienThoai: '',
      dauThoiGian: new Date().toISOString(),
      dangKyBauCuTanLap: false,
    });
    setAvailableDistricts([]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate CCCD & SĐT (bắt buộc đúng số chữ số)
    const cccdDigits = digitsOnly(formData.cccd);
    const phoneDigits = digitsOnly(formData.soDienThoai);
    if (cccdDigits.length !== 12) {
      alert('CCCD phải đúng 12 số.');
      return;
    }
    if (phoneDigits.length !== 10) {
      alert('Số điện thoại phải đúng 10 số.');
      return;
    }

    // Cập nhật dấu thời gian khi submit
    const updatedData = {
      ...formData,
      cccd: cccdDigits,
      soDienThoai: phoneDigits,
      dauThoiGian: new Date().toISOString(),
    };
    onSubmit(updatedData);
    // Reset form sau khi submit thành công
    setTimeout(() => {
      resetForm();
      onSuccess?.();
    }, 1600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
      {/* Họ và tên */}
      <div>
        <label htmlFor="hoTen" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="hoTen"
          name="hoTen"
          value={formData.hoTen}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Nhập họ và tên đầy đủ"
        />
      </div>

      {/* Ngày tháng năm sinh */}
      <div>
        <label htmlFor="ngaySinh" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ngày tháng năm sinh <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="ngaySinh"
          name="ngaySinh"
          value={formData.ngaySinh}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Số CCCD */}
      <div>
        <label htmlFor="cccd" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          CCCD <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="cccd"
          name="cccd"
          value={formData.cccd}
          onChange={handleDigitsInput}
          required
          inputMode="numeric"
          pattern="\d{12}"
          maxLength={12}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Nhập 12 số CCCD"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Bắt buộc đúng 12 chữ số.</p>
      </div>

      {/* HKTT - Tỉnh/Thành phố và Xã/Phường */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="hkttTinhTP" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            HKTT (Tỉnh/Thành phố) <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            id="hkttTinhTP"
            name="hkttTinhTP"
            value={formData.hkttTinhTP}
            onChange={handleSelectChange}
            options={provinces}
            placeholder="Gõ để tìm tỉnh/thành phố..."
            required
          />
        </div>
        <div>
          <label htmlFor="hkttXaPhuong" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            HKTT (Xã/Phường) <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            id="hkttXaPhuong"
            name="hkttXaPhuong"
            value={formData.hkttXaPhuong}
            onChange={handleSelectChange}
            options={availableDistricts}
            placeholder={
              !formData.hkttTinhTP 
                ? 'Chọn tỉnh/thành phố trước...' 
                : availableDistricts.length === 0 
                  ? 'Không có dữ liệu' 
                  : 'Gõ để tìm xã/phường...'
            }
            disabled={!formData.hkttTinhTP || availableDistricts.length === 0}
            required
          />
        </div>
      </div>

      {/* Nơi ở hiện tại */}
      <div>
        <label htmlFor="noiOHienTai" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nơi ở hiện tại <span className="text-red-500">*</span>
        </label>
        <textarea
          id="noiOHienTai"
          name="noiOHienTai"
          value={formData.noiOHienTai}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Nhập địa chỉ nơi ở hiện tại"
        />
      </div>

      {/* Đăng ký tạm trú */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Đăng ký tạm trú <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="dangKyTamTru"
              value="rồi"
              checked={formData.dangKyTamTru === 'rồi'}
              onChange={handleChange}
              required
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Rồi</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="dangKyTamTru"
              value="chưa"
              checked={formData.dangKyTamTru === 'chưa'}
              onChange={handleChange}
              required
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Chưa</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="dangKyTamTru"
              value="không xác định"
              checked={formData.dangKyTamTru === 'không xác định'}
              onChange={handleChange}
              required
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Không xác định</span>
          </label>
        </div>
      </div>

      {/* Nghề nghiệp */}
      <div>
        <label htmlFor="ngheNghiep" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nghề nghiệp <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="ngheNghiep"
          name="ngheNghiep"
          value={formData.ngheNghiep}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Nhập nghề nghiệp"
        />
      </div>

      {/* Số điện thoại */}
      <div>
        <label htmlFor="soDienThoai" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="soDienThoai"
          name="soDienThoai"
          value={formData.soDienThoai}
          onChange={handleDigitsInput}
          required
          inputMode="numeric"
          pattern="\d{10}"
          maxLength={10}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Nhập 10 số (vd: 09xxxxxxxx)"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Bắt buộc đúng 10 chữ số.</p>
      </div>

      {/* Đồng ý bầu cử tại Tân Uyên */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Đồng ý bầu cử tại Tân Uyên <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="dangKyBauCuTanLap"
              value="Đồng ý"
              checked={formData.dangKyBauCuTanLap === 'Đồng ý'}
              onChange={handleChange}
              required
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Đồng ý</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="dangKyBauCuTanLap"
              value="Không đồng ý"
              checked={formData.dangKyBauCuTanLap === 'Không đồng ý'}
              onChange={handleChange}
              required
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Không đồng ý</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
      >
        {isLoading ? 'Đang xử lý...' : 'Thêm vào danh sách'}
      </button>
    </form>
  );
}
