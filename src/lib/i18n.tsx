import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LangCode = "es" | "en" | "zh" | "hi" | "ar" | "pt" | "bn" | "ru" | "ja" | "de";

export interface LangOption {
  code: LangCode;
  name: string;       // native name
  english: string;    // english label (helps recognition)
  flag: string;       // emoji
}

export const LANGUAGES: LangOption[] = [
  { code: "es", name: "Español",     english: "Spanish",            flag: "🇪🇸" },
  { code: "en", name: "English",     english: "English",            flag: "🇬🇧" },
  { code: "zh", name: "中文",         english: "Mandarin Chinese",   flag: "🇨🇳" },
  { code: "hi", name: "हिन्दी",        english: "Hindi",              flag: "🇮🇳" },
  { code: "ar", name: "العربية",     english: "Arabic",             flag: "🇸🇦" },
  { code: "pt", name: "Português",   english: "Portuguese",         flag: "🇧🇷" },
  { code: "bn", name: "বাংলা",        english: "Bengali",            flag: "🇧🇩" },
  { code: "ru", name: "Русский",     english: "Russian",            flag: "🇷🇺" },
  { code: "ja", name: "日本語",       english: "Japanese",           flag: "🇯🇵" },
  { code: "de", name: "Deutsch",     english: "German",             flag: "🇩🇪" },
];

// Translation keys — UI chrome only. Tour content stays in Spanish.
export type TKey =
  | "nav.contact"
  | "hero.eyebrow"
  | "hero.title.a"
  | "hero.title.b"
  | "hero.subtitle"
  | "hero.cta.find"
  | "hero.cta.whatsapp"
  | "hero.proof.travelers"
  | "hero.proof.local"
  | "hero.proof.reply"
  | "common.whatsapp"
  | "common.moreInfo"
  | "common.from"
  | "common.reply5min"
  | "common.translatedSoon"
  | "common.shownInSpanish"
  | "footer.tagline"
  | "footer.about"
  | "footer.contact"
  | "footer.payment"
  | "footer.rights"
  | "footer.madeWith"
  | "footer.language"
  | "lang.modal.title"
  | "lang.modal.subtitle"
  | "lang.modal.note"
  | "lang.modal.continue"
  | "lang.modal.skip"
  | "name.modal.title"
  | "name.modal.subtitle"
  | "name.modal.placeholder"
  | "name.modal.continue"
  | "name.modal.skip";

type Dict = Record<TKey, string>;

const es: Dict = {
  "nav.contact": "Contacto",
  "hero.eyebrow": "La Guajira · Santa Marta · Tayrona",
  "hero.title.a": "La Guajira como nunca",
  "hero.title.b": "la has visto.",
  "hero.subtitle": "Tours auténticos por el norte salvaje de Colombia. Desde Riohacha y Santa Marta. Operador local desde 2018.",
  "hero.cta.find": "Encuentra tu tour en 30 segundos",
  "hero.cta.whatsapp": "WhatsApp directo",
  "hero.proof.travelers": "+500 viajeros felices",
  "hero.proof.local": "Operador local certificado",
  "hero.proof.reply": "Respuesta WhatsApp <5 min",
  "common.whatsapp": "WhatsApp",
  "common.moreInfo": "Más info",
  "common.from": "Desde",
  "common.reply5min": "Respuesta en <5 min",
  "common.translatedSoon": "Próximamente traducido",
  "common.shownInSpanish": "Contenido del tour en español",
  "footer.tagline": "La Guajira & Santa Marta · desde 2018",
  "footer.about": "Operador turístico colombiano especializado en experiencias auténticas en el norte del país.",
  "footer.contact": "Contacto",
  "footer.payment": "Pago seguro",
  "footer.rights": "Todos los derechos reservados.",
  "footer.madeWith": "Hecho con cariño desde La Guajira 🇨🇴",
  "footer.language": "Idioma",
  "lang.modal.title": "Elige tu idioma",
  "lang.modal.subtitle": "La interfaz se mostrará en tu idioma. Las respuestas por WhatsApp serán en español.",
  "lang.modal.note": "Puedes cambiarlo después desde el pie de página.",
  "lang.modal.continue": "Continuar",
  "lang.modal.skip": "Continuar en español",
  "name.modal.title": "¿Cómo te llamas?",
  "name.modal.subtitle": "Para personalizar tu experiencia y conectarte mejor con nuestro equipo.",
  "name.modal.placeholder": "Tu nombre",
  "name.modal.continue": "Empezar mi viaje →",
  "name.modal.skip": "Saltar",
};

