const getAllCountries = () => {
    // إرسال طلب HTTP باستخدام fetch للحصول على جميع الدول من API
    const request = fetch("https://restcountries.com/v3.1/all");

    // التعامل مع استجابة الطلب (Promise)
    request
        .then((data) => {
            // تحويل البيانات المستلمة من صيغة JSON إلى كائنات JavaScript
            return data.json();
        })
        .then((data) => {
            // طباعة البيانات المحولة (المعلومات عن الدول)
            console.log(data);
        })
        .catch((error) => {
            // معالجة الأخطاء إن وُجدت (مثل فشل الاتصال بـ API)
            console.log(error);
        });
};

// استدعاء الدالة لتنفيذ الطلب
getAllCountries();

const getCountry = (country) =>{
    const request = fetch(`https://restcountries.com/v3.1/name/${country}`)// fetch to get URL from the internet
    request.then((data)=>{ // the (data) is the response we get from fethcing , but in raw terms
        console.log(data); // show the data in console
        return data.json() // translate to JSON so it can be useable in code
    }).then((data)=>{
        console.log(data); // waiting for the return json to end
        
    })
}
    
getCountry('israel')
console.log('*******************************************************************');
// دالة لجلب بيانات دولة واحدة
const getOneCountry = async (country) => {
    try {
        // إرسال طلب إلى API باستخدام اسم الدولة
        const response = await fetch(`https://restcountries.com/v3.1/name/${country}`);
        
        // تحويل البيانات المستلمة إلى JSON
        const data = await response.json();
        
        // إرجاع البيانات بعد التحويل
        return data;
    } catch (error) {
        // التعامل مع الأخطاء وطباعة رسالة خطأ في حالة وجود مشكلة
        console.error(`Error fetching country data: ${error.message}`);
    }
};

// دالة رئيسية لاستخدام الدالة السابقة وطباعة النتائج
(async () => {
    try {
        // طلب بيانات دولة نيجيريا
        const nigeria = await getOneCountry('Nigeria');
        
        // طباعة بيانات الدولة (الكائن الأول يمثل الدولة المطلوبة)
        console.log(nigeria[0]);
        
        // طباعة رسالة أخرى
        console.log("Hello world");
        
        // طباعة رابط صورة العلم الخاص بالدولة
        console.log(nigeria[0].flags.png);

        // طلب بيانات دولة إسرائيل
        const israel = await getOneCountry('Israel');
        
        // طباعة بيانات إسرائيل
        console.log(israel[0]);
    } catch (error) {
        // التعامل مع أي خطأ يحدث في الكتلة الرئيسية
        console.error(`Error in main block: ${error.message}`);
    }
})();

