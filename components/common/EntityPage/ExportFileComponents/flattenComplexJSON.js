/**
 * خوارزمية فك وتسطيح الـ JSON المعقد والمتداخل مزدوجاً مع استثناء مفاتيح הـ ID
 * @param {Object|Array|string} input - الـ JSON المدخل
 * @param {string} prefix - البادئة المستخدمة للمفاتيح المتداخلة
 * @return {Array<Object>} مصفوفة من الكائنات المسطحة المناسبة للجدول
 */
export default function flattenComplexJSON(input, prefix = '') {
  // 1. إذا كان المدخل نصاً، نحاول تحليله أولاً
  let data = input;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      // ليس JSON مجرد نص عادي
      return [{ [prefix || 'value']: data }];
    }
  }

  const IDS_TO_IGNORE = new Set([
    // المعرفات الأساسية
    'id',
    'uuid',
    'recordId',

    // المفاتيح الأجنبية للمعاملات والعلاقات (Foreign Keys)
    'supplierId',
    'propertyId',
    'employeeId',
    'userId',
    'expenseCategoryId',

    // حقول التتبع والوقت والتجميع (Metadata & Timestamps)
    'updatedAt',
    'createdAt'
    ]);

  // 2. إذا كان المدخل مصفوفة، نطبق الخوارزمية على كل عنصر ونجمع النتائج (Explode)
  if (Array.isArray(data)) {
    return data.flatMap(item => flattenComplexJSON(item, prefix));
  }

  // 3. إذا كان كائناً (Object)، نمر على كل حقل ونقوم بالتسطيح العودي (Recursive Flattening)
  if (typeof data === 'object' && data !== null) {
    let rows = [{}];

    for (const [key, value] of Object.entries(data)) {
      // تجاهل المفاتيح التي تطابق id أو uuid (مع تجاهل حالة الأحرف Case-insensitive)
      const lowerKey = key.toLowerCase();
      if (IDS_TO_IGNORE.has(lowerKey)) {
        continue;
      }

      const newKey = prefix ? `${prefix} / ${key}` : key;
      let parsedValue = value;

      // فك الـ JSON المزدوج إذا كانت القيمة String محشوة بـ JSON
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          try {
            parsedValue = JSON.parse(trimmed);
          } catch (e) {
            parsedValue = value; // في حال فشل الـ parse نتركه كنص
          }
        }
      }

      // إذا كانت القيمة كائناً أو مصفوفة بعد الفك
      if (typeof parsedValue === 'object' && parsedValue !== null) {
        const childRows = flattenComplexJSON(parsedValue, newKey);
        
        // دمج الصفوف الناتجة من الأبناء مع الصفوف الحالية (Cartesian Product)
        const nextRows = [];
        for (const parentRow of rows) {
          for (const childRow of childRows) {
            nextRows.push({ ...parentRow, ...childRow });
          }
        }
        rows = nextRows;
      } else {
        // قيمة بسيطة (Primitive)
        for (const row of rows) {
          row[newKey] = parsedValue;
        }
      }
    }

    return rows;
  }

  return [{ [prefix || 'value']: data }];
}