const en: Dict = {
  "nav.contact": "Contact",
  "hero.eyebrow": "La Guajira · Santa Marta · Tayrona",
  "hero.title.a": "La Guajira like you've",
  "hero.title.b": "never seen it.",
  "hero.subtitle": "Authentic tours through Colombia's wild north. Departing from Riohacha and Santa Marta. Local operator since 2018.",
  "hero.cta.find": "Find your tour in 30 seconds",
  "hero.cta.whatsapp": "WhatsApp directly",
  "hero.proof.travelers": "+500 happy travelers",
  "hero.proof.local": "Certified local operator",
  "hero.proof.reply": "WhatsApp reply <5 min",
  "common.whatsapp": "WhatsApp",
  "common.moreInfo": "More info",
  "common.from": "From",
  "common.reply5min": "Reply in <5 min",
  "common.translatedSoon": "Translation coming soon",
  "common.shownInSpanish": "Tour details shown in Spanish",
  "footer.tagline": "La Guajira & Santa Marta · since 2018",
  "footer.about": "Colombian tour operator specializing in authentic experiences in the north of the country.",
  "footer.contact": "Contact",
  "footer.payment": "Secure payment",
  "footer.rights": "All rights reserved.",
  "footer.madeWith": "Made with love from La Guajira 🇨🇴",
  "footer.language": "Language",
  "lang.modal.title": "Choose your language",
  "lang.modal.subtitle": "The interface will appear in your language. WhatsApp replies are in Spanish.",
  "lang.modal.note": "You can change it later from the footer.",
  "lang.modal.continue": "Continue",
  "lang.modal.skip": "Continue in Spanish",
  "name.modal.title": "What's your name?",
  "name.modal.subtitle": "So we can personalize your experience and connect you with our team.",
  "name.modal.placeholder": "Your name",
  "name.modal.continue": "Start my journey →",
  "name.modal.skip": "Skip",
};

const zh: Dict = {
  ...en,
  "nav.contact": "联系",
  "hero.title.a": "前所未见的",
  "hero.title.b": "拉瓜希拉。",
  "hero.subtitle": "穿越哥伦比亚北部荒野的正宗旅游。从里奥阿查和圣玛尔塔出发。2018年起本地运营商。",
  "hero.cta.find": "30秒内找到你的旅程",
  "hero.cta.whatsapp": "直接 WhatsApp",
  "hero.proof.travelers": "500+ 满意游客",
  "hero.proof.local": "认证本地运营商",
  "hero.proof.reply": "WhatsApp 5分钟内回复",
  "common.moreInfo": "更多信息",
  "common.from": "起价",
  "common.reply5min": "5分钟内回复",
  "common.translatedSoon": "翻译即将推出",
  "common.shownInSpanish": "旅游详情以西班牙语显示",
  "footer.tagline": "拉瓜希拉与圣玛尔塔 · 2018年起",
  "footer.about": "哥伦比亚旅游运营商,专注于该国北部的正宗体验。",
  "footer.contact": "联系",
  "footer.payment": "安全付款",
  "footer.rights": "保留所有权利。",
  "footer.madeWith": "来自拉瓜希拉的用心之作 🇨🇴",
  "footer.language": "语言",
  "lang.modal.title": "选择你的语言",
  "lang.modal.subtitle": "界面将以您的语言显示。WhatsApp 回复使用西班牙语。",
  "lang.modal.note": "您可以稍后从页脚更改。",
  "lang.modal.continue": "继续",
  "lang.modal.skip": "以西班牙语继续",
};

