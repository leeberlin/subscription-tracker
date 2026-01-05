import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { MemberFormData } from '../types/subscription';
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Download, Users } from 'lucide-react';
import './ImportExcel.css';

// Extended member data with family info for import
export interface ImportedMemberData extends MemberFormData {
    familyName?: string;
}

interface ImportExcelProps {
    onImport: (members: ImportedMemberData[]) => void;
    onClose: () => void;
    subscriptionName: string;
    existingFamilies?: string[]; // List of existing family names for reference
}

interface ParsedMember {
    name: string;
    email: string;
    phone?: string;
    joinDate?: string;
    amountPaid?: number;
    nextPaymentDate?: string;
    notes?: string;
    zalo?: string;
    discord?: string;
    telegram?: string;
    familyName?: string;
    isValid: boolean;
    errors: string[];
}

export const ImportExcel: React.FC<ImportExcelProps> = ({ onImport, onClose, subscriptionName, existingFamilies = [] }) => {
    const [parsedData, setParsedData] = useState<ParsedMember[]>([]);
    const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getTodayString = () => new Date().toISOString().split('T')[0];
    const getDefaultNextPayment = () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date.toISOString().split('T')[0];
    };

    const parseExcelDate = (value: any): string => {
        if (!value) return getTodayString();

        // If it's already a string date
        if (typeof value === 'string') {
            // Try DD/MM/YYYY format
            const ddmmyyyy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (ddmmyyyy) {
                return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
            }
            // Try YYYY-MM-DD format
            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return value;
            }
        }

        // If it's an Excel serial date
        if (typeof value === 'number') {
            const date = new Date((value - 25569) * 86400 * 1000);
            return date.toISOString().split('T')[0];
        }

        return getTodayString();
    };

    const validateMember = (member: Partial<ParsedMember>): ParsedMember => {
        const errors: string[] = [];

        if (!member.name?.trim()) {
            errors.push('Tên bắt buộc');
        }
        if (!member.email?.trim()) {
            errors.push('Email bắt buộc');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
            errors.push('Email không hợp lệ');
        }

        return {
            name: member.name?.trim() || '',
            email: member.email?.trim() || '',
            phone: member.phone?.trim(),
            joinDate: member.joinDate || getTodayString(),
            amountPaid: member.amountPaid || 0,
            nextPaymentDate: member.nextPaymentDate || getDefaultNextPayment(),
            notes: member.notes?.trim(),
            zalo: member.zalo?.trim(),
            discord: member.discord?.trim(),
            telegram: member.telegram?.trim(),
            familyName: member.familyName?.trim(),
            isValid: errors.length === 0,
            errors,
        };
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                // Skip header row and parse data
                const headers = jsonData[0]?.map(h => String(h).toLowerCase().trim()) || [];
                const members: ParsedMember[] = [];

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.every(cell => !cell)) continue;

                    const member: Partial<ParsedMember> = {};

                    // Map columns to fields
                    headers.forEach((header, idx) => {
                        const value = row[idx];
                        if (header.includes('name') || header.includes('tên') || header.includes('họ')) {
                            member.name = String(value || '');
                        } else if (header.includes('email') || header.includes('mail')) {
                            member.email = String(value || '');
                        } else if (header.includes('phone') || header.includes('điện thoại') || header.includes('sđt')) {
                            member.phone = String(value || '');
                        } else if (header.includes('join') || header.includes('tham gia') || header.includes('ngày bắt đầu')) {
                            member.joinDate = parseExcelDate(value);
                        } else if (header.includes('amount') || header.includes('tiền') || header.includes('số tiền')) {
                            member.amountPaid = parseFloat(String(value)) || 0;
                        } else if (header.includes('next') || header.includes('thanh toán') || header.includes('hết hạn')) {
                            member.nextPaymentDate = parseExcelDate(value);
                        } else if (header.includes('note') || header.includes('ghi chú')) {
                            member.notes = String(value || '');
                        } else if (header.includes('zalo')) {
                            member.zalo = String(value || '');
                        } else if (header.includes('discord')) {
                            member.discord = String(value || '');
                        } else if (header.includes('telegram') || header.includes('tele')) {
                            member.telegram = String(value || '');
                        } else if (header.includes('family') || header.includes('nhóm') || header.includes('nhom') || header.includes('group') || header.includes('gia đình') || header.includes('gia dinh')) {
                            member.familyName = String(value || '');
                        }
                    });

                    members.push(validateMember(member));
                }

                setParsedData(members);
                setStep('preview');
            } catch (error) {
                console.error('Error parsing Excel:', error);
                alert('Không thể đọc file. Vui lòng kiểm tra định dạng file.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImport = () => {
        const validMembers: ImportedMemberData[] = parsedData.filter(m => m.isValid).map(m => ({
            name: m.name,
            email: m.email,
            phone: m.phone,
            joinDate: m.joinDate || getTodayString(),
            amountPaid: m.amountPaid || 0,
            nextPaymentDate: m.nextPaymentDate || getDefaultNextPayment(),
            notes: m.notes,
            socialLinks: {
                zalo: m.zalo,
                discord: m.discord,
                telegram: m.telegram,
            },
            familyName: m.familyName,
        }));

        onImport(validMembers);
        setStep('done');
    };

    const downloadTemplate = () => {
        // Include existing family names in template if available
        const familyHint = existingFamilies.length > 0
            ? `Ví dụ: ${existingFamilies.slice(0, 3).join(', ')}${existingFamilies.length > 3 ? '...' : ''}`
            : 'Nhà A / Family A';

        const template = [
            ['Tên', 'Email', 'Số điện thoại', 'Ngày tham gia', 'Số tiền', 'Ngày thanh toán', 'Family/Nhóm', 'Ghi chú', 'Zalo', 'Discord', 'Telegram'],
            ['Nguyễn Văn A', 'a@email.com', '0901234567', '01/01/2024', '100000', '01/02/2024', existingFamilies[0] || 'Nhà A', 'Ghi chú', '0901234567', 'user#1234', '@username'],
            ['Trần Thị B', 'b@email.com', '0987654321', '15/01/2024', '100000', '15/02/2024', existingFamilies[1] || 'Nhà B', '', '', '', ''],
            ['Lê Văn C', 'c@email.com', '0912345678', '20/01/2024', '100000', '20/02/2024', existingFamilies[0] || 'Nhà A', 'Member mới', '', '', ''],
        ];
        const ws = XLSX.utils.aoa_to_sheet(template);

        // Set column widths
        ws['!cols'] = [
            { wch: 20 }, // Tên
            { wch: 25 }, // Email
            { wch: 15 }, // SĐT
            { wch: 15 }, // Ngày tham gia
            { wch: 12 }, // Số tiền
            { wch: 15 }, // Ngày thanh toán
            { wch: 20 }, // Family/Nhóm
            { wch: 20 }, // Ghi chú
            { wch: 15 }, // Zalo
            { wch: 15 }, // Discord
            { wch: 15 }, // Telegram
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Members');
        XLSX.writeFile(wb, `${subscriptionName.replace(/[^a-zA-Z0-9]/g, '_')}_members_template.xlsx`);
    };

    // Get unique family names from parsed data
    const detectedFamilies = useMemo(() => {
        const families = new Set<string>();
        parsedData.forEach(m => {
            if (m.familyName) families.add(m.familyName);
        });
        return Array.from(families);
    }, [parsedData]);

    const validCount = parsedData.filter(m => m.isValid).length;
    const invalidCount = parsedData.filter(m => !m.isValid).length;

    return (
        <div className="import-overlay" onClick={onClose}>
            <div className="import-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="import-header">
                    <div className="import-header-content">
                        <FileSpreadsheet size={24} />
                        <div>
                            <h2>Nhập từ Excel</h2>
                            <p>{subscriptionName}</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="import-body">
                    {step === 'upload' && (
                        <div className="upload-section">
                            <div
                                className="upload-zone"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={48} />
                                <h3>Kéo thả hoặc click để chọn file</h3>
                                <p>Hỗ trợ: .xlsx, .xls, .csv</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                            <button className="template-btn" onClick={downloadTemplate}>
                                <Download size={16} />
                                Tải file mẫu
                            </button>
                            <div className="format-hint">
                                <h4>Các cột được hỗ trợ:</h4>
                                <ul>
                                    <li><strong>Tên / Name</strong> - Bắt buộc</li>
                                    <li><strong>Email</strong> - Bắt buộc</li>
                                    <li><strong>Số điện thoại / Phone</strong></li>
                                    <li><strong>Ngày tham gia / Join Date</strong> (DD/MM/YYYY)</li>
                                    <li><strong>Số tiền / Amount</strong></li>
                                    <li><strong>Ngày thanh toán / Next Payment</strong></li>
                                    <li><strong className="highlight">Family/Nhóm</strong> - Tên nhóm để phân chia</li>
                                    <li><strong>Zalo, Discord, Telegram</strong></li>
                                </ul>
                                {existingFamilies.length > 0 && (
                                    <div className="existing-families">
                                        <h4>Nhóm hiện có:</h4>
                                        <div className="family-tags">
                                            {existingFamilies.map((f, idx) => (
                                                <span key={idx} className="family-tag">{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="preview-section">
                            <div className="preview-stats">
                                <div className="stat valid">
                                    <Check size={16} />
                                    <span>{validCount} hợp lệ</span>
                                </div>
                                {invalidCount > 0 && (
                                    <div className="stat invalid">
                                        <AlertCircle size={16} />
                                        <span>{invalidCount} lỗi</span>
                                    </div>
                                )}
                            </div>
                            <div className="preview-table-wrapper">
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            <th>Trạng thái</th>
                                            <th>Tên</th>
                                            <th>Email</th>
                                            <th>Family/Nhóm</th>
                                            <th>Số tiền</th>
                                            <th>Lỗi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedData.map((member, idx) => (
                                            <tr key={idx} className={member.isValid ? 'valid' : 'invalid'}>
                                                <td>
                                                    {member.isValid ? (
                                                        <Check size={16} className="icon-valid" />
                                                    ) : (
                                                        <AlertCircle size={16} className="icon-invalid" />
                                                    )}
                                                </td>
                                                <td>{member.name || '-'}</td>
                                                <td>{member.email || '-'}</td>
                                                <td>
                                                    {member.familyName ? (
                                                        <span className={`family-badge ${existingFamilies.includes(member.familyName) ? 'existing' : 'new'}`}>
                                                            {member.familyName}
                                                            {!existingFamilies.includes(member.familyName) && <span className="new-tag">mới</span>}
                                                        </span>
                                                    ) : (
                                                        <span className="no-family">Mặc định</span>
                                                    )}
                                                </td>
                                                <td>{member.amountPaid?.toLocaleString() || '0'}</td>
                                                <td className="errors">{member.errors.join(', ')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {step === 'done' && (
                        <div className="done-section">
                            <div className="done-icon">
                                <Check size={48} />
                            </div>
                            <h3>Nhập thành công!</h3>
                            <p>Đã thêm {validCount} thành viên vào {subscriptionName}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="import-footer">
                    {step === 'upload' && (
                        <button className="btn-cancel" onClick={onClose}>
                            Hủy
                        </button>
                    )}
                    {step === 'preview' && (
                        <>
                            <button className="btn-cancel" onClick={() => setStep('upload')}>
                                Quay lại
                            </button>
                            <button
                                className="btn-import"
                                onClick={handleImport}
                                disabled={validCount === 0}
                            >
                                <Users size={16} />
                                Nhập {validCount} thành viên
                            </button>
                        </>
                    )}
                    {step === 'done' && (
                        <button className="btn-done" onClick={onClose}>
                            Hoàn tất
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
