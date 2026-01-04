# 📋 Subscription Tracker - Kế Hoạch Phát Triển

## 🔍 Các Vấn Đề Hiện Tại

### 1. **Chi phí trung bình tính sai** ⚠️ CRITICAL
- **Vấn đề**: Nếu mua gói 50,000 VND/năm (12 tháng), hệ thống tính 50,000/12 = 4,167 VND/tháng
- **Logic hiện tại**: `price / durationMonths` - chia giá theo thời gian subscription
- **Cần fix**: 
  - Nếu subscription có cycle (monthly/yearly), dùng đó để tính
  - Nếu không, hiển thị "Tổng chi phí" thay vì "Chi phí/tháng"

### 2. **Nút Xóa không hoạt động** ⚠️ CRITICAL
- **Vấn đề**: Bấm nút xóa subscription không có reaction
- **Nguyên nhân có thể**: 
  - Event handler không được gắn đúng
  - Thiếu confirmation dialog
  - State không được cập nhật

### 3. **Dashboard Charts UI xấu** 🎨 MEDIUM
- **Vấn đề**: Giao diện biểu đồ không đẹp, khó đọc
- **Cần fix**:
  - Thiết kế lại layout
  - Cải thiện màu sắc và typography
  - Thêm animations và hover effects

### 4. **Xuất file không cho chọn thư mục** 📁 HIGH
- **Vấn đề**: Export báo thành công nhưng không cho người dùng chọn nơi lưu
- **Cần fix**: Sử dụng Tauri's dialog API để mở file picker

### 5. **Tự động gia hạn không rõ ràng** ❓ LOW
- **Vấn đề**: Tính năng này để làm gì?
- **Cần làm rõ**: 
  - Đây là toggle để đánh dấu subscription có tự động renew không
  - Cần hiển thị ý nghĩa rõ ràng trong UI

---

## ✅ Kế Hoạch Fix

### Phase 1: Fix Critical Bugs 🔴
1. **Fix nút Xóa subscription**
   - Kiểm tra SubscriptionCard component
   - Thêm confirmation dialog
   - Verify event handlers

2. **Fix tính toán chi phí**
   - Thêm field `billingCycle` (monthly/yearly/one-time)
   - Tính toán lại dựa trên billing cycle
   - Cập nhật StatsPanel để hiển thị đúng

### Phase 2: Improve UX 🟡
3. **Fix Export/Import**
   - Sử dụng Tauri dialog API để chọn folder save
   - Thêm file picker cho import
   - Tự động đặt tên file với timestamp

4. **Làm rõ Auto-Renewal**
   - Thêm tooltip giải thích
   - Hiển thị icon/badge cho subscriptions auto-renew
   - Cảnh báo khi gần hết hạn với auto-renew OFF

### Phase 3: UI Enhancements 🟢
5. **Redesign Dashboard Charts**
   - Thiết kế layout mới (2 columns)
   - Sử dụng màu sắc nhất quán
   - Thêm empty states
   - Responsive design

6. **Polish toàn bộ UI**
   - Kiểm tra dark mode
   - Improve animations
   - Better error states

---

## 📝 Danh sách tính năng đầy đủ

### Core Features
| # | Tính năng | Trạng thái | Mô tả |
|---|-----------|------------|-------|
| 1 | Thêm subscription | ✅ Done | Thêm app mới với thông tin cơ bản |
| 2 | Sửa subscription | ✅ Done | Chỉnh sửa thông tin |
| 3 | Xóa subscription | ⚠️ Bug | Nút không hoạt động |
| 4 | Xem danh sách | ✅ Done | Danh sách cards với filters |
| 5 | Tìm kiếm | ✅ Done | Search by name |
| 6 | Lọc theo trạng thái | ✅ Done | Active/Expiring/Expired |
| 7 | Lọc theo danh mục | ✅ Done | 7 categories |
| 8 | Sắp xếp | ✅ Done | By name/date/price |

### Member Management
| # | Tính năng | Trạng thái | Mô tả |
|---|-----------|------------|-------|
| 9 | Thêm thành viên | ✅ Done | Thêm người share vào subscription |
| 10 | Quản lý thanh toán | ✅ Done | Track payments |
| 11 | Gửi nhắc nhở | ✅ Done | Email reminder |
| 12 | Bulk email | ✅ Done | Gửi cho nhiều người |

### Statistics & Analytics
| # | Tính năng | Trạng thái | Mô tả |
|---|-----------|------------|-------|
| 13 | Thống kê tổng quan | ⚠️ Bug | Chi phí tính sai |
| 14 | Biểu đồ phân bổ | 🎨 Cần UI | Pie chart theo category |
| 15 | Monthly spending | 🎨 Cần UI | Bar chart |
| 16 | Timeline hết hạn | 🎨 Cần UI | Expiration timeline |

### Data Management
| # | Tính năng | Trạng thái | Mô tả |
|---|-----------|------------|-------|
| 17 | Auto save | ✅ Done | Lưu tự động |
| 18 | Export JSON | ⚠️ Bug | Không cho chọn folder |
| 19 | Import JSON | ✅ Done | Nhập dữ liệu |

### Settings
| # | Tính năng | Trạng thái | Mô tả |
|---|-----------|------------|-------|
| 20 | Theme | ✅ Done | Light/Dark/System |
| 21 | Currency | ✅ Done | VND/USD/EUR |
| 22 | Language | ✅ Done | VI/EN |
| 23 | Reminder days | ✅ Done | Default reminder |

---

## 🎯 Ưu tiên thực hiện

### Sprint 1 (Ngay bây giờ):
1. ✅ Fix nút Xóa subscription
2. ✅ Fix tính toán chi phí (thêm billing cycle)
3. ✅ Fix Export file picker

### Sprint 2:
4. ✅ Làm rõ Auto-Renewal trong UI
5. ✅ Redesign Dashboard Charts

### Sprint 3:
6. ✅ Polish toàn bộ
7. ✅ Test lại tất cả tính năng
8. ✅ Build final app

---

## 🚀 Bắt đầu Sprint 1?

Bạn có đồng ý với kế hoạch này không? Tôi sẽ bắt đầu fix từng issue theo thứ tự ưu tiên.