const hi: Dict = {
  ...en,
  "nav.contact": "संपर्क",
  "hero.title.a": "ला गुआहिरा जैसा",
  "hero.title.b": "आपने कभी नहीं देखा।",
  "hero.subtitle": "कोलंबिया के जंगली उत्तर के माध्यम से प्रामाणिक पर्यटन। रियोआचा और सांता मार्ता से प्रस्थान। 2018 से स्थानीय ऑपरेटर।",
  "hero.cta.find": "30 सेकंड में अपना टूर खोजें",
  "hero.cta.whatsapp": "सीधे WhatsApp",
  "hero.proof.travelers": "500+ खुश यात्री",
  "hero.proof.local": "प्रमाणित स्थानीय ऑपरेटर",
  "hero.proof.reply": "WhatsApp उत्तर <5 मिनट",
  "common.moreInfo": "अधिक जानकारी",
  "common.from": "से",
  "common.reply5min": "<5 मिनट में उत्तर",
  "common.translatedSoon": "अनुवाद जल्द आ रहा है",
  "common.shownInSpanish": "टूर विवरण स्पेनिश में दिखाए गए हैं",
  "footer.tagline": "ला गुआहिरा और सांता मार्ता · 2018 से",
  "footer.about": "देश के उत्तर में प्रामाणिक अनुभवों में विशेषज्ञता वाला कोलंबियाई टूर ऑपरेटर।",
  "footer.contact": "संपर्क",
  "footer.payment": "सुरक्षित भुगतान",
  "footer.rights": "सर्वाधिकार सुरक्षित।",
  "footer.madeWith": "ला गुआहिरा से प्यार के साथ बनाया गया 🇨🇴",
  "footer.language": "भाषा",
  "lang.modal.title": "अपनी भाषा चुनें",
  "lang.modal.subtitle": "इंटरफ़ेस आपकी भाषा में दिखाई देगा। WhatsApp उत्तर स्पेनिश में हैं।",
  "lang.modal.note": "आप इसे बाद में फ़ुटर से बदल सकते हैं।",
  "lang.modal.continue": "जारी रखें",
  "lang.modal.skip": "स्पेनिश में जारी रखें",
};

const ar: Dict = {
  ...en,
  "nav.contact": "اتصل",
  "hero.title.a": "لا غواخيرا كما لم",
  "hero.title.b": "ترَها من قبل.",
  "hero.subtitle": "جولات أصيلة عبر شمال كولومبيا البري. انطلاقاً من ريوهاتشا وسانتا مارتا. مشغل محلي منذ 2018.",
  "hero.cta.find": "اعثر على جولتك في 30 ثانية",
  "hero.cta.whatsapp": "واتساب مباشر",
  "hero.proof.travelers": "+500 مسافر سعيد",
  "hero.proof.local": "مشغل محلي معتمد",
  "hero.proof.reply": "رد واتساب <5 دقائق",
  "common.moreInfo": "مزيد من المعلومات",
  "common.from": "من",
  "common.reply5min": "رد خلال <5 دقائق",
  "common.translatedSoon": "الترجمة قريباً",
  "common.shownInSpanish": "تفاصيل الجولة بالإسبانية",
  "footer.tagline": "لا غواخيرا وسانتا مارتا · منذ 2018",
  "footer.about": "مشغل سياحي كولومبي متخصص في التجارب الأصيلة في شمال البلاد.",
  "footer.contact": "اتصل",
  "footer.payment": "دفع آمن",
  "footer.rights": "جميع الحقوق محفوظة.",
  "footer.madeWith": "صُنع بحب من لا غواخيرا 🇨🇴",
  "footer.language": "اللغة",
  "lang.modal.title": "اختر لغتك",
  "lang.modal.subtitle": "ستظهر الواجهة بلغتك. ردود واتساب بالإسبانية.",
  "lang.modal.note": "يمكنك تغييرها لاحقاً من التذييل.",
  "lang.modal.continue": "متابعة",
  "lang.modal.skip": "متابعة بالإسبانية",
};

