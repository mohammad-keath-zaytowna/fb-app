import { getLocales } from "expo-localization";
import i18n from "i18next";
import "intl-pluralrules";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";

export const RESOURCES = {
  en: {
    translation: {
      // Common
      pullToRefresh: "Pull to refresh",
      refreshing: "Refreshing...",
      refreshed: "Refreshed",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      total: "Total",
      items: "items",
      
      // Auth - Login
      welcomeBack: "Welcome back!",
      loginSubtitle: "Log in to your account to continue.",
      emailOrPhone: "Email or Phone",
      emailOrPhonePlaceholder: "Enter your email or phone",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      forgotPassword: "Forgot password?",
      login: "Login",
      loggingIn: "Logging In...",
      
      // Auth - Forgot Password
      forgotPasswordTitle: "Forgot Password",
      forgotPasswordDescription: "Enter your email or phone number and we will send you a reset code.",
      sendCode: "Send Code",
      backToLogin: "Back to Login",
      
      // Auth - Verification Code
      enterVerificationCode: "Enter verification code",
      verificationCodeDescription: "We sent a code to {{email}}",
      didntReceiveCode: "Didn't receive the code? ",
      resendCode: "Resend code",
      verify: "Verify",
      
      // Auth - Reset Password
      resetPasswordTitle: "Reset Password",
      resetPasswordDescription: "Create a new, strong password for your account.",
      newPassword: "New Password",
      newPasswordPlaceholder: "Enter your new password",
      confirmNewPassword: "Confirm New Password",
      confirmNewPasswordPlaceholder: "Re-enter your new password",
      passwordStrengthWeak: "Weak",
      passwordHelperText: "Must be at least 8 characters.",
      saveNewPassword: "Save new password",
      
      // Products
      products: "Products",
      searchForProducts: "Search for products...",
      inStock: "In Stock",
      lowStock: "Low Stock",
      onSale: "On Sale",
      outOfStock: "Out of Stock",
      newArrival: "New Arrival",
      
      // Product Detail
      size: "Size",
      color: "Color",
      addToOrder: "Add to Order",
      productDescription: "Engineered for performance and style, featuring premium materials and responsive design for ultimate comfort.",
      
      // Cart
      shoppingCart: "Shopping Cart",
      yourCartIsEmpty: "Your Cart is Empty",
      startAddingProducts: "Start by adding products to your order",
      browseProducts: "Browse Products",
      checkout: "Checkout",
      
      // Orders
      myOrders: "My Orders",
      all: "All",
      pending: "Pending",
      completed: "Completed",
      canceled: "Canceled",
      cancelled: "Cancelled",
      noOrdersYet: "No orders yet",
      noOrdersDescription: "Your past and current orders will appear here.",
      order: "Order",
      
      // Profile
      profile: "Profile",
      accountInformation: "Account Information",
      name: "Name",
      email: "Email",
      role: "Role",
      logout: "Logout",
      language: "Language",
      english: "English",
      arabic: "Arabic",
      
      // Add Product
      addNewProduct: "Add New Product",
      addPhoto: "Add Photo",
      uploadAnImage: "Upload an image for your product",
      uploadImage: "Upload Image",
      imageSelected: "Image selected",
      productName: "Product Name",
      productNamePlaceholder: "e.g., Vintage Leather Jacket",
      category: "Category",
      categoryPlaceholder: "Select a category",
      price: "Price",
      pricePlaceholder: "JOD 0.00",
      description: "Description",
      descriptionPlaceholder: "Enter a brief description...",
      saveProduct: "Save Product",
      
      // Alerts
      error: "Error",
      success: "Success",
      permissionNeeded: "Permission needed",
      grantPermissions: "Please grant camera roll permissions",
      selectImage: "Please select an image",
      productCreatedSuccess: "Product created successfully",
      failedToCreateProduct: "Failed to create product",
      ok: "OK",
      
      // User roles
      user: "User",
      admin: "Admin",
      seller: "Seller",
      customer: "Customer",
      
      // New Order Screen
      newOrder: "New Order",
      orderItems: "Order Items",
      addMoreProducts: "Add More Products",
      noItemsInCart: "No items in cart",
      loadingProduct: "Loading product...",
      userInformation: "User Information",
      userName: "User Name",
      enterUserName: "Enter user name",
      phoneNumber: "Phone Number",
      enterPhoneNumber: "Enter phone number",
      address: "Address",
      enterDeliveryAddress: "Enter delivery address",
      shippingAndNotes: "Shipping & Notes",
      shippingCost: "Shipping Cost (JOD)",
      notes: "Notes",
      internalNotes: "Internal notes (optional)",
      userNotes: "User Notes",
      userNotesPlaceholder: "e.g. Please wrap as a gift.",
      facebookProfile: "Facebook Profile",
      facebookPlaceholder: "profile.link",
      orderSummary: "Order Summary",
      subtotal: "Subtotal",
      shipping: "Shipping",
      createOrder: "Create Order",
      addAtLeastOneProduct: "Please add at least one product to the order",
      failedToLoadProduct: "Failed to load product",
      failedToCreateOrder: "Failed to create order",
    },
  },
  ar: {
    translation: {
      // Common
      pullToRefresh: "اسحب للتحديث",
      refreshing: "جاري التحديث...",
      refreshed: "تم التحديث",
      loading: "جاري التحميل...",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      search: "بحث",
      total: "المجموع",
      items: "عناصر",
      
      // Auth - Login
      welcomeBack: "مرحباً بعودتك!",
      loginSubtitle: "قم بتسجيل الدخول إلى حسابك للمتابعة.",
      emailOrPhone: "البريد الإلكتروني أو الهاتف",
      emailOrPhonePlaceholder: "أدخل بريدك الإلكتروني أو رقم هاتفك",
      password: "كلمة المرور",
      passwordPlaceholder: "أدخل كلمة المرور",
      forgotPassword: "هل نسيت كلمة المرور؟",
      login: "تسجيل الدخول",
      loggingIn: "جاري تسجيل الدخول...",
      
      // Auth - Forgot Password
      forgotPasswordTitle: "نسيت كلمة المرور",
      forgotPasswordDescription: "أدخل بريدك الإلكتروني أو رقم هاتفك وسنرسل لك رمز إعادة التعيين.",
      sendCode: "إرسال الرمز",
      backToLogin: "العودة إلى تسجيل الدخول",
      
      // Auth - Verification Code
      enterVerificationCode: "أدخل رمز التحقق",
      verificationCodeDescription: "لقد أرسلنا رمزاً إلى {{email}}",
      didntReceiveCode: "لم تستلم الرمز؟ ",
      resendCode: "إعادة إرسال الرمز",
      verify: "تحقق",
      
      // Auth - Reset Password
      resetPasswordTitle: "إعادة تعيين كلمة المرور",
      resetPasswordDescription: "أنشئ كلمة مرور جديدة وقوية لحسابك.",
      newPassword: "كلمة المرور الجديدة",
      newPasswordPlaceholder: "أدخل كلمة المرور الجديدة",
      confirmNewPassword: "تأكيد كلمة المرور الجديدة",
      confirmNewPasswordPlaceholder: "أعد إدخال كلمة المرور الجديدة",
      passwordStrengthWeak: "ضعيف",
      passwordHelperText: "يجب أن تتكون من 8 أحرف على الأقل.",
      saveNewPassword: "حفظ كلمة المرور الجديدة",
      
      // Products
      products: "المنتجات",
      searchForProducts: "البحث عن منتجات...",
      inStock: "متوفر",
      lowStock: "مخزون منخفض",
      onSale: "في التخفيضات",
      outOfStock: "غير متوفر",
      newArrival: "وصول جديد",
      
      // Product Detail
      size: "المقاس",
      color: "اللون",
      addToOrder: "إضافة إلى الطلب",
      productDescription: "مصمم للأداء والأناقة، يتميز بمواد عالية الجودة وتصميم متجاوب لراحة قصوى.",
      
      // Cart
      shoppingCart: "سلة التسوق",
      yourCartIsEmpty: "سلة التسوق فارغة",
      startAddingProducts: "ابدأ بإضافة منتجات إلى طلبك",
      browseProducts: "تصفح المنتجات",
      checkout: "إتمام الطلب",
      
      // Orders
      myOrders: "طلباتي",
      all: "الكل",
      pending: "قيد الانتظار",
      completed: "مكتمل",
      canceled: "ملغي",
      cancelled: "ملغي",
      noOrdersYet: "لا توجد طلبات بعد",
      noOrdersDescription: "ستظهر طلباتك السابقة والحالية هنا.",
      order: "طلب",
      
      // Profile
      profile: "الملف الشخصي",
      accountInformation: "معلومات الحساب",
      name: "الاسم",
      email: "البريد الإلكتروني",
      role: "الدور",
      logout: "تسجيل الخروج",
      language: "اللغة",
      english: "English",
      arabic: "العربية",
      
      // Add Product
      addNewProduct: "إضافة منتج جديد",
      addPhoto: "إضافة صورة",
      uploadAnImage: "قم بتحميل صورة لمنتجك",
      uploadImage: "تحميل صورة",
      imageSelected: "تم اختيار الصورة",
      productName: "اسم المنتج",
      productNamePlaceholder: "مثال: جاكيت جلد عتيق",
      category: "الفئة",
      categoryPlaceholder: "اختر فئة",
      price: "السعر",
      pricePlaceholder: "0.00 دينار",
      description: "الوصف",
      descriptionPlaceholder: "أدخل وصفاً مختصراً...",
      saveProduct: "حفظ المنتج",
      
      // Alerts
      error: "خطأ",
      success: "نجح",
      permissionNeeded: "الإذن مطلوب",
      grantPermissions: "يرجى منح أذونات معرض الصور",
      selectImage: "يرجى اختيار صورة",
      productCreatedSuccess: "تم إنشاء المنتج بنجاح",
      failedToCreateProduct: "فشل إنشاء المنتج",
      ok: "حسناً",
      
      // User roles
      user: "مستخدم",
      admin: "مسؤول",
      seller: "بائع",
      customer: "عميل",
      
      // New Order Screen
      newOrder: "طلب جديد",
      orderItems: "عناصر الطلب",
      addMoreProducts: "إضافة المزيد من المنتجات",
      noItemsInCart: "لا توجد عناصر في السلة",
      loadingProduct: "جاري تحميل المنتج...",
      userInformation: "معلومات المستخدم",
      userName: "اسم المستخدم",
      enterUserName: "أدخل اسم المستخدم",
      phoneNumber: "رقم الهاتف",
      enterPhoneNumber: "أدخل رقم الهاتف",
      address: "العنوان",
      enterDeliveryAddress: "أدخل عنوان التوصيل",
      shippingAndNotes: "الشحن والملاحظات",
      shippingCost: "تكلفة الشحن (دينار)",
      notes: "ملاحظات",
      internalNotes: "ملاحظات داخلية (اختياري)",
      userNotes: "ملاحظات المستخدم",
      userNotesPlaceholder: "مثال: يرجى التغليف كهدية.",
      facebookProfile: "ملف فيسبوك",
      facebookPlaceholder: "رابط.الملف",
      orderSummary: "ملخص الطلب",
      subtotal: "المجموع الفرعي",
      shipping: "الشحن",
      createOrder: "إنشاء طلب",
      addAtLeastOneProduct: "يرجى إضافة منتج واحد على الأقل إلى الطلب",
      failedToLoadProduct: "فشل تحميل المنتج",
      failedToCreateOrder: "فشل إنشاء الطلب",
    },
  },
};

i18n.use(initReactI18next).init({
  resources: RESOURCES,
  lng: I18nManager.isRTL ? "ar" : getLocales()[0]?.languageCode ?? "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
