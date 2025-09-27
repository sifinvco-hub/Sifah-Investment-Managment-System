import React, { useState, useMemo, useRef } from 'react';
import { Product, Transaction } from '../types';
import { toDate } from '../App';

interface ReportsProps {
    products: Product[];
    transactions: Transaction[];
    categories: string[];
    warehouses: string[];
}

// Helper to format date as YYYY-MM-DD for date inputs
const formatDateForInput = (date: Date) => {
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};

const Reports: React.FC<ReportsProps> = ({ products, transactions, categories, warehouses }) => {
    const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [reportTitle, setReportTitle] = useState('');
    const reportContentRef = useRef<HTMLDivElement>(null);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState(categories[0] || '');
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouses[0] || '');
    const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
    const [startDate, setStartDate] = useState(formatDateForInput(new Date(Date.now() - 30 * 86400000)));
    const [endDate, setEndDate] = useState(formatDateForInput(new Date()));

    const handlePrint = () => {
        const node = reportContentRef.current;
        if (!node) return;
    
        // Get all style and link tags from the main document's head
        const styles = Array.from(document.querySelectorAll('link, style'))
            .map(el => el.outerHTML)
            .join('\n');
    
        const reportHtml = node.innerHTML;
    
        // Construct a full HTML document for the new window
        const printDocument = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>${reportTitle || 'تقرير'}</title>
                ${styles}
                <script src="https://cdn.tailwindcss.com"></script>
                <script>
                  tailwind.config = {
                    darkMode: 'class', // to match main app
                    theme: {
                      extend: {
                        fontFamily: {
                          sans: ['Cairo', 'sans-serif'],
                        },
                      },
                    },
                  }
                </script>
                <style>
                    body {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        background-color: white !important;
                        margin: 20px !important;
                        font-family: 'Cairo', sans-serif;
                    }
                    .no-print { display: none !important; }
                    .print-title {
                        display: block !important;
                        text-align: center;
                        color: black !important;
                        font-size: 1.5rem;
                        margin-bottom: 1rem;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 0.9rem;
                    }
                    th, td {
                        border: 1px solid #ccc !important;
                        padding: 8px;
                        text-align: right;
                    }
                    thead tr {
                        background-color: #f2f2f2 !important;
                    }
                    .prose, .prose * { color: black !important; }
                </style>
            </head>
            <body>
                ${reportHtml}
            </body>
            </html>
        `;
    
        const printWindow = window.open('', '', 'height=800,width=1000');
        if (printWindow) {
            printWindow.document.write(printDocument);
            printWindow.document.close();
            
            // Wait for the new window to fully load resources (like Tailwind script and fonts)
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 1000); // 1-second delay is usually safe
        } else {
            alert('الرجاء السماح بالنوافذ المنبثقة لطباعة هذا التقرير.');
        }
    };
    
    const generateReport = (type: string) => {
        // Clear previous report data when generating a new one to avoid type mismatches during render
        setReportData(null); 
        setActiveAccordion(type);

        switch (type) {
            case 'category': {
                const data = products.filter(p => p.category === selectedCategory);
                setReportData(data);
                setReportTitle(`تقرير المخزون - النوع: ${selectedCategory}`);
                break;
            }
            case 'warehouse': {
                const data = products.filter(p => p.warehouse === selectedWarehouse);
                setReportData(data);
                setReportTitle(`تقرير المخزون - المستودع: ${selectedWarehouse}`);
                break;
            }
            case 'zeroStock': {
                const data = products.filter(p => p.quantity === 0);
                setReportData(data);
                setReportTitle('تقرير المنتجات الصفرية');
                break;
            }
            case 'dispatch': {
                const start = new Date(startDate).setHours(0, 0, 0, 0);
                const end = new Date(endDate).setHours(23, 59, 59, 999);
                const data = transactions.filter(t => {
                    const txDate = toDate(t.date).getTime();
                    return t.type === 'صرف' && txDate >= start && txDate <= end;
                });
                setReportData(data);
                setReportTitle(`تقرير حركة الصرف من ${startDate} إلى ${endDate}`);
                break;
            }
            case 'productCard': {
                const product = products.find(p => p.id === selectedProduct);
                if (product) {
                    const productTransactions = transactions
                        .filter(t => t.productId === selectedProduct)
                        .sort((a,b) => toDate(a.date).getTime() - toDate(b.date).getTime());

                    // To calculate initial balance, we work backwards from the current quantity
                    let balance = product.quantity;
                    const reversedTransactions = [...productTransactions].reverse();
                    for(const tx of reversedTransactions) {
                        if (tx.type === 'إضافة' || tx.type === 'إرجاع') {
                            balance -= tx.quantity;
                        } else if (tx.type === 'صرف') {
                            balance += tx.quantity;
                        }
                    }
                    const initialBalance = balance;
                   

                    setReportData({ product, transactions: productTransactions, initialBalance });
                    setReportTitle(`بطاقة الصنف - ${product.nameAr}`);
                } else {
                    setReportData(null);
                    setReportTitle('لم يتم العثور على المنتج');
                }
                break;
            }
            default:
                setReportData(null);
                setReportTitle('');
        }
    };
    
    const renderReport = () => {
        if (!reportData) return <p className="text-center text-gray-500">{reportTitle || 'الرجاء إنشاء تقرير لعرض النتائج.'}</p>;

        switch(activeAccordion) {
            case 'category':
            case 'warehouse':
            case 'zeroStock':
                 if (!Array.isArray(reportData)) {
                    return <p className="text-center text-gray-500">بيانات التقرير غير متطابقة. الرجاء إنشاء تقرير جديد.</p>;
                 }
                 const totalItems = (reportData as Product[]).reduce((sum, p) => sum + p.quantity, 0);
                 const totalValue = (reportData as Product[]).reduce((sum, p) => sum + p.quantity * p.price, 0);
                return (
                    <div>
                         <p className="mb-2"><strong>إجمالي المنتجات:</strong> {(reportData as Product[]).length}</p>
                         <p className="mb-2"><strong>إجمالي القطع:</strong> {totalItems.toLocaleString('ar-EG')}</p>
                         <p className="mb-4"><strong>إجمالي القيمة:</strong> {totalValue.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR' })}</p>
                        <table className="w-full text-sm">
                            <thead><tr className="bg-gray-100 dark:bg-gray-700"><th>SKU</th><th>المنتج</th><th>الكمية</th><th>السعر</th><th>القيمة الإجمالية</th></tr></thead>
                            <tbody>
                                {(reportData as Product[]).map(p => (
                                    <tr key={p.id} className="border-b dark:border-gray-700"><td>{p.sku}</td><td>{p.nameAr}</td><td>{p.quantity}</td><td>{p.price.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR' })}</td><td>{(p.price * p.quantity).toLocaleString('ar-EG', { style: 'currency', currency: 'SAR' })}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'dispatch':
                if (!Array.isArray(reportData)) {
                    return <p className="text-center text-gray-500">بيانات التقرير غير متطابقة. الرجاء إنشاء تقرير جديد.</p>;
                }
                return (
                    <table className="w-full text-sm">
                        <thead><tr className="bg-gray-100 dark:bg-gray-700"><th>التاريخ</th><th>المنتج</th><th>الكمية</th><th>العميل</th><th>المستخدم</th><th>البيان</th></tr></thead>
                        <tbody>
                            {(reportData as Transaction[]).map(t => (
                                <tr key={t.id} className="border-b dark:border-gray-700">
                                    <td>{toDate(t.date).toLocaleDateString('ar-EG')}</td><td>{t.productName}</td><td>{t.quantity}</td><td>{t.customerName || '-'}</td><td>{t.username}</td><td>{t.notes || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'productCard':
                 if (typeof reportData !== 'object' || Array.isArray(reportData) || !reportData.product) {
                    return <p className="text-center text-gray-500">بيانات التقرير غير متطابقة. الرجاء إنشاء تقرير جديد.</p>;
                }

                const { product, transactions: transactionsForCard, initialBalance } = reportData;
                let runningBalance = initialBalance;

                return (
                    <div>
                        <h4 className="text-lg font-bold mb-2">{product.nameAr} <span className="text-sm font-normal text-gray-500">(الرصيد الحالي: {product.quantity})</span></h4>
                        <table className="w-full text-sm">
                           <thead><tr className="bg-gray-100 dark:bg-gray-700"><th>التاريخ</th><th>الحركة</th><th>الكمية</th><th>الرصيد</th><th>التفاصيل</th></tr></thead>
                           <tbody>
                               <tr className="border-b dark:border-gray-700 font-bold"><td colSpan={3}>الرصيد الافتتاحي</td><td>{initialBalance}</td><td>-</td></tr>
                               {transactionsForCard.map((t: Transaction) => {
                                   let quantityChange = 0;
                                   if (t.type === 'صرف') {
                                       quantityChange = -t.quantity;
                                   } else if (t.type === 'إضافة' || t.type === 'إرجاع') {
                                       quantityChange = t.quantity;
                                   }
                                   runningBalance += quantityChange;
                                   return (
                                       <tr key={t.id} className="border-b dark:border-gray-700">
                                           <td>{toDate(t.date).toLocaleString('ar-EG')}</td><td>{t.type}</td><td>{quantityChange > 0 ? `+${quantityChange}` : quantityChange}</td><td>{runningBalance}</td><td>{t.notes || t.customerName || '-'}</td>
                                       </tr>
                                   )
                               })}
                           </tbody>
                        </table>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const AccordionSection: React.FC<{title: string; id: string; children: React.ReactNode}> = ({ title, id, children }) => (
        <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
            <button onClick={() => setActiveAccordion(activeAccordion === id ? null : id)} className="w-full p-4 text-right font-bold flex justify-between">
                {title}
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${activeAccordion === id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {activeAccordion === id && <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">{children}</div>}
        </div>
    );
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 reports-page">
            <h2 className="text-2xl font-bold mb-6 no-print">التقارير</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4 no-print">
                     <AccordionSection title="تقرير المخزون حسب النوع" id="category">
                         <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                             {categories.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                         <button onClick={() => generateReport('category')} className="w-full mt-2 p-2 bg-blue-600 text-white rounded">إنشاء</button>
                     </AccordionSection>
                      <AccordionSection title="تقرير المخزون حسب المستودع" id="warehouse">
                         <select value={selectedWarehouse} onChange={e => setSelectedWarehouse(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                             {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
                         </select>
                         <button onClick={() => generateReport('warehouse')} className="w-full mt-2 p-2 bg-blue-600 text-white rounded">إنشاء</button>
                     </AccordionSection>
                    <AccordionSection title="تقرير المنتجات الصفرية" id="zeroStock">
                        <p className="text-sm mb-2 text-gray-600 dark:text-gray-400">عرض كل المنتجات التي كميتها صفر.</p>
                        <button onClick={() => generateReport('zeroStock')} className="w-full p-2 bg-blue-600 text-white rounded">إنشاء</button>
                    </AccordionSection>
                     <AccordionSection title="تقرير حركة الصرف" id="dispatch">
                        <label className="text-sm">من تاريخ</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 mb-2" />
                        <label className="text-sm">إلى تاريخ</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <button onClick={() => generateReport('dispatch')} className="w-full mt-2 p-2 bg-blue-600 text-white rounded">إنشاء</button>
                     </AccordionSection>
                     <AccordionSection title="بطاقة الصنف" id="productCard">
                         <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                             {products.map(p => <option key={p.id} value={p.id}>{p.nameAr} ({p.sku})</option>)}
                         </select>
                         <button onClick={() => generateReport('productCard')} className="w-full mt-2 p-2 bg-blue-600 text-white rounded">إنشاء</button>
                     </AccordionSection>
                </div>
                <div className="md:col-span-2 border rounded-lg p-4 dark:border-gray-700 min-h-[300px] report-container">
                    <div className="flex justify-between items-center mb-4 no-print">
                        <h3 className="font-bold">{reportTitle || 'نتائج التقرير'}</h3>
                        {reportData && <button onClick={handlePrint} className="text-sm py-1 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">معاينة وطباعة</button>}
                    </div>
                     <div ref={reportContentRef} className="report-content prose dark:prose-invert max-w-none">
                        <h3 className="text-xl font-bold mb-4 print-title" style={{ display: 'none' }}>{reportTitle}</h3>
                        {renderReport()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;