const pt: Dict = {
  ...en,
  "nav.contact": "Contato",
  "hero.title.a": "La Guajira como você",
  "hero.title.b": "nunca viu.",
  "hero.subtitle": "Tours autênticos pelo norte selvagem da Colômbia. Saídas de Riohacha e Santa Marta. Operador local desde 2018.",
  "hero.cta.find": "Encontre seu tour em 30 segundos",
  "hero.cta.whatsapp": "WhatsApp direto",
  "hero.proof.travelers": "+500 viajantes felizes",
  "hero.proof.local": "Operador local certificado",
  "hero.proof.reply": "Resposta WhatsApp <5 min",
  "common.moreInfo": "Mais informações",
  "common.from": "A partir de",
  "common.reply5min": "Resposta em <5 min",
  "common.translatedSoon": "Tradução em breve",
  "common.shownInSpanish": "Detalhes do tour em espanhol",
  "footer.tagline": "La Guajira & Santa Marta · desde 2018",
  "footer.about": "Operador turístico colombiano especializado em experiências autênticas no norte do país.",
  "footer.contact": "Contato",
  "footer.payment": "Pagamento seguro",
  "footer.rights": "Todos os direitos reservados.",
  "footer.madeWith": "Feito com carinho desde La Guajira 🇨🇴",
  "footer.language": "Idioma",
  "lang.modal.title": "Escolha seu idioma",
  "lang.modal.subtitle": "A interface será exibida no seu idioma. As respostas por WhatsApp são em espanhol.",
  "lang.modal.note": "Você pode alterá-lo depois no rodapé.",
  "lang.modal.continue": "Continuar",
  "lang.modal.skip": "Continuar em espanhol",
};

const bn: Dict = {
  ...en,
  "nav.contact": "যোগাযোগ",
  "hero.title.a": "লা গুয়াহিরা যেমন আপনি",
  "hero.title.b": "আগে কখনো দেখেননি।",
  "hero.subtitle": "কলম্বিয়ার বন্য উত্তরের মাধ্যমে প্রামাণিক ট্যুর। রিওআচা এবং সান্তা মার্তা থেকে ছেড়ে যায়। 2018 থেকে স্থানীয় অপারেটর।",
  "hero.cta.find": "30 সেকেন্ডে আপনার ট্যুর খুঁজুন",
  "hero.cta.whatsapp": "সরাসরি WhatsApp",
  "hero.proof.travelers": "500+ সুখী ভ্রমণকারী",
  "hero.proof.local": "প্রত্যয়িত স্থানীয় অপারেটর",
  "hero.proof.reply": "WhatsApp উত্তর <5 মিনিট",
  "common.moreInfo": "আরো তথ্য",
  "common.from": "থেকে",
  "common.reply5min": "<5 মিনিটে উত্তর",
  "common.translatedSoon": "অনুবাদ শীঘ্রই আসছে",
  "common.shownInSpanish": "ট্যুর বিবরণ স্প্যানিশ ভাষায়",
  "footer.tagline": "লা গুয়াহিরা ও সান্তা মার্তা · 2018 থেকে",
  "footer.about": "দেশের উত্তরে প্রামাণিক অভিজ্ঞতায় বিশেষজ্ঞ কলম্বিয়ান ট্যুর অপারেটর।",
  "footer.contact": "যোগাযোগ",
  "footer.payment": "নিরাপদ পেমেন্ট",
  "footer.rights": "সর্বস্বত্ব সংরক্ষিত।",
  "footer.madeWith": "লা গুয়াহিরা থেকে ভালোবাসা দিয়ে তৈরি 🇨🇴",
  "footer.language": "ভাষা",
  "lang.modal.title": "আপনার ভাষা নির্বাচন করুন",
  "lang.modal.subtitle": "ইন্টারফেস আপনার ভাষায় প্রদর্শিত হবে। WhatsApp উত্তর স্প্যানিশ ভাষায়।",
  "lang.modal.note": "আপনি পরে ফুটার থেকে এটি পরিবর্তন করতে পারেন।",
  "lang.modal.continue": "চালিয়ে যান",
  "lang.modal.skip": "স্প্যানিশে চালিয়ে যান",
};

const ru: Dict = {
  ...en,
  "nav.contact": "Контакт",
  "hero.title.a": "Ла-Гуахира, какой вы её",
  "hero.title.b": "никогда не видели.",
  "hero.subtitle": "Аутентичные туры по дикому северу Колумбии. Отправление из Риоачи и Санта-Марты. Местный оператор с 2018 года.",
  "hero.cta.find": "Найдите свой тур за 30 секунд",
  "hero.cta.whatsapp": "WhatsApp напрямую",
  "hero.proof.travelers": "500+ счастливых путешественников",
  "hero.proof.local": "Сертифицированный местный оператор",
  "hero.proof.reply": "Ответ в WhatsApp <5 мин",
  "common.moreInfo": "Подробнее",
  "common.from": "От",
  "common.reply5min": "Ответ за <5 мин",
  "common.translatedSoon": "Перевод скоро",
  "common.shownInSpanish": "Детали тура на испанском",
  "footer.tagline": "Ла-Гуахира и Санта-Марта · с 2018",
  "footer.about": "Колумбийский туроператор, специализирующийся на аутентичных впечатлениях на севере страны.",
  "footer.contact": "Контакт",
  "footer.payment": "Безопасная оплата",
  "footer.rights": "Все права защищены.",
  "footer.madeWith": "Сделано с любовью из Ла-Гуахиры 🇨🇴",
  "footer.language": "Язык",
  "lang.modal.title": "Выберите язык",
  "lang.modal.subtitle": "Интерфейс будет отображаться на вашем языке. Ответы в WhatsApp — на испанском.",
  "lang.modal.note": "Вы можете изменить его позже в футере.",
  "lang.modal.continue": "Продолжить",
  "lang.modal.skip": "Продолжить на испанском",
};

const ja: Dict = {
  ...en,
  "nav.contact": "お問い合わせ",
  "hero.title.a": "今まで見たことのない",
  "hero.title.b": "ラ・グアヒラ。",
  "hero.subtitle": "コロンビア北部の野生を巡る本物のツアー。リオアチャとサンタマルタから出発。2018年以来の地元オペレーター。",
  "hero.cta.find": "30秒でツアーを見つける",
  "hero.cta.whatsapp": "WhatsAppで直接",
  "hero.proof.travelers": "500人以上の満足した旅行者",
  "hero.proof.local": "認定された地元オペレーター",
  "hero.proof.reply": "WhatsApp返信5分以内",
  "common.moreInfo": "詳細",
  "common.from": "から",
  "common.reply5min": "5分以内に返信",
  "common.translatedSoon": "翻訳近日公開",
  "common.shownInSpanish": "ツアー詳細はスペイン語で表示",
  "footer.tagline": "ラ・グアヒラ&サンタマルタ · 2018年から",
  "footer.about": "コロンビア北部の本格的な体験を専門とするコロンビアのツアーオペレーター。",
  "footer.contact": "お問い合わせ",
  "footer.payment": "安全な支払い",
  "footer.rights": "全著作権所有。",
  "footer.madeWith": "ラ・グアヒラから愛を込めて 🇨🇴",
  "footer.language": "言語",
  "lang.modal.title": "言語を選択",
  "lang.modal.subtitle": "インターフェースはあなたの言語で表示されます。WhatsAppの返信はスペイン語です。",
  "lang.modal.note": "後でフッターから変更できます。",
  "lang.modal.continue": "続ける",
  "lang.modal.skip": "スペイン語で続ける",
};

const de: Dict = {
  ...en,
  "nav.contact": "Kontakt",
  "hero.title.a": "La Guajira, wie du sie",
  "hero.title.b": "noch nie gesehen hast.",
  "hero.subtitle": "Authentische Touren durch Kolumbiens wilden Norden. Abfahrt von Riohacha und Santa Marta. Lokaler Anbieter seit 2018.",
  "hero.cta.find": "Finde deine Tour in 30 Sekunden",
  "hero.cta.whatsapp": "Direkt WhatsApp",
  "hero.proof.travelers": "+500 glückliche Reisende",
  "hero.proof.local": "Zertifizierter lokaler Anbieter",
  "hero.proof.reply": "WhatsApp-Antwort <5 Min",
  "common.moreInfo": "Mehr Infos",
  "common.from": "Ab",
  "common.reply5min": "Antwort in <5 Min",
  "common.translatedSoon": "Übersetzung bald verfügbar",
  "common.shownInSpanish": "Tour-Details auf Spanisch",
  "footer.tagline": "La Guajira & Santa Marta · seit 2018",
  "footer.about": "Kolumbianischer Reiseveranstalter, spezialisiert auf authentische Erlebnisse im Norden des Landes.",
  "footer.contact": "Kontakt",
  "footer.payment": "Sichere Zahlung",
  "footer.rights": "Alle Rechte vorbehalten.",
  "footer.madeWith": "Mit Liebe gemacht aus La Guajira 🇨🇴",
  "footer.language": "Sprache",
  "lang.modal.title": "Wähle deine Sprache",
  "lang.modal.subtitle": "Die Oberfläche erscheint in deiner Sprache. WhatsApp-Antworten sind auf Spanisch.",
  "lang.modal.note": "Du kannst sie später im Footer ändern.",
  "lang.modal.continue": "Weiter",
  "lang.modal.skip": "Auf Spanisch fortfahren",
};

const DICTS: Record<LangCode, Dict> = { es, en, zh, hi, ar, pt, bn, ru, ja, de };

export const RTL_LANGS: LangCode[] = ["ar"];

interface I18nContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: TKey) => string;
  isReady: boolean;
  needsModal: boolean;
  modalStep: "lang" | "name";
  goToNameStep: () => void;
  dismissModal: () => void;
  userName: string;
  setUserName: (name: string) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "castle-tours.lang";
const NAME_KEY = "castle-tours.name";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("es");
  const [isReady, setIsReady] = useState(false);
  const [needsModal, setNeedsModal] = useState(false);
  const [modalStep, setModalStep] = useState<"lang" | "name">("lang");
  const [userName, setUserNameState] = useState<string>("");

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      const storedName = typeof window !== "undefined" ? window.localStorage.getItem(NAME_KEY) : null;
      if (storedName) setUserNameState(storedName);
      if (stored && DICTS[stored as LangCode]) {
        setLangState(stored as LangCode);
        if (!storedName) {
          setModalStep("name");
          setNeedsModal(true);
        }
      } else {
        setNeedsModal(true);
      }
    } catch {
      // ignore
    }
    setIsReady(true);
  }, []);

  // Reflect lang + dir on <html>
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: LangCode) => {
    setLangState(l);
    try { window.localStorage.setItem(STORAGE_KEY, l); } catch { /* noop */ }
  };

  const goToNameStep = () => setModalStep("name");

  const setUserName = (name: string) => {
    const trimmed = name.trim();
    setUserNameState(trimmed);
    try { window.localStorage.setItem(NAME_KEY, trimmed); } catch { /* noop */ }
  };

  const dismissModal = () => {
    if (needsModal) {
      try { window.localStorage.setItem(STORAGE_KEY, lang); } catch { /* noop */ }
    }
    setNeedsModal(false);
  };

  const value = useMemo<I18nContextValue>(() => ({
    lang,
    setLang,
    t: (key: TKey) => DICTS[lang][key] ?? DICTS.es[key] ?? key,
    isReady,
    needsModal,
    modalStep,
    goToNameStep,
    dismissModal,
    userName,
    setUserName,
  }), [lang, isReady, needsModal, modalStep, userName]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}
